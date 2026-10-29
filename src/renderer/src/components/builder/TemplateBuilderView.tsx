import React, { useState, useEffect } from 'react'
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Layers,
  ListOrdered,
  FileCode,
  Tag,
  Palette,
  Check,
  EyeOff,
  Eye,
  RefreshCw
} from 'lucide-react'

import { useTemplateStore } from '../../store/templateStore'
import { CustomTemplateData, PptxParseResult, MarkdownSlotType, PptxSlotMapping } from '../../../../shared/types'

export default function TemplateBuilderView(): React.JSX.Element {
  const {
    currentTemplate,
    activeSection,
    setActiveSection,
    setTemplate,
    updateTemplateMeta,
    updateTocSettings,
    updateHeaderFooter,
    updateTheme,
    updateSlotMapping,
    setHasCover,
    importFromPptx
  } = useTemplateStore()

  const [savedTemplates, setSavedTemplates] = useState<CustomTemplateData[]>([])
  const [isParsingPptx, setIsParsingPptx] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null)
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null)
  const [showSampleModal, setShowSampleModal] = useState<boolean>(false)
  const [isDraggingPptx, setIsDraggingPptx] = useState<boolean>(false)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  // 保存済みテンプレート一覧をロード
  const loadTemplates = async () => {
    if (!window.pfpdfAPI) return
    try {
      const list = await window.pfpdfAPI.getCustomTemplates()
      setSavedTemplates(list)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  // PPTXファイル選択
  const handleSelectPptx = async () => {
    if (!window.pfpdfAPI) return
    setIsParsingPptx(true)
    setSaveErrorMsg(null)
    setSaveSuccessMsg(null)

    try {
      const result = await window.pfpdfAPI.selectPptxFile()
      if (result && result.success) {
        handlePptxParsed(result)
      } else if (result && !result.success) {
        setSaveErrorMsg(result.error || 'PPTXの解析に失敗しました')
      }
    } catch (err: any) {
      setSaveErrorMsg(err.message)
    } finally {
      setIsParsingPptx(false)
    }
  }

  // PPTX解析完了の処理
  const handlePptxParsed = (result: PptxParseResult) => {
    importFromPptx(result)
    setSelectedSlotId(result.slotMappings[0]?.id || null)
  }

  // ドラッグ＆ドロップ処理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingPptx(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingPptx(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingPptx(false)

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.name.toLowerCase().endsWith('.pptx')) {
      setSaveErrorMsg('PowerPointファイル (.pptx) をドロップしてください。')
      return
    }

    setIsParsingPptx(true)
    setSaveErrorMsg(null)

    try {
      const buffer = await file.arrayBuffer()
      const result = await window.pfpdfAPI.parsePptxBuffer(buffer, file.name)
      if (result.success) {
        handlePptxParsed(result)
      } else {
        setSaveErrorMsg(result.error || 'PPTXの解析に失敗しました')
      }
    } catch (err: any) {
      setSaveErrorMsg(err.message)
    } finally {
      setIsParsingPptx(false)
    }
  }

  // サンプルPPTXの書き出し
  const handleExportSample = async (type: 'business' | 'tech' | 'academic') => {
    if (!window.pfpdfAPI) return
    try {
      const res = await window.pfpdfAPI.exportPptxSample(type)
      if (res.success && res.filePath) {
        setShowSampleModal(false)
        setSaveSuccessMsg(`サンプルPPTXを保存しました: ${res.filePath}`)
        setTimeout(() => setSaveSuccessMsg(null), 5000)
      }
    } catch (err: any) {
      setSaveErrorMsg(err.message)
    }
  }

  // 保存処理 (テンプレート登録)
  const handleSave = async () => {
    if (!window.pfpdfAPI) return
    setIsSaving(true)
    setSaveSuccessMsg(null)
    setSaveErrorMsg(null)

    try {
      const res = await window.pfpdfAPI.saveCustomTemplate(currentTemplate)
      if (res.success) {
        setSaveSuccessMsg('テンプレートを登録しました！「ジェネレーター」タブですぐに使えます')
        await loadTemplates()
        setTimeout(() => setSaveSuccessMsg(null), 5000)
      } else {
        setSaveErrorMsg(res.error || '保存に失敗しました')
      }
    } catch (err: any) {
      setSaveErrorMsg(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // 既存テンプレートの切り替え
  const handleSelectTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value
    const found = savedTemplates.find((t) => t.id === selectedId)
    if (found) {
      setTemplate(found)
      if (found.slotMappings && found.slotMappings.length > 0) {
        setSelectedSlotId(found.slotMappings[0].id)
      }
    }
  }

  const hasPptxLoaded = Boolean(currentTemplate.sourcePptx || (currentTemplate.slotMappings && currentTemplate.slotMappings.length > 0))
  const slots: PptxSlotMapping[] = currentTemplate.slotMappings || []
  const theme = currentTemplate.theme || {
    primaryColor: '#0f5e5a',
    secondaryColor: '#4f46e5',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    headingFont: 'sans-serif',
    bodyFont: 'sans-serif'
  }

  // スロットラベルのヘルパー
  const getSlotBadge = (slot: MarkdownSlotType) => {
    switch (slot) {
      case 'title':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">タイトル (title)</span>
      case 'subtitle':
        return <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">サブタイトル (subtitle)</span>
      case 'author':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">著者名 (author)</span>
      case 'date':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">日付 (date)</span>
      case 'series':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">シリーズ (series)</span>
      case 'confidential':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">機密区分 (confidential)</span>
      default:
        return <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">固定テキスト</span>
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100 select-none relative"
    >
      {/* PPTX ドラッグ時の全画面オーバーレイ */}
      {isDraggingPptx && (
        <div className="absolute inset-0 bg-blue-600/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white pointer-events-none animate-in fade-in duration-150">
          <FileSpreadsheet className="w-20 h-20 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-1">PowerPoint (.pptx) をドロップ</h2>
          <p className="text-sm text-blue-100">
            スライドから表紙・目次・本文のテキストボックスや色情報を自動解析します
          </p>
        </div>
      )}

      {/* 上部ツールバー */}
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-2xs shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-orange-600" />
            <span className="font-bold text-slate-800 text-sm">PPTX テンプレート変換</span>
          </div>

          <span className="text-slate-300">|</span>

          {/* テンプレート名入力 */}
          <input
            type="text"
            value={currentTemplate.name}
            onChange={(e) => updateTemplateMeta(e.target.value)}
            placeholder="テンプレート名"
            className="text-xs font-bold text-slate-800 border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-lg px-2.5 py-1 focus:outline-none transition w-48 bg-slate-50"
          />

          {currentTemplate.sourcePptx && (
            <span className="text-[10px] bg-orange-50 text-orange-800 font-bold px-2.5 py-1 rounded-lg border border-orange-200 flex items-center gap-1">
              <span>元ファイル:</span>
              <span className="font-mono">{currentTemplate.sourcePptx}</span>
            </span>
          )}

          {/* 保存済みテンプレート切り替え */}
          {savedTemplates.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs ml-2">
              <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={currentTemplate.id}
                onChange={handleSelectTemplate}
                className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[140px] truncate"
              >
                {savedTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {saveSuccessMsg && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              {saveSuccessMsg}
            </span>
          )}
          {saveErrorMsg && (
            <span className="text-xs text-red-600 font-bold flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {saveErrorMsg}
            </span>
          )}

          {/* サンプルPPTXダウンロード */}
          <button
            type="button"
            onClick={() => setShowSampleModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-200 text-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            サンプルPPTX保存
          </button>

          {/* PPTX ファイル読み込み */}
          <button
            type="button"
            onClick={handleSelectPptx}
            disabled={isParsingPptx}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-xs transition text-xs disabled:opacity-50"
          >
            {isParsingPptx ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            PPTX を読み込む
          </button>

          {/* テンプレート登録ボタン */}
          {hasPptxLoaded && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              この設定でテンプレートを登録
            </button>
          )}
        </div>
      </div>

      {/* メインエリア */}
      {!hasPptxLoaded ? (
        /* ======================================================== */
        /* 状態 A: PPTX 未読み込み（初期ドロップゾーン画面） */
        /* ======================================================== */
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
          <div className="max-w-xl w-full text-center space-y-6">
            <div
              onClick={handleSelectPptx}
              className="p-12 border-2 border-dashed border-slate-300 hover:border-orange-500 bg-white hover:bg-orange-50/20 rounded-3xl cursor-pointer transition-all shadow-sm group flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-10 h-10" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-orange-700">
                PowerPoint (.pptx) をドロップ
              </h2>
              <p className="text-xs text-slate-500 mb-4 max-w-sm">
                またはクリックしてファイルを選択してください。
                スライド1枚目の表紙、色、フォント、各テキストボックスの役割を自動解析します。
              </p>
              <div className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2">
                <Upload className="w-3.5 h-3.5" />
                ファイルを選択して解析
              </div>
            </div>

            {/* サンプルファイル案内 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between text-left">
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-0.5">
                  PowerPointファイルをお持ちでない場合
                </h4>
                <p className="text-[11px] text-slate-500">
                  A4縦・洗練デザインのひな形スライドをダウンロードして、文字や色を変えてお使いいただけます。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSampleModal(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shrink-0 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                サンプルを取得
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 状態 B: PPTX 解析完了（このような形で問題ないですか？提示画面） */
        /* ======================================================== */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 上部ステータスバナー */}
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-900 shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold">
                PowerPointの解析が完了しました！以下の構成・マッピングで問題ないかご確認ください。
              </span>
              <span className="text-emerald-700 font-medium">
                （表紙のテキストボックスはMarkdownのFront Matterから自動置換されます）
              </span>
            </div>
            <button
              type="button"
              onClick={handleSelectPptx}
              className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 underline underline-offset-2"
            >
              <RefreshCw className="w-3 h-3" />
              別のPPTXを再読み込み
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* 左側: スライド切り替えタブ ＆ ビジュアルプレビュー */}
            <div className="w-[520px] bg-slate-200/70 border-r border-slate-300 flex flex-col shrink-0 overflow-hidden">
              {/* スライド切り替えセレクター */}
              <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveSection('cover')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      activeSection === 'cover'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    1. 表紙プレビュー
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('toc')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      activeSection === 'toc'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                    2. 目次プレビュー
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('body')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      activeSection === 'body'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    3. 本文プレビュー
                  </button>
                </div>

                {/* 表紙・目次ON/OFFトグル */}
                {activeSection === 'cover' && (
                  <button
                    type="button"
                    onClick={() => setHasCover(!currentTemplate.hasCover)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      currentTemplate.hasCover
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {currentTemplate.hasCover ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{currentTemplate.hasCover ? '表紙あり' : '表紙なし'}</span>
                  </button>
                )}

                {activeSection === 'toc' && (
                  <button
                    type="button"
                    onClick={() => updateTocSettings({ enabled: !currentTemplate.tocSettings.enabled })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      currentTemplate.tocSettings.enabled
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {currentTemplate.tocSettings.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{currentTemplate.tocSettings.enabled ? '目次あり' : '目次なし'}</span>
                  </button>
                )}
              </div>

              {/* キャンバス中央表示 */}
              <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
                {/* 1. 表紙プレビュー */}
                {activeSection === 'cover' && (
                  <div
                    style={{
                      width: '420px',
                      height: '594px', // A4比率 1:1.414
                      backgroundColor: theme.backgroundColor || '#ffffff'
                    }}
                    className={`relative rounded-sm shadow-xl border border-slate-300 overflow-hidden transition-all ${
                      !currentTemplate.hasCover ? 'opacity-40 grayscale-[60%]' : ''
                    }`}
                  >
                    {slots.map((s) => {
                      const isSelected = selectedSlotId === s.id

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
                              backgroundColor: s.backgroundColor || theme.primaryColor,
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
                            alt="Logo"
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
                          onClick={() => setSelectedSlotId(s.id)}
                          style={{
                            position: 'absolute',
                            left: `${s.xPercent}%`,
                            top: `${s.yPercent}%`,
                            width: `${s.widthPercent}%`,
                            minHeight: `${s.heightPercent}%`,
                            color: s.color || theme.textColor,
                            fontSize: s.fontSizePt ? `${Math.round(s.fontSizePt * 0.7)}pt` : '11pt',
                            fontWeight: s.fontWeight || (s.slot === 'title' ? 'bold' : 'normal'),
                            textAlign: s.textAlign || 'left',
                            lineHeight: 1.25,
                            fontFamily: s.slot === 'title' ? theme.headingFont : theme.bodyFont
                          }}
                          className={`cursor-pointer rounded-xs p-1 transition-all ${
                            isSelected
                              ? 'ring-2 ring-blue-500 bg-blue-500/10'
                              : 'hover:ring-1 hover:ring-blue-300 hover:bg-blue-50/30'
                          }`}
                        >
                          <div className="absolute -top-3.5 left-0 z-10 pointer-events-none">
                            {getSlotBadge(s.slot)}
                          </div>
                          <span>{s.originalText}</span>
                        </div>
                      )
                    })}

                    {!currentTemplate.hasCover && (
                      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px] flex flex-col items-center justify-center text-white p-6 text-center">
                        <EyeOff className="w-10 h-10 mb-2 opacity-80" />
                        <h4 className="font-bold text-sm">表紙は出力されません</h4>
                        <p className="text-[11px] text-slate-200">1ページ目から直接目次・本文が始まります</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. 目次プレビュー */}
                {activeSection === 'toc' && (
                  <div
                    style={{ width: '420px', height: '594px', backgroundColor: '#ffffff' }}
                    className="relative rounded-sm shadow-xl border border-slate-300 p-8 flex flex-col justify-between"
                  >
                    {currentTemplate.tocSettings.enabled ? (
                      <div>
                        <h2
                          style={{ color: theme.primaryColor, borderBottom: `2px solid ${theme.primaryColor}` }}
                          className="text-lg font-bold pb-2 mb-6"
                        >
                          {currentTemplate.tocSettings.title || '目 次'}
                        </h2>
                        <div className="space-y-4 text-xs">
                          <div className="flex items-center justify-between text-slate-800 font-semibold">
                            <span>1. はじめに・プロジェクト背景</span>
                            <span className="text-slate-400 font-mono">
                              {currentTemplate.tocSettings.leaderStyle === 'dots' ? '••••••••••••••••' : '----------------'} 1
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-800 font-semibold pl-4">
                            <span>1.1 開発目標と対象読者</span>
                            <span className="text-slate-400 font-mono">
                              {currentTemplate.tocSettings.leaderStyle === 'dots' ? '••••••••••••••••' : '----------------'} 2
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-800 font-semibold">
                            <span>2. システムアーキテクチャ設計</span>
                            <span className="text-slate-400 font-mono">
                              {currentTemplate.tocSettings.leaderStyle === 'dots' ? '••••••••••••••••' : '----------------'} 3
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-800 font-semibold pl-4">
                            <span>2.1 PowerPoint連携仕様</span>
                            <span className="text-slate-400 font-mono">
                              {currentTemplate.tocSettings.leaderStyle === 'dots' ? '••••••••••••••••' : '----------------'} 5
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-800 font-semibold">
                            <span>3. まとめ・今後の展望</span>
                            <span className="text-slate-400 font-mono">
                              {currentTemplate.tocSettings.leaderStyle === 'dots' ? '••••••••••••••••' : '----------------'} 8
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center">
                        <EyeOff className="w-10 h-10 mb-2 opacity-50" />
                        <h4 className="font-bold text-sm text-slate-600">目次は生成されません</h4>
                        <p className="text-xs text-slate-400">上部スイッチで目次を有効化できます</p>
                      </div>
                    )}
                    <div className="text-center text-[10px] text-slate-400 font-mono">
                      - {currentTemplate.hasCover ? '2' : '1'} -
                    </div>
                  </div>
                )}

                {/* 3. 本文プレビュー */}
                {activeSection === 'body' && (
                  <div
                    style={{ width: '420px', height: '594px', backgroundColor: '#ffffff' }}
                    className="relative rounded-sm shadow-xl border border-slate-300 p-8 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <h1
                        style={{
                          color: theme.primaryColor,
                          borderBottom: `2px solid ${theme.primaryColor}`,
                          fontFamily: theme.headingFont
                        }}
                        className="text-lg font-bold pb-1.5"
                      >
                        1. システム概要と基本設計
                      </h1>
                      <p style={{ color: theme.textColor, lineHeight: 1.7 }} className="text-xs leading-relaxed">
                        本ドキュメントは、MarkdownファイルからVivliostyleベースのpfpdfエンジンを用いて高品質な出版レベルPDFを出力する技術仕様書です。
                      </p>

                      <h2
                        style={{
                          color: theme.textColor,
                          borderLeft: `4px solid ${theme.primaryColor}`,
                          fontFamily: theme.headingFont
                        }}
                        className="text-sm font-bold pl-2.5 mt-4"
                      >
                        1.1 PowerPoint連携による自動組版
                      </h2>
                      <p style={{ color: theme.textColor, lineHeight: 1.7 }} className="text-xs leading-relaxed">
                        PowerPointでデザインしたテキストボックスの座標・フォントサイズ・配色を自動抽出し、MarkdownのFront Matterから流し込みます。
                      </p>

                      <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-[10px] font-mono mt-3">
                        <code>console.log(&quot;PPTX Template successfully applied!&quot;);</code>
                      </div>
                    </div>
                    <div className="text-center text-[10px] text-slate-400 font-mono">
                      - {currentTemplate.hasCover ? '3' : '2'} -
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 右側: 「このような形で問題ないですか？」マッピング確認＆調整パネル */}
            <div className="flex-1 bg-white flex flex-col overflow-y-auto p-6 space-y-6">
              {/* セクション 1: 表紙テキストボックスの Markdown 項目マッピング */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-orange-600" />
                    <h3 className="text-sm font-bold text-slate-800">
                      表紙テキストボックスの置換マッピング (Markdown ⇄ PPTX)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    検出: {slots.filter((s) => !s.isShape && !s.imageDataUrl).length} 個の枠
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  PowerPointから検出されたテキストボックスです。Markdown変換時にどのFront Matter（タイトル・著者名など）と置き換えるかを確認・変更できます。
                </p>

                <div className="space-y-2.5 pt-1">
                  {slots
                    .filter((s) => !s.isShape && !s.imageDataUrl)
                    .map((s, idx) => {
                      const isSelected = selectedSlotId === s.id
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSelectedSlotId(s.id)
                            setActiveSection('cover')
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/10 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 font-mono">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                                {idx + 1}
                              </span>
                              <span>PPTX内の文字:</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {s.fontSizePt}pt / {s.color}
                              </span>
                              {getSlotBadge(s.slot)}
                            </div>
                          </div>

                          <div className="text-xs font-semibold text-slate-800 bg-slate-100/70 p-2 rounded-lg mb-2.5 font-mono truncate">
                            &quot;{s.originalText}&quot;
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                            <span className="text-[11px] font-bold text-slate-600 shrink-0">
                              置き換えるMarkdown項目:
                            </span>
                            <select
                              value={s.slot}
                              onChange={(e) => updateSlotMapping(s.id, { slot: e.target.value as MarkdownSlotType })}
                              className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            >
                              <option value="title">タイトル (title) に置換</option>
                              <option value="subtitle">サブタイトル (subtitle) に置換</option>
                              <option value="author">著者名 (author) に置換</option>
                              <option value="date">日付 (date) に置換</option>
                              <option value="series">シリーズ・分類 (series) に置換</option>
                              <option value="confidential">機密区分 (confidential) に置換</option>
                              <option value="none">固定文字（Markdownで置換せずPPTXのまま表示）</option>
                            </select>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* セクション 2: 目次（TOC）設定 */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">目次ページの設定</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateTocSettings({ enabled: !currentTemplate.tocSettings.enabled })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      currentTemplate.tocSettings.enabled
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {currentTemplate.tocSettings.enabled ? <Check className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>目次を出力する: {currentTemplate.tocSettings.enabled ? 'ON' : 'OFF'}</span>
                  </button>
                </div>

                {currentTemplate.tocSettings.enabled ? (
                  <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">目次タイトル</span>
                      <input
                        type="text"
                        value={currentTemplate.tocSettings.title}
                        onChange={(e) => updateTocSettings({ title: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">リーダー線形式</span>
                      <select
                        value={currentTemplate.tocSettings.leaderStyle}
                        onChange={(e) => updateTocSettings({ leaderStyle: e.target.value as any })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs cursor-pointer"
                      >
                        <option value="dots">点線 (••••)</option>
                        <option value="dashes">破線 (----)</option>
                        <option value="solid">実線 (____)</option>
                        <option value="none">リーダー線なし</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">見出し階層深さ</span>
                      <select
                        value={currentTemplate.tocSettings.levels}
                        onChange={(e) => updateTocSettings({ levels: parseInt(e.target.value, 10) as any })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs cursor-pointer"
                      >
                        <option value="1">H1 のみ</option>
                        <option value="2">H1 〜 H2 まで (推奨)</option>
                        <option value="3">H1 〜 H3 まで</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    目次はOFFになっています。短い資料や目次が不要な場合はこのまま出力されます。
                  </p>
                )}
              </div>

              {/* セクション 3: 抽出されたテーマカラー・組版情報 */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-slate-800">
                      PPTXから抽出されたテーマカラー・組版仕様
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                      アクセントカラー (H1ライン/帯)
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.primaryColor}
                        onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                      />
                      <span className="font-mono text-xs font-semibold text-slate-800">
                        {theme.primaryColor}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                      検出フォント
                    </span>
                    <div className="font-mono text-xs font-semibold text-slate-800 bg-white p-2 rounded-lg border border-slate-200 truncate">
                      {theme.headingFont}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                      ノンブル（ページ番号）
                    </span>
                    <select
                      value={currentTemplate.headerFooter?.pageNumberFormat || 'dash'}
                      onChange={(e) => updateHeaderFooter({ pageNumberFormat: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs cursor-pointer"
                    >
                      <option value="dash">- 1 - (ハイフン付き)</option>
                      <option value="number">1 (数字のみ)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 登録確認ボタンエリア */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between mt-4">
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 mb-0.5">
                    この設定でテンプレートとして登録しますか？
                  </h4>
                  <p className="text-[11px] text-emerald-700">
                    登録すると「ジェネレーター」画面のテンプレート一覧に即座に追加され、MarkdownからPDFを生成できます。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  この構成で登録する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* サンプルPPTXダウンロードモーダル */}
      {showSampleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-slate-900">
                  サンプルPowerPointファイルの保存
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSampleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              お手元のPowerPointで自由に開いて編集できる「A4縦デザインのひな形スライド」を保存します。
              保存したファイルをPowerPointで開き、タイトルやロゴ、色を変更して本アプリにドロップするだけでテンプレートが完成します。
            </p>

            <div className="space-y-2.5">
              <div
                onClick={() => handleExportSample('business')}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/30 cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                    PFN風
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-orange-700">
                      ビジネス・公式レポート風サンプル
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      ディープティール帯、整然としたタイトルと著者レイアウト
                    </p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-orange-600" />
              </div>

              <div
                onClick={() => handleExportSample('tech')}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                    TECH
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      技術仕様書・API設計書風サンプル
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      ブルーアクセント、システム文書に適したクリーン構成
                    </p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </div>

              <div
                onClick={() => handleExportSample('academic')}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-800 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
                    論文
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      学術・研究ドラフト風サンプル
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      フォーマルなダークグレー、アカデミック仕様
                    </p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-800" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
