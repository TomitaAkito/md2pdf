import React, { useState, useEffect, useRef } from 'react'
import {
  Upload,
  FileText,
  FileCode,
  FolderOpen,
  FileDown,
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
  Check,
  PenTool,
  Save,
  Settings2,
  Plus,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  Code,
  Quote,
  Table as TableIcon,
  FilePlus,
  ChevronUp,
  ChevronDown,
  CheckSquare,
  Minus
} from 'lucide-react'
import {
  MarkdownFileData,
  TemplateInfo,
  PdfGenerateOptions,
  PdfGenerateResult,
  PfpdfProgressEvent,
  CustomTemplateData
} from '../../../shared/types'

// 各テンプレートのフォーマット・デザイン仕様定義（pfpdf公式CSS/HTML準拠）
interface TemplateFormatDetail {
  id: string
  name: string
  color: string
  paperBg: string
  coverBg: string
  coverTextColor: string
  fontFamily: 'sans' | 'serif'
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
    color: '#19438f',
    paperBg: '#ffffff',
    coverBg: 'linear-gradient(135deg, #111b64 0%, #19438f 52%, #1b75b4 100%)',
    coverTextColor: '#ffffff',
    fontFamily: 'sans',
    layoutName: '公式コーポレート・企業報告書',
    fontName: 'Noto Sans JP (モダンサンセリフ)',
    coverType: 'standalone',
    coverTypeName: '独立表紙（全面ディープブルーグラデーション）',
    coverFeature: '全面ブルーグラデーション ＋ 白文字中央タイトル ＋ 右上赤CONFIDENTIAL',
    runningHeader: '章タイトル連動ヘッダー',
    pageNumberPos: '下部中央 (- 1 -)',
    h1Style: { color: '#19438f', borderBottom: '2.5px solid #19438f' },
    h2Style: { color: '#19438f', borderLeft: '4px solid #19438f' },
    tableHeaderBg: '#19438f',
    features: ['濃紺グラデーション表紙', '白文字タイポグラフィ', 'CONFIDENTIALバッジ', '公式コーポレート'],
    badge: '公式コーポレート',
    bestFor: '企業報告書・コーポレート技術文書・公式仕様書',
    thumbnail: {
      hasTopBar: false,
      hasCenterTitle: true,
      h1BarColor: '#19438f',
      accentColor: '#19438f'
    }
  },
  academic: {
    id: 'academic',
    name: 'Academic',
    color: '#243f5b',
    paperBg: '#ffffff',
    coverBg: '#ffffff',
    coverTextColor: '#20252b',
    fontFamily: 'serif',
    layoutName: '学術論文・テクニカルレポート',
    fontName: 'Noto Serif JP (学術・明朝セリフ体)',
    coverType: 'standalone',
    coverTypeName: '独立表紙（ジャーナル二重線マストヘッド）',
    coverFeature: '上部二重線マストヘッド ＋ 重厚なセリフ体タイトル',
    runningHeader: '上部細線 ＋ 論文タイトル',
    pageNumberPos: '下部中央',
    h1Style: { color: '#243f5b', borderBottom: '1px solid #243f5b' },
    h2Style: { color: '#243f5b' },
    tableHeaderBg: '#243f5b',
    features: ['二重線マストヘッド', '学術明朝・セリフ体', '独立表紙', '数式・論文最適化'],
    badge: '論文・研究',
    bestFor: '学術論文・査読用レポート・大学課題・研究発表',
    thumbnail: {
      hasTopBar: true,
      hasCenterTitle: false,
      h1BarColor: '#243f5b',
      accentColor: '#243f5b'
    }
  },
  technical: {
    id: 'technical',
    name: 'Technical',
    color: '#086f83',
    paperBg: '#ffffff',
    coverBg: '#ffffff',
    coverTextColor: '#17202a',
    fontFamily: 'sans',
    layoutName: '技術仕様書・APIドキュメント',
    fontName: 'Noto Sans JP ＋ 等幅コード重視',
    coverType: 'standalone',
    coverTypeName: '独立表紙（左端深青緑縦バー）',
    coverFeature: '左端5mmバー ＋ 等幅シリーズ名 ＋ 高密度コード',
    runningHeader: 'APIセクション名連動ヘッダー',
    pageNumberPos: '下部右寄せ',
    h1Style: { color: '#086f83', borderBottom: '2px solid #086f83' },
    h2Style: { color: '#064e5d', borderLeft: '3.5px solid #086f83' },
    tableHeaderBg: '#086f83',
    features: ['左端5mmバー', 'コードブロック重視', '高密度レイアウト', '右寄せノンブル'],
    badge: '技術仕様書',
    bestFor: 'APIリファレンス・システム設計書・エンジニア向け手引き',
    thumbnail: {
      hasTopBar: false,
      hasCenterTitle: false,
      h1BarColor: '#086f83',
      accentColor: '#086f83'
    }
  },
  book: {
    id: 'book',
    name: 'Book',
    color: '#5b312e',
    paperBg: '#fdfbf6',
    coverBg: '#fdfbf6',
    coverTextColor: '#292521',
    fontFamily: 'serif',
    layoutName: '書籍・長文マニュアル',
    fontName: 'Noto Serif JP (書籍明朝・ゆったり行間)',
    coverType: 'standalone',
    coverTypeName: '独立表紙（アイボリー紙＆二重枠フレーム）',
    coverFeature: 'クリーム紙 ＋ エレガント二重枠 ＋ 中央揃えセリフ体',
    runningHeader: '見開き連動（左: 書籍名、右: 章名）',
    pageNumberPos: '見開き配置（偶数左下 / 奇数右下）',
    h1Style: { color: '#292521', borderBottom: '1px solid #b8aea0' },
    h2Style: { color: '#5b312e' },
    tableHeaderBg: '#5b312e',
    features: ['クリーム紙色', 'クラシック二重枠', '書籍明朝セリフ体', '長文ゆったり行間'],
    badge: '書籍・長文',
    bestFor: '技術同人誌・操作マニュアル・解説書・長編ドキュメント',
    thumbnail: {
      hasTopBar: false,
      hasCenterTitle: true,
      h1BarColor: '#5b312e',
      accentColor: '#b8aea0'
    }
  },
  compact: {
    id: 'compact',
    name: 'Compact',
    color: '#343a40',
    paperBg: '#ffffff',
    coverBg: '#ffffff',
    coverTextColor: '#202428',
    fontFamily: 'sans',
    layoutName: '省スペース・短文サマリー',
    fontName: 'Noto Sans JP (高密度コンパクト)',
    coverType: 'integrated',
    coverTypeName: '表紙なし直結（上部ヘッダーバー）',
    coverFeature: '独立表紙なし ＋ 上部仕切りバー ＋ 本文即開始',
    runningHeader: 'なし（本文領域を最大化）',
    pageNumberPos: '下部右寄せ',
    h1Style: { color: '#343a40', borderBottom: '1.5px solid #aeb4b9' },
    h2Style: { color: '#343a40' },
    tableHeaderBg: '#343a40',
    features: ['表紙なし直結', '最小限の余白', '要約サマリーバー', 'ワンペーパー向け'],
    badge: '省スペース',
    bestFor: 'ワンペーパー報告・会議サマリー・要約レジュメ',
    thumbnail: {
      hasTopBar: false,
      hasCenterTitle: false,
      h1BarColor: '#343a40',
      accentColor: '#343a40'
    }
  },
  notebook: {
    id: 'notebook',
    name: 'Notebook',
    color: '#287d78',
    paperBg: '#fffdf8',
    coverBg: '#fffdf8',
    coverTextColor: '#293b40',
    fontFamily: 'sans',
    layoutName: 'カジュアル・ノートブック風',
    fontName: '親しみやすいサンセリフ (アイボリー紙)',
    coverType: 'standalone',
    coverTypeName: '独立表紙（幾何学シェイプ ＆ ティール枠）',
    coverFeature: '右上ティール＆左下コーラル幾何学 ＋ 手帳風枠線',
    runningHeader: 'メモ風ヘッダー',
    pageNumberPos: '下部中央',
    h1Style: { color: '#185b58', borderBottom: '2px dashed #287d78' },
    h2Style: { color: '#185b58', borderLeft: '4px solid #e66b58' },
    tableHeaderBg: '#287d78',
    features: ['斜め幾何学シェイプ', 'ティール＆コーラル', 'アイボリー紙', '手帳・ノート風'],
    badge: 'カジュアル',
    bestFor: '議事録・社内勉強会資料・アイデアメモ・企画書',
    thumbnail: {
      hasTopBar: true,
      hasCenterTitle: false,
      h1BarColor: '#287d78',
      accentColor: '#e66b58'
    }
  },
  default: {
    id: 'default',
    name: 'Default',
    color: '#46515c',
    paperBg: '#ffffff',
    coverBg: '#ffffff',
    coverTextColor: '#222222',
    fontFamily: 'sans',
    layoutName: '標準レポート・ニュートラル',
    fontName: '標準ゴシック (Noto Sans JP)',
    coverType: 'standalone',
    coverTypeName: '独立標準表紙（大見出し左寄せ）',
    coverFeature: '大見出しタイトル ＋ 左寄せメタデータ ＋ 汎用標準',
    runningHeader: 'ドキュメントタイトル',
    pageNumberPos: '下部中央',
    h1Style: { color: '#46515c', borderBottom: '1.5px solid #46515c' },
    h2Style: { color: '#46515c' },
    tableHeaderBg: '#46515c',
    features: ['標準ニュートラル', '大見出し左寄せ', 'ノンブル中央', 'どんな文書にも適合'],
    badge: '標準汎用',
    bestFor: 'あらゆる一般的な報告書・提案書・日常ドキュメント',
    thumbnail: {
      hasTopBar: false,
      hasCenterTitle: false,
      h1BarColor: '#46515c',
      accentColor: '#46515c'
    }
  }
}

import { marked } from 'marked'

// 見出しアイテム
interface HeadingItem {
  level: number
  text: string
}

// Markdown本文から見出し（H1〜H3）を抽出（コードブロック内は除外）
function extractHeadings(markdown: string): HeadingItem[] {
  const lines = markdown.split(/\r?\n/)
  const headings: HeadingItem[] = []
  let inCodeBlock = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue

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

// Notionライクなスラッシュコマンド定義
interface SlashCommandItem {
  id: string
  title: string
  description: string
  category: '見出し' | 'リスト' | 'ブロック'
  icon: React.ReactNode
  keywords: string[]
  insertText: string
  cursorOffset?: number
}

const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    id: 'h1',
    title: '大見出し (H1)',
    description: '大きなセクション見出しを作成',
    category: '見出し',
    icon: <Heading1 className="w-4 h-4 text-slate-700" />,
    keywords: ['h1', 'heading1', '見出し', '大見出し', 'タイトル'],
    insertText: '# '
  },
  {
    id: 'h2',
    title: '中見出し (H2)',
    description: 'サブセクションの見出しを作成',
    category: '見出し',
    icon: <Heading2 className="w-4 h-4 text-slate-700" />,
    keywords: ['h2', 'heading2', '見出し', '中見出し'],
    insertText: '## '
  },
  {
    id: 'h3',
    title: '小見出し (H3)',
    description: '項目の小見出しを作成',
    category: '見出し',
    icon: <Heading3 className="w-4 h-4 text-slate-700" />,
    keywords: ['h3', 'heading3', '見出し', '小見出し'],
    insertText: '### '
  },
  {
    id: 'bullet-list',
    title: '箇条書きリスト',
    description: 'シンプルな箇条書きリストを作成',
    category: 'リスト',
    icon: <List className="w-4 h-4 text-slate-700" />,
    keywords: ['list', 'bullet', 'ul', '箇条書き', 'リスト'],
    insertText: '- '
  },
  {
    id: 'numbered-list',
    title: '番号付きリスト',
    description: '順序付きのリストを作成',
    category: 'リスト',
    icon: <ListOrdered className="w-4 h-4 text-slate-700" />,
    keywords: ['number', 'numbered', 'ol', '番号', '数字'],
    insertText: '1. '
  },
  {
    id: 'todo-list',
    title: 'ToDo リスト',
    description: 'チェックボックス付きタスクを作成',
    category: 'リスト',
    icon: <CheckSquare className="w-4 h-4 text-slate-700" />,
    keywords: ['todo', 'task', 'check', 'タスク', 'チェック'],
    insertText: '- [ ] '
  },
  {
    id: 'quote',
    title: '引用 (Quote)',
    description: '目立たせたい引用文を作成',
    category: 'ブロック',
    icon: <Quote className="w-4 h-4 text-slate-700" />,
    keywords: ['quote', '引用', 'コールアウト'],
    insertText: '> '
  },
  {
    id: 'code-block',
    title: 'コードブロック',
    description: 'シンタックス付きコードを記述',
    category: 'ブロック',
    icon: <Code className="w-4 h-4 text-slate-700" />,
    keywords: ['code', 'block', 'コード', 'プログラム'],
    insertText: '```typescript\n// ここにコードを入力\n```\n',
    cursorOffset: 14
  },
  {
    id: 'table',
    title: '表（テーブル）',
    description: '3列のMarkdownテーブルを挿入',
    category: 'ブロック',
    icon: <TableIcon className="w-4 h-4 text-slate-700" />,
    keywords: ['table', '表', 'テーブル', 'ひょう'],
    insertText: '| 項目 | 内容 | 備考 |\n| :--- | :--- | :--- |\n| 項目1 | 内容1 | 備考1 |\n| 項目2 | 内容2 | 備考2 |\n\n'
  },
  {
    id: 'pagebreak',
    title: '改ページ (A4印刷用)',
    description: 'PDF組版時に強制的に次のページへ送る',
    category: 'ブロック',
    icon: <FileText className="w-4 h-4 text-slate-700" />,
    keywords: ['page', 'pagebreak', 'break', '改ページ', 'ページ区切り'],
    insertText: '\n<div style="page-break-after: always;"></div>\n\n'
  },
  {
    id: 'divider',
    title: '区切り線 (水平線)',
    description: 'セクションを区切る水平線',
    category: 'ブロック',
    icon: <Minus className="w-4 h-4 text-slate-700" />,
    keywords: ['divider', 'hr', 'line', '区切り', '水平線'],
    insertText: '\n---\n\n'
  }
]

export default function GeneratorView(): React.JSX.Element {
  const [fileData, setFileData] = useState<MarkdownFileData | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [templates, setTemplates] = useState<TemplateInfo[]>([])
  const [customTemplatesList, setCustomTemplatesList] = useState<CustomTemplateData[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default')
  const [outputPath, setOutputPath] = useState<string>('')

  // エディタ用ステート
  const [leftTab, setLeftTab] = useState<'editor' | 'settings'>('editor')
  const [editorText, setEditorText] = useState<string>('')
  const [isDirty, setIsDirty] = useState<boolean>(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState<string>('')
  const editorRef = useRef<HTMLTextAreaElement>(null)

  // スラッシュコマンド（Notionライクメニュー）用ステート
  const [slashMenuOpen, setSlashMenuOpen] = useState<boolean>(false)
  const [slashQuery, setSlashQuery] = useState<string>('')
  const [slashSelectedIndex, setSlashSelectedIndex] = useState<number>(0)
  const [slashCoords, setSlashCoords] = useState<{ top: number; left: number }>({ top: 40, left: 20 })
  const [slashStartIndex, setSlashStartIndex] = useState<number>(-1)
  const slashMenuRef = useRef<HTMLDivElement>(null)

  // 右カラムプレビューのスクロール管理
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [previewScrollPercent, setPreviewScrollPercent] = useState<number>(0)
  const scrollTrackRef = useRef<HTMLDivElement>(null)
  const isDraggingScroll = useRef<boolean>(false)

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
      setCustomTemplatesList(custom || [])
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
    setEditorText(data.body)
    setIsDirty(false)
    setSaveStatus('idle')
    setTitle(data.frontMatter.title || data.fileName.replace(/\.(md|markdown)$/i, ''))
    setAuthor(data.frontMatter.author || '')
    setDate(data.frontMatter.date || new Date().toISOString().slice(0, 10))
    setToc(data.frontMatter.toc !== false)

    if (data.frontMatter.template) {
      setSelectedTemplate(data.frontMatter.template)
    }

    const defaultPdfName = data.fileName.replace(/\.(md|markdown)$/i, '') + '.pdf'
    if (data.filePath) {
      const dir = data.filePath.substring(0, Math.max(data.filePath.lastIndexOf('/'), data.filePath.lastIndexOf('\\')))
      const separator = data.filePath.includes('\\') ? '\\' : '/'
      setOutputPath(`${dir}${separator}${defaultPdfName}`)
    } else {
      setOutputPath(defaultPdfName)
    }

    setResult(null)
    setLogs([])
    setLeftTab('editor')
  }

  // 新規ドキュメント作成
  const handleCreateNew = () => {
    const today = new Date().toISOString().slice(0, 10)
    const initialTitle = '無題のドキュメント'
    const initialBody = `# ${initialTitle}

ここから Markdown を入力できます。
左カラムでテキストを編集すると、右カラムの A4 組版プレビューにリアルタイムで反映されます。

## 機能紹介
- **リアルタイム組版**: A4 用紙スタイルで即座にレイアウト確認
- **見出し自動認識**: 見出しから目次（TOC）を自動生成
- **ショートカット**: \`Ctrl+S\` で即座に保存
`
    const initialData: MarkdownFileData = {
      filePath: '',
      fileName: 'untitled.md',
      content: initialBody,
      body: initialBody,
      frontMatter: {
        title: initialTitle,
        author: '',
        date: today,
        toc: true,
        template: selectedTemplate || 'default'
      }
    }
    handleFileLoaded(initialData)
    setIsDirty(true)
  }

  // スラッシュコマンド候補（検索クエリで絞り込み）
  const filteredSlashCommands = SLASH_COMMANDS.filter((cmd) => {
    if (!slashQuery.trim()) return true
    const q = slashQuery.toLowerCase().trim()
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.keywords.some((k) => k.toLowerCase().includes(q))
    )
  })

  // スラッシュ入力判定
  const checkSlashTrigger = (text: string, cursorPos: number) => {
    const textBefore = text.substring(0, cursorPos)
    const lastNewline = textBefore.lastIndexOf('\n')
    const currentLine = textBefore.substring(lastNewline + 1)

    const lastSlashInLine = currentLine.lastIndexOf('/')
    if (lastSlashInLine === -1) {
      setSlashMenuOpen(false)
      return
    }

    // '/' の直前が行頭または空白文字であるかをチェック
    const charBeforeSlash = lastSlashInLine > 0 ? currentLine[lastSlashInLine - 1] : ''
    const isValidStart = lastSlashInLine === 0 || /\s/.test(charBeforeSlash)
    if (!isValidStart) {
      setSlashMenuOpen(false)
      return
    }

    const query = currentLine.substring(lastSlashInLine + 1)
    if (/\s/.test(query)) {
      setSlashMenuOpen(false)
      return
    }

    const slashIdx = lastNewline + 1 + lastSlashInLine
    setSlashStartIndex(slashIdx)
    setSlashQuery((prev) => {
      if (prev !== query) {
        setSlashSelectedIndex(0)
      }
      return query
    })

    const lines = textBefore.split('\n')
    const lineIndex = lines.length - 1
    const textarea = editorRef.current
    const scrollTop = textarea ? textarea.scrollTop : 0
    const lineHeight = 19.5
    const estimatedTop = (lineIndex + 1) * lineHeight - scrollTop + 14
    const top = Math.max(10, Math.min(estimatedTop, 280))
    setSlashCoords({ top, left: 16 })
    setSlashMenuOpen(true)
  }

  // スラッシュコマンド実行
  const executeSlashCommand = (item: SlashCommandItem) => {
    const textarea = editorRef.current
    if (!textarea || slashStartIndex === -1) return

    const currentVal = textarea.value
    const currentCursor = textarea.selectionStart

    const before = currentVal.substring(0, slashStartIndex)
    const after = currentVal.substring(currentCursor)
    const newVal = before + item.insertText + after

    setEditorText(newVal)
    setIsDirty(true)
    if (fileData) {
      setFileData((prev) => (prev ? { ...prev, body: newVal } : null))
    }
    setSlashMenuOpen(false)

    setTimeout(() => {
      textarea.focus()
      const newPos = slashStartIndex + (item.cursorOffset ?? item.insertText.length)
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

  // エディタのテキスト入力時
  const handleEditorChange = (newBody: string) => {
    setEditorText(newBody)
    setIsDirty(true)
    if (fileData) {
      setFileData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          body: newBody
        }
      })
    }
    setTimeout(() => {
      if (editorRef.current) {
        checkSlashTrigger(newBody, editorRef.current.selectionStart)
      }
    }, 0)
  }

  // 右カラムプレビューのスクロール管理
  const handlePreviewScroll = () => {
    if (!previewContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = previewContainerRef.current
    const maxScroll = scrollHeight - clientHeight
    if (maxScroll <= 0) {
      setPreviewScrollPercent(0)
    } else {
      setPreviewScrollPercent(Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100))))
    }
  }

  const scrollToTop = () => {
    previewContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToBottom = () => {
    if (!previewContainerRef.current) return
    previewContainerRef.current.scrollTo({
      top: previewContainerRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }

  // 縦型スクロールトラックをクリック＆ドラッグしてプレビューを上下スクロール
  const handleScrollTrackMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const track = scrollTrackRef.current
    if (!track || !previewContainerRef.current) return

    const updateScrollByY = (clientY: number) => {
      const rect = track.getBoundingClientRect()
      const thumbHeight = 24
      const trackHeight = rect.height - thumbHeight
      if (trackHeight <= 0) return
      const offsetY = clientY - rect.top - thumbHeight / 2
      const ratio = Math.max(0, Math.min(1, offsetY / trackHeight))
      const maxScroll = previewContainerRef.current!.scrollHeight - previewContainerRef.current!.clientHeight
      if (maxScroll > 0) {
        previewContainerRef.current!.scrollTop = maxScroll * ratio
      }
    }

    updateScrollByY(e.clientY)
    isDraggingScroll.current = true

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingScroll.current) return
      updateScrollByY(moveEvent.clientY)
    }

    const handleMouseUp = () => {
      isDraggingScroll.current = false
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // 矢印キーでスラッシュメニューの選択が変わった時、選択項目が見える位置へ自動スクロール
  useEffect(() => {
    if (!slashMenuOpen || !slashMenuRef.current) return
    const selectedEl = slashMenuRef.current.querySelector('[data-selected="true"]') as HTMLElement | null
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' })
    }
  }, [slashSelectedIndex, slashMenuOpen])

  // Front Matter 統合済みの Markdown テキストを生成
  const buildFullMarkdownContent = (bodyText: string) => {
    const frontMatterObj: Record<string, any> = {
      ...(fileData?.frontMatter || {}),
      title,
      author,
      date,
      template: selectedTemplate,
      toc
    }

    const yamlLines = Object.entries(frontMatterObj)
      .filter(([_, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}: ${typeof v === 'string' ? `"${v}"` : v}`)

    return `---\n${yamlLines.join('\n')}\n---\n\n${bodyText}`
  }

  // 保存処理 (上書き保存 または 別名保存)
  const handleSaveFile = async (saveAs: boolean = false) => {
    if (!fileData || !window.pfpdfAPI) return

    let targetPath = fileData.filePath
    if (!targetPath || saveAs) {
      const selected = await window.pfpdfAPI.selectMarkdownSavePath(fileData.fileName || 'document.md')
      if (!selected) return
      targetPath = selected
    }

    setSaveStatus('saving')
    try {
      const fullContent = buildFullMarkdownContent(editorText)
      const res = await window.pfpdfAPI.saveMarkdownFile(targetPath, fullContent)
      if (res.success) {
        setSaveStatus('saved')
        setIsDirty(false)
        const fileName = targetPath.split(/[\\/]/).pop() || 'document.md'
        setFileData((prev) =>
          prev
            ? {
                ...prev,
                filePath: targetPath,
                fileName,
                content: fullContent,
                body: editorText
              }
            : null
        )
        if (!outputPath || saveAs) {
          const dir = targetPath.substring(0, Math.max(targetPath.lastIndexOf('/'), targetPath.lastIndexOf('\\')))
          const separator = targetPath.includes('\\') ? '\\' : '/'
          setOutputPath(`${dir}${separator}${fileName.replace(/\.(md|markdown)$/i, '.pdf')}`)
        }
        setSaveMessage('保存しました')
        setTimeout(() => setSaveStatus('idle'), 2500)
      } else {
        setSaveStatus('error')
        setSaveMessage(res.error || '保存に失敗しました')
        setTimeout(() => setSaveStatus('idle'), 4000)
      }
    } catch (err: any) {
      setSaveStatus('error')
      setSaveMessage(err.message || '保存に失敗しました')
      setTimeout(() => setSaveStatus('idle'), 4000)
    }
  }

  // クイック書式挿入
  const insertFormatting = (prefix: string, suffix: string = '', placeholder: string = '') => {
    const textarea = editorRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentVal = textarea.value
    const selected = currentVal.substring(start, end) || placeholder

    const replacement = `${prefix}${selected}${suffix}`
    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end)

    handleEditorChange(newVal)

    setTimeout(() => {
      textarea.focus()
      const newStart = start + prefix.length
      const newEnd = newStart + selected.length
      textarea.setSelectionRange(newStart, newEnd)
    }, 0)
  }

  // エディタキーボード操作 (Tabインデント, Ctrl+S, スラッシュメニューナビゲーション)
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // スラッシュメニューが開いている時のキー操作
    if (slashMenuOpen && filteredSlashCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        e.stopPropagation()
        setSlashSelectedIndex((prev) => (prev + 1) % filteredSlashCommands.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        e.stopPropagation()
        setSlashSelectedIndex((prev) => (prev - 1 + filteredSlashCommands.length) % filteredSlashCommands.length)
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        const targetCmd = filteredSlashCommands[slashSelectedIndex]
        if (targetCmd) {
          executeSlashCommand(targetCmd)
        }
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        setSlashMenuOpen(false)
        return
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      handleSaveFile(false)
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const val = textarea.value
      const indent = '  '

      const newVal = val.substring(0, start) + indent + val.substring(end)
      handleEditorChange(newVal)

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + indent.length
      }, 0)
    }
  }

  // グローバル Ctrl+S ショートカット
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (fileData) {
          handleSaveFile(false)
        }
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [fileData, editorText, title, author, date, selectedTemplate, toc, outputPath])

  // スラッシュメニュー外部クリックで閉じる
  useEffect(() => {
    if (!slashMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (slashMenuRef.current && !slashMenuRef.current.contains(e.target as Node)) {
        setSlashMenuOpen(false)
      }
    }
    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [slashMenuOpen])

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

  // 選択中のカスタムテンプレート（存在する場合）
  const selectedCustomTemplate = customTemplatesList.find((t) => t.id === selectedTemplate)

  // 現在選択されているテンプレートのフォーマット詳細
  const currentFormat: TemplateFormatDetail =
    TEMPLATE_DETAILS[selectedTemplate] || {
      id: selectedTemplate,
      name: selectedCustomTemplate ? `${selectedCustomTemplate.name} (自作)` : '自作テンプレート (PPTX)',
      color: selectedCustomTemplate?.theme?.primaryColor || '#ea580c',
      paperBg: '#ffffff',
      coverBg: selectedCustomTemplate?.theme?.backgroundColor || '#ffffff',
      coverTextColor: selectedCustomTemplate?.theme?.textColor || '#1f2937',
      fontFamily: 'sans',
      layoutName: selectedCustomTemplate?.sourcePptx ? 'PowerPointインポート' : '自作テンプレート',
      fontName: selectedCustomTemplate?.theme?.bodyFont || 'Noto Sans JP (モダンサンセリフ)',
      coverType: selectedCustomTemplate ? (selectedCustomTemplate.hasCover ? 'standalone' : 'integrated') : 'standalone',
      coverTypeName: selectedCustomTemplate?.sourcePptx ? 'PPTXスライド表紙' : '自作表紙',
      coverFeature: 'PPTXテキストボックス自動置換 ＋ カスタム組版',
      runningHeader: selectedCustomTemplate?.headerFooter?.headerText || '自作テンプレートヘッダー',
      pageNumberPos: '下部中央',
      h1Style: {
        color: selectedCustomTemplate?.theme?.primaryColor || '#ea580c',
        borderBottom: `2px solid ${selectedCustomTemplate?.theme?.primaryColor || '#ea580c'}`
      },
      h2Style: {
        color: selectedCustomTemplate?.theme?.textColor || '#1f2937',
        borderLeft: `4px solid ${selectedCustomTemplate?.theme?.primaryColor || '#ea580c'}`
      },
      tableHeaderBg: selectedCustomTemplate?.theme?.primaryColor || '#ea580c',
      features: ['PPTX表紙レイアウト', '自動テキスト置換', 'ノンブル中央', 'カスタムカラー'],
      badge: '自作PPTX',
      bestFor: '自社スライド・独自デザイン報告書',
      thumbnail: {
        hasTopBar: true,
        hasCenterTitle: false,
        h1BarColor: selectedCustomTemplate?.theme?.primaryColor || '#ea580c',
        accentColor: selectedCustomTemplate?.theme?.secondaryColor || '#f97316'
      }
    }

  // Markdownから抽出した見出しリスト
  const markdownHeadings = fileData ? extractHeadings(fileData.body) : []

  // 各テンプレート公式仕様に忠実な表紙コンテンツ描画
  const renderCoverPageContent = () => {
    // 1. PFN 公式テンプレート (全面ディープブルーグラデーション + 白文字 + CONFIDENTIAL)
    if (selectedTemplate === 'pfn') {
      return (
        <div
          className="w-full h-full p-8 md:p-10 flex flex-col justify-between text-white relative select-none"
          style={{
            background: 'linear-gradient(135deg, #111b64 0%, #19438f 52%, #1b75b4 100%)'
          }}
        >
          {/* 右上 CONFIDENTIAL バッジ */}
          <div className="flex justify-end">
            <span className="bg-[#c00] text-white font-mono text-[9px] font-bold px-3 py-0.5 tracking-wider uppercase shadow-xs">
              CONFIDENTIAL
            </span>
          </div>

          {/* 中央タイトル部 */}
          <div className="my-auto text-center space-y-3 px-4">
            <div className="text-[10px] tracking-[0.25em] text-blue-200/90 font-medium uppercase font-mono">
              PREFERRED NETWORKS REPORT
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight drop-shadow-xs">
              {title || '(タイトル未設定)'}
            </h1>
            <div className="w-12 h-0.5 bg-blue-300/40 mx-auto my-3" />
            <div className="text-xs text-blue-100/90 space-y-0.5 font-normal">
              <div>{author || '著者未設定'}</div>
              <div className="font-mono text-[11px] text-blue-200/70">{date || '日付未設定'}</div>
            </div>
          </div>

          {/* 右下 PFN ロゴマーク */}
          <div className="flex justify-end items-end pt-4">
            <div className="flex items-center gap-1.5 opacity-90">
              <div className="w-4 h-4 rounded-xs border-2 border-white/90 flex items-center justify-center font-bold text-[8px] text-white">
                P
              </div>
              <span className="font-extrabold tracking-wider text-[11px] text-white font-sans">
                Preferred Networks
              </span>
            </div>
          </div>
        </div>
      )
    }

    // 2. Academic (学術論文: ジャーナル二重線マストヘッド + 学術明朝セリフ体)
    if (selectedTemplate === 'academic') {
      return (
        <div className="w-full h-full p-8 md:p-10 flex flex-col justify-between bg-white text-[#20252b] font-serif relative select-none">
          {/* 上部二重線マストヘッド */}
          <div>
            <div className="pb-2 border-b-[2.5px] border-[#243f5b] flex items-end justify-between">
              <span className="text-[9px] font-bold text-[#243f5b] tracking-[0.28em] uppercase font-sans">
                ACADEMIC RESEARCH PAPER
              </span>
              <span className="text-[9px] text-[#59636d] font-sans">
                PFPD / SCHOLARLY
              </span>
            </div>
            <div className="border-b-[0.8px] border-[#243f5b] mt-[2px]" />
          </div>

          {/* 中央メインエリア */}
          <div className="my-auto space-y-4 px-2">
            <span className="border border-[#8d2c2c] text-[#8d2c2c] text-[8.5px] font-bold font-sans tracking-widest px-2 py-0.5 uppercase inline-block">
              CONFIDENTIAL
            </span>
            <h1 className="text-2xl font-serif font-bold text-[#20252b] leading-snug tracking-tight">
              {title || '(タイトル未設定)'}
            </h1>
            <div className="pt-4 space-y-1 text-xs text-[#59636d]">
              <div className="font-medium text-slate-800">{author || '著者未設定'}</div>
              <div className="font-mono text-[11px] text-[#59636d]">{date || '日付未設定'}</div>
            </div>
          </div>

          {/* 下部対称二重線 */}
          <div>
            <div className="border-b-[0.8px] border-[#243f5b] mb-[2px]" />
            <div className="border-b-[2.5px] border-[#243f5b]" />
          </div>
        </div>
      )
    }

    // 3. Technical (技術仕様書: 左端5mm深青緑縦バー + 等幅シリーズ名 + 高密度)
    if (selectedTemplate === 'technical') {
      return (
        <div className="w-full h-full flex bg-white text-[#17202a] relative overflow-hidden select-none">
          {/* 左端 5mm の深青緑バー */}
          <div className="w-2.5 md:w-3 bg-[#086f83] shrink-0" />

          {/* メインエリア */}
          <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9.5px] font-bold text-[#086f83] tracking-wider uppercase">
                TECHNICAL DOCUMENTATION
              </span>
              <span className="border border-[#a12622] text-[#a12622] font-mono text-[8px] font-bold px-2 py-0.5 uppercase">
                INTERNAL ONLY
              </span>
            </div>

            <div className="my-auto space-y-3">
              <h1 className="text-2xl font-bold text-[#17202a] leading-tight tracking-tight">
                {title || '(タイトル未設定)'}
              </h1>
              <div className="w-12 h-1 bg-[#086f83] rounded-xs" />
            </div>

            <div className="pt-4 border-t border-[#aebbc4] flex items-end justify-between font-mono text-xs text-[#52606d]">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">AUTHOR</span>
                <span className="font-medium text-[#17202a]">{author || '著者未設定'}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-sans">DATE</span>
                <span className="text-[11px]">{date || '日付未設定'}</span>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // 4. Book (書籍: クリーム紙 + 二重枠フレーム + 格調高い明朝セリフ体)
    if (selectedTemplate === 'book') {
      return (
        <div className="w-full h-full p-4 bg-[#fdfbf6] text-[#292521] font-serif relative select-none">
          {/* 二重枠フレーム */}
          <div className="w-full h-full border-[1.5px] border-[#b8aea0] p-1.5 flex flex-col justify-between">
            <div className="w-full h-full border-[0.6px] border-[#b8aea0] p-6 md:p-8 flex flex-col justify-between text-center relative">
              <div className="text-[8.5px] tracking-[0.25em] text-[#71685d] uppercase">
                MONOGRAPH SERIES
              </div>

              <div className="my-auto space-y-3 px-4">
                <h1 className="text-xl md:text-2xl font-serif font-bold text-[#292521] leading-relaxed tracking-wide">
                  {title || '(タイトル未設定)'}
                </h1>
                <div className="w-10 h-px bg-[#5b312e]/40 mx-auto" />
              </div>

              <div className="space-y-1 text-xs text-[#71685d]">
                <div className="font-medium text-slate-900">{author || '著者未設定'}</div>
                <div className="font-mono text-[11px] text-[#71685d]">{date || '日付未設定'}</div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // 5. Notebook (ノートブック: アイボリー紙 + 右上ティール＆左下コーラル幾何学 + 枠線)
    if (selectedTemplate === 'notebook') {
      return (
        <div className="w-full h-full p-4 bg-[#fffdf8] text-[#293b40] relative overflow-hidden select-none">
          {/* 右上幾何学シェイプ */}
          <div className="absolute -top-12 -right-10 w-32 h-24 bg-[#287d78] rotate-[-12deg] pointer-events-none" />
          {/* 左下幾何学シェイプ */}
          <div className="absolute -bottom-12 -left-10 w-36 h-24 bg-[#e66b58] rotate-[-12deg] pointer-events-none" />

          {/* 内枠 */}
          <div className="w-full h-full border-[1.5px] border-[#287d78] p-6 md:p-8 flex flex-col justify-between relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-[#185b58] tracking-widest uppercase">
                NOTEBOOK / REPORT
              </span>
              <span className="bg-[#fbe8e2] text-[#a63e32] text-[8px] font-bold rounded-full px-2.5 py-0.5 uppercase">
                MEMO
              </span>
            </div>

            <div className="my-auto space-y-3">
              <h1 className="text-xl md:text-2xl font-bold text-[#293b40] leading-tight">
                {title || '(タイトル未設定)'}
              </h1>
              <div className="w-12 h-1 bg-[#287d78] rounded-full" />
            </div>

            <div className="pt-3 border-t border-[#c9d5d2] flex items-end justify-between text-xs text-[#66777a]">
              <div>
                <span className="text-[10px] text-slate-400 block">担当</span>
                <span className="font-medium text-[#293b40]">{author || '著者未設定'}</span>
              </div>
              <div className="text-right font-mono text-[11px]">
                {date || '日付未設定'}
              </div>
            </div>
          </div>
        </div>
      )
    }

    // 6. Default (標準ニュートラル: 大見出し左寄せ + 赤CONFIDENTIAL)
    if (selectedTemplate === 'default') {
      return (
        <div className="w-full h-full p-8 md:p-10 flex flex-col justify-center bg-white text-[#222222] relative select-none">
          <div className="space-y-4 max-w-[85%]">
            <span className="text-[10px] text-[#a00000] font-bold tracking-widest uppercase block">
              CONFIDENTIAL
            </span>
            <h1 className="text-2xl font-bold text-[#222222] leading-tight tracking-tight">
              {title || '(タイトル未設定)'}
            </h1>
            <div className="pt-4 border-t border-slate-200 space-y-1 text-xs text-slate-600">
              <div className="font-medium text-slate-800">{author || '著者未設定'}</div>
              <div className="font-mono text-[11px] text-slate-400">{date || '日付未設定'}</div>
            </div>
          </div>
        </div>
      )
    }

    // 7. 自作 PPTX / カスタムテンプレート (PPTXの座標・フォント・配置を正確に反映)
    if (selectedCustomTemplate && selectedCustomTemplate.slotMappings && selectedCustomTemplate.slotMappings.length > 0) {
      return (
        <div
          className="w-full h-full relative overflow-hidden select-none"
          style={{
            backgroundColor: selectedCustomTemplate.theme?.backgroundColor || '#ffffff',
            color: selectedCustomTemplate.theme?.textColor || '#1f2937'
          }}
        >
          {selectedCustomTemplate.slotMappings.map((s) => {
            let displayContent = s.originalText
            if (s.slot === 'title' && title) displayContent = title
            if (s.slot === 'author' && author) displayContent = author
            if (s.slot === 'date' && date) displayContent = date

            if (s.isShape) {
              return (
                <div
                  key={s.id}
                  style={{
                    position: 'absolute',
                    left: `${s.xPercent}%`,
                    top: `${s.yPercent}%`,
                    width: `${s.widthPercent}%`,
                    height: `${s.heightPercent}%`,
                    backgroundColor: s.backgroundColor || selectedCustomTemplate.theme?.primaryColor || '#ea580c',
                    borderRadius: '2px'
                  }}
                />
              )
            }

            if (s.imageDataUrl) {
              return (
                <img
                  key={s.id}
                  src={s.imageDataUrl}
                  alt=""
                  style={{
                    position: 'absolute',
                    left: `${s.xPercent}%`,
                    top: `${s.yPercent}%`,
                    width: `${s.widthPercent}%`,
                    height: `${s.heightPercent}%`,
                    objectFit: 'contain'
                  }}
                />
              )
            }

            return (
              <div
                key={s.id}
                style={{
                  position: 'absolute',
                  left: `${s.xPercent}%`,
                  top: `${s.yPercent}%`,
                  width: `${s.widthPercent}%`,
                  minHeight: `${s.heightPercent}%`,
                  color: s.color || selectedCustomTemplate.theme?.textColor || '#1f2937',
                  fontSize: s.fontSizePt ? `${Math.round(s.fontSizePt * 0.7)}pt` : '12pt',
                  fontWeight: s.fontWeight || (s.slot === 'title' ? 'bold' : 'normal'),
                  textAlign: s.textAlign || 'left',
                  lineHeight: 1.25,
                  fontFamily: s.slot === 'title' ? selectedCustomTemplate.theme?.headingFont : selectedCustomTemplate.theme?.bodyFont
                }}
                className="p-1 leading-snug break-words"
              >
                {displayContent}
              </div>
            )
          })}
        </div>
      )
    }

    // フォールバック自作表紙
    return (
      <div className="w-full h-full p-8 md:p-10 flex flex-col justify-between bg-white text-slate-800 relative select-none">
        <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: currentFormat.color }} />
        <div className="my-auto space-y-2">
          <h1 className="text-2xl font-bold" style={{ color: currentFormat.color }}>
            {title || '(タイトル未設定)'}
          </h1>
          <p className="text-xs text-slate-500">カスタムテンプレート表紙</p>
        </div>
        <div className="text-xs text-slate-600 border-t border-slate-200 pt-3 flex justify-between items-end">
          <div>{author || '著者未設定'}</div>
          <div className="font-mono text-[11px] text-slate-400">{date || '日付未設定'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-5 p-5 max-w-7xl mx-auto w-full h-full max-h-full overflow-hidden select-none">
      {/* 左カラム: Markdown エディタ / 文書設定 */}
      <div className="w-full md:w-1/2 flex flex-col gap-3 overflow-hidden h-full">
        {/* ファイル未読み込み時: ドロップゾーン ＆ 新規作成ボタン */}
        {!fileData ? (
          <div className="flex flex-col gap-3 my-auto">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleSelectFile}
              className={`border border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-150 group bg-white shadow-2xs ${
                isDragging
                  ? 'border-slate-800 bg-slate-50'
                  : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 mb-3 group-hover:text-slate-800 transition-colors pointer-events-none">
                <Upload className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="text-xs font-semibold text-slate-800 mb-1 pointer-events-none">
                Markdown ファイルをドラッグ＆ドロップ
              </h3>
              <p className="text-[11px] text-slate-400 mb-3 pointer-events-none">
                または、クリックしてファイルを選択
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-2xs transition pointer-events-none"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                ファイルを選択 (.md)
              </button>
            </div>

            {/* 新規ドキュメント作成カード */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <FilePlus className="w-4 h-4 text-slate-600" />
                  新規ドキュメントを作成
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  白紙から直接 Markdown を執筆・プレビューできます
                </div>
              </div>
              <button
                type="button"
                onClick={handleCreateNew}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium border border-slate-200 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                新規作成
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 h-full overflow-hidden">
            {/* 上部ファイル操作バー & モード切り替え */}
            <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <FileCode className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-800 truncate flex items-center gap-1.5">
                      <span className="truncate">{fileData.fileName || 'untitled.md'}</span>
                      {isDirty && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-medium border border-amber-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          未保存
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* 保存ボタン (Ctrl+S) */}
                  <button
                    type="button"
                    onClick={() => handleSaveFile(false)}
                    disabled={saveStatus === 'saving'}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                      isDirty
                        ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title="上書き保存 (Ctrl+S / Cmd+S)"
                  >
                    {saveStatus === 'saving' ? (
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : saveStatus === 'saved' ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                    <span>{saveStatus === 'saved' ? '保存済' : '保存'}</span>
                    <span className="text-[10px] opacity-60 font-mono hidden sm:inline">Ctrl+S</span>
                  </button>

                  {/* 別名で保存 */}
                  <button
                    type="button"
                    onClick={() => handleSaveFile(true)}
                    className="text-[11px] text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition cursor-pointer"
                    title="名前を付けて保存"
                  >
                    別名保存
                  </button>

                  {/* ファイル変更 */}
                  <button
                    type="button"
                    onClick={handleSelectFile}
                    className="text-[11px] text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition cursor-pointer"
                    title="別のファイルを開く"
                  >
                    開く
                  </button>

                  {/* 閉じる */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isDirty && !confirm('未保存の変更があります。閉じてもよろしいですか？')) return
                      setFileData(null)
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition cursor-pointer"
                    title="閉じる"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* モード切り替えタブ (セグメントコントロール) */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/70 text-xs">
                <button
                  type="button"
                  onClick={() => setLeftTab('editor')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md transition-all cursor-pointer ${
                    leftTab === 'editor'
                      ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  Markdown 編集
                </button>
                <button
                  type="button"
                  onClick={() => setLeftTab('settings')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md transition-all cursor-pointer ${
                    leftTab === 'settings'
                      ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  文書設定・テンプレート
                </button>
              </div>
            </div>

            {/* モード 1: Markdown エディタ */}
            {leftTab === 'editor' && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-2xs flex-1 flex flex-col overflow-hidden min-h-[440px]">
                {/* クイック書式ツールバー */}
                <div className="border-b border-slate-200/90 p-1.5 bg-slate-50/70 flex flex-wrap items-center gap-1 text-slate-700 shrink-0">
                  <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-200">
                    <button
                      type="button"
                      onClick={() => insertFormatting('# ', '', '大見出し')}
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title="見出し 1 (# )"
                    >
                      <Heading1 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('## ', '', '中見出し')}
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title="見出し 2 (## )"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('### ', '', '小見出し')}
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title="見出し 3 (### )"
                    >
                      <Heading3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
                    <button
                      type="button"
                      onClick={() => insertFormatting('**', '**', '太字')}
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title="太字 (**テキスト**)"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('*', '*', '斜体')}
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title="斜体 (*テキスト*)"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('`', '`', 'code')}
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title="インラインコード (`code`)"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
                    <button
                      type="button"
                      onClick={() => insertFormatting('- ', '', 'リスト項目')}
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title="箇条書き (- )"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('1. ', '', '項目 1')}
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title="番号付きリスト (1. )"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('> ', '', '引用テキスト')}
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title="引用 (> )"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-0.5 pl-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        insertFormatting(
                          '\n| 項目 | 内容 | 備考 |\n| :--- | :--- | :--- |\n| 項目A | 内容A | 備考A |\n| 項目B | 内容B | 備考B |\n\n',
                          '',
                          ''
                        )
                      }
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title="表（テーブル）挿入"
                    >
                      <TableIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertFormatting('```typescript\n', '\n```\n', '// コード')
                      }
                      className="px-1.5 py-0.5 rounded hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition cursor-pointer"
                      title="コードブロック (```)"
                    >
                      ```
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertFormatting('\n\n<div style="page-break-after: always;"></div>\n\n', '', '')
                      }
                      className="px-1.5 py-0.5 rounded hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition cursor-pointer"
                      title="改ページタグ挿入"
                    >
                      改ページ
                    </button>
                  </div>
                </div>

                {/* textarea 入力エリア */}
                <div className="relative flex-1 flex flex-col min-h-0">
                  <textarea
                    ref={editorRef}
                    value={editorText}
                    onChange={(e) => handleEditorChange(e.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    onClick={() => {
                      if (editorRef.current) {
                        checkSlashTrigger(editorRef.current.value, editorRef.current.selectionStart)
                      }
                    }}
                    onKeyUp={(e) => {
                      if (
                        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', 'Tab', 'Shift', 'Control', 'Alt'].includes(
                          e.key
                        )
                      ) {
                        return
                      }
                      if (editorRef.current) {
                        checkSlashTrigger(editorRef.current.value, editorRef.current.selectionStart)
                      }
                    }}
                    placeholder="Markdown を入力してください... [/] を入力すると Notion 風にブロック・書式を選択できます。"
                    spellCheck={false}
                    className="w-full flex-1 p-3.5 font-mono text-xs leading-relaxed text-slate-800 bg-white resize-none focus:outline-none placeholder:text-slate-300 overflow-y-auto"
                  />

                  {/* Notion 風 スラッシュコマンドメニュー */}
                  {slashMenuOpen && filteredSlashCommands.length > 0 && (
                    <div
                      ref={slashMenuRef}
                      style={{
                        top: `${slashCoords.top}px`,
                        left: `${slashCoords.left}px`
                      }}
                      className="absolute z-50 w-72 max-h-72 bg-white rounded-xl shadow-xl border border-slate-200 overflow-y-auto p-1.5 preview-scrollbar select-none"
                    >
                      <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 mb-1">
                        <span>ブロックを選択</span>
                        {slashQuery && (
                          <span className="font-mono text-slate-600 bg-slate-100 px-1 rounded">/{slashQuery}</span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        {filteredSlashCommands.map((cmd, idx) => {
                          const isSelected = idx === slashSelectedIndex
                          return (
                            <button
                              key={cmd.id}
                              type="button"
                              data-selected={isSelected}
                              onClick={() => executeSlashCommand(cmd)}
                              onMouseEnter={() => setSlashSelectedIndex(idx)}
                              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-300'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border ${
                                  isSelected
                                    ? 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                {cmd.icon}
                              </div>
                              <div className="truncate flex-1">
                                <div className="text-xs font-semibold leading-tight text-slate-900">
                                  {cmd.title}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                                  {cmd.description}
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      <div className="mt-1 pt-1 border-t border-slate-100 px-2 py-0.5 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                        <span>↑↓ 選択</span>
                        <span>Enter 決定</span>
                        <span>Esc 閉じる</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* エディタ下部ステータスバー */}
                <div className="border-t border-slate-200/90 px-3 py-2 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="font-mono">
                      {editorText ? editorText.split('\n').length : 0} 行
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="font-mono">
                      {editorText.length.toLocaleString()} 文字
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.2 rounded border border-slate-200/60">
                      [/] コマンド
                    </span>
                    {saveMessage && (
                      <span className="text-emerald-600 font-medium ml-1 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {saveMessage}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      リアルタイム組版同期
                    </span>
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating || !fileData || !outputPath}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-md text-xs font-medium transition cursor-pointer shadow-2xs"
                    >
                      <FileDown className="w-3 h-3" />
                      <span>PDF出力</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* モード 2: 文書設定・テンプレート */}
            {leftTab === 'settings' && (
              <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-0.5">
                {/* メタデータ設定 */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>文書情報 (メタデータ)</span>
                    </div>
                    <span className="text-[11px] text-slate-400">PDF表紙・ヘッダーに反映</span>
                  </div>

                  {/* タイトル */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      文書タイトル (title)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value)
                        setIsDirty(true)
                      }}
                      placeholder="例: プロジェクト仕様書"
                      className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition"
                    />
                  </div>

                  {/* 著者 & 日付 */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        著者 (author)
                      </label>
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => {
                          setAuthor(e.target.value)
                          setIsDirty(true)
                        }}
                        placeholder="例: 開発チーム"
                        className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          日付 (date)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setDate(new Date().toISOString().slice(0, 10))
                            setIsDirty(true)
                          }}
                          className="text-[10px] text-slate-500 hover:text-slate-900 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <RotateCcw className="w-2.5 h-2.5" /> 今日
                        </button>
                      </div>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => {
                          setDate(e.target.value)
                          setIsDirty(true)
                        }}
                        className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition font-mono"
                      />
                    </div>
                  </div>

                  {/* 目次トグル */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <ListOrdered className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <span className="text-xs font-medium text-slate-700 block">目次の自動生成 (toc)</span>
                        <span className="text-[10px] text-slate-400 block">本文見出しから目次ページを自動挿入</span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={toc}
                        onChange={(e) => {
                          setToc(e.target.checked)
                          setIsDirty(true)
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                    </label>
                  </div>
                </div>

                {/* テンプレート選択 */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      <span>適用テンプレート</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      選択中: <strong className="text-slate-900 font-semibold">{currentFormat.name}</strong>
                    </span>
                  </div>

                  {/* テンプレート一覧グリッド */}
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((tpl) => {
                      const isSelected = selectedTemplate === tpl.id
                      const detail = TEMPLATE_DETAILS[tpl.id] || {
                        color: tpl.id.startsWith('custom-') ? '#ea580c' : '#0f5e5a',
                        layoutName: tpl.category === 'custom' ? '自作 (PPTX)' : '標準レポート',
                        badge: tpl.category === 'custom' ? '自作PPTX' : '公式'
                      }

                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => {
                            setSelectedTemplate(tpl.id)
                            setIsDirty(true)
                          }}
                          className={`text-left p-2.5 rounded-lg border transition-all duration-150 relative cursor-pointer ${
                            isSelected
                              ? 'border-slate-900 bg-slate-50/70 ring-1 ring-slate-900 shadow-2xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/40'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5 truncate">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: detail.color }}
                              />
                              <span className="text-xs font-semibold text-slate-900 truncate">
                                {tpl.name}
                              </span>
                            </div>
                            {isSelected && <Check className="w-3 h-3 text-slate-900 shrink-0" />}
                          </div>

                          <p className="text-[10px] text-slate-500 line-clamp-1 leading-normal">
                            {detail.layoutName}
                          </p>
                        </button>
                      )
                    })}
                  </div>

                  {/* 選択中テンプレートの仕様スペックサマリー */}
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/70 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-700 font-medium pb-1.5 border-b border-slate-200/60 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-slate-500" />
                        <span>【{currentFormat.name}】 仕様サマリー</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">
                        A4 縦
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                      <div>
                        <span className="text-slate-400">表紙形式: </span>
                        <span className="text-slate-700 font-medium">{currentFormat.coverTypeName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">テーマ色: </span>
                        <span className="font-mono text-slate-700 font-medium inline-flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: currentFormat.color }}
                          />
                          {currentFormat.color}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400">書体: </span>
                        <span className="text-slate-700">{currentFormat.fontName}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400">推奨用途: </span>
                        <span className="text-slate-700">{currentFormat.bestFor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 出力先 & PDF生成ボタン */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      出力先 PDF ファイルパス
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={outputPath}
                        onChange={(e) => setOutputPath(e.target.value)}
                        placeholder="C:\Users\...\output.pdf"
                        className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition"
                      />
                      <button
                        type="button"
                        onClick={handleSelectOutputPath}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition shrink-0 cursor-pointer"
                      >
                        参照...
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || !fileData || !outputPath}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-medium shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>PDF をレンダリング中...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4" />
                        <span>PDF を書き出す</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 右カラム: プレビュー & ログ / 完了結果 */}
      <div className="w-full md:w-1/2 flex flex-col bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden h-full">
        {/* タブバー */}
        <div className="flex items-center justify-between border-b border-slate-200/90 px-4 py-2 bg-white shrink-0">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/70 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('formatted')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                activeTab === 'formatted'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              組版プレビュー
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('raw')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                activeTab === 'raw'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Markdown
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                activeTab === 'logs'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              実行ログ
              {logs.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
              )}
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
            {progress ? (
              <span className="text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold uppercase">[{progress.stage}]</span>
                <span className="truncate max-w-[140px]">{progress.message}</span>
              </span>
            ) : (
              <span>A4 (210 × 297 mm)</span>
            )}
          </div>
        </div>

        {/* 出力完了バナー */}
        {result && (
          <div
            className={`mx-4 mt-3 p-3 rounded-lg flex items-center justify-between text-xs shrink-0 transition-all ${
              result.success
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-red-50 border border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <div className="truncate">
                <div className="font-semibold truncate">
                  {result.success ? 'PDF を書き出しました' : 'PDF 書き出しエラー'}
                </div>
                <div className="text-[11px] opacity-75 font-mono truncate">
                  {result.success
                    ? `${result.outputPdfPath} (${((result.byteSize || 0) / 1024).toFixed(1)} KB)`
                    : result.error}
                </div>
              </div>
            </div>

            {result.success && (
              <div className="flex items-center gap-1.5 shrink-0 ml-3">
                <button
                  type="button"
                  onClick={handleOpenPdf}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-900 rounded-md text-xs font-medium transition cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  PDFを開く
                </button>
                <button
                  type="button"
                  onClick={handleOpenFolder}
                  className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded-md transition cursor-pointer"
                  title="保存先フォルダを表示"
                >
                  <Folder className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* コンテンツエリア (スクロールコンテナ + 上下移動バー) */}
        <div className="flex-1 relative overflow-hidden flex flex-col bg-[#ebedef]">
          <div
            ref={previewContainerRef}
            onScroll={handlePreviewScroll}
            className="flex-1 overflow-y-auto p-5 preview-scrollbar relative"
          >
            {activeTab === 'formatted' ? (
            fileData ? (
              /* A4用紙シート リアルタイム組版シミュレーション */
              <div className="space-y-6 max-w-xl mx-auto flex flex-col items-center">
                {/* ページ 1: 独立表紙 (coverType === 'standalone' の場合) */}
                {currentFormat.coverType === 'standalone' && (
                  <div
                    style={{
                      backgroundColor: currentFormat.paperBg
                    }}
                    className="shadow-[0_2px_14px_rgba(0,0,0,0.06)] border border-slate-300/70 rounded-[1px] w-full max-w-[490px] aspect-[1/1.414] relative overflow-hidden transition-all duration-200"
                  >
                    {/* ページ右上の控えめなノンブル表示 */}
                    <div className="absolute top-3 right-3 text-[9px] font-mono opacity-40 z-20">
                      1 / 2 表紙
                    </div>

                    {/* 公式テンプレート実体準拠の表紙レンダラー */}
                    {renderCoverPageContent()}
                  </div>
                )}

                {/* ページ 2（または compact などの一体型 1ページ目）: 本文組版 */}
                <div
                  style={{
                    backgroundColor: currentFormat.paperBg
                  }}
                  className={`shadow-[0_2px_14px_rgba(0,0,0,0.06)] border border-slate-300/70 rounded-[1px] w-full max-w-[490px] min-h-[700px] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden transition-all duration-200 ${
                    currentFormat.fontFamily === 'serif' ? 'font-serif text-[#20252b]' : 'font-sans text-slate-700'
                  }`}
                >
                  {/* ページ右上の控えめなノンブル表示 */}
                  <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-400">
                    {currentFormat.coverType === 'standalone' ? '2 / 2 本文' : '1 / 1 本文'}
                  </div>

                  <div>
                    {/* 上部ランニングヘッダー (compact 以外) */}
                    {currentFormat.coverType !== 'integrated' && (
                      <div
                        className={`pb-2 mb-6 flex items-center justify-between text-[10px] ${
                          currentFormat.fontFamily === 'serif'
                            ? 'font-serif border-b-[0.8px] border-[#243f5b]/40 text-[#59636d]'
                            : selectedTemplate === 'technical'
                            ? 'font-mono border-b border-[#aebbc4] text-[#086f83]'
                            : 'font-mono border-b border-slate-200/80 text-slate-400'
                        }`}
                      >
                        <span className="truncate max-w-[180px]">{title || 'ドキュメント'}</span>
                        <span className="truncate max-w-[160px] font-medium">
                          {currentFormat.runningHeader}
                        </span>
                      </div>
                    )}

                    {/* Compact テンプレート専用の公式上部ヘッダーバー (下線太字 + タイトル + メタデータ) */}
                    {selectedTemplate === 'compact' && (
                      <div className="mb-6 pb-3 border-b-[2px] border-[#343a40]">
                        <div className="flex items-start justify-between gap-4">
                          <h1 className="text-lg md:text-xl font-bold text-[#202428] leading-tight">
                            {title || '(タイトル未設定)'}
                          </h1>
                          <div className="text-right text-[11px] text-[#596168] shrink-0 font-mono space-y-0.5">
                            <div>{author || '著者未設定'}</div>
                            <div>{date || '日付未設定'}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 目次表示 (tocが有効な場合) */}
                    {toc && (
                      <div className="mb-6 pb-4 border-b border-slate-200/70 space-y-2">
                        <div
                          style={{ color: currentFormat.color }}
                          className="text-xs font-bold pb-1 flex items-center gap-1.5"
                        >
                          <ListOrdered className="w-3.5 h-3.5" />
                          <span>目 次</span>
                        </div>

                        {markdownHeadings.length > 0 ? (
                          <div className="space-y-1 text-[11px]">
                            {markdownHeadings.slice(0, 6).map((hd, hIdx) => (
                              <div
                                key={hIdx}
                                className={`flex items-baseline justify-between ${
                                  hd.level === 1
                                    ? 'font-medium opacity-90'
                                    : hd.level === 2
                                    ? 'pl-2 opacity-80'
                                    : 'pl-4 opacity-70'
                                }`}
                              >
                                <span className="truncate pr-2">{hd.text}</span>
                                <div className="flex-1 border-b border-dotted border-slate-300 mx-1 mb-1" />
                                <span className="font-mono text-[10px] opacity-60 shrink-0">
                                  {hd.level === 1 ? '1' : hd.level === 2 ? '1' : '2'}
                                </span>
                              </div>
                            ))}
                            {markdownHeadings.length > 6 && (
                              <div className="text-[10px] text-slate-400 pl-2 italic">
                                ...他 {markdownHeadings.length - 6} 項目
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic py-1">
                            文書内に見出しが存在しません
                          </div>
                        )}
                      </div>
                    )}

                    {/* 本文段落レンダリング (marked による GFM 完全準拠組版) */}
                    <style>{`
                      .pfpdf-body-preview h1 {
                        font-size: 1.15rem;
                        font-weight: 700;
                        margin-top: 1.5rem;
                        margin-bottom: 0.6rem;
                        line-height: 1.4;
                        color: ${currentFormat.h1Style.color};
                        border-bottom: ${currentFormat.h1Style.borderBottom || 'none'};
                        padding-bottom: ${currentFormat.h1Style.borderBottom ? '0.25rem' : '0'};
                      }
                      .pfpdf-body-preview h1:first-child {
                        margin-top: 0.5rem;
                      }
                      .pfpdf-body-preview h2 {
                        font-size: 0.95rem;
                        font-weight: 700;
                        margin-top: 1.25rem;
                        margin-bottom: 0.5rem;
                        line-height: 1.4;
                        color: ${currentFormat.h2Style.color};
                        border-left: ${currentFormat.h2Style.borderLeft || 'none'};
                        border-bottom: ${currentFormat.h2Style.borderBottom || 'none'};
                        padding-left: ${currentFormat.h2Style.borderLeft ? '0.5rem' : '0'};
                        padding-bottom: ${currentFormat.h2Style.borderBottom ? '0.2rem' : '0'};
                      }
                      .pfpdf-body-preview h3 {
                        font-size: 0.85rem;
                        font-weight: 700;
                        margin-top: 1rem;
                        margin-bottom: 0.4rem;
                        line-height: 1.4;
                        color: ${currentFormat.fontFamily === 'serif' ? '#20252b' : '#1e293b'};
                      }
                      .pfpdf-body-preview p {
                        margin-top: 0.6rem;
                        margin-bottom: 0.6rem;
                        line-height: ${currentFormat.id === 'book' ? '1.9' : currentFormat.id === 'compact' ? '1.55' : '1.75'};
                        font-size: 0.8rem;
                        color: ${currentFormat.fontFamily === 'serif' ? '#292521' : '#334155'};
                      }
                      .pfpdf-body-preview ul {
                        margin-top: 0.5rem;
                        margin-bottom: 0.5rem;
                        padding-left: 1.25rem;
                        list-style-type: disc;
                        font-size: 0.8rem;
                        line-height: 1.6;
                        color: #334155;
                      }
                      .pfpdf-body-preview ol {
                        margin-top: 0.5rem;
                        margin-bottom: 0.5rem;
                        padding-left: 1.25rem;
                        list-style-type: decimal;
                        font-size: 0.8rem;
                        line-height: 1.6;
                        color: #334155;
                      }
                      .pfpdf-body-preview li {
                        margin-top: 0.2rem;
                        margin-bottom: 0.2rem;
                      }
                      .pfpdf-body-preview pre {
                        background-color: #0f172a;
                        color: #f8fafc;
                        padding: 0.75rem 1rem;
                        border-radius: 0.375rem;
                        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                        font-size: 0.72rem;
                        overflow-x: auto;
                        margin: 0.75rem 0;
                        border: 1px solid #1e293b;
                        line-height: 1.5;
                      }
                      .pfpdf-body-preview code:not(pre code) {
                        background-color: rgba(0, 0, 0, 0.06);
                        color: #0f5e5a;
                        padding: 0.15rem 0.35rem;
                        border-radius: 0.25rem;
                        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                        font-size: 0.75rem;
                      }
                      .pfpdf-body-preview table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 1rem 0;
                        font-size: 0.75rem;
                      }
                      .pfpdf-body-preview th {
                        background-color: ${currentFormat.tableHeaderBg};
                        color: #ffffff;
                        font-weight: 600;
                        padding: 0.4rem 0.6rem;
                        text-align: left;
                        border: 1px solid rgba(0, 0, 0, 0.1);
                      }
                      .pfpdf-body-preview td {
                        padding: 0.35rem 0.6rem;
                        border: 1px solid #e2e8f0;
                        color: #334155;
                      }
                      .pfpdf-body-preview tr:nth-child(even) td {
                        background-color: rgba(0, 0, 0, 0.02);
                      }
                      .pfpdf-body-preview blockquote {
                        border-left: 3px solid ${currentFormat.color};
                        padding-left: 0.75rem;
                        margin: 0.75rem 0;
                        color: #64748b;
                        font-style: italic;
                      }
                      .pfpdf-body-preview hr {
                        border: 0;
                        border-top: 1px solid #e2e8f0;
                        margin: 1.5rem 0;
                      }
                    `}</style>

                    <div
                      className="pfpdf-body-preview"
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(fileData.body, { async: false, gfm: true }) as string
                      }}
                    />
                  </div>

                  {/* 下部ノンブル（ページ番号） */}
                  <div
                    className={`text-[10px] text-slate-400 font-mono pt-6 pb-2 border-t border-slate-100/80 flex ${
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
                <FileText className="w-10 h-10 text-slate-300 mb-2 stroke-1" />
                <span>Markdown ファイルを読み込むと組版プレビューが表示されます</span>
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
                <FileText className="w-10 h-10 text-slate-300 mb-2 stroke-1" />
                <span>Markdown ファイルが読み込まれていません</span>
              </div>
            )
          ) : (
            /* ログコンソール */
            <div className="bg-[#18181b] text-slate-200 rounded-xl p-4 font-mono text-xs h-full min-h-[300px] overflow-y-auto space-y-1 shadow-inner">
              {logs.length === 0 ? (
                <div className="text-slate-500 italic">「PDF を書き出す」を実行すると、リアルタイムログがここに表示されます...</div>
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

          {/* 右端に配置される上下移動バー (Scroll Controller) */}
          {activeTab === 'formatted' && fileData && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex flex-col items-center bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-full py-2 px-1 shadow-md z-30 select-none space-y-1.5">
              {/* 最上部へジャンプ */}
              <button
                type="button"
                onClick={scrollToTop}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                title="最上部へ移動"
              >
                <ChevronUp className="w-4 h-4" />
              </button>

              {/* 上下に移動できる自作スクロールトラック（縦方向ドラッグ対応） */}
              <div
                ref={scrollTrackRef}
                onMouseDown={handleScrollTrackMouseDown}
                className="w-2.5 h-28 bg-slate-200/90 hover:bg-slate-300/80 rounded-full relative cursor-pointer my-1 transition-colors group select-none"
                title={`スクロール位置: ${previewScrollPercent}% (クリックまたは上下にドラッグしてスクロール)`}
              >
                {/* ドラッグ可能なサム（つまみ） */}
                <div
                  style={{
                    top: `${(previewScrollPercent / 100) * (112 - 24)}px`
                  }}
                  className="w-2.5 h-6 bg-slate-700 group-hover:bg-slate-900 rounded-full absolute left-0 shadow-xs transition-colors cursor-grab active:cursor-grabbing pointer-events-none"
                />
              </div>

              {/* 最下部へジャンプ */}
              <button
                type="button"
                onClick={scrollToBottom}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                title="最下部へ移動"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* スクロール進捗パーセンテージ */}
              <span className="text-[9px] font-mono font-semibold text-slate-500 pt-0.5">
                {previewScrollPercent}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
