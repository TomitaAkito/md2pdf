/**
 * Pfpdf Preview Renderer
 * 
 * pfpdf 公式エンジンと同一の MathJax (mathjax-full) および Mermaid (isomorphic-mermaid) を用いて、
 * プレビュー用インライン SVG を生成するモジュール。
 * 
 * Vite (Rolldown) の静的バンドラによるサブ依存解決エラーを完全に回避するため、
 * 実行時 (Runtime) に Node.js のモジュール解決経由で @pfnet-research/pfpdf 内の
 * math.js, mermaid.js, hast-util-to-html を安全に動的ロードします。
 */

import path from 'path'
import { pathToFileURL } from 'url'
import { createRequire } from 'module'

// Vite の静的インポート解析を回避するランタイム動的インポート関数
const dynamicImport = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<any>

interface PfpdfModules {
  renderMathToHast: (tex: string, display: boolean) => Promise<{ nodes: any[]; error: string | null }>
  renderMermaidToHast: (source: string, id: string) => Promise<any[]>
  toHtml: (node: any) => string
}

let pfpdfModulesPromise: Promise<PfpdfModules> | null = null

async function getPfpdfModules(): Promise<PfpdfModules> {
  if (!pfpdfModulesPromise) {
    pfpdfModulesPromise = (async () => {
      console.log('[previewRenderer] Initializing pfpdf modules...')
      // 1. @pfnet-research/pfpdf の package.json からコンテキストを作成 (CJS / ESM 双方対応)
      const baseRequire = typeof require !== 'undefined' ? require : createRequire(import.meta.url)
      const pfpdfEntry = baseRequire.resolve('@pfnet-research/pfpdf')
      const distDir = path.dirname(pfpdfEntry)
      const pkgDir = path.dirname(distDir)
      const pfpdfRequire = createRequire(path.join(pkgDir, 'package.json'))

      // 2. math.js, mermaid.js, hast-util-to-html のファイルURLを生成
      const mathUrl = pathToFileURL(path.join(distDir, 'math.js')).href
      const mermaidUrl = pathToFileURL(path.join(distDir, 'mermaid.js')).href
      const toHtmlEntry = pfpdfRequire.resolve('hast-util-to-html')
      const toHtmlUrl = pathToFileURL(toHtmlEntry).href

      // 3. ランタイム動的インポート
      const [mathMod, mermaidMod, toHtmlMod] = await Promise.all([
        dynamicImport(mathUrl),
        dynamicImport(mermaidUrl),
        dynamicImport(toHtmlUrl)
      ])

      const toHtmlFn = toHtmlMod.toHtml || toHtmlMod.default || toHtmlMod
      console.log('[previewRenderer] pfpdf modules loaded successfully!')

      return {
        renderMathToHast: mathMod.renderMathToHast,
        renderMermaidToHast: mermaidMod.renderMermaidToHast,
        toHtml: toHtmlFn
      }
    })().catch((err) => {
      console.error('[previewRenderer] Failed to load pfpdf modules:', err)
      pfpdfModulesPromise = null
      throw err
    })
  }
  return pfpdfModulesPromise
}

export async function renderMathSvg(tex: string, display: boolean): Promise<string> {
  try {
    const { renderMathToHast, toHtml } = await getPfpdfModules()
    const result = await renderMathToHast(tex, display)
    if (result.error) {
      return `<span class="pfpdf-math-error" style="color: #e11d48; background: #fff1f2; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.85em; border: 1px solid #fecdd3;">⚠️ 数式エラー: ${result.error}</span>`
    }
    const svgHtml = result.nodes.map((node) => toHtml(node)).join('')
    const className = display ? 'pfpdf-math-display' : 'pfpdf-math-inline'
    const tag = display ? 'div' : 'span'
    return `<${tag} class="${className}">${svgHtml}</${tag}>`
  } catch (err: any) {
    return `<span class="pfpdf-math-error" style="color: #e11d48; background: #fff1f2; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.85em; border: 1px solid #fecdd3;">⚠️ 数式エラー: ${err.message || '構文エラー'}</span>`
  }
}

let diagramCounter = 0

export async function renderMermaidSvg(source: string): Promise<string> {
  try {
    const { renderMermaidToHast, toHtml } = await getPfpdfModules()
    diagramCounter++
    const id = `pfpdf-preview-mermaid-${diagramCounter}`
    const hastNodes = await renderMermaidToHast(source, id)
    const svgHtml = hastNodes.map((node) => toHtml(node)).join('')
    return `<div class="pfpdf-mermaid" style="text-align: center; margin: 1.2em 0; overflow-x: auto;">${svgHtml}</div>`
  } catch (err: any) {
    return `<div class="pfpdf-mermaid-error" style="padding: 8px 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; color: #dc2626; font-family: monospace; font-size: 11px; margin: 1em 0;">
      <div style="font-weight: 700; margin-bottom: 2px;">⚠️ Mermaid 図描画中 / 構文エラー</div>
      <div>${err.message || 'ダイアグラム構文が無効です'}</div>
    </div>`
  }
}

export interface PreviewRenderBatchRequest {
  mathItems: Array<{ id: string; tex: string; display: boolean }>
  mermaidItems: Array<{ id: string; source: string }>
}

export interface PreviewRenderBatchResult {
  mathResults: Record<string, string>
  mermaidResults: Record<string, string>
}

export async function renderPreviewBatch(req: PreviewRenderBatchRequest): Promise<PreviewRenderBatchResult> {
  const mathResults: Record<string, string> = {}
  const mermaidResults: Record<string, string> = {}

  await Promise.all([
    ...req.mathItems.map(async (item) => {
      mathResults[item.id] = await renderMathSvg(item.tex, item.display)
    }),
    ...req.mermaidItems.map(async (item) => {
      mermaidResults[item.id] = await renderMermaidSvg(item.source)
    })
  ])

  return { mathResults, mermaidResults }
}
