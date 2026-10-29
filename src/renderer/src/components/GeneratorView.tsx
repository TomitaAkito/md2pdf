import React, { useState, useEffect, useRef } from 'react'
import {
  UploadCloud,
  FileText,
  FileCode,
  FolderOpen,
  Sparkles,
  ExternalLink,
  Folder,
  Terminal,
  CheckCircle2,
  AlertCircle,
  X,
  ListOrdered,
  BookOpen,
  User,
  Calendar,
  RotateCcw,
  Palette,
  Eye,
  Check
} from 'lucide-react'
import {
  MarkdownFileData,
  TemplateInfo,
  PdfGenerateOptions,
  PdfGenerateResult,
  PfpdfProgressEvent
} from '../../../shared/types'

// 各テンプレートのフォーマット・デザイン仕様定義
interface TemplateFormatDetail {
  id: string
  name: string
  color: string
  layoutName: string
  fontName: string
  coverType: 'standalone' | 'integrated' | 'none'
  coverTypeName: string
  coverFeature: string
  runningHeader: string
  pageNumberPos: string
  h1Style: { color: string; borderBottom?: string; borderLeft?: string }
  h2Style: { color: string; borderLeft?: string; borderBottom?: string }
  tableHeaderBg: string
  features: string[]
  badge: string
  bestFor: string
  thumbnail: {
    hasTopBar: boolean
    hasCenterTitle: boolean
    h1BarColor: string
    accentColor: string
  }
}

const TEMPLATE_DETAILS: Record<string, TemplateFormatDetail> = {
  pfn: {
    id: 'pfn',
    name: 'PFN Corporate',
    color: '#263c7f',
    layoutName: '公式コーポレート・企業報告書',
    fontName: 'Noto Sans JP (モダンサンセリフ)',
    coverType: 'standalone',
    coverTypeName: '独立表紙（トップ濃紺帯）',
    coverFeature: '上部ネイビー帯 ＋ 章連動ランニングヘッダー',
    runningHeader: '奇数・偶数ページ章タイトル連動ヘッダー',
    pageNumberPos: '下部中央 (- 1 -)',
    h1Style: { color: '#263c7f', borderBottom: '2.5px solid #263c7f' },
    h2Style: { color: '#1f2937', borderLeft: '4px solid #263c7f' },
    tableHeaderBg: '#263c7f',
    features: ['コーポレート帯', '章連動ヘッダー', 'ノンブル中央', '洗練タイポグラフィ'],
    badge: '公式コーポレート',
    bestFor: '企業報告書・コーポレート技術文書・公式仕様書',
    thumbnail: {
      hasTopBar: true,
      hasCenterTitle: false,
      h1BarColor: '#263c7f',
      accentColor: '#263c7f'
    }
  },
  academic: {
    id: 'academic',
    name: 'Academic',
    color: '#831843',
    layoutName: '学術論文・テクニカルレポート',
    fontName: '明朝・フォーマルセリフ混植',
    coverType: 'integrated',
    coverTypeName: '本文一体型（先頭に表題・即本文）',
    coverFeature: '中央配置タイトル ＋ 文献引用・数式最適化',
    runningHeader: '上部細線 ＋ 論文タイトル',
    pageNumberPos: '下部中央',
    h1Style: { color: '#831843', borderBottom: '1.5px solid #831843' },
    h2Style: { color: '#374151', borderLeft: '3px solid #831843' },
    tableHeaderBg: '#831843',
    features: ['論文スタイル', '2段組風組版', '数式最適化', '文献引用'],
    badge: '論文・研究',
    bestFor: '学術論文・査読用レポート・大学課題・研究発表',
    thumbnail: {
      hasTopBar: false,
      hasCenterTitle: true,
      h1BarColor: '#831843',
      accentColor: '#831843'
    }
  },
  technical: {
    id: 'technical',
    name: 'Technical',
    color: '#0f5e5a',
    layoutName: '技術仕様書・APIドキュメント',
    fontName: '等幅コード重視 ＋ サンセリフ',
    coverType: 'standalone',
    coverTypeName: '独立表紙（ダーク調・左グリーンライン）',
    coverFeature: '高密度レイアウト ＋ ダークコードブロック',
    runningHeader: 'APIセクション名連動ヘッダー',
    pageNumberPos: '下部右寄せ',
    h1Style: { color: '#0f5e5a', borderBottom: '2px solid #0f5e5a' },
    h2Style: { color: '#0f5e5a', borderLeft: '4px solid #0f5e5a' },
    tableHeaderBg: '#0f5e5a',
    features: ['コードハイライト重視', '高密度レイアウト', '技術書向け', '左ラインH2'],
    badge: '技術仕様書',
    bestFor: 'APIリファレンス・システム設計書・エンジニア向け手引き',
    thumbnail: {
      hasTopBar: true,
      hasCenterTitle: false,
      h1BarColor: '#0f5e5a',
      accentColor: '#10b981'
    }
  },
  book: {
    id: 'book',
    name: 'Book',
    color: '#1e293b',
    layoutName: '書籍・長文マニュアル',
    fontName: '書籍用長文フォント (ゆったり行間)',
    coverType: 'standalone',
    coverTypeName: '独立書籍章扉（章扉H1改ページ）',
    coverFeature: '章扉・H1での改ページ ＋ 見開きノンブル',
    runningHeader: '見開き連動（左: 書籍名、右: 章名）',
    pageNumberPos: '見開き配置（偶数左下 / 奇数右下）',
    h1Style: { color: '#1e293b', borderBottom: '1px solid #94a3b8' },
    h2Style: { color: '#334155', borderLeft: '3px solid #64748b' },
    tableHeaderBg: '#334155',
    features: ['章扉改ページ', '見開きノンブル', '書籍組版', '長文最適化'],
    badge: '書籍・長文',
    bestFor: '技術同人誌・操作マニュアル・解説書・長編ドキュメント',
    thumbnail: {
      hasTopBar: false,
      hasCenterTitle: true,
      h1BarColor: '#1e293b',
      accentColor: '#64748b'
    }
  },
  compact: {
    id: 'compact',
    name: 'Compact',
    color: '#334155',
    layoutName: '省スペース・短文サマリー',
    fontName: '高可読コンパクトフォント',
    coverType: 'integrated',
    coverTypeName: '表紙なし（余白最小限・1〜2枚凝縮）',
    coverFeature: '余白を抑えた高密度（1〜2枚に凝縮）',
    runningHeader: 'なし（本文領域を最大化）',
    pageNumberPos: '下部右寄せ',
    h1Style: { color: '#334155', borderBottom: '1.5px solid #cbd5e1' },
    h2Style: { color: '#475569', borderLeft: '3px solid #94a3b8' },
    tableHeaderBg: '#475569',
    features: ['省スペース', '最小限の余白', '表紙省略対応', 'レジュメ向け'],
    badge: '省スペース',
    bestFor: 'ワンペーパー報告・会議サマリー・要約レジュメ',
    thumbnail: {
      hasTopBar: false,
      hasCenterTitle: false,
      h1BarColor: '#334155',
      accentColor: '#94a3b8'
    }
  },
  notebook: {
    id: 'notebook',
    name: 'Notebook',
    color: '#4f46e5',
    layoutName: 'カジュアル・ノートブック風',
    fontName: '親しみやすいサンセリフ',
    coverType: 'standalone',
    coverTypeName: '独立表紙（方眼・手帳風）',
    coverFeature: 'グリッド方眼風 ＋ 手帳スタイル',
    runningHeader: '親しみやすいメモ風ヘッダー',
    pageNumberPos: '下部中央',
    h1Style: { color: '#4f46e5', borderBottom: '2px dashed #4f46e5' },
    h2Style: { color: '#312e81', borderLeft: '4px solid #818cf8' },
    tableHeaderBg: '#4f46e5',
    features: ['手帳・ノート風', 'グリッド背景', '親しみやすい配色', 'メモ・議事録'],
    badge: 'カジュアル',
    bestFor: '議事録・社内勉強会資料・アイデアメモ・企画書',
    thumbnail: {
      hasTopBar: true,
      hasCenterTitle: false,
      h1BarColor: '#4f46e5',
      accentColor: '#818cf8'
    }
  },
  default: {
    id: 'default',
    name: 'Default',
    color: '#0f5e5a',
    layoutName: '標準レポート・ニュートラル',
    fontName: '標準ゴシック (Noto Sans JP)',
    coverType: 'standalone',
    coverTypeName: '独立標準表紙（中央配置）',
    coverFeature: '端正なタイトル ＋ 下部著者・日付',
    runningHeader: 'ドキュメントタイトル',
    pageNumberPos: '下部中央',
    h1Style: { color: '#0f5e5a', borderBottom: '2px solid #0f5e5a' },
    h2Style: { color: '#1f2937', borderLeft: '4px solid #0f5e5a' },
    tableHeaderBg: '#0f5e5a',
    features: ['標準ニュートラル', '汎用レポート', 'ノンブル中央', 'どんな文書にも適合'],
    badge: '標準汎用',
    bestFor: 'あらゆる一般的な報告書・提案書・日常ドキュメント',
    thumbnail: {
      hasTopBar: false,
      hasCenterTitle: true,
      h1BarColor: '#0f5e5a',
      accentColor: '#0f5e5a'
    }
  }
}

// 見出しアイテム
interface HeadingItem {
  level: number
  text: string
}

// Markdown本文から見出し（H1〜H3）を抽出
function extractHeadings(markdown: string): HeadingItem[] {
  const lines = markdown.split('\n')
  const headings: HeadingItem[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    const match = trimmed.match(/^(#{1,3})\s+(.+)$/)
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim()
      })
    }
  }
  return headings
}

// Markdownテーブルのパース
interface ParsedTable {
  headers: string[]
  rows: string[][]
}

function parseMarkdownTable(block: string): ParsedTable | null {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return null
  if (!lines[0].includes('|')) return null

  // 1行目: ヘッダー
  const headers = lines[0]
    .split('|')
    .map((c) => c.trim())
    .filter((_, i, arr) => (i > 0 && i < arr.length - 1) || arr.length <= 2)

  // 2行目: アライメント行 (|---|---|)
  const isAlignRow = /^\|?[\s-:]+\|[\s-:]+\|?/.test(lines[1])
  if (!isAlignRow) return null

  const rows: string[][] = []
  for (let i = 2; i < lines.length; i++) {
    const rawCells = lines[i].split('|').map((c) => c.trim())
    const cells = rawCells.slice(1, -1)
    if (cells.length > 0) {
      rows.push(cells)
    }
  }

  return { headers, rows }
}

export default function GeneratorView(): React.JSX.Element {
  const [fileData, setFileData] = useState<MarkdownFileData | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [templates, setTemplates] = useState<TemplateInfo[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default')
  const [outputPath, setOutputPath] = useState<string>('')

  // フォーム用ステート
  const [title, setTitle] = useState<string>('')
  const [author, setAuthor] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [toc, setToc] = useState<boolean>(true)

  // 実行状態
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [progress, setProgress] = useState<PfpdfProgressEvent | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [result, setResult] = useState<PdfGenerateResult | null>(null)
  const [activeTab, setActiveTab] = useState<'formatted' | 'raw' | 'logs'>('formatted')

  const logEndRef = useRef<HTMLDivElement>(null)

  // テンプレート一覧取得 & 進捗リスナー登録
  useEffect(() => {
    if (!window.pfpdfAPI) return

    Promise.all([
      window.pfpdfAPI.getOfficialTemplates(),
      window.pfpdfAPI.getCustomTemplates ? window.pfpdfAPI.getCustomTemplates() : Promise.resolve([])
    ]).then(([official, custom]) => {
      const customFormatted: TemplateInfo[] = (custom || []).map((t) => ({
        id: t.id,
        name: `${t.name} (自作)`,
        description: t.description || 'PowerPoint・自作テンプレート',
        category: 'custom',
        tags: ['自作', t.sourcePptx ? 'PPTX' : 'カスタム']
      }))
      setTemplates([...official, ...customFormatted])
    })

    const unsubscribe = window.pfpdfAPI.onProgress((event) => {
      setProgress(event)
      setLogs((prev) => [...prev, `[${event.stage}] ${event.message}`])
    })

    return () => unsubscribe()
  }, [])

  // ウィンドウ全体のデフォルトのドラッグ＆ドロップ動作を抑止
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => e.preventDefault()
    const handleWindowDrop = (e: DragEvent) => e.preventDefault()
    window.addEventListener('dragover', handleWindowDragOver)
    window.addEventListener('drop', handleWindowDrop)
    return () => {
      window.removeEventListener('dragover', handleWindowDragOver)
      window.removeEventListener('drop', handleWindowDrop)
    }
  }, [])

  // ログが追加されたら下へ自動スクロール
  useEffect(() => {
    if (activeTab === 'logs') {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, activeTab])

  // ファイルが読み込まれたときの共通初期化
  const handleFileLoaded = (data: MarkdownFileData) => {
    setFileData(data)
    setTitle(data.frontMatter.title || data.fileName.replace(/\.(md|markdown)$/i, ''))
    setAuthor(data.frontMatter.author || '')
    setDate(data.frontMatter.date || new Date().toISOString().slice(0, 10))
    setToc(data.frontMatter.toc !== false)

    if (data.frontMatter.template) {
      setSelectedTemplate(data.frontMatter.template)
    }

    const defaultPdfName = data.fileName.replace(/\.(md|markdown)$/i, '') + '.pdf'
    const dir = data.filePath.substring(0, Math.max(data.filePath.lastIndexOf('/'), data.filePath.lastIndexOf('\\')))
    const separator = data.filePath.includes('\\') ? '\\' : '/'
    setOutputPath(`${dir}${separator}${defaultPdfName}`)

    setResult(null)
    setLogs([])
  }

  // ファイルダイアログ選択
  const handleSelectFile = async () => {
    if (!window.pfpdfAPI) return
    try {
      const data = await window.pfpdfAPI.selectMarkdownFile()
      if (data) handleFileLoaded(data)
    } catch (err: any) {
      console.error(err)
    }
  }

  // ドラッグ＆ドロップ処理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    const file = files[0]
    const isMd = /\.(md|markdown)$/i.test(file.name)
    if (!isMd) {
      alert('Markdown ファイル (.md または .markdown) をドロップしてください。')
      return
    }

    try {
      let filePath = ''
      if (window.pfpdfAPI?.getPathForFile) {
        filePath = window.pfpdfAPI.getPathForFile(file)
      }
      if (!filePath && (file as any).path) {
        filePath = (file as any).path
      }

      if (filePath && window.pfpdfAPI?.readMarkdownFile) {
        const data = await window.pfpdfAPI.readMarkdownFile(filePath)
        handleFileLoaded(data)
      } else {
        const content = await file.text()
        const data = await window.pfpdfAPI.parseMarkdownContent(content, file.name)
        handleFileLoaded(data)
      }
    } catch (err: any) {
      console.error('File read error:', err)
      try {
        const content = await file.text()
        const data = await window.pfpdfAPI.parseMarkdownContent(content, file.name)
        handleFileLoaded(data)
      } catch (innerErr: any) {
        alert('ファイルの読み込みに失敗しました: ' + innerErr.message)
      }
    }
  }

  // 出力先ファイルの選択
  const handleSelectOutputPath = async () => {
    if (!window.pfpdfAPI) return
    const defaultName = fileData ? fileData.fileName.replace(/\.(md|markdown)$/i, '.pdf') : 'document.pdf'
    const chosen = await window.pfpdfAPI.selectPdfSavePath(defaultName)
    if (chosen) {
      setOutputPath(chosen)
    }
  }

  // PDF 生成実行
  const handleGenerate = async () => {
    if (!fileData || !outputPath || !window.pfpdfAPI) return

    setIsGenerating(true)
    setResult(null)
    setLogs([])
    setActiveTab('logs')

    const frontMatterObj: Record<string, any> = {
      ...fileData.frontMatter,
      title,
      author,
      date,
      template: selectedTemplate,
      toc
    }

    const yamlLines = Object.entries(frontMatterObj)
      .filter(([_, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}: ${typeof v === 'string' ? `"${v}"` : v}`)

    const rebuiltContent = `---\n${yamlLines.join('\n')}\n---\n\n${fileData.body}`

    const options: PdfGenerateOptions = {
      inputPath: fileData.filePath,
      contentOverride: rebuiltContent,
      outputPath,
      template: selectedTemplate,
      toc,
      title
    }

    try {
      const res = await window.pfpdfAPI.generatePdf(options)
      setResult(res)
    } catch (err: any) {
      setResult({ success: false, logs: [], error: err.message })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleOpenPdf = () => {
    if (result?.outputPdfPath && window.pfpdfAPI) {
      window.pfpdfAPI.openPdf(result.outputPdfPath)
    }
  }

  const handleOpenFolder = () => {
    if (result?.outputPdfPath && window.pfpdfAPI) {
      window.pfpdfAPI.showInFolder(result.outputPdfPath)
    }
  }

  // 現在選択されているテンプレートのフォーマット詳細
  const currentFormat: TemplateFormatDetail =
    TEMPLATE_DETAILS[selectedTemplate] || {
      id: selectedTemplate,
      name: selectedTemplate.startsWith('custom-') ? '自作テンプレート (PPTX)' : selectedTemplate,
      color: '#ea580c',
      layoutName: '自作 (PowerPointインポート)',
      fontName: 'PowerPointで設定されたフォント',
      coverType: 'standalone',
      coverTypeName: 'PPTXスライド表紙',
      coverFeature: 'PPTXで配置した表紙テキストボックスに自動置換',
      runningHeader: 'PowerPointスライドマスター準拠',
      pageNumberPos: '下部中央',
      h1Style: { color: '#ea580c', borderBottom: '2px solid #ea580c' },
      h2Style: { color: '#1f2937', borderLeft: '4px solid #ea580c' },
      tableHeaderBg: '#ea580c',
      features: ['PPTX表紙レイアウト', '自動テキスト置換', 'ノンブル中央', 'カスタムカラー'],
      badge: '自作PPTX',
      bestFor: '自社スライド・独自デザイン報告書',
      thumbnail: {
        hasTopBar: true,
        hasCenterTitle: false,
        h1BarColor: '#ea580c',
        accentColor: '#f97316'
      }
    }

  // Markdownから抽出した見出しリスト
  const markdownHeadings = fileData ? extractHeadings(fileData.body) : []

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 p-6 max-w-7xl mx-auto w-full overflow-hidden select-none">
      {/* 左カラム: 入力・設定・アクション */}
      <div className="w-full md:w-1/2 flex flex-col gap-5 overflow-y-auto pr-1">
        {/* ファイル読み込みドロップゾーン */}
        {!fileData ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleSelectFile}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group bg-white shadow-sm ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 scale-[1.01] ring-4 ring-blue-500/10'
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform pointer-events-none">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1 pointer-events-none">
              Markdown ファイルをドラッグ＆ドロップ
            </h3>
            <p className="text-xs text-slate-500 mb-4 pointer-events-none">または、ここをクリックしてファイルを選択</p>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium shadow-sm transition pointer-events-none"
            >
              <FolderOpen className="w-4 h-4" />
              ファイルを選択 (.md)
            </button>
          </div>
        ) : (
          /* 読み込み済みファイルカード */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between transition-all ${
              isDragging ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden pointer-events-none">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="text-sm font-semibold text-slate-800 truncate flex items-center gap-2">
                  <span>{fileData.fileName}</span>
                  {fileData.frontMatter.template && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono font-normal">
                      指定: {fileData.frontMatter.template}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 truncate">{fileData.filePath}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSelectFile}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
              >
                変更
              </button>
              <button
                onClick={() => setFileData(null)}
                className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-slate-100 transition"
                title="閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Front Matter & 設定フォーム */}
        {fileData && (
          <>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Front Matter 設定 (メタ情報)</span>
                </div>
                <span className="text-[11px] text-slate-400">PDFの表紙やヘッダーに反映</span>
              </div>

              {/* タイトル */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  文書タイトル (title)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: プロジェクト仕様書"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              {/* 著者 & 日付 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    著者 (author)
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="例: 開発チーム"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      日付 (date)
                    </label>
                    <button
                      type="button"
                      onClick={() => setDate(new Date().toISOString().slice(0, 10))}
                      className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      <RotateCcw className="w-2.5 h-2.5" /> 今日
                    </button>
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* 目次トグル */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block">目次を自動生成 (toc)</span>
                    <span className="text-[11px] text-slate-400 block">文書内の見出し（H1〜H3）から目次ページを挿入</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={toc}
                    onChange={(e) => setToc(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* テンプレート選択 ＆ フォーマットビジュアルカード */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>適用テンプレートを選択</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  現在: <strong className="text-blue-700 font-bold">{currentFormat.name}</strong>
                </span>
              </div>

              {/* テンプレート一覧グリッド (ビジュアルカード ＋ ミニサムネイル) */}
              <div className="grid grid-cols-2 gap-2.5">
                {templates.map((tpl) => {
                  const isSelected = selectedTemplate === tpl.id
                  const detail = TEMPLATE_DETAILS[tpl.id] || {
                    color: tpl.id.startsWith('custom-') ? '#ea580c' : '#0f5e5a',
                    layoutName: tpl.category === 'custom' ? '自作 (PPTX)' : '標準レポート',
                    badge: tpl.category === 'custom' ? '自作PPTX' : '公式',
                    thumbnail: {
                      hasTopBar: true,
                      hasCenterTitle: false,
                      h1BarColor: tpl.id.startsWith('custom-') ? '#ea580c' : '#0f5e5a',
                      accentColor: '#f97316'
                    }
                  }

                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`text-left p-3 rounded-xl border transition-all duration-150 relative overflow-hidden group flex gap-2.5 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                      }`}
                    >
                      {/* 左側のカラーアクセント縦ライン */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1.5"
                        style={{ backgroundColor: detail.color }}
                      />

                      {/* A4ミニチュアプレビューアイコン */}
                      <div className="w-8 h-11 bg-white border border-slate-300 rounded-[2px] shadow-2xs relative shrink-0 overflow-hidden flex flex-col p-0.5 ml-1">
                        {detail.thumbnail?.hasTopBar && (
                          <div
                            className="h-1 w-full rounded-xs mb-0.5"
                            style={{ backgroundColor: detail.color }}
                          />
                        )}
                        {detail.thumbnail?.hasCenterTitle ? (
                          <div className="my-auto space-y-0.5">
                            <div
                              className="h-0.5 w-4 mx-auto rounded-xs"
                              style={{ backgroundColor: detail.color }}
                            />
                            <div className="h-0.5 w-2.5 mx-auto bg-slate-200 rounded-xs" />
                          </div>
                        ) : (
                          <div className="mt-1 space-y-0.5">
                            <div
                              className="h-0.5 w-5 rounded-xs"
                              style={{ backgroundColor: detail.color }}
                            />
                            <div className="h-0.5 w-3.5 bg-slate-200 rounded-xs" />
                          </div>
                        )}
                        <div className="mt-auto flex justify-center pb-0.5">
                          <div className="h-0.5 w-2 bg-slate-300 rounded-xs" />
                        </div>
                      </div>

                      {/* テキスト詳細 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span
                            className={`text-xs font-bold truncate ${
                              isSelected ? 'text-blue-800' : 'text-slate-800'
                            }`}
                          >
                            {tpl.name}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </div>

                        <div className="mb-1">
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-medium">
                            {detail.badge}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                          {tpl.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* 選択中テンプレートの「組版フォーマット仕様」カード */}
              <div className="p-4 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-xl border border-slate-200 space-y-3 text-xs shadow-2xs">
                <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-1.5 text-blue-900">
                    <Palette className="w-4 h-4 text-blue-600" />
                    <span>【{currentFormat.name}】組版フォーマット仕様</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-blue-100/70 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md font-semibold">
                      {currentFormat.coverTypeName}
                    </span>
                    <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono text-slate-600">
                      A4 縦
                    </span>
                  </div>
                </div>

                {/* スペックグリッド */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">レイアウト種別:</span>
                    <span className="font-semibold text-slate-700">{currentFormat.layoutName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">テーマカラー:</span>
                    <span
                      className="font-mono font-bold flex items-center gap-1.5"
                      style={{ color: currentFormat.color }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block shadow-2xs"
                        style={{ backgroundColor: currentFormat.color }}
                      />
                      {currentFormat.color}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">フォント仕様:</span>
                    <span className="text-slate-700 truncate block">{currentFormat.fontName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">ページ番号位置:</span>
                    <span className="text-slate-700">{currentFormat.pageNumberPos}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">ランニングヘッダー:</span>
                    <span className="text-slate-700">{currentFormat.runningHeader}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">推奨用途:</span>
                    <span className="text-blue-900 font-medium">{currentFormat.bestFor}</span>
                  </div>
                </div>

                {/* スタイル見本（H1 / H2 / 表ヘッダー ミニチュア） */}
                <div className="pt-2.5 border-t border-slate-200/70 flex flex-wrap items-center gap-4 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">H1見出し:</span>
                    <span
                      style={{
                        color: currentFormat.h1Style.color,
                        borderBottom: currentFormat.h1Style.borderBottom
                      }}
                      className="font-bold px-1"
                    >
                      大見出し
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">H2見出し:</span>
                    <span
                      style={{
                        color: currentFormat.h2Style.color,
                        borderLeft: currentFormat.h2Style.borderLeft
                      }}
                      className="font-bold pl-1.5"
                    >
                      中見出し
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">表ヘッダー:</span>
                    <span
                      style={{ backgroundColor: currentFormat.tableHeaderBg }}
                      className="text-white text-[10px] px-1.5 py-0.5 rounded font-bold"
                    >
                      項目名
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 出力先 & PDF生成ボタン */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  出力先 PDF ファイルパス
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={outputPath}
                    onChange={(e) => setOutputPath(e.target.value)}
                    placeholder="C:\Users\...\output.pdf"
                    className="flex-1 px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={handleSelectOutputPath}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 transition shrink-0"
                  >
                    参照...
                  </button>
                </div>
              </div>

              {/* PDF生成実行ボタン */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !fileData || !outputPath}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>PDF をレンダリング中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>【{currentFormat.name}】で PDF を生成する</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* 右カラム: プレビュー & ログ / 完了結果 */}
      <div className="w-full md:w-1/2 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full min-h-[500px]">
        {/* タブバー */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 bg-slate-50 shrink-0">
          <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('formatted')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'formatted'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              フォーマット適用プレビュー
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('raw')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'raw'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              生テキスト
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'logs'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              実行ログ
              {logs.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-pulse" />
              )}
            </button>
          </div>

          {progress && (
            <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold uppercase text-blue-600">[{progress.stage}]</span>
              <span className="truncate max-w-[160px]">{progress.message}</span>
            </div>
          )}
        </div>

        {/* 生成完了バナー */}
        {result && (
          <div
            className={`p-4 border-b flex items-center justify-between shrink-0 ${
              result.success
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-red-50/70 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {result.success ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
              )}
              <div>
                <div className="text-xs font-bold">
                  {result.success ? 'PDF の生成に成功しました！' : 'PDF 生成エラー'}
                </div>
                <div className="text-[11px] opacity-80 truncate max-w-sm">
                  {result.success
                    ? `${result.outputPdfPath} (${((result.byteSize || 0) / 1024).toFixed(1)} KB)`
                    : result.error}
                </div>
              </div>
            </div>

            {result.success && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  PDFを開く
                </button>
                <button
                  type="button"
                  onClick={handleOpenFolder}
                  className="p-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs transition"
                  title="保存フォルダを開く"
                >
                  <Folder className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-y-auto bg-slate-100/70 p-5">
          {activeTab === 'formatted' ? (
            fileData ? (
              /* フォーマット適用リアルタイムプレビュー (A4用紙シートシミュレーション) */
              <div className="space-y-6 max-w-2xl mx-auto flex flex-col items-center">
                {/* プレビューステータスバー */}
                <div className="w-full flex items-center justify-between px-3 py-2 bg-white/90 backdrop-blur-xs border border-slate-200/90 rounded-xl text-[11px] text-slate-600 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: currentFormat.color }}
                    />
                    <span className="font-semibold text-slate-800">
                      【{currentFormat.name}】 組版シミュレーション
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500 font-mono">A4 縦 (210×297mm)</span>
                  </div>
                  <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full font-medium">
                    {currentFormat.coverTypeName}
                  </span>
                </div>

                {/* ページ 1: 独立表紙 (coverType === 'standalone' の場合) */}
                {currentFormat.coverType === 'standalone' && (
                  <div className="bg-white shadow-md border border-slate-300/80 rounded-xs w-full max-w-[520px] aspect-[1/1.414] p-10 flex flex-col justify-between relative overflow-hidden transition-all duration-200">
                    {/* ページ右上バッジ */}
                    <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-100/90 px-1.5 py-0.5 rounded">
                      Page 1 (表紙)
                    </div>

                    {/* 表紙トップ帯 (PFN, Technical, Notebookなど) */}
                    <div>
                      {currentFormat.thumbnail.hasTopBar && (
                        <div
                          className="h-2.5 w-32 rounded-xs mb-8"
                          style={{ backgroundColor: currentFormat.color }}
                        />
                      )}
                    </div>

                    {/* 中央タイトル部 */}
                    <div className="my-auto space-y-3">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                        DOCUMENT TITLE
                      </span>
                      <h1
                        style={{ color: currentFormat.color }}
                        className="text-2xl font-bold tracking-tight leading-snug break-words"
                      >
                        {title || '(タイトル未設定)'}
                      </h1>
                      <div
                        className="w-16 h-1 rounded-full mt-3"
                        style={{ backgroundColor: currentFormat.color, opacity: 0.3 }}
                      />
                    </div>

                    {/* 下部著者・日付部 */}
                    <div className="pt-6 border-t border-slate-200/80 flex items-end justify-between text-xs text-slate-600">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 block font-mono">AUTHOR</span>
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{author || '著者未設定'}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="text-[10px] text-slate-400 block font-mono">DATE</span>
                        <div className="font-mono text-slate-600 flex items-center gap-1.5 justify-end">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{date || '日付未設定'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ページ 2（または一体型のページ 1）: 目次 ＆ 本文組版 */}
                <div className="bg-white shadow-md border border-slate-300/80 rounded-xs w-full max-w-[520px] min-h-[735px] p-10 flex flex-col justify-between relative overflow-hidden transition-all duration-200">
                  {/* ページ右上バッジ */}
                  <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-100/90 px-1.5 py-0.5 rounded">
                    Page {currentFormat.coverType === 'standalone' ? '2' : '1'} (本文)
                  </div>

                  <div>
                    {/* 上部ランニングヘッダー */}
                    <div className="border-b border-slate-200/80 pb-2 mb-6 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="truncate max-w-[200px]">{title || 'ドキュメント'}</span>
                      <span className="truncate max-w-[180px]">
                        {currentFormat.runningHeader}
                      </span>
                    </div>

                    {/* 本文一体型（academic / compact）のタイトルヘッダー */}
                    {currentFormat.coverType === 'integrated' && (
                      <div className="mb-6 pb-4 border-b border-slate-200 text-center space-y-2">
                        <h1
                          style={{ color: currentFormat.color }}
                          className="text-xl font-bold tracking-tight"
                        >
                          {title || '(タイトル未設定)'}
                        </h1>
                        <div className="text-xs text-slate-600 flex items-center justify-center gap-4">
                          {author && <span>{author}</span>}
                          {date && <span className="font-mono text-slate-400">{date}</span>}
                        </div>
                      </div>
                    )}

                    {/* 目次表示 (tocが有効な場合) */}
                    {toc && (
                      <div className="mb-8 p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl space-y-2.5">
                        <div
                          style={{
                            color: currentFormat.color,
                            borderBottom: `2px solid ${currentFormat.color}`
                          }}
                          className="text-xs font-bold pb-1 flex items-center justify-between"
                        >
                          <span className="flex items-center gap-1.5">
                            <ListOrdered className="w-3.5 h-3.5" />
                            目 次
                          </span>
                          <span className="text-[10px] font-mono font-normal opacity-70">Table of Contents</span>
                        </div>

                        {markdownHeadings.length > 0 ? (
                          <div className="space-y-1 text-[11px] text-slate-700 font-sans">
                            {markdownHeadings.slice(0, 7).map((hd, hIdx) => (
                              <div
                                key={hIdx}
                                className={`flex items-baseline justify-between ${
                                  hd.level === 1
                                    ? 'font-bold text-slate-800 pt-0.5'
                                    : hd.level === 2
                                    ? 'pl-3 text-slate-700'
                                    : 'pl-6 text-slate-500'
                                }`}
                              >
                                <span className="truncate pr-2">{hd.text}</span>
                                <div className="flex-1 border-b border-dotted border-slate-300 mx-1 mb-1" />
                                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                  {hd.level === 1 ? '1' : hd.level === 2 ? '1' : '2'}
                                </span>
                              </div>
                            ))}
                            {markdownHeadings.length > 7 && (
                              <div className="text-[10px] text-slate-400 pl-3 italic">
                                ...他 {markdownHeadings.length - 7} 項目
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic py-1">
                            文書内に見出し（#、##）が存在しません
                          </div>
                        )}
                      </div>
                    )}

                    {/* 本文段落レンダリング */}
                    <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                      {fileData.body.split('\n\n').map((paragraph, idx) => {
                        const trimmed = paragraph.trim()
                        if (!trimmed) return null

                        // H1見出し
                        if (trimmed.startsWith('# ')) {
                          return (
                            <h1
                              key={idx}
                              style={{
                                color: currentFormat.h1Style.color,
                                borderBottom: currentFormat.h1Style.borderBottom
                              }}
                              className="text-base font-bold pb-1 mt-6 mb-2"
                            >
                              {trimmed.replace(/^#\s+/, '')}
                            </h1>
                          )
                        }

                        // H2見出し
                        if (trimmed.startsWith('## ')) {
                          return (
                            <h2
                              key={idx}
                              style={{
                                color: currentFormat.h2Style.color,
                                borderLeft: currentFormat.h2Style.borderLeft
                              }}
                              className="text-xs font-bold pl-2.5 mt-5 mb-2"
                            >
                              {trimmed.replace(/^##\s+/, '')}
                            </h2>
                          )
                        }

                        // H3見出し
                        if (trimmed.startsWith('### ')) {
                          return (
                            <h3
                              key={idx}
                              className="text-xs font-bold text-slate-800 mt-4 mb-1 pl-1"
                            >
                              {trimmed.replace(/^###\s+/, '')}
                            </h3>
                          )
                        }

                        // Markdown テーブル
                        const parsedTable = parseMarkdownTable(trimmed)
                        if (parsedTable) {
                          return (
                            <div
                              key={idx}
                              className="my-3 overflow-x-auto rounded-lg border border-slate-200 shadow-2xs"
                            >
                              <table className="w-full text-left text-[11px] border-collapse">
                                <thead>
                                  <tr
                                    style={{ backgroundColor: currentFormat.tableHeaderBg }}
                                    className="text-white"
                                  >
                                    {parsedTable.headers.map((h, hIdx) => (
                                      <th key={hIdx} className="px-3 py-1.5 font-bold border-b border-black/10">
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {parsedTable.rows.map((row, rIdx) => (
                                    <tr
                                      key={rIdx}
                                      className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                                    >
                                      {row.map((cell, cIdx) => (
                                        <td
                                          key={cIdx}
                                          className="px-3 py-1.5 border-t border-slate-200/60 text-slate-700"
                                        >
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )
                        }

                        // コードブロック
                        if (trimmed.startsWith('```')) {
                          return (
                            <pre
                              key={idx}
                              className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto shadow-2xs border border-slate-800 my-3"
                            >
                              <code>{trimmed.replace(/```[a-z]*\n?/gi, '')}</code>
                            </pre>
                          )
                        }

                        // 箇条書き
                        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                          const items = trimmed.split('\n')
                          return (
                            <ul key={idx} className="list-disc list-inside space-y-1 pl-2 text-slate-700">
                              {items.map((it, iIdx) => (
                                <li key={iIdx}>{it.replace(/^[*•-]\s+/, '')}</li>
                              ))}
                            </ul>
                          )
                        }

                        return (
                          <p key={idx} className="leading-relaxed">
                            {trimmed}
                          </p>
                        )
                      })}
                    </div>
                  </div>

                  {/* 下部ノンブル（ページ番号） */}
                  <div
                    className={`text-[10px] text-slate-400 font-mono pt-6 pb-2 border-t border-slate-100 flex ${
                      currentFormat.pageNumberPos.includes('右')
                        ? 'justify-end'
                        : 'justify-center'
                    }`}
                  >
                    <span>- 1 -</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-16">
                <FileText className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
                <span>Markdown ファイルを読み込むと本文組版プレビューが表示されます</span>
              </div>
            )
          ) : activeTab === 'raw' ? (
            /* 生テキスト (Markdown) */
            fileData ? (
              <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed font-mono text-xs bg-white p-5 rounded-xl border border-slate-200/80 whitespace-pre-wrap shadow-2xs">
                {fileData.content}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-16">
                <FileText className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
                <span>Markdown ファイルが読み込まれていません</span>
              </div>
            )
          ) : (
            /* ログコンソール */
            <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs h-full min-h-[300px] overflow-y-auto space-y-1 shadow-inner">
              {logs.length === 0 ? (
                <div className="text-slate-500 italic">「PDF を生成する」を実行すると、リアルタイムログがここに表示されます...</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed whitespace-pre-wrap break-all">
                    {log}
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
