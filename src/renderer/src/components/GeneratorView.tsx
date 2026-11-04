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
  Underline,
  Highlighter,
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
  Minus,
  ZoomIn,
  ZoomOut,
  Strikethrough,
  Keyboard,
  Workflow,
  Sigma
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

// 該当ページのHTMLからランニングヘッダー（章タイトル）を動的取得
function getPageRunningHeaderFromHtml(html: string, fallback: string): string {
  const match = html.match(/<h[12][^>]*>(.*?)<\/h[12]>/i)
  if (match) {
    return match[1].replace(/<[^>]+>/g, '').trim()
  }
  return fallback
}

// A4 ページ寸法定数 (210mm : 297mm = 1 : 1.4142857)
const A4_SHEET_WIDTH = 520 // px (実寸 210mm 相当)
const A4_SHEET_HEIGHT = 735 // px (実寸 297mm 相当)
const MM_TO_PX = A4_SHEET_WIDTH / 210 // ≈ 2.47619 px/mm
const PT_TO_PX = (96 / 72) * (A4_SHEET_WIDTH / (210 * (96 / 25.4))) // ≈ 0.87355 px/pt

interface TemplatePageMetrics {
  paddingTopPx: number
  firstPagePaddingTopPx: number
  paddingBottomPx: number
  paddingXPx: number
  contentWidthPx: number
  contentHeightPx: number
  firstPageContentHeightPx: number
  bodyFontSizePx: number
  bodyLineHeight: number
  pMarginEm: number
}

// pfpdf 各公式テンプレートの @page 余白・本文幅・フォントサイズ・行間を 520×735px シートへ幾何学的に完全換算
function getTemplatePageMetrics(templateId: string): TemplatePageMetrics {
  let marginTopMm = 24
  let firstPageMarginTopMm = 24
  let marginBottomMm = 24
  let contentWidthMm = 174 // 210 - 18*2
  let fontSizePt = 10.5
  let lineHeight = 1.7
  let pMarginEm = 0.6

  switch (templateId) {
    case 'pfn':
      // @page { margin: 20mm 20mm 30mm 20mm }
      marginTopMm = 20
      firstPageMarginTopMm = 20
      marginBottomMm = 30
      contentWidthMm = 170
      fontSizePt = 10.5
      lineHeight = 1.9
      pMarginEm = 0.85
      break
    case 'academic':
      // @page { margin: 27mm 22mm 24mm }, .academic-content { max-width: 158mm; margin: 0 auto }
      marginTopMm = 27
      firstPageMarginTopMm = 27
      marginBottomMm = 24
      contentWidthMm = 158
      fontSizePt = 9.5
      lineHeight = 1.8
      pMarginEm = 0.65
      break
    case 'technical':
      // @page { margin: 23mm 16mm 21mm }
      marginTopMm = 23
      firstPageMarginTopMm = 23
      marginBottomMm = 21
      contentWidthMm = 178
      fontSizePt = 9.5
      lineHeight = 1.55
      pMarginEm = 0.48
      break
    case 'book':
      // @page { margin: 29mm 22mm 25mm }, .book-content { max-width: 155mm; margin: 0 auto }
      marginTopMm = 29
      firstPageMarginTopMm = 29
      marginBottomMm = 25
      contentWidthMm = 155
      fontSizePt = 10.5
      lineHeight = 1.9
      pMarginEm = 0.75
      break
    case 'notebook':
      // @page { margin: 23mm 18mm 22mm }
      marginTopMm = 23
      firstPageMarginTopMm = 23
      marginBottomMm = 22
      contentWidthMm = 174
      fontSizePt = 10.5
      lineHeight = 1.75
      pMarginEm = 0.65
      break
    case 'compact':
      // @page { margin: 19mm 14mm 17mm }, @page :first { margin-top: 15mm }
      marginTopMm = 19
      firstPageMarginTopMm = 15
      marginBottomMm = 17
      contentWidthMm = 182
      fontSizePt = 9.5
      lineHeight = 1.52
      pMarginEm = 0.38
      break
    case 'default':
    default:
      // @page { margin: 24mm 18mm 24mm }
      marginTopMm = 24
      firstPageMarginTopMm = 24
      marginBottomMm = 24
      contentWidthMm = 174
      fontSizePt = 10.5
      lineHeight = 1.7
      pMarginEm = 0.6
      break
  }

  const paddingTopPx = Math.round(marginTopMm * MM_TO_PX)
  const firstPagePaddingTopPx = Math.round(firstPageMarginTopMm * MM_TO_PX)
  const paddingBottomPx = Math.round(marginBottomMm * MM_TO_PX)
  const contentWidthPx = Math.round(contentWidthMm * MM_TO_PX)
  const paddingXPx = Number(((A4_SHEET_WIDTH - contentWidthPx) / 2).toFixed(1))
  const contentHeightPx = A4_SHEET_HEIGHT - paddingTopPx - paddingBottomPx
  const firstPageContentHeightPx = A4_SHEET_HEIGHT - firstPagePaddingTopPx - paddingBottomPx
  const bodyFontSizePx = Number((fontSizePt * PT_TO_PX).toFixed(2))

  return {
    paddingTopPx,
    firstPagePaddingTopPx,
    paddingBottomPx,
    paddingXPx,
    contentWidthPx,
    contentHeightPx,
    firstPageContentHeightPx,
    bodyFontSizePx,
    bodyLineHeight: lineHeight,
    pMarginEm
  }
}

// プレビュー用に Markdown 内の改ページ記法 (`___` および `<div style="page-break-after: always;"></div>`) と
// 蛍光マーカー (`<mark>` / `==...==`)・下線 (`<u>`) を展開する
function preprocessMarkdownForPreview(markdown: string): string {
  const lines = markdown.split(/\r?\n/)
  const outLines: string[] = []
  let inCodeBlock = false
  const pageBreakDivRegex =
    /[ \t]*<div\b[^>]*(?:page-break|break-after|break-before|data-pfpdf-page-break|pagebreak)[^>]*>\s*<\/div>[ \t]*/gi

  const transformInline = (textLine: string): string => {
    return textLine
      .split(/(`+[^`]*`+)/g)
      .map((segment) => {
        if (segment.startsWith('`')) return segment
        return segment
          .replace(
            /==([^=\n]+)==/g,
            '<span class="pfpdf-marker-coral">$1</span>'
          )
          .replace(
            /<mark\s+class=["']yellow["']\s*>([\s\S]*?)<\/mark>/gi,
            '<span class="pfpdf-marker-yellow">$1</span>'
          )
          .replace(
            /<mark>([\s\S]*?)<\/mark>/gi,
            '<span class="pfpdf-marker-coral">$1</span>'
          )
      })
      .join('')
  }

  for (const line of lines) {
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
      outLines.push(
        transformInline(
          line.replace(
            pageBreakDivRegex,
            '\n\n<div class="page-break" data-pfpdf-page-break=""></div>\n\n'
          )
        )
      )
      continue
    }

    if (/^___+\s*$/.test(trimmed)) {
      outLines.push('', '<div class="page-break" data-pfpdf-page-break=""></div>', '')
      continue
    }

    outLines.push(transformInline(line))
  }

  return outLines.join('\n')
}

// HTML特殊文字エスケープ
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// HTML タグ内の属性 (class="yellow" 等) を1パスで色分け
const HTML_ATTR_REGEX = /([a-zA-Z_:][a-zA-Z0-9_.:-]*)(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'=<>`]+)/g

function highlightHtmlTagToken(rawTag: string, escapeFn: (s: string) => string): string {
  const m = rawTag.match(/^(<\/?)([a-zA-Z][a-zA-Z0-9-]*)([\s\S]*?)(\/?>$)/)
  if (!m) {
    return `<span style="color: #be123c;">${escapeFn(rawTag)}</span>`
  }
  const openBracket = m[1]
  const tagName = m[2]
  const attrs = m[3]
  const closeBracket = m[4]

  const attrParts: string[] = []
  let lastIdx = 0
  HTML_ATTR_REGEX.lastIndex = 0
  let am: RegExpExecArray | null
  while ((am = HTML_ATTR_REGEX.exec(attrs)) !== null) {
    if (am.index > lastIdx) {
      attrParts.push(escapeFn(attrs.slice(lastIdx, am.index)))
    }
    attrParts.push(
      `<span style="color: #d97706;">${escapeFn(am[1])}</span>` +
        `<span style="color: #64748b;">${escapeFn(am[2])}</span>` +
        `<span style="color: #2563eb;">${escapeFn(am[3])}</span>`
    )
    lastIdx = am.index + am[0].length
  }
  if (lastIdx < attrs.length) {
    attrParts.push(escapeFn(attrs.slice(lastIdx)))
  }

  return (
    `<span style="color: #800000;">${escapeFn(openBracket)}</span>` +
    `<span style="color: #be123c;">${escapeFn(tagName)}</span>` +
    attrParts.join('') +
    `<span style="color: #800000;">${escapeFn(closeBracket)}</span>`
  )
}

// 行内の Markdown 記号・HTMLタグを1パスでトークナイズしてタグ・記号側に色を付ける
// ※文字幅・カーソル位置が1pxもズレないよう、文字数の増減・padding・font-weight変更は一切行わず color のみ付与する
const INLINE_TOKEN_MASTER_REGEX =
  /(<!--[\s\S]*?-->)|(`+[^`\n]+?`+)|(<\/?[a-zA-Z][a-zA-Z0-9-]*(?:\s+[^>\n]*)?>)|(\[[^\]\n]+\]\([^)\n]+\))|(\$\$)|((?<!\$)\$[^\$\r\n]+?\$(?!\$))|(\*\*)|((?<!\*)\*[^*\n]+?\*(?!\*))|(~~)|(==)/g

function highlightInlineElements(text: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const out: string[] = []
  let lastIdx = 0
  const regex = new RegExp(INLINE_TOKEN_MASTER_REGEX.source, 'g')
  let m: RegExpExecArray | null

  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      out.push(escape(text.slice(lastIdx, m.index)))
    }

    const token = m[0]
    if (m[1]) {
      // 1. インライン HTML コメント <!-- ... --> (VSCode コメントグリーン)
      out.push(`<span style="color: #16a34a;">${escape(token)}</span>`)
    } else if (m[2]) {
      // 2. インラインコード `...` (バッククォート記号に鮮やかなピンク、中身に落ち着いたコード色)
      const mc = token.match(/^(`+)([\s\S]*?)(`+)$/)
      if (mc) {
        out.push(
          `<span style="color: #db2777;">${escape(mc[1])}</span>` +
            `<span style="color: #be185d;">${escape(mc[2])}</span>` +
            `<span style="color: #db2777;">${escape(mc[3])}</span>`
        )
      } else {
        out.push(`<span style="color: #db2777;">${escape(token)}</span>`)
      }
    } else if (m[3]) {
      // 3. HTML タグ (<mark>, </mark>, <u>, </u>, <kbd>, </kbd>, <div ...> 等: タグのみ色付け)
      out.push(highlightHtmlTagToken(token, escape))
    } else if (m[4]) {
      // 4. リンク [text](url)
      const ml = token.match(/^(\[)([^\]\n]+)(\]\()([^)\n]+)(\))$/)
      if (ml) {
        out.push(
          `<span style="color: #0284c7;">${escape(ml[1])}</span>` +
            highlightInlineElements(ml[2]) +
            `<span style="color: #0284c7;">${escape(ml[3])}</span>` +
            `<span style="color: #2563eb;">${escape(ml[4])}</span>` +
            `<span style="color: #0284c7;">${escape(ml[5])}</span>`
        )
      } else {
        out.push(escape(token))
      }
    } else if (m[5]) {
      // 5. 数式記号 $$
      out.push(`<span style="color: #7c3aed;">${escape(token)}</span>`)
    } else if (m[6]) {
      // 6. インライン数式 $...$ ($ 記号にパープル色付け)
      const inner = token.slice(1, -1)
      out.push(
        `<span style="color: #7c3aed;">$</span>` +
          `<span style="color: #6d28d9;">${escape(inner)}</span>` +
          `<span style="color: #7c3aed;">$</span>`
      )
    } else if (m[7]) {
      // 7. 太字タグ ** (記号のみに VSCode ブルー色付け、中身は通常テキストとして自由編集)
      out.push(`<span style="color: #0284c7;">${escape(token)}</span>`)
    } else if (m[8]) {
      // 8. 斜体 *...* (両端の * 記号に色付け、中身は再帰処理)
      const inner = token.slice(1, -1)
      out.push(
        `<span style="color: #0284c7;">*</span>` +
          highlightInlineElements(inner) +
          `<span style="color: #0284c7;">*</span>`
      )
    } else if (m[9]) {
      // 9. 取り消し線タグ ~~ (記号のみにパープル色付け)
      out.push(`<span style="color: #9333ea;">${escape(token)}</span>`)
    } else if (m[10]) {
      // 10. 蛍光マーカータグ == (記号のみにオレンジ色付け)
      out.push(`<span style="color: #ea580c;">${escape(token)}</span>`)
    } else {
      out.push(escape(token))
    }

    lastIdx = m.index + token.length
  }

  if (lastIdx < text.length) {
    out.push(escape(text.slice(lastIdx)))
  }

  return out.join('')
}

// VSCode 風 Markdown シンタックスハイライト生成関数
// ※前面の textarea と文字位置・折り返しが 100% 一致するよう、文字幅を変えるスタイルは一切使わず色のみで表現
function highlightMarkdownForEditor(text: string): string {
  if (!text) return '<br>'

  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const lines = text.split('\n')
  let inCodeBlock = false
  let inCommentBlock = false

  const highlightedLines = lines.map((line) => {
    // 1. 複数行 HTML コメント (<!-- ... -->) の継続判定
    if (inCommentBlock) {
      const closeIdx = line.indexOf('-->')
      if (closeIdx !== -1) {
        const endPos = closeIdx + 3
        const commentPart = line.slice(0, endPos)
        const restPart = line.slice(endPos)
        inCommentBlock = false
        return `<span style="color: #16a34a;">${escape(commentPart)}</span>${highlightInlineElements(restPart)}`
      }
      return `<span style="color: #16a34a;">${escape(line)}</span>`
    }

    const openCommentIdx = line.indexOf('<!--')
    if (openCommentIdx !== -1 && line.indexOf('-->', openCommentIdx + 4) === -1) {
      const beforePart = line.slice(0, openCommentIdx)
      const commentPart = line.slice(openCommentIdx)
      inCommentBlock = true
      return `${highlightInlineElements(beforePart)}<span style="color: #16a34a;">${escape(commentPart)}</span>`
    }

    // 2. コードブロック開始・終了フェンス (``` または ~~~)
    const fenceMatch = line.match(/^([ \t]*(?:```+|~~~+))(.*)$/)
    if (fenceMatch) {
      inCodeBlock = !inCodeBlock
      return `<span style="color: #7c3aed;">${escape(fenceMatch[1])}</span><span style="color: #0284c7;">${escape(fenceMatch[2])}</span>`
    }

    if (inCodeBlock) {
      return `<span style="color: #0f766e;">${escape(line)}</span>`
    }

    // 3. 見出し (# 〜 ###### : 先頭の # タグに鮮やかな VSCode ブルーを付与し、本文内のタグも色分け)
    const headingMatch = line.match(/^([ \t]*#{1,6}(?:[ \t]+|$))([\s\S]*)$/)
    if (headingMatch) {
      return `<span style="color: #0284c7;">${escape(headingMatch[1])}</span>${highlightInlineElements(headingMatch[2])}`
    }

    // 4. 引用 (> : 先頭の > 記号にブルーを付与)
    const quoteMatch = line.match(/^([ \t]*>+[ \t]*)([\s\S]*)$/)
    if (quoteMatch) {
      return `<span style="color: #0284c7;">${escape(quoteMatch[1])}</span>${highlightInlineElements(quoteMatch[2])}`
    }

    // 5. チェックボックスリスト (- [ ] / - [x] : 先頭記号にアンバーオレンジを付与)
    const taskMatch = line.match(/^([ \t]*[-*+][ \t]+\[[ xX]\][ \t]+)([\s\S]*)$/)
    if (taskMatch) {
      return `<span style="color: #d97706;">${escape(taskMatch[1])}</span>${highlightInlineElements(taskMatch[2])}`
    }

    // 6. 箇条書き・番号付きリスト (- , * , + , 1. : 先頭記号にアンバーオレンジを付与)
    const listMatch = line.match(/^([ \t]*(?:[-*+]|\d+\.)[ \t]+)([\s\S]*)$/)
    if (listMatch) {
      return `<span style="color: #d97706;">${escape(listMatch[1])}</span>${highlightInlineElements(listMatch[2])}`
    }

    // 7. 区切り線 (---) または 改ページ (___)
    if (/^[ \t]*(?:---+|_{3,})[ \t]*$/.test(line)) {
      const isBreak = line.includes('_')
      const color = isBreak ? '#e11d48' : '#64748b'
      return `<span style="color: ${color};">${escape(line)}</span>`
    }

    // 8. 通常の行: インラインのタグ・記号を色分け
    return highlightInlineElements(line)
  })

  const result = highlightedLines.join('\n')
  return text.endsWith('\n') ? `${result} ` : result
}

// エディタの文字位置・キャレット・折り返しを1pxの狂いもなく完全同期させる共通スタイル
const EDITOR_SHARED_STYLE: React.CSSProperties = {
  boxSizing: 'border-box',
  border: 'none',
  outline: 'none',
  margin: 0,
  padding: '14px 16px',
  fontSize: '13px',
  lineHeight: '22px', // 整数ピクセルで固定（行ごとにサブピクセルのズレが累積するのを完全に防止）
  fontFamily: 'Consolas, "BIZ UDGothic", "MS Gothic", "Courier New", monospace', // Windows完全等幅フォント
  letterSpacing: '0px',
  wordSpacing: '0px',
  tabSize: 2,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
  wordBreak: 'break-all',
  fontVariantLigatures: 'none',
  fontFeatureSettings: '"liga" 0, "calt" 0',
  textRendering: 'optimizeSpeed'
}

interface ExtractedPreviewItem {
  id: string
  type: 'math-display' | 'math-inline' | 'mermaid'
  content: string
  placeholder: string
}

// プレビュー用に数式 ($$...$$, $...$) および Mermaid コードブロックを抽出し、
// marked の太字記法 (_等) に壊されない完全な HTML タグプレースホルダーに置換する関数
function extractMathAndMermaidForPreview(markdown: string): {
  cleanMarkdown: string
  items: ExtractedPreviewItem[]
} {
  const items: ExtractedPreviewItem[] = []
  let count = 0

  // 1. ```mermaid ... ``` を抽出
  let processed = markdown.replace(/```mermaid\s*\r?\n([\s\S]*?)```/g, (_, code) => {
    const trimmed = code.trim()
    const id = `mermaid${count++}`
    const placeholder = `<div data-pfpdf-ph="${id}"></div>`
    items.push({
      id,
      type: 'mermaid',
      content: trimmed,
      placeholder
    })
    return `\n\n${placeholder}\n\n`
  })

  // 2. $$ ... $$ (ディスプレイ数式) を抽出 (単一行・複数行双方に対応)
  processed = processed.replace(/\$\$\s*\r?\n?([\s\S]*?)\r?\n?\s*\$\$/g, (_, tex) => {
    const trimmed = tex.trim()
    const id = `mathdisp${count++}`
    const placeholder = `<div data-pfpdf-ph="${id}"></div>`
    items.push({
      id,
      type: 'math-display',
      content: trimmed,
      placeholder
    })
    return `\n\n${placeholder}\n\n`
  })

  // 3. $...$ (インライン数式) を抽出
  // インラインコード (`...`) の内側は除外するためコードセグメントで分割して走査
  const codeSegments = processed.split(/(`+[^`]*`+)/g)
  processed = codeSegments
    .map((segment) => {
      if (segment.startsWith('`')) return segment
      // 単なる金額表記 ($100, $5.99) を除外
      return segment.replace(/(?<!\$)\$([^\$\r\n]+?)\$(?!\$)/g, (fullMatch, tex) => {
        const trimmed = tex.trim()
        if (!trimmed || /^\d+([.,]\d+)?$/.test(trimmed)) {
          return fullMatch
        }
        const id = `mathinline${count++}`
        const placeholder = `<span data-pfpdf-ph="${id}"></span>`
        items.push({
          id,
          type: 'math-inline',
          content: trimmed,
          placeholder
        })
        return placeholder
      })
    })
    .join('')

  return { cleanMarkdown: processed, items }
}

// marked で変換された HTML 内のプレースホルダーを、キャッシュされた本物の MathJax / Mermaid SVG に復元
function injectRenderedSvg(
  html: string,
  items: ExtractedPreviewItem[],
  cache: Map<string, string>
): string {
  let result = html
  for (const item of items) {
    const key = `${item.type}:${item.content}`
    const cachedSvg = cache.get(key)
    const replacement =
      cachedSvg ||
      (item.type === 'mermaid'
        ? `<div class="pfpdf-mermaid" style="text-align: center; margin: 1em 0; color: #64748b; font-family: monospace; font-size: 11px; padding: 12px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px;">⏳ Mermaid ダイアグラムを描画中...</div>`
        : item.type === 'math-display'
        ? `<div class="pfpdf-math-display" style="text-align: center; margin: 0.8em 0; color: #64748b; font-family: monospace; font-size: 12px; padding: 6px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 4px;">⏳ \\[ ${escapeHtml(item.content)} \\]</div>`
        : `<span class="pfpdf-math-inline" style="color: #64748b; font-family: monospace; font-size: 0.9em;">⏳ \\( ${escapeHtml(item.content)} \\)</span>`)

    // marked が前後に自動挿入する <p> や改行を含めて完全に置換
    const regex = new RegExp(`(<p>\\s*)?<[a-z]+ data-pfpdf-ph="${item.id}">.*?<\\/[a-z]+>(\\s*<\\/p>)?`, 'g')
    result = result.replace(regex, replacement)
  }
  return result
}

// DOM測定を利用して、A4の1枚に収まらない長文を pfpdf (Vivliostyle) と同じ組版規則で次ページへ分割する関数
// - 測定コンテナ内で要素を累積配置することで CSS の上下マージン相殺 (margin collapsing) を正確に再現
// - リスト (ul/ol) の項目単位分割、長文段落 (p) の行分割 (orphans: 2, widows: 2)、見出しの孤立防止 (break-after: avoid) に対応
function paginateHtmlContent(
  htmlContent: string,
  maxHeightP1: number,
  maxHeightStandard: number,
  measureContainer: HTMLElement | null,
  breakBeforeSubsequentH1: boolean = false
): string[] {
  if (!htmlContent || !htmlContent.trim()) return ['']

  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div>${htmlContent}</div>`, 'text/html')
  const root = doc.body.firstElementChild
  if (!root || root.children.length === 0) {
    return [htmlContent]
  }

  // 測定コンテナが無い場合のフォールバック
  if (!measureContainer) {
    return [htmlContent]
  }

  measureContainer.innerHTML = ''

  const pages: string[] = []
  let currentLimit = maxHeightP1
  let seenFirstH1 = false

  const flushPage = (): void => {
    pages.push(measureContainer.innerHTML)
    measureContainer.innerHTML = ''
    currentLimit = maxHeightStandard
  }

  // pfpdf の `h1..h6 { break-after: avoid }` を再現:
  // ページ末尾に見出しだけが残って次要素が次ページに送られる場合、見出しも一緒に次ページへ送る
  const popTrailingHeadings = (): HTMLElement[] => {
    const popped: HTMLElement[] = []
    while (
      measureContainer.children.length > 0 &&
      /^H[1-6]$/.test(measureContainer.lastElementChild?.tagName || '')
    ) {
      const last = measureContainer.lastElementChild as HTMLElement
      measureContainer.removeChild(last)
      popped.unshift(last)
    }
    // もしページ内の全要素が見出しだった場合は空ページを防ぐため元に戻す
    if (measureContainer.children.length === 0 && popped.length > 0) {
      for (const h of popped) {
        measureContainer.appendChild(h)
      }
      return []
    }
    return popped
  }

  const queue: HTMLElement[] = Array.from(root.children) as HTMLElement[]
  const computedLineHeight = parseFloat(window.getComputedStyle(measureContainer).lineHeight) || 15.5

  while (queue.length > 0) {
    const el = queue.shift()!

    // 明示的な改ページタグの判定
    const isExplicitBreak =
      el.hasAttribute('data-pfpdf-page-break') ||
      el.getAttribute('style')?.includes('page-break-after') ||
      el.getAttribute('style')?.includes('break-after') ||
      el.getAttribute('style')?.includes('page-break-before') ||
      el.getAttribute('style')?.includes('break-before') ||
      el.classList.contains('page-break') ||
      el.classList.contains('pagebreak')

    if (isExplicitBreak) {
      if (measureContainer.children.length > 0) {
        flushPage()
      }
      continue
    }

    // book テンプレートの `.book-content h1 { break-before: page }` (最初の h1 以外) を再現
    if (el.tagName === 'H1') {
      if (breakBeforeSubsequentH1 && seenFirstH1 && measureContainer.children.length > 0) {
        flushPage()
      }
      seenFirstH1 = true
    }

    // 要素を測定コンテナに追加して、CSSマージン相殺込みの実測高さを確認
    const clone = el.cloneNode(true) as HTMLElement
    measureContainer.appendChild(clone)

    if (measureContainer.offsetHeight <= currentLimit) {
      // 現在のページに収まる場合はそのまま確定
      continue
    }

    // 収まらない場合はいったん取り除く
    measureContainer.removeChild(clone)

    // 1. 箇条書きリスト (UL / OL) の項目 (LI) 単位でのページ跨ぎ分割
    if (el.tagName === 'UL' || el.tagName === 'OL') {
      const items = Array.from(el.children).filter((c) => c.tagName === 'LI') as HTMLElement[]
      if (items.length >= 2) {
        const part1 = el.cloneNode(false) as HTMLElement
        measureContainer.appendChild(part1)

        let fitCount = 0
        for (let k = 0; k < items.length; k++) {
          const liClone = items[k].cloneNode(true) as HTMLElement
          part1.appendChild(liClone)
          if (measureContainer.offsetHeight > currentLimit) {
            part1.removeChild(liClone)
            break
          }
          fitCount++
        }

        if (fitCount > 0 && fitCount < items.length) {
          const part2 = el.cloneNode(false) as HTMLElement
          if (el.tagName === 'OL') {
            const baseStart = parseInt(el.getAttribute('start') || '1', 10) || 1
            part2.setAttribute('start', String(baseStart + fitCount))
          }
          for (let k = fitCount; k < items.length; k++) {
            part2.appendChild(items[k].cloneNode(true))
          }
          flushPage()
          queue.unshift(part2)
          continue
        } else {
          measureContainer.removeChild(part1)
        }
      }
    }

    // 2. 長文の段落 (P) のページ跨ぎ行分割 (pfpdf の orphans: 2, widows: 2 準拠)
    if (
      el.tagName === 'P' &&
      el.childNodes.length === 1 &&
      el.firstChild?.nodeType === Node.TEXT_NODE
    ) {
      const fullText = el.textContent || ''
      const remainingSpace = currentLimit - measureContainer.offsetHeight
      // 最低2行分 (orphans: 2) 以上の余白がページ下部に残っている場合のみ段落分割を試行
      if (fullText.length >= 50 && remainingSpace >= computedLineHeight * 1.95) {
        const p1 = el.cloneNode(false) as HTMLElement
        p1.style.marginBottom = '0'
        measureContainer.appendChild(p1)

        let low = 1
        let high = fullText.length - 1
        let bestIdx = 0

        while (low <= high) {
          const mid = (low + high) >> 1
          p1.textContent = fullText.slice(0, mid)
          if (measureContainer.offsetHeight <= currentLimit) {
            bestIdx = mid
            low = mid + 1
          } else {
            high = mid - 1
          }
        }

        if (bestIdx > 0) {
          p1.textContent = fullText.slice(0, bestIdx)
          const p1Lines = Math.round(p1.offsetHeight / computedLineHeight)
          const restText = fullText.slice(bestIdx).trimStart()
          measureContainer.removeChild(p1)

          // orphans >= 2 かつ 次ページ送り分も十分な文字数 (widows >= 2 相当) ある場合のみ分割確定
          if (p1Lines >= 2 && restText.length >= 25) {
            measureContainer.appendChild(p1)
            const p2 = el.cloneNode(false) as HTMLElement
            p2.style.marginTop = '0'
            p2.textContent = restText
            flushPage()
            queue.unshift(p2)
            continue
          }
        } else {
          measureContainer.removeChild(p1)
        }
      }
    }

    // 3. 分割できない要素の場合:
    // 現在のページに既に要素があるなら、末尾の孤立見出し (H1〜H6) を一緒に次ページへ送る
    if (measureContainer.children.length > 0) {
      const trailingHeadings = popTrailingHeadings()
      flushPage()
      queue.unshift(...trailingHeadings, el)
    } else {
      // ページ先頭で単一要素が1ページを超える場合はそのまま配置して次ページへ
      measureContainer.appendChild(clone)
      flushPage()
    }
  }

  if (measureContainer.children.length > 0 || pages.length === 0) {
    pages.push(measureContainer.innerHTML)
    measureContainer.innerHTML = ''
  }

  return pages.length > 0 ? pages : ['']
}

// Notionライクなスラッシュコマンド定義
interface SlashCommandItem {
  id: string
  title: string
  description: string
  category: '見出し' | '文字装飾' | 'リスト' | 'ブロック'
  icon: React.ReactNode
  keywords: string[]
  insertText: string
  cursorOffset?: number
}

const SLASH_COMMANDS: SlashCommandItem[] = [
  // --- 見出し ---
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

  // --- 文字装飾 ---
  {
    id: 'bold',
    title: '太字 (Bold)',
    description: '文字を太くして重要箇所を強調 (**テキスト**)',
    category: '文字装飾',
    icon: <Bold className="w-4 h-4 text-slate-700" />,
    keywords: ['bold', 'strong', '太字', '強調', 'ふとじ'],
    insertText: '**重要テキスト**',
    cursorOffset: 2
  },
  {
    id: 'italic',
    title: '斜体 (Italic)',
    description: '文字を斜体にして控えめに強調 (*テキスト*)',
    category: '文字装飾',
    icon: <Italic className="w-4 h-4 text-slate-700" />,
    keywords: ['italic', 'em', '斜体', 'イタリック'],
    insertText: '*補足テキスト*',
    cursorOffset: 1
  },
  {
    id: 'strikethrough',
    title: '取り消し線 (Strikethrough)',
    description: '修正前や完了した項目を打ち消し (~~テキスト~~)',
    category: '文字装飾',
    icon: <Strikethrough className="w-4 h-4 text-slate-700" />,
    keywords: ['strike', 'del', '取り消し線', '打ち消し', '修正'],
    insertText: '~~取り消しテキスト~~',
    cursorOffset: 2
  },
  {
    id: 'marker',
    title: '蛍光マーカー下線 (コーラル)',
    description: '文字の下半分にコーラルの蛍光マーカー (<mark>テキスト</mark> または ==テキスト==)',
    category: '文字装飾',
    icon: <Highlighter className="w-4 h-4 text-orange-500" />,
    keywords: ['marker', 'highlight', 'mark', 'マーカー', '蛍光', '下線', '強調', 'コーラル', 'ピンク'],
    insertText: '<mark>お知らせ</mark>',
    cursorOffset: 6
  },
  {
    id: 'marker-yellow',
    title: '蛍光マーカー下線 (イエロー)',
    description: '文字の下半分に定番の黄色蛍光マーカー (<mark class="yellow">テキスト</mark>)',
    category: '文字装飾',
    icon: <Highlighter className="w-4 h-4 text-amber-500" />,
    keywords: ['marker', 'yellow', 'highlight', 'マーカー', '黄色', 'イエロー', '蛍光'],
    insertText: '<mark class="yellow">重要項目</mark>',
    cursorOffset: 23
  },
  {
    id: 'underline',
    title: '普通の下線 (Underline)',
    description: 'シンプルな下線を引く (<u>テキスト</u>)',
    category: '文字装飾',
    icon: <Underline className="w-4 h-4 text-slate-700" />,
    keywords: ['underline', 'u', '下線', 'アンダーライン'],
    insertText: '<u>下線テキスト</u>',
    cursorOffset: 3
  },
  {
    id: 'kbd',
    title: 'キートップ・キー操作 (Kbd)',
    description: 'PC操作キーやショートカットを綺麗にボタン表示 (<kbd>Ctrl</kbd>)',
    category: '文字装飾',
    icon: <Keyboard className="w-4 h-4 text-slate-700" />,
    keywords: ['kbd', 'key', 'keyboard', 'キー', 'ショートカット', 'ボタン'],
    insertText: '<kbd>Ctrl</kbd> + <kbd>S</kbd>'
  },
  {
    id: 'inline-code',
    title: 'インラインコード',
    description: 'コマンドや変数名を等幅フォントで囲む (`code`)',
    category: '文字装飾',
    icon: <Code className="w-4 h-4 text-slate-700" />,
    keywords: ['code', 'inline', 'コード', 'コマンド', '変数'],
    insertText: '`コード`',
    cursorOffset: 1
  },

  // --- リスト ---
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
    title: 'ToDo リスト (チェックボックス)',
    description: 'チェックボックス付きタスクを作成 (- [ ] )',
    category: 'リスト',
    icon: <CheckSquare className="w-4 h-4 text-slate-700" />,
    keywords: ['todo', 'task', 'check', 'タスク', 'チェック'],
    insertText: '- [ ] '
  },

  // --- ブロック & コールアウト ---
  {
    id: 'quote',
    title: '引用 (Quote)',
    description: '目立たせたい引用文を作成 (> )',
    category: 'ブロック',
    icon: <Quote className="w-4 h-4 text-slate-700" />,
    keywords: ['quote', '引用', 'コールアウト'],
    insertText: '> '
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
    id: 'code-block',
    title: 'コードブロック',
    description: 'シンタックスハイライト付きプログラムコードを記述',
    category: 'ブロック',
    icon: <Code className="w-4 h-4 text-slate-700" />,
    keywords: ['code', 'block', 'コード', 'プログラム'],
    insertText: '```typescript\n// ここにコードを入力\n```\n',
    cursorOffset: 14
  },
  {
    id: 'math',
    title: '数式ブロック (MathJax / LaTeX)',
    description: '本格的な数式をTeX記法で美しく描画',
    category: 'ブロック',
    icon: <Sigma className="w-4 h-4 text-indigo-600" />,
    keywords: ['math', 'tex', 'latex', '数式', 'シグマ', '方程式'],
    insertText: '$$\nE = mc^2\n$$\n\n',
    cursorOffset: 3
  },
  {
    id: 'mermaid',
    title: 'フローチャート・図 (Mermaid)',
    description: 'テキストからフローチャートやシーケンス図を自動生成',
    category: 'ブロック',
    icon: <Workflow className="w-4 h-4 text-emerald-600" />,
    keywords: ['mermaid', 'flowchart', 'graph', 'diagram', '図', 'フローチャート', 'シーケンス'],
    insertText: '```mermaid\ngraph LR\n  開始[開始] --> 処理[処理実行] --> 完了[完了]\n```\n\n'
  },
  {
    id: 'pagebreak',
    title: '改ページ (A4印刷用)',
    description: 'PDF組版時に強制的に次のページへ送る (pfpdf公式 ___ 記法)',
    category: 'ブロック',
    icon: <FileText className="w-4 h-4 text-slate-700" />,
    keywords: ['page', 'pagebreak', 'break', '改ページ', 'ページ区切り'],
    insertText: '\n\n___\n\n'
  },
  {
    id: 'comment',
    title: 'コメントアウト (HTML Comment)',
    description: 'プレビュー・PDF出力時に非表示にするコメント (Ctrl + /)',
    category: 'ブロック',
    icon: <Code className="w-4 h-4 text-slate-700" />,
    keywords: ['comment', 'コメント', '非表示', 'メモ', 'html comment', '<!--'],
    insertText: '<!-- ここに非表示コメントを入力 -->\n\n'
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
  const [syntaxHighlightEnabled, setSyntaxHighlightEnabled] = useState<boolean>(true)
  const [isDirty, setIsDirty] = useState<boolean>(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState<string>('')
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const highlightPreRef = useRef<HTMLPreElement>(null)

  // 未保存変更ガード用ステート
  const [showUnsavedModal, setShowUnsavedModal] = useState<boolean>(false)
  const [isCloseAction, setIsCloseAction] = useState<boolean>(false)
  const [pendingNavigationAction, setPendingNavigationAction] = useState<(() => void) | null>(null)

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

  // プレビューのズーム倍率 (Ctrl + マウスホイールで 50% 〜 200%)
  const [zoomLevel, setZoomLevel] = useState<number>(100)

  // A4 自動改ページ計算用の非表示測定コンテナ ref & 分割済みページ
  const measureContainerRef = useRef<HTMLDivElement>(null)
  const [paginatedPages, setPaginatedPages] = useState<string[]>([''])

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

  // Markdownから抽出した見出しリスト (useEffect より前に宣言)
  const markdownHeadings = fileData ? extractHeadings(fileData.body) : []

  // 数式 (MathJax) & Mermaid のプレビュー用インライン SVG キャッシュ
  const previewSvgCacheRef = useRef<Map<string, string>>(new Map())
  const [svgRenderVersion, setSvgRenderVersion] = useState<number>(0)

  // Markdown 本文内の数式 ($$ / $) および Mermaid を検出し、未キャッシュのものをバックグラウンドで SVG 化
  useEffect(() => {
    const bodyText = fileData?.body ?? editorText
    if (!bodyText || !window.pfpdfAPI?.renderPreviewBatch) return

    const { items } = extractMathAndMermaidForPreview(bodyText)
    const mathToFetch: Array<{ id: string; tex: string; display: boolean; key: string }> = []
    const mermaidToFetch: Array<{ id: string; source: string; key: string }> = []

    for (const item of items) {
      const key = `${item.type}:${item.content}`
      if (!previewSvgCacheRef.current.has(key)) {
        if (item.type === 'mermaid') {
          mermaidToFetch.push({ id: item.id, source: item.content, key })
        } else {
          mathToFetch.push({
            id: item.id,
            tex: item.content,
            display: item.type === 'math-display',
            key
          })
        }
      }
    }

    if (mathToFetch.length === 0 && mermaidToFetch.length === 0) return

    let isCancelled = false

    // 80ms のデバウンスで過剰なレンダリング要求を抑制しつつ素早く反映
    const timer = setTimeout(async () => {
      try {
        const res = await window.pfpdfAPI!.renderPreviewBatch!({
          mathItems: mathToFetch.map((m) => ({ id: m.id, tex: m.tex, display: m.display })),
          mermaidItems: mermaidToFetch.map((m) => ({ id: m.id, source: m.source }))
        })

        if (isCancelled) return

        let hasNew = false
        if (res && res.mathResults) {
          for (const m of mathToFetch) {
            if (res.mathResults[m.id]) {
              previewSvgCacheRef.current.set(m.key, res.mathResults[m.id])
              hasNew = true
            }
          }
        }
        if (res && res.mermaidResults) {
          for (const m of mermaidToFetch) {
            if (res.mermaidResults[m.id]) {
              previewSvgCacheRef.current.set(m.key, res.mermaidResults[m.id])
              hasNew = true
            }
          }
        }

        if (hasNew) {
          setSvgRenderVersion((v) => v + 1)
        }
      } catch (err) {
        console.error('Failed to render preview math/mermaid batch:', err)
      }
    }, 80)

    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [fileData?.body, editorText])

  // エディタとシンタックスハイライトレイヤーのスクロール同期
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightPreRef.current) {
      highlightPreRef.current.scrollTop = e.currentTarget.scrollTop
      highlightPreRef.current.scrollLeft = e.currentTarget.scrollLeft
    }
  }

  // テキスト変更時・改行時にも背面ハイライトレイヤーのスクロール位置を厳密に同期
  useEffect(() => {
    if (editorRef.current && highlightPreRef.current) {
      highlightPreRef.current.scrollTop = editorRef.current.scrollTop
      highlightPreRef.current.scrollLeft = editorRef.current.scrollLeft
    }
  }, [editorText])

  // ウィンドウを閉じる時の未保存変更確認ガード (Electron IPC 連動)
  useEffect(() => {
    if (!window.pfpdfAPI?.onRequestClose) return
    const cleanup = window.pfpdfAPI.onRequestClose(() => {
      if (isDirty) {
        setIsCloseAction(true)
        setShowUnsavedModal(true)
      } else {
        window.pfpdfAPI?.forceCloseApp?.()
      }
    })
    return cleanup
  }, [isDirty])

  // ブラウザ標準の beforeunload ガード
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

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

  // Ctrl + マウスホイールによるプレビュー拡大縮小 (50%〜200%)
  useEffect(() => {
    const container = previewContainerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
        const step = 10
        const delta = e.deltaY < 0 ? step : -step
        setZoomLevel((prev) => Math.min(200, Math.max(50, prev + delta)))
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  // 文章が A4 を超えた場合の自動改ページ（DOM測定による動的ブロック分割）
  useEffect(() => {
    if (!fileData?.body) {
      setPaginatedPages([''])
      return
    }

    const container = measureContainerRef.current
    if (!container) return

    const metrics = getTemplatePageMetrics(selectedTemplate)
    // 測定コンテナの横幅を現在のテンプレートの本文幅に完全一致させる
    container.style.width = `${metrics.contentWidthPx}px`

    const isCompact = selectedTemplate === 'compact'
    // pfpdf では compact 以外のすべてのテンプレートで目次 (TOC) は独立ページ (break-after: page) に配置される
    let p1TocHeight = 0
    if (isCompact && toc && markdownHeadings.length > 0) {
      const rows = Math.ceil(Math.min(12, markdownHeadings.length) / 2)
      p1TocHeight = 28 + rows * 13
    }
    const p1CompactHeaderHeight = isCompact ? 54 : 0
    // A4 用紙本文の利用可能実効高さ (pfpdf の @page 余白を除いた正確な本文領域高さ)
    const maxP1 = Math.max(
      200,
      metrics.firstPageContentHeightPx - p1CompactHeaderHeight - p1TocHeight
    )
    const maxStd = metrics.contentHeightPx

    const currentBody = fileData?.body ?? editorText
    const preprocessedBody = preprocessMarkdownForPreview(currentBody)
    // 数式 ($$) および Mermaid を安全なプレースホルダーに置換して marked の記号誤解釈を防止
    const { cleanMarkdown, items } = extractMathAndMermaidForPreview(preprocessedBody)
    // WordライクなEnter改行に対応: breaks: true で単一改行を <br> としてレンダリング
    const rawHtml = marked.parse(cleanMarkdown, { async: false, gfm: true, breaks: true }) as string
    // プレースホルダーをキャッシュ済み SVG (またはローディング表示) に置換
    const finalHtml = injectRenderedSvg(rawHtml, items, previewSvgCacheRef.current)
    const pages = paginateHtmlContent(
      finalHtml,
      maxP1,
      maxStd,
      container,
      selectedTemplate === 'book'
    )
    setPaginatedPages(pages)
  }, [fileData?.body, editorText, title, author, date, toc, selectedTemplate, markdownHeadings.length, activeTab, svgRenderVersion])

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
  const executeCreateNew = () => {
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

  const handleCreateNew = () => {
    requestNavigation(executeCreateNew)
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
  const handleSaveFile = async (saveAs: boolean = false): Promise<boolean> => {
    if (!fileData || !window.pfpdfAPI) return false

    let targetPath = fileData.filePath
    if (!targetPath || saveAs) {
      const selected = await window.pfpdfAPI.selectMarkdownSavePath(fileData.fileName || 'document.md')
      if (!selected) return false
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
        return true
      } else {
        setSaveStatus('error')
        setSaveMessage(res.error || '保存に失敗しました')
        setTimeout(() => setSaveStatus('idle'), 4000)
        return false
      }
    } catch (err: any) {
      setSaveStatus('error')
      setSaveMessage(err.message || '保存に失敗しました')
      setTimeout(() => setSaveStatus('idle'), 4000)
      return false
    }
  }

  // 画面遷移・ファイル切り替え時の未保存変更確認ガード
  const requestNavigation = (action: () => void) => {
    if (isDirty) {
      setPendingNavigationAction(() => action)
      setIsCloseAction(false)
      setShowUnsavedModal(true)
    } else {
      action()
    }
  }

  // 未保存モーダル: 保存して進む/終了
  const handleSaveAndProceed = async () => {
    const success = await handleSaveFile(false)
    if (!success) {
      return
    }
    setShowUnsavedModal(false)
    if (isCloseAction) {
      window.pfpdfAPI?.forceCloseApp?.()
    } else if (pendingNavigationAction) {
      pendingNavigationAction()
      setPendingNavigationAction(null)
    }
  }

  // 未保存モーダル: 保存せずに進む/終了
  const handleDiscardAndProceed = () => {
    setIsDirty(false)
    setShowUnsavedModal(false)
    if (isCloseAction) {
      window.pfpdfAPI?.forceCloseApp?.()
    } else if (pendingNavigationAction) {
      pendingNavigationAction()
      setPendingNavigationAction(null)
    }
  }

  // 未保存モーダル: キャンセル (現在の編集を維持)
  const handleCancelUnsavedModal = () => {
    setShowUnsavedModal(false)
    setIsCloseAction(false)
    setPendingNavigationAction(null)
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

  // VSCode 風コメントアウト・解除トグル (Ctrl + /)
  const toggleComment = () => {
    const textarea = editorRef.current
    if (!textarea) return

    const val = textarea.value
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    if (start !== end) {
      // ----------------------------------------------------
      // パターン A: 単語または複数行の範囲選択がある場合
      // ----------------------------------------------------
      const selected = val.substring(start, end)
      const trimmed = selected.trim()

      // A-1. 選択範囲自体が <!-- ... --> で囲まれている場合（解除）
      if (trimmed.startsWith('<!--') && trimmed.endsWith('-->') && trimmed.length >= 7) {
        // 先頭の <!-- と 末尾の --> を除去（前後の空白・改行も綺麗に除去）
        const uncommented = selected.replace(/^(\s*)<!--(?:[ \t]|\r?\n)?([\s\S]*?)(?:[ \t]|\r?\n)?-->(\s*)$/, '$1$2$3')
        const newVal = val.substring(0, start) + uncommented + val.substring(end)
        handleEditorChange(newVal)
        setTimeout(() => {
          textarea.focus()
          textarea.setSelectionRange(start, start + uncommented.length)
        }, 0)
        return
      }

      // A-2. 選択範囲の直前直後が <!-- と --> で囲まれている場合（中身だけ選択して解除）
      const beforeText = val.substring(0, start)
      const afterText = val.substring(end)
      const beforeMatch = beforeText.match(/<!--(?:[ \t]|\r?\n)?$/)
      const afterMatch = afterText.match(/^(?:[ \t]|\r?\n)?-->/)
      if (beforeMatch && afterMatch) {
        const commentStart = start - beforeMatch[0].length
        const commentEnd = end + afterMatch[0].length
        const newVal = val.substring(0, commentStart) + selected + val.substring(commentEnd)
        handleEditorChange(newVal)
        setTimeout(() => {
          textarea.focus()
          textarea.setSelectionRange(commentStart, commentStart + selected.length)
        }, 0)
        return
      }

      // A-3. 複数行選択で、各行が個別に <!-- ... --> で囲まれている場合（一括解除）
      if (selected.includes('\n')) {
        const lines = selected.split('\n')
        const nonEmptyLines = lines.filter((l) => l.trim().length > 0)
        const allCommented =
          nonEmptyLines.length > 0 &&
          nonEmptyLines.every((l) => {
            const t = l.trim()
            return t.startsWith('<!--') && t.endsWith('-->')
          })

        if (allCommented) {
          const uncommentedLines = lines.map((l) => {
            const match = l.match(/^(\s*)<!--(?:[ \t])?(.*?)(?:[ \t])?-->(\s*)$/)
            return match ? `${match[1]}${match[2]}${match[3]}` : l
          })
          const replacement = uncommentedLines.join('\n')
          const newVal = val.substring(0, start) + replacement + val.substring(end)
          handleEditorChange(newVal)
          setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start, start + replacement.length)
          }, 0)
          return
        }
      }

      // A-4. コメントアウト実行
      let replacement = ''
      if (selected.includes('\n')) {
        // 複数行選択の場合: 改行ブロックで囲む
        replacement = `<!--\n${selected}\n-->`
      } else {
        // 単語や行内選択の場合: インラインで囲む
        replacement = `<!-- ${selected} -->`
      }

      const newVal = val.substring(0, start) + replacement + val.substring(end)
      handleEditorChange(newVal)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start, start + replacement.length)
      }, 0)
      return
    }

    // ----------------------------------------------------
    // パターン B: カーソルのみ（選択範囲なし start === end）の場合
    // ----------------------------------------------------
    const lineStart = val.lastIndexOf('\n', start - 1) + 1
    const nextNewline = val.indexOf('\n', start)
    const lineEnd = nextNewline === -1 ? val.length : nextNewline
    const currentLine = val.substring(lineStart, lineEnd)
    const trimmedLine = currentLine.trim()

    // B-1. 現在行がすでに <!-- ... --> で囲まれている場合（解除）
    if (trimmedLine.startsWith('<!--') && trimmedLine.endsWith('-->') && trimmedLine.length >= 7) {
      const match = currentLine.match(/^(\s*)<!--(?:[ \t])?(.*?)(?:[ \t])?-->(\s*)$/)
      let uncommentedLine = currentLine
      let prefixLenRemoved = 5 // '<!-- ' の標準幅
      if (match) {
        const indent = match[1]
        const content = match[2]
        const trailing = match[3]
        uncommentedLine = `${indent}${content}${trailing}`
        prefixLenRemoved = currentLine.indexOf(content) - indent.length
      } else {
        uncommentedLine = currentLine.replace('<!--', '').replace('-->', '')
      }

      const newVal = val.substring(0, lineStart) + uncommentedLine + val.substring(lineEnd)
      handleEditorChange(newVal)

      // カーソル位置を行内の適切な相対位置に戻す
      const newCursor = Math.max(lineStart, Math.min(lineStart + uncommentedLine.length, start - prefixLenRemoved))
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(newCursor, newCursor)
      }, 0)
      return
    }

    // B-2. 空行の場合
    if (trimmedLine === '') {
      const indent = currentLine
      const commentedLine = `${indent}<!--  -->`
      const newVal = val.substring(0, lineStart) + commentedLine + val.substring(lineEnd)
      handleEditorChange(newVal)
      const newCursor = lineStart + indent.length + 5 // <!-- の後のスペース位置
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(newCursor, newCursor)
      }, 0)
      return
    }

    // B-3. 現在行をコメントアウト (インデントを保持して <!-- ... --> で囲む)
    const indentMatch = currentLine.match(/^(\s*)(.*)$/)
    const indent = indentMatch ? indentMatch[1] : ''
    const content = indentMatch ? indentMatch[2] : currentLine
    const commentedLine = `${indent}<!-- ${content} -->`

    const newVal = val.substring(0, lineStart) + commentedLine + val.substring(lineEnd)
    handleEditorChange(newVal)

    // カーソル位置をオフセット
    const offsetInLine = start - lineStart
    const newCursor = offsetInLine <= indent.length ? start : start + 5
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursor, newCursor)
    }, 0)
  }

  // エディタキーボード操作 (Tabインデント, Ctrl+S, Ctrl+/, スラッシュメニューナビゲーション)
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl + / (または Cmd + /): VSCode 風コメントアウト・解除
    if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.code === 'Slash')) {
      e.preventDefault()
      e.stopPropagation()
      setSlashMenuOpen(false)
      toggleComment()
      return
    }

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

  // ファイルダイアログ選択 (実行本体)
  const executeSelectFile = async () => {
    if (!window.pfpdfAPI) return
    try {
      const data = await window.pfpdfAPI.selectMarkdownFile()
      if (data) handleFileLoaded(data)
    } catch (err: any) {
      console.error(err)
    }
  }

  // ファイルダイアログ選択 (未保存変更ガード付き)
  const handleSelectFile = () => {
    requestNavigation(executeSelectFile)
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

  const handleDrop = (e: React.DragEvent) => {
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

    requestNavigation(async () => {
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
    })
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

  // 選択中テンプレートのページ寸法・余白・フォント換算値
  const pageMetrics = getTemplatePageMetrics(selectedTemplate)

  // pfpdf 公式仕様: compact 以外のすべてのテンプレートでは目次 (TOC) は独立した専用ページ (break-after: page) になる
  const hasStandaloneTocPage = toc && markdownHeadings.length > 0 && selectedTemplate !== 'compact'
  const coverSheetCount = currentFormat.coverType === 'standalone' ? 1 : 0
  const tocSheetCount = hasStandaloneTocPage ? 1 : 0

  // 総ページ数 (独立表紙 + 独立目次ページ + 本文ページ)
  const totalPages = coverSheetCount + tocSheetCount + Math.max(1, paginatedPages.length)

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
                      requestNavigation(() => setFileData(null))
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition cursor-pointer"
                    title="ファイルを閉じる"
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
                      onClick={() => insertFormatting('~~', '~~', '取り消し線')}
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title="取り消し線 (~~テキスト~~)"
                    >
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('<u>', '</u>', '下線テキスト')}
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title="普通の下線 (<u>テキスト</u>)"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('<mark>', '</mark>', 'お知らせ')}
                      className="p-1 rounded hover:bg-orange-100 text-orange-600 transition cursor-pointer"
                      title="蛍光マーカー下線 (<mark>お知らせ</mark> または ==お知らせ==)"
                    >
                      <Highlighter className="w-3.5 h-3.5" />
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
                        insertFormatting('\n\n___\n\n', '', '')
                      }
                      className="px-1.5 py-0.5 rounded hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition cursor-pointer"
                      title="改ページ挿入 (pfpdf公式 ___)"
                    >
                      改ページ
                    </button>
                    <button
                      type="button"
                      onClick={toggleComment}
                      className="px-1.5 py-0.5 rounded hover:bg-slate-200 text-slate-600 text-[10px] font-mono transition cursor-pointer"
                      title="コメントアウト / 解除 (Ctrl + /)"
                    >
                      &lt;!-- --&gt;
                    </button>
                    <button
                      type="button"
                      onClick={() => setSyntaxHighlightEnabled(!syntaxHighlightEnabled)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer flex items-center gap-1 border ${
                        syntaxHighlightEnabled
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-200'
                      }`}
                      title={syntaxHighlightEnabled ? 'シンタックスハイライト: ON (クリックで標準テキスト表示)' : 'シンタックスハイライト: OFF (クリックでカラー表示)'}
                    >
                      <Palette className="w-3 h-3" />
                      <span>{syntaxHighlightEnabled ? 'カラーON' : 'カラーOFF'}</span>
                    </button>
                  </div>
                </div>

                {/* textarea 入力エリア ＆ VSCode風シンタックスハイライト */}
                <div className="relative flex-1 min-h-0 bg-white overflow-hidden">
                  {/* 背面: VSCode 風シンタックスハイライト描画レイヤー (textareaと1pxのズレもなく完全一致) */}
                  {syntaxHighlightEnabled && (
                    <pre
                      ref={highlightPreRef}
                      aria-hidden="true"
                      className="pfpdf-editor-backdrop absolute inset-0 w-full h-full m-0 pointer-events-none select-none bg-white text-slate-800"
                      style={{
                        ...EDITOR_SHARED_STYLE,
                        overflowY: 'scroll',
                        overflowX: 'hidden'
                      }}
                      dangerouslySetInnerHTML={{
                        __html: highlightMarkdownForEditor(editorText)
                      }}
                    />
                  )}

                  {/* 前面: 実際の入力用 textarea (完全座標一致) */}
                  <textarea
                    ref={editorRef}
                    value={editorText}
                    onChange={(e) => handleEditorChange(e.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    onScroll={handleEditorScroll}
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
                    className="pfpdf-editor-textarea absolute inset-0 w-full h-full resize-none focus:outline-none placeholder:text-slate-300 bg-transparent"
                    style={{
                      ...EDITOR_SHARED_STYLE,
                      overflowY: 'scroll',
                      overflowX: 'hidden',
                      color: syntaxHighlightEnabled ? 'transparent' : '#0f172a',
                      caretColor: '#0f172a',
                      cursor: 'text',
                      userSelect: 'text',
                      WebkitUserSelect: 'text'
                    }}
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
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.2 rounded border border-slate-200/60">
                      [Ctrl+/] コメント
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
              <>
                {/* ページ数表示 */}
                {activeTab === 'formatted' && fileData && (
                  <span className="text-slate-600 font-sans font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80 text-[10px]">
                    全 {totalPages} ページ
                  </span>
                )}

                {/* ズームコントローラー (Ctrl + ホイールでも操作可能) */}
                {activeTab === 'formatted' && (
                  <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200/80 p-0.5 ml-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((prev) => Math.max(50, prev - 10))}
                      disabled={zoomLevel <= 50}
                      className="p-1 hover:bg-white text-slate-600 hover:text-slate-900 rounded disabled:opacity-30 transition cursor-pointer"
                      title="ズームアウト (Ctrl + ホイール下)"
                    >
                      <ZoomOut className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(100)}
                      className="px-1.5 py-0.5 text-[10px] font-mono font-medium hover:bg-white text-slate-700 rounded transition cursor-pointer"
                      title="100%にリセット (クリックで等倍)"
                    >
                      {zoomLevel}%
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((prev) => Math.min(200, prev + 10))}
                      disabled={zoomLevel >= 200}
                      className="p-1 hover:bg-white text-slate-600 hover:text-slate-900 rounded disabled:opacity-30 transition cursor-pointer"
                      title="ズームイン (Ctrl + ホイール上)"
                    >
                      <ZoomIn className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <span className="hidden sm:inline">A4 (210 × 297 mm)</span>
              </>
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
              /* A4用紙シート リアルタイム組版シミュレーション (PDF感覚の幾何学的ズーム・A4自動改ページ対応) */
              (() => {
                const totalSheets = coverSheetCount + tocSheetCount + Math.max(1, paginatedPages.length)
                const SHEET_GAP = 32
                const baseTotalHeight = totalSheets * A4_SHEET_HEIGHT + Math.max(0, totalSheets - 1) * SHEET_GAP + 48
                const scale = zoomLevel / 100
                const scaledHeight = Math.round(baseTotalHeight * scale)
                const scaledWidth = Math.round(A4_SHEET_WIDTH * scale)

                // 各見出しが本文の何ページ目にあるかを計算 (pfpdf 目次の target-counter(page) 再現)
                const bodyStartPageNum = coverSheetCount + tocSheetCount + 1
                let searchFromIdx = 0
                const headingPageNumbers = markdownHeadings.map((hd) => {
                  const plain = hd.text.replace(/<[^>]+>/g, '').trim()
                  for (let pIdx = searchFromIdx; pIdx < paginatedPages.length; pIdx++) {
                    const textOnly = paginatedPages[pIdx].replace(/<[^>]+>/g, '')
                    if (plain && textOnly.includes(plain)) {
                      searchFromIdx = pIdx
                      return bodyStartPageNum + pIdx
                    }
                  }
                  return bodyStartPageNum
                })

                // テンプレートに応じた下部ノンブル表記 (pfpdf 公式 vivliostyle.css 準拠)
                const formatPageNumber = (pageNum: number) => {
                  if (selectedTemplate === 'book' || selectedTemplate === 'notebook') {
                    return `—  ${pageNum}  —`
                  }
                  if (selectedTemplate === 'technical') {
                    return String(pageNum).padStart(3, '0')
                  }
                  if (selectedTemplate === 'pfn' || selectedTemplate === 'default' || selectedTemplate === 'academic' || selectedTemplate === 'compact') {
                    return `${pageNum}`
                  }
                  return `- ${pageNum} -`
                }

                // テンプレートに応じた上部ランニングヘッダー描画 (pfpdf 公式 vivliostyle.css の @top-* マージンボックス完全準拠)
                const renderPageTopHeader = (runningHeaderTitle?: string) => {
                  // default テンプレートは上部ヘッダーなし
                  if (selectedTemplate === 'default') {
                    return null
                  }
                  // pfn テンプレートは上部全面に濃紺帯 (#263c7f, 高さ 11mm ≈ 27px) + 白文字中央タイトル
                  if (selectedTemplate === 'pfn') {
                    return (
                      <div
                        style={{ height: `${Math.round(11 * MM_TO_PX)}px` }}
                        className="absolute top-0 left-0 right-0 bg-[#263c7f] text-white px-6 flex items-center justify-center text-[8px] font-semibold tracking-wide pointer-events-none z-10"
                      >
                        <span className="truncate block">{title || 'ドキュメント'}</span>
                      </div>
                    )
                  }
                  // book テンプレートは中央揃えタイトル + 下細線 (#b8aea0)
                  if (selectedTemplate === 'book') {
                    return (
                      <div
                        style={{
                          height: `${pageMetrics.paddingTopPx}px`,
                          paddingLeft: `${pageMetrics.paddingXPx}px`,
                          paddingRight: `${pageMetrics.paddingXPx}px`,
                          paddingBottom: `${Math.round(5 * MM_TO_PX)}px`
                        }}
                        className="absolute top-0 left-0 right-0 flex items-end pointer-events-none z-10"
                      >
                        <div className="w-full pb-1 border-b border-[#b8aea0] text-center text-[7.5px] text-[#71685d] tracking-wider font-serif">
                          <span className="truncate block">{title || 'ドキュメント'}</span>
                        </div>
                      </div>
                    )
                  }
                  // notebook テンプレートは線なし、左にティール太字タイトル、右にコーラル記号
                  if (selectedTemplate === 'notebook') {
                    return (
                      <div
                        style={{
                          height: `${pageMetrics.paddingTopPx}px`,
                          paddingLeft: `${pageMetrics.paddingXPx}px`,
                          paddingRight: `${pageMetrics.paddingXPx}px`,
                          paddingBottom: `${Math.round(4 * MM_TO_PX)}px`
                        }}
                        className="absolute top-0 left-0 right-0 flex items-end pointer-events-none z-10"
                      >
                        <div className="w-full pb-1 flex items-center justify-between text-[8px]">
                          <span className="truncate max-w-[260px] font-bold text-[#287d78]">
                            {title || 'ドキュメント'}
                          </span>
                          <span className="text-[7px] tracking-[0.2em] text-[#e66b58]">● ◆ ●</span>
                        </div>
                      </div>
                    )
                  }
                  // academic / technical / compact (2頁目以降) / 自作テンプレート
                  return (
                    <div
                      style={{
                        height: `${pageMetrics.paddingTopPx}px`,
                        paddingLeft: `${pageMetrics.paddingXPx}px`,
                        paddingRight: `${pageMetrics.paddingXPx}px`,
                        paddingBottom: `${Math.round(4.5 * MM_TO_PX)}px`
                      }}
                      className="absolute top-0 left-0 right-0 flex items-end pointer-events-none z-10"
                    >
                      <div
                        className={`w-full pb-1 flex items-center justify-between text-[7.5px] ${
                          selectedTemplate === 'academic'
                            ? 'font-serif border-b border-[#aeb7bf] text-[#59636d]'
                            : selectedTemplate === 'technical'
                            ? 'border-b border-[#aebbc4] text-[#52606d]'
                            : 'font-mono border-b border-[#aeb4b9] text-[#596168]'
                        }`}
                      >
                        <span className="truncate max-w-[220px]">{title || 'ドキュメント'}</span>
                        <span
                          className={`truncate max-w-[160px] ${
                            selectedTemplate === 'technical' ? 'font-mono font-bold text-[#086f83]' : 'font-medium'
                          }`}
                        >
                          {runningHeaderTitle || ''}
                        </span>
                      </div>
                    </div>
                  )
                }

                // テンプレートに応じた下部ノンブル描画 (pfpdf 公式 vivliostyle.css の @bottom-* マージンボックス完全準拠)
                const renderPageBottomFooter = (pageNum: number) => (
                  <div
                    style={{
                      height: `${pageMetrics.paddingBottomPx}px`,
                      paddingLeft: `${pageMetrics.paddingXPx}px`,
                      paddingRight: `${pageMetrics.paddingXPx}px`,
                      paddingTop: `${Math.round(2.5 * MM_TO_PX)}px`
                    }}
                    className={`absolute bottom-0 left-0 right-0 flex items-start text-[8px] text-slate-500 font-mono pointer-events-none z-10 ${
                      currentFormat.pageNumberPos.includes('右') ? 'justify-end' : 'justify-center'
                    }`}
                  >
                    <span>{formatPageNumber(pageNum)}</span>
                  </div>
                )

                return (
                  <div
                    className="flex justify-center items-start mx-auto relative select-none w-full"
                    style={{
                      minHeight: `${scaledHeight}px`,
                      minWidth: `${Math.max(scaledWidth, A4_SHEET_WIDTH)}px`,
                      paddingTop: '20px',
                      paddingBottom: '28px'
                    }}
                  >
                    {/* 幾何学的スケーリングレイヤー (PDF拡大縮小の体感を完全再現) */}
                    <div
                      style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        width: `${A4_SHEET_WIDTH}px`
                      }}
                      className="space-y-8 flex flex-col items-center shrink-0 transition-transform duration-75"
                    >
                      {/* ページ 1: 独立表紙 (coverType === 'standalone' の場合) */}
                      {currentFormat.coverType === 'standalone' && (
                        <div
                          style={{
                            backgroundColor: currentFormat.paperBg,
                            width: `${A4_SHEET_WIDTH}px`,
                            height: `${A4_SHEET_HEIGHT}px`
                          }}
                          className="shadow-[0_2px_14px_rgba(0,0,0,0.08)] border border-slate-300/70 rounded-[1px] relative overflow-hidden transition-all duration-200 shrink-0"
                        >
                          {/* ページ右上の控えめなノンブル表示 */}
                          <div className="absolute top-2 right-2.5 text-[8.5px] font-mono opacity-40 z-20 pointer-events-none">
                            1 / {totalPages} 表紙
                          </div>

                          {/* 公式テンプレート実体準拠の表紙レンダラー */}
                          {renderCoverPageContent()}
                        </div>
                      )}

                      {/* ページ 2: 独立目次ページ (pfpdf の `.pfpdf-toc-container { break-after: page }` を忠実再現) */}
                      {hasStandaloneTocPage && (
                        <React.Fragment>
                          {coverSheetCount > 0 && (
                            <div
                              style={{ width: `${A4_SHEET_WIDTH}px` }}
                              className="flex items-center justify-center gap-3 py-1 select-none opacity-60"
                            >
                              <div className="flex-1 border-t border-dashed border-slate-300" />
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-200/90 px-2.5 py-0.5 rounded-full shadow-2xs">
                                改ページ (Page {coverSheetCount + 1} : 目次)
                              </span>
                              <div className="flex-1 border-t border-dashed border-slate-300" />
                            </div>
                          )}

                          <div
                            style={{
                              backgroundColor: currentFormat.paperBg,
                              width: `${A4_SHEET_WIDTH}px`,
                              height: `${A4_SHEET_HEIGHT}px`,
                              paddingTop: `${pageMetrics.paddingTopPx}px`,
                              paddingBottom: `${pageMetrics.paddingBottomPx}px`,
                              paddingLeft: `${pageMetrics.paddingXPx}px`,
                              paddingRight: `${pageMetrics.paddingXPx}px`
                            }}
                            className={`shadow-[0_2px_14px_rgba(0,0,0,0.08)] border border-slate-300/70 rounded-[1px] flex flex-col justify-between relative overflow-hidden transition-all duration-200 shrink-0 ${
                              currentFormat.fontFamily === 'serif' ? 'font-serif text-[#20252b]' : 'font-sans text-slate-700'
                            }`}
                          >
                            {/* 右上のページインジケータ */}
                            <div
                              className={`absolute ${
                                selectedTemplate === 'pfn' ? 'top-7' : 'top-1.5'
                              } right-2.5 text-[8.5px] font-mono text-slate-400/80 z-20 pointer-events-none`}
                            >
                              {coverSheetCount + 1} / {totalPages} 目次
                            </div>

                            {renderPageTopHeader('目次')}

                            <div className="flex-1 overflow-hidden flex flex-col">
                              <div
                                className={
                                  selectedTemplate === 'pfn'
                                    ? 'border border-[#ccc] rounded-md p-4 mt-1'
                                    : selectedTemplate === 'notebook'
                                    ? 'bg-[#e5f2ef] rounded-xl p-4 mt-1'
                                    : selectedTemplate === 'book'
                                    ? 'px-2 pt-3'
                                    : 'pt-0.5'
                                }
                              >
                                <h2
                                  style={{
                                    fontSize: `${Math.round(16 * PT_TO_PX)}px`,
                                    color:
                                      selectedTemplate === 'pfn'
                                        ? '#234b78'
                                        : selectedTemplate === 'notebook'
                                        ? '#185b58'
                                        : selectedTemplate === 'technical'
                                        ? '#064e5d'
                                        : currentFormat.color,
                                    borderBottom:
                                      selectedTemplate === 'default'
                                        ? `1.3px solid ${currentFormat.color}`
                                        : 'none'
                                  }}
                                  className={`font-bold mb-3 pb-1 ${
                                    selectedTemplate === 'book' ? 'text-center tracking-widest' : ''
                                  }`}
                                >
                                  目次
                                </h2>

                                <div
                                  style={{ fontSize: `${pageMetrics.bodyFontSizePx}px` }}
                                  className="space-y-1.5"
                                >
                                  {markdownHeadings.slice(0, 22).map((hd, hIdx) => (
                                    <div
                                      key={hIdx}
                                      className={`flex items-baseline justify-between ${
                                        hd.level === 1
                                          ? 'font-bold text-slate-900 mt-1.5'
                                          : hd.level === 2
                                          ? 'pl-3.5 text-slate-700'
                                          : 'pl-7 text-slate-500 text-[0.94em]'
                                      }`}
                                    >
                                      <span className="truncate pr-2">{hd.text}</span>
                                      <div className="flex-1 border-b border-dotted border-slate-300/90 mx-1.5 mb-0.5" />
                                      <span className="font-mono text-[0.95em] text-slate-500 shrink-0">
                                        {headingPageNumbers[hIdx]}
                                      </span>
                                    </div>
                                  ))}
                                  {markdownHeadings.length > 22 && (
                                    <div className="text-[0.9em] text-slate-400 pl-2 italic pt-1">
                                      ...他 {markdownHeadings.length - 22} 項目
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {renderPageBottomFooter(coverSheetCount + 1)}
                          </div>
                        </React.Fragment>
                      )}

                      {/* 本文各ページシート (A4超過自動分割 + 改ページタグ対応) */}
                      {paginatedPages.map((pageHtml, segIdx) => {
                        const actualPageNum = coverSheetCount + tocSheetCount + 1 + segIdx
                        const isFirstContentPage = segIdx === 0
                        const isCompactFirstPage = selectedTemplate === 'compact' && isFirstContentPage
                        const runningHeaderTitle = getPageRunningHeaderFromHtml(pageHtml, currentFormat.runningHeader)

                        return (
                          <React.Fragment key={segIdx}>
                            {/* 改ページ境界ガイド表示 (表紙・目次の直後、または本文2枚目以降) */}
                            {(segIdx > 0 || coverSheetCount > 0 || tocSheetCount > 0) && (
                              <div
                                style={{ width: `${A4_SHEET_WIDTH}px` }}
                                className="flex items-center justify-center gap-3 py-1 select-none opacity-60"
                              >
                                <div className="flex-1 border-t border-dashed border-slate-300" />
                                <span className="text-[10px] font-mono text-slate-500 bg-slate-200/90 px-2.5 py-0.5 rounded-full shadow-2xs">
                                  改ページ (Page {actualPageNum} : 本文)
                                </span>
                                <div className="flex-1 border-t border-dashed border-slate-300" />
                              </div>
                            )}

                            {/* 固定寸法 A4 本文シート (pfpdf の @page 余白・本文領域寸法と完全一致) */}
                            <div
                              style={{
                                backgroundColor: currentFormat.paperBg,
                                width: `${A4_SHEET_WIDTH}px`,
                                height: `${A4_SHEET_HEIGHT}px`,
                                paddingTop: `${isCompactFirstPage ? pageMetrics.firstPagePaddingTopPx : pageMetrics.paddingTopPx}px`,
                                paddingBottom: `${pageMetrics.paddingBottomPx}px`,
                                paddingLeft: `${pageMetrics.paddingXPx}px`,
                                paddingRight: `${pageMetrics.paddingXPx}px`
                              }}
                              className={`shadow-[0_2px_14px_rgba(0,0,0,0.08)] border border-slate-300/70 rounded-[1px] flex flex-col justify-between relative overflow-hidden transition-all duration-200 shrink-0 ${
                                currentFormat.fontFamily === 'serif' ? 'font-serif text-[#20252b]' : 'font-sans text-slate-700'
                              }`}
                            >
                              {/* ページ右上の控えめなノンブル表示 */}
                              <div
                                className={`absolute ${
                                  selectedTemplate === 'pfn' ? 'top-7' : 'top-1.5'
                                } right-2.5 text-[8.5px] font-mono text-slate-400/80 z-20 pointer-events-none`}
                              >
                                {actualPageNum} / {totalPages} 本文
                              </div>

                              {/* 上部ランニングヘッダー (@top-* マージンボックス内、compact 1枚目以外) */}
                              {!isCompactFirstPage && renderPageTopHeader(runningHeaderTitle)}

                              <div className="flex-1 overflow-hidden flex flex-col">
                                {/* Compact テンプレート専用の公式上部ヘッダーバー + 2段組インライン目次 (1枚目のみ) */}
                                {isCompactFirstPage && (
                                  <>
                                    <div className="mb-2.5 pb-1.5 border-b-[1.5px] border-[#343a40] shrink-0">
                                      <div className="flex items-start justify-between gap-3">
                                        <h1
                                          style={{ fontSize: `${Math.round(20 * PT_TO_PX)}px` }}
                                          className="font-bold text-[#202428] leading-tight"
                                        >
                                          {title || '(タイトル未設定)'}
                                        </h1>
                                        <div className="text-right text-[8px] text-[#596168] shrink-0 font-mono space-y-0.5">
                                          <div>{author || '著者未設定'}</div>
                                          <div>{date || '日付未設定'}</div>
                                        </div>
                                      </div>
                                    </div>

                                    {toc && markdownHeadings.length > 0 && (
                                      <div className="mb-2.5 pb-2 border-b border-[#aeb4b9] shrink-0">
                                        <div className="text-[9.5px] font-bold text-[#343a40] mb-1">目次</div>
                                        <div className="grid grid-cols-2 gap-x-3.5 gap-y-0.5 text-[8px]">
                                          {markdownHeadings.slice(0, 12).map((hd, hIdx) => (
                                            <div key={hIdx} className="flex items-baseline justify-between">
                                              <span
                                                className={`truncate pr-1 ${
                                                  hd.level === 1 ? 'font-bold' : hd.level === 2 ? 'pl-2' : 'pl-3 text-slate-500'
                                                }`}
                                              >
                                                {hd.text}
                                              </span>
                                              <div className="flex-1 border-b border-dotted border-slate-300 mx-1 mb-0.5" />
                                              <span className="font-mono text-[7.5px] text-[#596168] shrink-0">
                                                {headingPageNumbers[hIdx]}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* 本文段落レンダリング (pfpdf の実寸比率と完全同期) */}
                                <div
                                  className="pfpdf-body-preview flex-1 overflow-hidden"
                                  dangerouslySetInnerHTML={{
                                    __html: pageHtml
                                  }}
                                />
                              </div>

                              {/* 下部ノンブル (@bottom-* マージンボックス内) */}
                              {renderPageBottomFooter(actualPageNum)}
                            </div>
                          </React.Fragment>
                        )
                      })}
                    </div>
                  </div>
                )
              })()
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

          {/* 共通組版 CSS スタイル定義 (pfpdf 公式テンプレートのフォントサイズ・行間・マージン・引用幅を実寸比 1:1 で完全再現) */}
          <style>{`
            .pfpdf-body-preview {
              font-size: ${pageMetrics.bodyFontSizePx}px;
              line-height: ${pageMetrics.bodyLineHeight};
              font-family: ${
                currentFormat.fontFamily === 'serif'
                  ? '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", serif'
                  : '"Noto Sans JP", "Yu Gothic", "Hiragino Sans", "Meiryo", sans-serif'
              };
              color: ${currentFormat.fontFamily === 'serif' ? '#292521' : '#222222'};
              font-feature-settings: ${
                selectedTemplate === 'academic'
                  ? '"palt" 1, "pkna" 1'
                  : selectedTemplate === 'book'
                  ? '"palt" 1'
                  : 'normal'
              };
              letter-spacing: ${selectedTemplate === 'pfn' ? '-0.005em' : 'normal'};
              display: flow-root;
            }
            .pfpdf-body-preview > *:first-child {
              margin-top: 0 !important;
            }
            .pfpdf-body-preview > *:last-child {
              margin-bottom: 0 !important;
            }
            .pfpdf-body-preview h1 {
              font-size: ${
                selectedTemplate === 'book'
                  ? '2em'
                  : selectedTemplate === 'notebook'
                  ? '1.905em'
                  : selectedTemplate === 'technical'
                  ? '1.895em'
                  : selectedTemplate === 'academic'
                  ? '1.737em'
                  : selectedTemplate === 'compact'
                  ? '1.579em'
                  : selectedTemplate === 'pfn'
                  ? '1.5em'
                  : '1.714em'
              };
              font-weight: 700;
              margin-top: ${
                selectedTemplate === 'academic'
                  ? '1.8em'
                  : selectedTemplate === 'technical' || selectedTemplate === 'notebook'
                  ? '1.5em'
                  : selectedTemplate === 'pfn'
                  ? '0.9em'
                  : selectedTemplate === 'book'
                  ? '0'
                  : '1.2em'
              };
              margin-bottom: ${
                selectedTemplate === 'book'
                  ? '1.4em'
                  : selectedTemplate === 'academic'
                  ? '0.8em'
                  : selectedTemplate === 'notebook'
                  ? '0.7em'
                  : selectedTemplate === 'technical'
                  ? '0.65em'
                  : selectedTemplate === 'compact'
                  ? '0.45em'
                  : '0.6em'
              };
              line-height: ${
                selectedTemplate === 'compact'
                  ? '1.28'
                  : selectedTemplate === 'technical'
                  ? '1.3'
                  : selectedTemplate === 'book'
                  ? '1.5'
                  : '1.4'
              };
              color: ${selectedTemplate === 'pfn' ? '#263c7f' : currentFormat.h1Style.color};
              border-bottom: ${
                selectedTemplate === 'pfn'
                  ? '2px solid #c9d0e6'
                  : selectedTemplate === 'notebook'
                  ? 'none'
                  : currentFormat.h1Style.borderBottom || 'none'
              };
              padding-bottom: ${
                currentFormat.h1Style.borderBottom || selectedTemplate === 'notebook' ? '0.22em' : '0'
              };
              text-align: ${selectedTemplate === 'book' ? 'center' : 'left'};
              position: relative;
            }
            ${
              selectedTemplate === 'pfn'
                ? `.pfpdf-body-preview h1::after {
                    content: "";
                    display: block;
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 15%;
                    border-bottom: 2px solid #5267aa;
                  }`
                : ''
            }
            ${
              selectedTemplate === 'notebook'
                ? `.pfpdf-body-preview h1::after {
                    content: "";
                    display: block;
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 1.5px;
                    background: linear-gradient(to right, #e66b58 0 18%, #d8a62d 18% 30%, #c9d5d2 30% 100%);
                  }`
                : ''
            }
            ${
              selectedTemplate === 'book'
                ? `.pfpdf-body-preview h1::before {
                    content: "◆";
                    display: block;
                    font-size: 0.35em;
                    margin-bottom: 0.8em;
                    color: #5b312e;
                  }`
                : ''
            }
            .pfpdf-body-preview h2 {
              font-size: ${
                selectedTemplate === 'technical'
                  ? '1.474em'
                  : selectedTemplate === 'book' || selectedTemplate === 'notebook'
                  ? '1.429em'
                  : selectedTemplate === 'pfn'
                  ? '1.4em'
                  : selectedTemplate === 'academic'
                  ? '1.368em'
                  : selectedTemplate === 'compact'
                  ? '1.263em'
                  : '1.333em'
              };
              font-weight: 700;
              margin-top: ${
                selectedTemplate === 'book'
                  ? '2em'
                  : selectedTemplate === 'academic'
                  ? '1.7em'
                  : selectedTemplate === 'notebook'
                  ? '1.4em'
                  : selectedTemplate === 'technical'
                  ? '1.35em'
                  : selectedTemplate === 'compact'
                  ? '1.05em'
                  : selectedTemplate === 'pfn'
                  ? '0.9em'
                  : '1.15em'
              };
              margin-bottom: ${
                selectedTemplate === 'book'
                  ? '0.8em'
                  : selectedTemplate === 'academic'
                  ? '0.65em'
                  : selectedTemplate === 'notebook'
                  ? '0.6em'
                  : selectedTemplate === 'technical'
                  ? '0.55em'
                  : selectedTemplate === 'compact'
                  ? '0.38em'
                  : '0.5em'
              };
              line-height: ${selectedTemplate === 'compact' ? '1.28' : selectedTemplate === 'technical' ? '1.3' : '1.4'};
              color: ${selectedTemplate === 'pfn' ? '#263c7f' : currentFormat.h2Style.color};
              border-left: ${
                selectedTemplate === 'pfn' || selectedTemplate === 'notebook' || selectedTemplate === 'technical'
                  ? 'none'
                  : currentFormat.h2Style.borderLeft || 'none'
              };
              border-bottom: ${
                selectedTemplate === 'pfn'
                  ? '1px solid #263c7f'
                  : selectedTemplate === 'technical'
                  ? '1px solid #aebbc4'
                  : currentFormat.h2Style.borderBottom || 'none'
              };
              padding-left: ${
                selectedTemplate === 'notebook'
                  ? '0.7em'
                  : selectedTemplate === 'pfn' || selectedTemplate === 'technical'
                  ? '0'
                  : currentFormat.h2Style.borderLeft
                  ? '0.5em'
                  : '0'
              };
              padding-bottom: ${
                selectedTemplate === 'pfn' || selectedTemplate === 'technical' || currentFormat.h2Style.borderBottom
                  ? '0.15em'
                  : '0'
              };
              position: relative;
            }
            ${
              selectedTemplate === 'notebook'
                ? `.pfpdf-body-preview h2::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 0.48em;
                    width: 0.42em;
                    height: 0.42em;
                    border-radius: 50%;
                    background: #e66b58;
                  }`
                : ''
            }
            ${
              selectedTemplate === 'book'
                ? `.pfpdf-body-preview h2::after {
                    content: "  —";
                    color: #5b312e;
                    font-weight: 400;
                  }`
                : ''
            }
            .pfpdf-body-preview h3 {
              font-size: ${
                selectedTemplate === 'technical'
                  ? '1.211em'
                  : selectedTemplate === 'pfn'
                  ? '1.2em'
                  : selectedTemplate === 'book' || selectedTemplate === 'notebook'
                  ? '1.19em'
                  : selectedTemplate === 'academic'
                  ? '1.158em'
                  : selectedTemplate === 'compact'
                  ? '1.105em'
                  : '1.143em'
              };
              font-weight: 700;
              margin-top: ${
                selectedTemplate === 'book'
                  ? '1.7em'
                  : selectedTemplate === 'academic'
                  ? '1.5em'
                  : selectedTemplate === 'notebook'
                  ? '1.25em'
                  : selectedTemplate === 'technical'
                  ? '1.2em'
                  : selectedTemplate === 'compact'
                  ? '0.95em'
                  : '1.05em'
              };
              margin-bottom: ${
                selectedTemplate === 'book'
                  ? '0.7em'
                  : selectedTemplate === 'academic'
                  ? '0.55em'
                  : selectedTemplate === 'notebook'
                  ? '0.5em'
                  : selectedTemplate === 'technical'
                  ? '0.45em'
                  : selectedTemplate === 'compact'
                  ? '0.32em'
                  : '0.45em'
              };
              line-height: 1.4;
              color: ${
                selectedTemplate === 'pfn'
                  ? '#3f5598'
                  : selectedTemplate === 'notebook'
                  ? '#e66b58'
                  : selectedTemplate === 'technical'
                  ? '#064e5d'
                  : currentFormat.fontFamily === 'serif'
                  ? '#20252b'
                  : '#1e293b'
              };
              border-left: ${
                selectedTemplate === 'pfn'
                  ? '3px solid #3f5598'
                  : selectedTemplate === 'book'
                  ? '1.8px solid #5b312e'
                  : selectedTemplate === 'compact'
                  ? '1.8px solid #343a40'
                  : 'none'
              };
              padding-left: ${
                selectedTemplate === 'pfn' || selectedTemplate === 'book' || selectedTemplate === 'compact'
                  ? '0.5em'
                  : '0'
              };
            }
            ${
              selectedTemplate === 'academic'
                ? `.pfpdf-body-preview h3::before {
                    content: "■ ";
                    color: #243f5b;
                    font-size: 0.65em;
                    vertical-align: 0.15em;
                  }`
                : ''
            }
            .pfpdf-body-preview p {
              margin: ${Math.min(0.35, pageMetrics.pMarginEm)}em 0;
              line-height: inherit;
              font-size: 1em;
              color: inherit;
              text-align: justify;
              text-justify: inter-character;
              overflow-wrap: anywhere;
              word-break: normal;
            }
            .pfpdf-body-preview ul {
              margin: ${selectedTemplate === 'compact' ? '0.38em 0' : '0.6em 0'};
              padding-left: ${selectedTemplate === 'compact' ? '1.55em' : selectedTemplate === 'technical' ? '1.75em' : '1.8em'};
              list-style-type: disc;
              font-size: 1em;
              line-height: inherit;
              color: inherit;
            }
            .pfpdf-body-preview ol {
              margin: ${selectedTemplate === 'compact' ? '0.38em 0' : '0.6em 0'};
              padding-left: ${selectedTemplate === 'compact' ? '1.55em' : selectedTemplate === 'technical' ? '1.75em' : '1.8em'};
              list-style-type: decimal;
              font-size: 1em;
              line-height: inherit;
              color: inherit;
            }
            .pfpdf-body-preview li {
              margin: ${selectedTemplate === 'compact' ? '0.08em 0' : selectedTemplate === 'technical' ? '0.18em 0' : '0.2em 0'};
              text-align: justify;
              text-justify: inter-character;
            }
            .pfpdf-body-preview li > p {
              margin: 0.2em 0;
            }
            .pfpdf-body-preview pre {
              background-color: ${
                selectedTemplate === 'pfn'
                  ? '#0d1117'
                  : selectedTemplate === 'academic'
                  ? '#f2f5f7'
                  : selectedTemplate === 'technical'
                  ? '#f5f7f8'
                  : selectedTemplate === 'book'
                  ? '#f4f0e8'
                  : selectedTemplate === 'notebook'
                  ? '#f5f5f1'
                  : selectedTemplate === 'compact'
                  ? '#f3f4f5'
                  : '#f6f8fa'
              };
              color: ${selectedTemplate === 'pfn' ? '#c9d1d9' : '#1f2937'};
              padding: ${selectedTemplate === 'compact' ? '0.5em 0.7em' : '0.75em 0.95em'};
              border-radius: ${selectedTemplate === 'notebook' ? '0.4rem' : '0.2rem'};
              font-family: "Noto Sans Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-size: ${selectedTemplate === 'compact' ? '0.86em' : '0.88em'};
              white-space: pre-wrap;
              overflow-wrap: anywhere;
              margin: ${selectedTemplate === 'compact' ? '0.55em 0' : '0.8em 0'};
              border: ${
                selectedTemplate === 'pfn'
                  ? '1px solid #1e293b'
                  : selectedTemplate === 'technical'
                  ? '1px solid #aebbc4'
                  : selectedTemplate === 'book'
                  ? 'none'
                  : '1px solid #d0d7de'
              };
              border-left: ${
                selectedTemplate === 'technical'
                  ? '2.6px solid #086f83'
                  : selectedTemplate === 'book'
                  ? '2px solid #b8aea0'
                  : undefined
              };
              line-height: ${selectedTemplate === 'compact' ? '1.38' : '1.5'};
            }
            .pfpdf-body-preview code:not(pre code) {
              background-color: ${
                selectedTemplate === 'notebook'
                  ? '#fff4cf'
                  : selectedTemplate === 'book'
                  ? '#eee5df'
                  : selectedTemplate === 'technical'
                  ? '#e9eff1'
                  : '#f2f2f2'
              };
              color: inherit;
              padding: 0.08em 0.28em;
              border-radius: 2px;
              font-family: "Noto Sans Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-size: 0.9em;
            }
            .pfpdf-body-preview table {
              width: 100%;
              border-collapse: collapse;
              margin: ${selectedTemplate === 'compact' ? '0.55em 0' : '0.95em 0'};
              font-size: ${
                selectedTemplate === 'pfn'
                  ? '0.82em'
                  : selectedTemplate === 'academic' || selectedTemplate === 'technical' || selectedTemplate === 'compact'
                  ? '0.89em'
                  : '0.92em'
              };
              line-height: ${selectedTemplate === 'compact' ? '1.32' : '1.45'};
            }
            .pfpdf-body-preview th {
              background-color: ${
                selectedTemplate === 'pfn'
                  ? '#eaf0f7'
                  : selectedTemplate === 'default'
                  ? '#f0f4f8'
                  : selectedTemplate === 'technical'
                  ? '#dfe9ec'
                  : selectedTemplate === 'compact'
                  ? '#e5e7e9'
                  : selectedTemplate === 'academic' || selectedTemplate === 'book'
                  ? 'transparent'
                  : currentFormat.tableHeaderBg
              };
              color: ${
                selectedTemplate === 'pfn'
                  ? '#234b78'
                  : selectedTemplate === 'default' || selectedTemplate === 'compact'
                  ? '#222222'
                  : selectedTemplate === 'technical'
                  ? '#102f38'
                  : selectedTemplate === 'academic'
                  ? '#20252b'
                  : selectedTemplate === 'book'
                  ? '#5b312e'
                  : '#ffffff'
              };
              font-weight: 700;
              padding: ${selectedTemplate === 'compact' ? '0.22em 0.38em' : '0.32em 0.55em'};
              text-align: left;
              border: ${
                selectedTemplate === 'academic' || selectedTemplate === 'book' || selectedTemplate === 'notebook'
                  ? 'none'
                  : '1px solid #cbd5e1'
              };
              border-top: ${selectedTemplate === 'academic' ? '1.2px solid #243f5b' : undefined};
              border-bottom: ${
                selectedTemplate === 'academic'
                  ? '1.2px solid #243f5b'
                  : selectedTemplate === 'book'
                  ? '1.2px solid #5b312e'
                  : undefined
              };
            }
            .pfpdf-body-preview td {
              padding: ${selectedTemplate === 'compact' ? '0.22em 0.38em' : '0.32em 0.55em'};
              border: ${
                selectedTemplate === 'academic' || selectedTemplate === 'book' || selectedTemplate === 'notebook'
                  ? 'none'
                  : '1px solid #cbd5e1'
              };
              border-bottom: 1px solid #cbd5e1;
              color: #222222;
            }
            .pfpdf-body-preview tr:nth-child(even) td {
              background-color: ${
                selectedTemplate === 'book'
                  ? '#f4f0e8'
                  : selectedTemplate === 'notebook'
                  ? '#e5f2ef'
                  : selectedTemplate === 'technical' || selectedTemplate === 'compact'
                  ? '#f8fafb'
                  : 'transparent'
              };
            }
            .pfpdf-body-preview blockquote {
              border-left: ${
                selectedTemplate === 'book'
                  ? 'none'
                  : selectedTemplate === 'default'
                  ? '2.6px solid #7da3c8'
                  : selectedTemplate === 'pfn'
                  ? '2.5px solid #79a'
                  : selectedTemplate === 'academic'
                  ? '1.8px solid #aeb7bf'
                  : `2.5px solid ${currentFormat.color}`
              };
              border-top: ${selectedTemplate === 'book' ? '0.8px solid #b8aea0' : 'none'};
              border-bottom: ${selectedTemplate === 'book' ? '0.8px solid #b8aea0' : 'none'};
              background-color: ${
                selectedTemplate === 'pfn'
                  ? '#f5f8fb'
                  : selectedTemplate === 'default'
                  ? '#f7f9fb'
                  : selectedTemplate === 'technical'
                  ? '#f2f6f7'
                  : selectedTemplate === 'notebook'
                  ? '#fbe8e2'
                  : 'transparent'
              };
              padding: ${
                selectedTemplate === 'book'
                  ? '0.6em 1.2em'
                  : selectedTemplate === 'notebook'
                  ? '0.6em 1em'
                  : selectedTemplate === 'technical'
                  ? '0.45em 0.9em'
                  : selectedTemplate === 'academic'
                  ? '0.25em 0 0.25em 1em'
                  : selectedTemplate === 'pfn'
                  ? '0.25em 1em'
                  : selectedTemplate === 'compact'
                  ? '0.15em 0.7em'
                  : '0.1em 1em'
              };
              margin: ${
                selectedTemplate === 'book'
                  ? '1.3em 1.5em'
                  : selectedTemplate === 'academic'
                  ? '1em 1.2em'
                  : selectedTemplate === 'notebook'
                  ? '1em 0'
                  : selectedTemplate === 'pfn'
                  ? '0.9em 0'
                  : selectedTemplate === 'compact'
                  ? '0.55em 0'
                  : '0.8em 0'
              };
              color: #475569;
            }
            .pfpdf-body-preview blockquote > :first-child {
              margin-top: 0 !important;
            }
            .pfpdf-body-preview blockquote > :last-child {
              margin-bottom: 0 !important;
            }
            .pfpdf-body-preview hr {
              border: 0;
              border-top: ${
                selectedTemplate === 'notebook'
                  ? '1.2px dotted #e66b58'
                  : '0.8px solid #cbd5e1'
              };
              width: ${selectedTemplate === 'academic' ? '60%' : selectedTemplate === 'book' ? '45%' : '100%'};
              margin: ${selectedTemplate === 'compact' ? '0.8em auto' : '1.5em auto'};
            }
            .pfpdf-body-preview u {
              text-decoration: underline;
              text-underline-offset: 0.2em;
              text-decoration-thickness: 1px;
            }
            .pfpdf-body-preview .pfpdf-marker-coral,
            .pfpdf-body-preview mark {
              background: linear-gradient(transparent 60%, #ffbfa3 60%);
              background-color: transparent;
              color: inherit;
              font-weight: 700;
              padding: 0 1px;
              box-decoration-break: clone;
              -webkit-box-decoration-break: clone;
            }
            .pfpdf-body-preview .pfpdf-marker-yellow {
              background: linear-gradient(transparent 60%, #fef08a 60%);
              background-color: transparent;
              color: inherit;
              font-weight: 700;
              padding: 0 1px;
              box-decoration-break: clone;
              -webkit-box-decoration-break: clone;
            }
            .pfpdf-body-preview del,
            .pfpdf-body-preview s {
              text-decoration: line-through;
              color: #94a3b8;
            }
            .pfpdf-body-preview kbd {
              background-color: #f5f5f5;
              border: 0.5pt solid #999;
              border-bottom-width: 1.5pt;
              border-radius: 2.5px;
              display: inline-block;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-size: 0.82em;
              line-height: 1.25;
              padding: 0.08em 0.35em;
              white-space: nowrap;
              color: #334155;
            }
            /* pfpdf 公式共通仕様: MathJax数式 & Mermaidダイアグラム組版スタイル */
            .pfpdf-body-preview .pfpdf-math-display {
              break-inside: avoid;
              text-align: center;
              margin: 0.9em 0;
            }
            .pfpdf-body-preview .pfpdf-math-display mjx-container,
            .pfpdf-body-preview .pfpdf-math-display svg {
              display: block;
              margin-left: auto;
              margin-right: auto;
            }
            .pfpdf-body-preview .pfpdf-math-display svg {
              height: auto;
              vertical-align: middle !important;
            }
            .pfpdf-body-preview .pfpdf-math-display svg,
            .pfpdf-body-preview .pfpdf-math-inline svg {
              max-width: 100%;
            }
            .pfpdf-body-preview .pfpdf-math-inline {
              display: inline-block;
              vertical-align: middle;
              margin: 0 0.15em;
            }
            .pfpdf-body-preview .pfpdf-mermaid {
              text-align: center;
              margin: 1.2em 0;
              break-inside: avoid;
            }
            .pfpdf-body-preview .pfpdf-mermaid svg {
              max-width: 100%;
              height: auto;
              margin: 0 auto;
              display: block;
            }
            /* VSCode風エディタのテキスト選択＆スクロールバー完全同期 */
            textarea.pfpdf-editor-textarea::selection {
              background-color: rgba(59, 130, 246, 0.35);
              color: transparent;
            }
            pre.pfpdf-editor-backdrop::-webkit-scrollbar,
            textarea.pfpdf-editor-textarea::-webkit-scrollbar {
              width: 10px;
              height: 10px;
            }
            pre.pfpdf-editor-backdrop::-webkit-scrollbar-track,
            textarea.pfpdf-editor-textarea::-webkit-scrollbar-track {
              background: transparent;
            }
            pre.pfpdf-editor-backdrop::-webkit-scrollbar-thumb {
              background: transparent;
            }
            textarea.pfpdf-editor-textarea::-webkit-scrollbar-thumb {
              background: rgba(148, 163, 184, 0.4);
              border-radius: 5px;
            }
            textarea.pfpdf-editor-textarea::-webkit-scrollbar-thumb:hover {
              background: rgba(100, 116, 139, 0.7);
            }
            pre.pfpdf-editor-backdrop span {
              font-weight: 400 !important;
              font-style: normal !important;
              padding: 0 !important;
              margin: 0 !important;
              border: none !important;
              letter-spacing: 0px !important;
            }
          `}</style>

          {/* 非表示の A4 高さ自動測定用コンテナ */}
          <div
            ref={measureContainerRef}
            className="pfpdf-body-preview pointer-events-none"
            style={{
              position: 'absolute',
              left: '-99999px',
              top: 0,
              width: `${pageMetrics.contentWidthPx}px`,
              visibility: 'hidden'
            }}
          />
        </div>
      </div>

      {/* 未保存変更確認ダイアログ (モーダル) */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">
                  変更内容を保存しますか？
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  「<span className="font-semibold text-slate-700">{fileData?.fileName || '無題のドキュメント'}</span>」への変更が保存されていません。
                  {isCloseAction
                    ? '保存せずに閉じると、編集した内容は破棄されます。'
                    : '保存せずに移動すると、編集した内容は失われます。'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancelUnsavedModal}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDiscardAndProceed}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                {isCloseAction ? '保存せずに閉じる' : '保存せずに開く'}
              </button>
              <button
                type="button"
                onClick={handleSaveAndProceed}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition cursor-pointer"
              >
                {isCloseAction ? '保存して閉じる' : '保存する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
