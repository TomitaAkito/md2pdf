import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'path'
import fs from 'fs'
import { spawn } from 'child_process'
import matter from 'gray-matter'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  PdfGenerateOptions,
  PdfGenerateResult,
  PfpdfProgressEvent,
  MarkdownFileData,
  MarkdownFrontMatter,
  TemplateInfo,
  CustomTemplateData,
  PptxParseResult
} from '../shared/types'
import { parsePptxFile, parsePptxBuffer } from './pptxParser'
import { exportSamplePptxFile } from './pptxSampleGenerator'
import { saveTemplateAsNativeDir } from './transpiler'
import { renderPreviewBatch } from './previewRenderer'



const OFFICIAL_TEMPLATES: TemplateInfo[] = [
  { id: 'default', name: 'Default', description: '標準的な中立レイアウト。一般的なレポートやメモに最適', category: 'official', tags: ['標準', '汎用'] },
  { id: 'academic', name: 'Academic', description: '論文や学術研究報告向け。2段組風や文献引用に対応', category: 'official', tags: ['学術', '研究', '論文'] },
  { id: 'book', name: 'Book', description: '書籍や長文ドキュメント向け。章立て・改ページが強調される', category: 'official', tags: ['書籍', '長文', 'マニュアル'] },
  { id: 'compact', name: 'Compact', description: '1〜2枚の短い資料向け。余白を抑えた高密度デザイン', category: 'official', tags: ['簡潔', 'サマリー', 'レジュメ'] },
  { id: 'notebook', name: 'Notebook', description: 'カジュアルなノートブック風。アイデア出しや日記向け', category: 'official', tags: ['ノート', 'カジュアル'] },
  { id: 'pfn', name: 'PFN Corporate', description: '企業文書・公式技術報告向け。洗練されたコーポレートスタイル', category: 'official', tags: ['コーポレート', 'ビジネス'] },
  { id: 'technical', name: 'Technical', description: '技術仕様書・APIドキュメント向け。コードハイライト重視', category: 'official', tags: ['技術書', '仕様書', 'コード'] }
]

function readMarkdown(filePath: string): MarkdownFileData {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const parsed = matter(raw)
  return {
    filePath,
    fileName: path.basename(filePath),
    content: raw,
    body: parsed.content,
    frontMatter: parsed.data as MarkdownFrontMatter
  }
}

/**
 * Markdown 内の改ページ指定（`<div style="page-break-after: always;"></div>` 等や `___`）を
 * pfpdf 公式仕様のトップレベル `___`（前後空行付き）へ正規化し、
 * あわせて蛍光マーカー（`<mark>...</mark>` / `==...==`）や下線（`<u>...</u>`）のインライン装飾を展開する。
 */
function normalizeMarkdownPageBreaks(rawMarkdown: string): string {
  const parsed = matter(rawMarkdown)
  const lines = parsed.content.split(/\r?\n/)
  const outLines: string[] = []
  let inCodeBlock = false

  const pageBreakDivRegex =
    /[ \t]*<div\b[^>]*(?:page-break|break-after|break-before|data-pfpdf-page-break|pagebreak)[^>]*>\s*<\/div>[ \t]*/gi

  const transformInlineDecorations = (textLine: string): string => {
    // インラインコード (`...`) 内は変換しないよう分割処理
    return textLine
      .split(/(`+[^`]*`+)/g)
      .map((segment) => {
        if (segment.startsWith('`')) return segment
        return segment
          .replace(
            /==([^=\n]+)==/g,
            '<span style="background: linear-gradient(transparent 60%, #ffbfa3 60%); font-weight: 700; padding: 0 1px; -webkit-print-color-adjust: exact; print-color-adjust: exact; box-decoration-break: clone; -webkit-box-decoration-break: clone;">$1</span>'
          )
          .replace(
            /<mark\s+class=["']yellow["']\s*>([\s\S]*?)<\/mark>/gi,
            '<span style="background: linear-gradient(transparent 60%, #fef08a 60%); font-weight: 700; padding: 0 1px; -webkit-print-color-adjust: exact; print-color-adjust: exact; box-decoration-break: clone; -webkit-box-decoration-break: clone;">$1</span>'
          )
          .replace(
            /<mark>([\s\S]*?)<\/mark>/gi,
            '<span style="background: linear-gradient(transparent 60%, #ffbfa3 60%); font-weight: 700; padding: 0 1px; -webkit-print-color-adjust: exact; print-color-adjust: exact; box-decoration-break: clone; -webkit-box-decoration-break: clone;">$1</span>'
          )
          .replace(
            /<u>([\s\S]*?)<\/u>/gi,
            '<u style="text-decoration: underline; text-underline-offset: 0.2em; text-decoration-thickness: 1pt;">$1</u>'
          )
      })
      .join('')
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock
      outLines.push(line)
      continue
    }
    if (inCodeBlock) {
      outLines.push(line)
      continue
    }

    if (pageBreakDivRegex.test(line)) {
      pageBreakDivRegex.lastIndex = 0
      const replaced = transformInlineDecorations(line.replace(pageBreakDivRegex, '\n\n___\n\n'))
      outLines.push(replaced)
      continue
    }

    if (/^___+\s*$/.test(trimmed)) {
      outLines.push('', '___', '')
      continue
    }

    const transformedLine = transformInlineDecorations(line)

    // 通常の文章行（段落行）における Enter 改行を <br> として扱う処理
    // 見出し・リスト・テーブル・水平線・引用・数式ブロック・HTMLブロックではない行で、
    // 次の行に継続して文章が続く場合、行末に <br> を補完して pfpdf で改行させる
    const isSpecialBlock =
      trimmed === '' ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('>') ||
      trimmed.startsWith('-') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('+') ||
      /^\d+\.\s/.test(trimmed) ||
      (trimmed.startsWith('|') && trimmed.endsWith('|')) ||
      trimmed === '---' ||
      trimmed.startsWith('$$') ||
      trimmed.startsWith('<details') ||
      trimmed.startsWith('</details') ||
      trimmed.startsWith('<summary') ||
      trimmed.startsWith('</summary') ||
      trimmed.startsWith('<div') ||
      trimmed.startsWith('</div>') ||
      trimmed.startsWith('<table') ||
      trimmed.startsWith('</table>')

    if (!isSpecialBlock && i + 1 < lines.length) {
      const nextTrimmed = lines[i + 1].trim()
      const nextIsSpecial =
        nextTrimmed === '' ||
        nextTrimmed.startsWith('#') ||
        nextTrimmed.startsWith('```') ||
        nextTrimmed.startsWith('~~~') ||
        nextTrimmed.startsWith('>') ||
        nextTrimmed.startsWith('-') ||
        nextTrimmed.startsWith('*') ||
        nextTrimmed.startsWith('+') ||
        /^\d+\.\s/.test(nextTrimmed) ||
        (nextTrimmed.startsWith('|') && nextTrimmed.endsWith('|')) ||
        nextTrimmed === '---' ||
        /^___+\s*$/.test(nextTrimmed) ||
        nextTrimmed.startsWith('$$') ||
        nextTrimmed.startsWith('<div')

      if (!nextIsSpecial && !/<\s*br\s*\/?>\s*$/i.test(transformedLine)) {
        outLines.push(`${transformedLine}<br>`)
        continue
      }
    }

    outLines.push(transformedLine)
  }

  const normalizedBody = outLines.join('\n').replace(/\n{3,}/g, '\n\n')
  if (rawMarkdown.startsWith('---')) {
    const fmEnd = rawMarkdown.indexOf('\n---', 3)
    if (fmEnd !== -1) {
      const fmBlock = rawMarkdown.slice(0, fmEnd + 4)
      return `${fmBlock}\n\n${normalizedBody}\n`
    }
  }
  return `${normalizedBody}\n`
}

let mainWindowInstance: BrowserWindow | null = null
let isForceClosing = false

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindowInstance = mainWindow

  mainWindow.on('close', (e) => {
    if (!isForceClosing) {
      e.preventDefault()
      mainWindow.webContents.send('pfpdf:request-close')
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('pfpdf:test-dummy', async (event): Promise<PdfGenerateResult> => {
    const logs: string[] = []
    const emitProgress = (stage: string, message: string): void => {
      const payload: PfpdfProgressEvent = { stage, message, timestamp: Date.now() }
      event.sender.send('pfpdf:progress', payload)
    }

    try {
      emitProgress('init', 'ダミー Markdown ファイルを作成中...')
      const tempDir = app.getPath('temp')
      const desktopDir = app.getPath('desktop')
      const dummyMdPath = join(tempDir, 'dummy-pfpdf-test.md')
      const outputPdfPath = join(desktopDir, 'pfpdf-test-output.pdf')

      const dummyContent = `---
title: "Pfpdf Studio 疎通テスト"
author: "Pfpdf Studio"
date: "${new Date().toISOString().slice(0, 10)}"
---

# Pfpdf Studio 疎通テスト

これは **Pfpdf Studio** の Phase 1 疎通テストで自動生成された PDF です。

## 特徴と組版テスト
- 日本語組版テスト: **「太字の括弧」** や *イタリック*、\`インラインコード\`
- 数式テスト: $E = mc^2$
- 生成日時: ${new Date().toLocaleString()}

\`\`\`ts
// TypeScript コードブロックのシンタックスハイライトテスト
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
console.log(greet("Pfpdf Studio"));
\`\`\`
`
      fs.writeFileSync(dummyMdPath, dummyContent, 'utf-8')
      emitProgress('preparing', `入力ファイル作成完了: ${dummyMdPath}`)

      const launcherPath = join(app.getAppPath(), 'node_modules/@pfnet-research/pfpdf/dist/launcher.js')
      emitProgress('running', `pfpdf を実行中 (出力先: ${outputPdfPath})...`)

      return await new Promise<PdfGenerateResult>((resolve) => {
        const child = spawn(process.execPath, [launcherPath, '--input', dummyMdPath, '--output', outputPdfPath], {
          env: {
            ...process.env,
            ELECTRON_RUN_AS_NODE: '1'
          }
        })

        child.stdout.on('data', (chunk) => {
          const text = chunk.toString()
          logs.push(text)
          emitProgress('stdout', text.trim())
        })

        child.stderr.on('data', (chunk) => {
          const text = chunk.toString()
          logs.push(text)
          emitProgress('stderr', text.trim())
        })

        child.on('error', (err) => {
          emitProgress('error', err.message)
          resolve({
            success: false,
            logs,
            error: `プロセス起動エラー: ${err.message}`
          })
        })

        child.on('close', (code) => {
          if (code === 0) {
            emitProgress('done', 'PDF 生成完了！')
            resolve({
              success: true,
              outputPdfPath,
              logs
            })
          } else {
            emitProgress('failed', `pfpdf 終了コード: ${code}`)
            resolve({
              success: false,
              logs,
              error: `pfpdf が終了コード ${code} で終了しました。`
            })
          }
        })
      })
    } catch (err: any) {
      emitProgress('error', err.message)
      return {
        success: false,
        logs,
        error: err.message
      }
    }
  })

  ipcMain.handle('pfpdf:get-official-templates', async (): Promise<TemplateInfo[]> => {
    return OFFICIAL_TEMPLATES
  })

  ipcMain.handle('pfpdf:select-markdown', async (): Promise<MarkdownFileData | null> => {
    const result = await dialog.showOpenDialog({
      title: 'Markdown ファイルを選択',
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return readMarkdown(result.filePaths[0])
  })

  ipcMain.handle('pfpdf:read-markdown', async (_event, filePath: string): Promise<MarkdownFileData> => {
    return readMarkdown(filePath)
  })

  ipcMain.handle(
    'pfpdf:parse-markdown-content',
    async (_event, content: string, fileName: string, filePath?: string): Promise<MarkdownFileData> => {
      const parsed = matter(content)
      const resolvedPath = filePath || join(app.getPath('desktop'), fileName)
      return {
        filePath: resolvedPath,
        fileName,
        content,
        body: parsed.content,
        frontMatter: parsed.data as MarkdownFrontMatter
      }
    }
  )

  ipcMain.handle(
    'pfpdf:save-markdown',
    async (_event, filePath: string, content: string): Promise<{ success: boolean; error?: string }> => {
      try {
        await fs.promises.writeFile(filePath, content, 'utf-8')
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    }
  )

  ipcMain.handle(
    'pfpdf:select-markdown-save-path',
    async (_event, defaultFileName?: string): Promise<string | null> => {
      const defaultPath = join(app.getPath('desktop'), defaultFileName || 'document.md')
      const result = await dialog.showSaveDialog({
        title: 'Markdown ファイルの保存先を選択',
        defaultPath,
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
      })
      if (result.canceled) return null
      return result.filePath
    }
  )

  ipcMain.handle('pfpdf:select-save-path', async (_event, defaultFileName?: string): Promise<string | null> => {
    const defaultPath = join(app.getPath('desktop'), defaultFileName || 'document.pdf')
    const result = await dialog.showSaveDialog({
      title: 'PDF の保存先を選択',
      defaultPath,
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    })
    if (result.canceled) return null
    return result.filePath
  })

  ipcMain.handle('pfpdf:generate', async (event, options: PdfGenerateOptions): Promise<PdfGenerateResult> => {
    const logs: string[] = []
    const started = Date.now()
    const emitProgress = (stage: string, message: string): void => {
      const payload: PfpdfProgressEvent = { stage, message, timestamp: Date.now() }
      event.sender.send('pfpdf:progress', payload)
    }

    try {
      emitProgress('init', 'PDF 生成の準備を開始します...')
      let targetInput = options.inputPath
      let tempFileToDelete: string | null = null

      if (options.contentOverride) {
        emitProgress('preparing', 'Front Matter または本文の変更を反映中...')
        const tempDir = app.getPath('temp')
        const tempMdPath = join(tempDir, `pfpdf-gen-${Date.now()}.md`)
        const normalizedContent = normalizeMarkdownPageBreaks(options.contentOverride)
        fs.writeFileSync(tempMdPath, normalizedContent, 'utf-8')
        targetInput = tempMdPath
        tempFileToDelete = tempMdPath
      } else if (options.inputPath && fs.existsSync(options.inputPath)) {
        const rawFile = fs.readFileSync(options.inputPath, 'utf-8')
        const normalizedContent = normalizeMarkdownPageBreaks(rawFile)
        if (normalizedContent !== rawFile) {
          const tempDir = app.getPath('temp')
          const tempMdPath = join(tempDir, `pfpdf-gen-${Date.now()}.md`)
          fs.writeFileSync(tempMdPath, normalizedContent, 'utf-8')
          targetInput = tempMdPath
          tempFileToDelete = tempMdPath
        }
      }

      // 出力先ディレクトリの確保
      const outputDir = path.dirname(options.outputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      const launcherPath = join(app.getAppPath(), 'node_modules/@pfnet-research/pfpdf/dist/launcher.js')
      const args: string[] = ['--input', targetInput, '--output', options.outputPath]

      const isOfficial = OFFICIAL_TEMPLATES.some((t) => t.id === options.template)
      const templatesDir = getTemplatesDir()
      const customTemplateDirPath = join(templatesDir, options.template)

      if (!isOfficial && fs.existsSync(customTemplateDirPath)) {
        emitProgress('preparing', `自作テンプレートディレクトリを適用中: ${options.template}`)
        args.push('--template', customTemplateDirPath)
      } else if (options.template) {
        args.push('--template', options.template)
      }


      if (options.toc === true) {
        args.push('--toc')
      } else if (options.toc === false) {
        args.push('--no-toc')
      }
      if (options.title) {
        args.push('--title', options.title)
      }

      emitProgress('running', `pfpdf エンジンを実行中 (テンプレート: ${options.template || 'default'})...`)


      return await new Promise<PdfGenerateResult>((resolve) => {
        const child = spawn(process.execPath, [launcherPath, ...args], {
          env: {
            ...process.env,
            ELECTRON_RUN_AS_NODE: '1'
          }
        })

        child.stdout.on('data', (chunk) => {
          const text = chunk.toString()
          logs.push(text)
          emitProgress('stdout', text.trim())
        })

        child.stderr.on('data', (chunk) => {
          const text = chunk.toString()
          logs.push(text)
          emitProgress('stderr', text.trim())
        })

        child.on('error', (err) => {
          if (tempFileToDelete && fs.existsSync(tempFileToDelete)) {
            try { fs.unlinkSync(tempFileToDelete) } catch {}
          }
          emitProgress('error', err.message)
          resolve({
            success: false,
            logs,
            error: `プロセス起動エラー: ${err.message}`
          })
        })

        child.on('close', (code) => {
          if (tempFileToDelete && fs.existsSync(tempFileToDelete)) {
            try { fs.unlinkSync(tempFileToDelete) } catch {}
          }

          const elapsedMs = Date.now() - started
          if (code === 0 && fs.existsSync(options.outputPath)) {
            const stat = fs.statSync(options.outputPath)
            emitProgress('done', `PDF 生成完了 (${stat.size} bytes, ${Math.round(elapsedMs / 100) / 10}秒)`)
            resolve({
              success: true,
              outputPdfPath: options.outputPath,
              logs,
              elapsedMs,
              byteSize: stat.size
            })
          } else {
            emitProgress('failed', `pfpdf 終了コード: ${code}`)
            resolve({
              success: false,
              logs,
              error: `pfpdf が終了コード ${code} で終了しました。`,
              elapsedMs
            })
          }
        })
      })
    } catch (err: any) {
      emitProgress('error', err.message)
      return {
        success: false,
        logs,
        error: err.message
      }
    }
  })

  ipcMain.handle('pfpdf:open-pdf', async (_event, filePath: string): Promise<boolean> => {
    if (fs.existsSync(filePath)) {
      await shell.openPath(filePath)
      return true
    }
    return false
  })

  ipcMain.handle('pfpdf:show-in-folder', async (_event, filePath: string): Promise<void> => {
    if (fs.existsSync(filePath)) {
      shell.showItemInFolder(filePath)
    }
  })

  // ==========================================
  // Phase 3: カスタムテンプレート管理 IPC
  // ==========================================
  const getTemplatesDir = (): string => {
    const dir = join(app.getPath('userData'), 'custom-templates')
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      // 初回サンプルテンプレートを生成
      const samplePath = join(dir, 'custom-template-01.json')
      const sampleTemplate: CustomTemplateData = {
        id: 'custom-template-01',
        name: 'ビジネスレポート (標準)',
        description: '青色アクセントと余白を整えたシンプルなレポート表紙',
        updatedAt: new Date().toISOString().slice(0, 10),
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margin: { top: '20mm', bottom: '20mm', left: '25mm', right: '25mm' }
        },
        hasCover: true,
        tocSettings: {
          enabled: true,
          title: '目 次',
          levels: 2,
          leaderStyle: 'dots',
          fontSize: '11pt',
          color: '#1e293b'
        },
        headerFooter: {
          showHeader: true,
          headerText: 'ビジネスレポート',
          showPageNumber: true,
          pageNumberPosition: 'bottom-center',
          pageNumberFormat: 'dash'
        },
        coverElements: [
          {
            id: 'el-title',
            type: 'title',
            x: 40,
            y: 120,
            width: 420,
            height: 70,
            text: 'プロジェクト報告書タイトル',
            fontSize: '28pt',
            color: '#0f172a',
            fontWeight: 'bold',
            textAlign: 'left',
            borderBottom: '3px solid #2563eb'
          },
          {
            id: 'el-subtitle',
            type: 'subtitle',
            x: 40,
            y: 200,
            width: 420,
            height: 40,
            text: '〜 成果報告および今後の展望 〜',
            fontSize: '14pt',
            color: '#475569',
            textAlign: 'left'
          },
          {
            id: 'el-author',
            type: 'author',
            x: 40,
            y: 480,
            width: 320,
            height: 30,
            text: '作成者: 開発チーム',
            fontSize: '12pt',
            color: '#334155'
          },
          {
            id: 'el-date',
            type: 'date',
            x: 40,
            y: 515,
            width: 320,
            height: 30,
            text: '日付: 2026年10月29日',
            fontSize: '11pt',
            color: '#64748b'
          }
        ],
        elementStyles: {
          h1: {
            color: '#1d4ed8',
            borderBottom: '2px solid #2563eb',
            fontSize: '22pt'
          },
          h2: {
            color: '#1e293b',
            borderLeft: '4px solid #2563eb',
            fontSize: '16pt'
          },
          body: {
            color: '#334155',
            fontSize: '10.5pt',
            lineHeight: '1.75'
          },
          codeBlock: {
            backgroundColor: '#f8fafc',
            color: '#0f172a'
          }
        }
      }
      fs.writeFileSync(samplePath, JSON.stringify(sampleTemplate, null, 2), 'utf-8')
    }
    return dir
  }

  ipcMain.handle('pfpdf:get-custom-templates', async (): Promise<CustomTemplateData[]> => {
    try {
      const dir = getTemplatesDir()
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
      const templates: CustomTemplateData[] = []
      for (const file of files) {
        try {
          const raw = fs.readFileSync(join(dir, file), 'utf-8')
          templates.push(JSON.parse(raw))
        } catch (e) {
          console.error(`Failed to parse template ${file}:`, e)
        }
      }
      return templates
    } catch (err: any) {
      console.error('get-custom-templates error:', err)
      return []
    }
  })

  ipcMain.handle(
    'pfpdf:save-custom-template',
    async (_event, template: CustomTemplateData): Promise<{ success: boolean; error?: string; cssPath?: string }> => {
      try {
        const dir = getTemplatesDir()
        const fileName = `${template.id}.json`
        const filePath = join(dir, fileName)
        template.updatedAt = new Date().toISOString().slice(0, 10)
        fs.writeFileSync(filePath, JSON.stringify(template, null, 2), 'utf-8')

        // ネイティブテンプレートディレクトリも自動トランスパイル出力
        const templateDirPath = await saveTemplateAsNativeDir(template, dir, app.getAppPath())
        return { success: true, cssPath: templateDirPath }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    }
  )

  ipcMain.handle(
    'pfpdf:delete-custom-template',
    async (_event, templateId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const dir = getTemplatesDir()
        const jsonPath = join(dir, `${templateId}.json`)
        const templateFolder = join(dir, templateId)
        if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath)
        if (fs.existsSync(templateFolder)) fs.rmSync(templateFolder, { recursive: true, force: true })
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    }
  )


  // PPTX 関連ハンドラー
  ipcMain.handle('pfpdf:select-pptx-file', async (): Promise<PptxParseResult | null> => {
    const result = await dialog.showOpenDialog({
      title: 'PowerPoint (.pptx) ファイルを選択',
      filters: [{ name: 'PowerPoint Presentation', extensions: ['pptx'] }],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return parsePptxFile(result.filePaths[0])
  })

  ipcMain.handle('pfpdf:parse-pptx-file', async (_event, filePath: string): Promise<PptxParseResult> => {
    return parsePptxFile(filePath)
  })

  ipcMain.handle(
    'pfpdf:parse-pptx-buffer',
    async (_event, buffer: ArrayBuffer, fileName: string): Promise<PptxParseResult> => {
      return parsePptxBuffer(Buffer.from(buffer), fileName)
    }
  )

  ipcMain.handle(
    'pfpdf:export-pptx-sample',
    async (
      _event,
      sampleType?: 'business' | 'tech' | 'academic'
    ): Promise<{ success: boolean; filePath?: string; error?: string }> => {
      try {
        const defaultName = `template_sample_${sampleType || 'business'}.pptx`
        const result = await dialog.showSaveDialog({
          title: 'サンプル PowerPoint ファイルの保存先',
          defaultPath: join(app.getPath('desktop'), defaultName),
          filters: [{ name: 'PowerPoint Presentation', extensions: ['pptx'] }]
        })
        if (result.canceled || !result.filePath) return { success: false }
        await exportSamplePptxFile(result.filePath, sampleType)
        return { success: true, filePath: result.filePath }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    }
  )

  // 数式 (MathJax) & Mermaid リアルタイムプレビュー用一括レンダリングハンドラ
  ipcMain.handle('pfpdf:render-preview-batch', async (_event, req) => {
    try {
      return await renderPreviewBatch(req)
    } catch (err: any) {
      console.error('Error in render-preview-batch:', err)
      return { mathResults: {}, mermaidResults: {} }
    }
  })

  // ウィンドウ強制終了ハンドラ（未保存確認完了後）
  ipcMain.handle('pfpdf:force-close-app', () => {
    isForceClosing = true
    if (mainWindowInstance && !mainWindowInstance.isDestroyed()) {
      mainWindowInstance.close()
    } else {
      app.quit()
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
