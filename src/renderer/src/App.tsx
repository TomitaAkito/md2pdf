// src/renderer/src/App.tsx
import React, { useState, useEffect } from 'react'
import {
  FileText,
  Layers,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react'
import { AppMode, PfpdfProgressEvent, PdfGenerateResult } from '../../shared/types'
import GeneratorView from './components/GeneratorView'
import TemplateBuilderView from './components/builder/TemplateBuilderView'

export default function App(): React.JSX.Element {
  const [mode, setMode] = useState<AppMode>('generator')
  const [showTestModal, setShowTestModal] = useState<boolean>(false)
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false)
  const [testProgress, setTestProgress] = useState<PfpdfProgressEvent | null>(null)
  const [testResult, setTestResult] = useState<PdfGenerateResult | null>(null)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    if (!window.pfpdfAPI) {
      setInitError(
        'window.pfpdfAPI が見つかりません。preload/index.ts または main/index.ts の書き換えが反映されていない可能性があります。'
      )
      return
    }

    const unsubscribe = window.pfpdfAPI.onProgress((event) => {
      setTestProgress(event)
    })
    return () => unsubscribe()
  }, [])

  const handleRunDummyTest = async () => {
    if (!window.pfpdfAPI) return
    setIsTestRunning(true)
    setTestResult(null)
    try {
      const result = await window.pfpdfAPI.testDummyPdf()
      setTestResult(result)
    } catch (err: any) {
      setTestResult({ success: false, logs: [], error: err.message })
    } finally {
      setIsTestRunning(false)
    }
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm max-w-lg w-full">
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <AlertCircle className="w-5 h-5" />
            <h1 className="font-semibold text-sm">初期化エラーが発生しました</h1>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">{initError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#f8f9fa] text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* ナビゲーションバー */}
      <header className="bg-white border-b border-slate-200/90 px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-2xs">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-sm tracking-tight text-slate-900 font-mono">
              pfpdf studio
            </span>
            <span className="text-[10px] text-slate-400 font-mono">v1.0</span>
          </div>
        </div>

        {/* モード切替タブ (セグメントコントロール) */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/70 text-xs">
          <button
            type="button"
            onClick={() => setMode('generator')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              mode === 'generator'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            PDF 出力
          </button>
          <button
            type="button"
            onClick={() => setMode('builder')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              mode === 'builder'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            PPTX テンプレート変換
          </button>
        </div>

        {/* 右側アクション */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTestModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md text-xs transition border border-transparent hover:border-slate-200"
            title="pfpdf コア疎通テスト"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>疎通テスト</span>
          </button>
        </div>
      </header>

      {/* メインビュー切り替え */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {mode === 'generator' ? <GeneratorView /> : <TemplateBuilderView />}
      </main>

      {/* 疎通テストモーダル (Phase 1 機能をいつでも実行可能) */}
      {showTestModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl max-w-xl w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <FlaskConical className="w-5 h-5 text-blue-600" />
                <span>Phase 1: pfpdf コア疎通テスト</span>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Mainプロセス側でダミーのMarkdownファイル（日本語組版・数式・コードハイライト入り）を一時生成し、デスクトップへPDFを出力してエンジンの動作を検証します。
            </p>

            <button
              onClick={handleRunDummyTest}
              disabled={isTestRunning}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
            >
              {isTestRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>pfpdf 実行中...</span>
                </>
              ) : (
                'ダミー .md から PDF を生成テスト'
              )}
            </button>

            {testProgress && (
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700">
                <span className="font-bold uppercase text-blue-700">[{testProgress.stage}]</span>{' '}
                {testProgress.message}
              </div>
            )}

            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>PDF生成成功: {testResult.outputPdfPath}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>PDF生成失敗: {testResult.error}</span>
                    </>
                  )}
                </div>
                {testResult.logs.length > 0 && (
                  <pre className="mt-2 p-2 bg-slate-900 text-slate-100 rounded-lg text-[10px] overflow-x-auto max-h-36">
                    {testResult.logs.join('')}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}