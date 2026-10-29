import React, { useState, useEffect, useRef } from 'react'
import {
  FileText,
  UploadCloud,
  FolderOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Folder,
  Terminal,
  Calendar,
  User,
  BookOpen,
  ListOrdered,
  X,
  FileCode,
  RotateCcw
} from 'lucide-react'
import {
  MarkdownFileData,
  TemplateInfo,
  PdfGenerateResult,
  PfpdfProgressEvent,
  PdfGenerateOptions
} from '../../../shared/types'

export default function GeneratorView(): React.JSX.Element {
  const [fileData, setFileData] = useState<MarkdownFileData | null>(null)
  const [templates, setTemplates] = useState<TemplateInfo[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default')
  const [title, setTitle] = useState<string>('')
  const [author, setAuthor] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [toc, setToc] = useState<boolean>(true)
  const [outputPath, setOutputPath] = useState<string>('')

  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [progress, setProgress] = useState<PfpdfProgressEvent | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [result, setResult] = useState<PdfGenerateResult | null>(null)
  const [activeTab, setActiveTab] = useState<'preview' | 'logs'>('preview')

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
    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault()
    }
    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault()
    }
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

  // ファイル読み込みハンドラー
  const handleFileLoaded = (data: MarkdownFileData) => {
    setFileData(data)
    setTitle(data.frontMatter.title || data.fileName.replace(/\.md$/i, ''))
    setAuthor(data.frontMatter.author || '')
    setDate(data.frontMatter.date || new Date().toISOString().slice(0, 10))
    setToc(data.frontMatter.toc !== false)

    if (data.frontMatter.template && typeof data.frontMatter.template === 'string') {
      setSelectedTemplate(data.frontMatter.template)
    }

    // 出力先初期値（同じディレクトリに .pdf で保存）
    const defaultPdfName = data.fileName.replace(/\.(md|markdown)$/i, '.pdf')
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
      // 1. Electron 30+ 公式推奨の webUtils.getPathForFile で絶対パスを取得
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
        // パスが取得できない場合の確実なフォールバック (File API で直接コンテンツを読み取り)
        const text = await file.text()
        if (window.pfpdfAPI?.parseMarkdownContent) {
          const data = await window.pfpdfAPI.parseMarkdownContent(text, file.name, filePath || undefined)
          handleFileLoaded(data)
        }
      }
    } catch (err: any) {
      console.error('Failed to load dropped file:', err)
      alert(`ファイルの読み込みに失敗しました: ${err.message}`)
    }
  }

  // 出力先変更
  const handleChangeSavePath = async () => {
    if (!window.pfpdfAPI) return
    const defaultName = title ? `${title}.pdf` : 'output.pdf'
    const newPath = await window.pfpdfAPI.selectPdfSavePath(defaultName)
    if (newPath) {
      setOutputPath(newPath)
    }
  }

  // PDF 生成実行
  const handleGenerate = async () => {
    if (!fileData || !outputPath || !window.pfpdfAPI) return

    setIsGenerating(true)
    setResult(null)
    setLogs([])
    setActiveTab('logs')

    // Front Matter を上書きした Markdown コンテンツを組み立て
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

  // PDF を開く
  const handleOpenPdf = () => {
    if (result?.outputPdfPath && window.pfpdfAPI) {
      window.pfpdfAPI.openPdf(result.outputPdfPath)
    }
  }

  // フォルダを開く
  const handleOpenFolder = () => {
    if (result?.outputPdfPath && window.pfpdfAPI) {
      window.pfpdfAPI.showInFolder(result.outputPdfPath)
    }
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 p-6 max-w-7xl mx-auto w-full overflow-hidden">
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
          /* 読み込み済みファイルカード (ここにもドロップ可能) */
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
                <div className="text-sm font-semibold text-slate-800 truncate">{fileData.fileName}</div>
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
                    著者 / 組織 (author)
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="例: 山田 太郎"
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

            {/* テンプレート選択 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>適用テンプレート</span>
                </div>
                <span className="text-[11px] text-slate-400">pfpdf 公式7種同梱</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {templates.map((tpl) => {
                  const isSelected = selectedTemplate === tpl.id
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`text-left p-3 rounded-xl border transition-all duration-150 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                          {tpl.name}
                        </span>
                        {tpl.tags?.[0] && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            {tpl.tags[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {tpl.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 出力先 & PDF生成ボタン */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PDF 出力先
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={outputPath}
                    readOnly
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none truncate"
                  />
                  <button
                    type="button"
                    onClick={handleChangeSavePath}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition shrink-0"
                  >
                    変更...
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !outputPath}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>PDF をレンダリング中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>PDF を生成する</span>
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
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 bg-slate-50">
          <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'preview'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              本文プレビュー
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
              <span className="truncate max-w-[200px]">{progress.message}</span>
            </div>
          )}
        </div>

        {/* 生成完了バナー */}
        {result && (
          <div
            className={`p-4 border-b flex items-center justify-between ${
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
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'preview' ? (
            fileData ? (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">適用されるメタ情報</div>
                  <div className="font-bold text-slate-800 text-sm">{title || '(タイトル未設定)'}</div>
                  <div className="text-slate-600">
                    {author ? `著者: ${author}` : ''} {date ? `・ 日付: ${date}` : ''}
                  </div>
                </div>

                <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed font-sans whitespace-pre-wrap font-mono text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  {fileData.body}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-16">
                <FileText className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
                <span>Markdown ファイルを読み込むと本文が表示されます</span>
              </div>
            )
          ) : (
            /* ログコンソール */
            <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs h-full min-h-[300px] overflow-y-auto space-y-1">
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
