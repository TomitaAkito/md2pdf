import { create } from 'zustand'
import {
  CustomTemplateData,
  CoverElement,
  CoverElementType,
  PageSettings,
  ElementStyles,
  TocSettings,
  HeaderFooterSettings
} from '../../../shared/types'

export type BuilderSection = 'cover' | 'toc' | 'body' | 'page'

export interface TemplatePreset {
  id: string
  name: string
  description: string
  color: string
  template: Partial<CustomTemplateData>
}

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'business',
    name: 'ビジネスレポート',
    description: '信頼感のあるネイビーブルーとすっきりした目次',
    color: '#1d4ed8',
    template: {
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
        headerText: 'ビジネスプロジェクト報告書',
        showPageNumber: true,
        pageNumberPosition: 'bottom-center',
        pageNumberFormat: 'dash'
      },
      coverElements: [
        {
          id: 'el-title',
          type: 'title',
          x: 35,
          y: 130,
          width: 430,
          height: 70,
          text: 'プロジェクト成果報告書',
          fontSize: '30pt',
          color: '#0f172a',
          fontWeight: 'bold',
          textAlign: 'left',
          borderBottom: '3px solid #1d4ed8'
        },
        {
          id: 'el-sub',
          type: 'subtitle',
          x: 35,
          y: 215,
          width: 430,
          height: 35,
          text: '〜 2026年度 下半期総括および来期戦略 〜',
          fontSize: '14pt',
          color: '#475569',
          textAlign: 'left'
        },
        {
          id: 'el-author',
          type: 'author',
          x: 35,
          y: 500,
          width: 320,
          height: 30,
          text: '作成者: 開発推進本部',
          fontSize: '12pt',
          color: '#334155',
          textAlign: 'left'
        },
        {
          id: 'el-date',
          type: 'date',
          x: 35,
          y: 535,
          width: 320,
          height: 30,
          text: `発行日: ${new Date().toISOString().slice(0, 10)}`,
          fontSize: '11pt',
          color: '#64748b',
          textAlign: 'left'
        }
      ],
      elementStyles: {
        h1: { color: '#1d4ed8', borderBottom: '2px solid #1d4ed8', fontSize: '20pt' },
        h2: { color: '#1e293b', borderLeft: '4px solid #1d4ed8', fontSize: '15pt' },
        body: { color: '#334155', fontSize: '10.5pt', lineHeight: '1.75' },
        codeBlock: { backgroundColor: '#f8fafc', color: '#0f172a' }
      }
    }
  },
  {
    id: 'academic',
    name: '学術・研究報告',
    description: '端正でアカデミックな深紅・フォーマル仕様',
    color: '#831843',
    template: {
      hasCover: true,
      tocSettings: {
        enabled: true,
        title: '目 次 (Contents)',
        levels: 3,
        leaderStyle: 'dots',
        fontSize: '10.5pt',
        color: '#1f2937'
      },
      headerFooter: {
        showHeader: true,
        headerText: 'Research Paper & Technical Review',
        showPageNumber: true,
        pageNumberPosition: 'bottom-right',
        pageNumberFormat: 'number'
      },
      coverElements: [
        {
          id: 'el-title',
          type: 'title',
          x: 35,
          y: 150,
          width: 430,
          height: 80,
          text: '高精度時間跳躍アルゴリズムの研究',
          fontSize: '28pt',
          color: '#831843',
          fontWeight: 'bold',
          textAlign: 'center',
          borderBottom: '2px solid #831843'
        },
        {
          id: 'el-sub',
          type: 'subtitle',
          x: 35,
          y: 245,
          width: 430,
          height: 35,
          text: 'クロノス理論に基づくエネルギー効率の最適化',
          fontSize: '13pt',
          color: '#4b5563',
          textAlign: 'center'
        },
        {
          id: 'el-author',
          type: 'author',
          x: 35,
          y: 500,
          width: 430,
          height: 30,
          text: '先端物理学研究所 Chronos プロジェクトチーム',
          fontSize: '12pt',
          color: '#374151',
          textAlign: 'center'
        },
        {
          id: 'el-date',
          type: 'date',
          x: 35,
          y: 535,
          width: 430,
          height: 30,
          text: `${new Date().getFullYear()}年10月`,
          fontSize: '11pt',
          color: '#6b7280',
          textAlign: 'center'
        }
      ],
      elementStyles: {
        h1: { color: '#831843', borderBottom: '1px solid #831843', fontSize: '18pt' },
        h2: { color: '#374151', borderLeft: '3px solid #831843', fontSize: '14pt' },
        body: { color: '#374151', fontSize: '10pt', lineHeight: '1.8' },
        codeBlock: { backgroundColor: '#fdf2f8', color: '#831843' }
      }
    }
  },
  {
    id: 'modern',
    name: 'モダン・ミニマル',
    description: '装飾を削ぎ落とした洗練された現代的デザイン',
    color: '#0f172a',
    template: {
      hasCover: true,
      tocSettings: {
        enabled: true,
        title: 'INDEX',
        levels: 2,
        leaderStyle: 'none',
        fontSize: '11pt',
        color: '#0f172a'
      },
      headerFooter: {
        showHeader: false,
        showPageNumber: true,
        pageNumberPosition: 'bottom-center',
        pageNumberFormat: 'number'
      },
      coverElements: [
        {
          id: 'el-title',
          type: 'title',
          x: 40,
          y: 220,
          width: 420,
          height: 90,
          text: 'DESIGN SPECIFICATION',
          fontSize: '32pt',
          color: '#0f172a',
          fontWeight: 'bold',
          textAlign: 'left'
        },
        {
          id: 'el-div',
          type: 'divider',
          x: 40,
          y: 315,
          width: 100,
          height: 4,
          borderBottom: '4px solid #0f172a'
        },
        {
          id: 'el-author',
          type: 'author',
          x: 40,
          y: 540,
          width: 250,
          height: 25,
          text: 'DESIGN STUDIO ARCH',
          fontSize: '10pt',
          color: '#64748b',
          textAlign: 'left'
        }
      ],
      elementStyles: {
        h1: { color: '#0f172a', borderBottom: '1px solid #e2e8f0', fontSize: '20pt' },
        h2: { color: '#334155', borderLeft: 'none', fontSize: '15pt' },
        body: { color: '#334155', fontSize: '10.5pt', lineHeight: '1.75' },
        codeBlock: { backgroundColor: '#f1f5f9', color: '#0f172a' }
      }
    }
  },
  {
    id: 'tech',
    name: 'テクノロジー / 仕様書',
    description: 'エメラルドグリーンとダークコードが際立つ技術文書',
    color: '#059669',
    template: {
      hasCover: true,
      tocSettings: {
        enabled: true,
        title: 'Table of Contents',
        levels: 2,
        leaderStyle: 'dashes',
        fontSize: '11pt',
        color: '#065f46'
      },
      headerFooter: {
        showHeader: true,
        headerText: 'System Technical Architecture Guide',
        showPageNumber: true,
        pageNumberPosition: 'bottom-right',
        pageNumberFormat: 'number'
      },
      coverElements: [
        {
          id: 'el-logo',
          type: 'logo',
          x: 40,
          y: 80,
          width: 130,
          height: 45,
          text: '<TECH_CORP/>',
          fontSize: '12pt',
          color: '#059669',
          backgroundColor: '#ecfdf5',
          borderRadius: '6px'
        },
        {
          id: 'el-title',
          type: 'title',
          x: 40,
          y: 150,
          width: 420,
          height: 70,
          text: 'API & データベース設計仕様書',
          fontSize: '28pt',
          color: '#064e3b',
          fontWeight: 'bold',
          textAlign: 'left',
          borderBottom: '3px solid #059669'
        },
        {
          id: 'el-sub',
          type: 'subtitle',
          x: 40,
          y: 230,
          width: 420,
          height: 35,
          text: 'マイクロサービスアーキテクチャ v2.4 リファレンス',
          fontSize: '13pt',
          color: '#047857',
          textAlign: 'left'
        },
        {
          id: 'el-author',
          type: 'author',
          x: 40,
          y: 500,
          width: 320,
          height: 30,
          text: 'コア基盤開発チーム',
          fontSize: '12pt',
          color: '#374151',
          textAlign: 'left'
        },
        {
          id: 'el-date',
          type: 'date',
          x: 40,
          y: 535,
          width: 320,
          height: 30,
          text: 'Status: Production Ready',
          fontSize: '11pt',
          color: '#059669',
          textAlign: 'left'
        }
      ],
      elementStyles: {
        h1: { color: '#047857', borderBottom: '2px solid #059669', fontSize: '20pt' },
        h2: { color: '#065f46', borderLeft: '4px solid #10b981', fontSize: '15pt' },
        body: { color: '#1f2937', fontSize: '10pt', lineHeight: '1.7' },
        codeBlock: { backgroundColor: '#0f172a', color: '#34d399' }
      }
    }
  }
]

const DEFAULT_TEMPLATE: CustomTemplateData = {
  id: 'custom-template-01',
  name: 'マイ・カスタムレポート',
  description: '表紙・目次・本文を自由にカスタマイズできるテンプレート',
  updatedAt: new Date().toISOString().slice(0, 10),
  pageSettings: {
    size: 'A4',
    orientation: 'portrait',
    margin: { top: '20mm', bottom: '20mm', left: '25mm', right: '25mm' },
    backgroundColor: '#ffffff'
  },
  headerFooter: {
    showHeader: true,
    headerText: 'ドキュメントタイトル',
    showPageNumber: true,
    pageNumberPosition: 'bottom-center',
    pageNumberFormat: 'dash'
  },
  hasCover: true,
  coverElements: TEMPLATE_PRESETS[0].template.coverElements || [],
  tocSettings: {
    enabled: true,
    title: '目 次',
    levels: 2,
    leaderStyle: 'dots',
    fontSize: '11pt',
    color: '#1e293b'
  },
  elementStyles: TEMPLATE_PRESETS[0].template.elementStyles || {}
}

interface TemplateStoreState {
  currentTemplate: CustomTemplateData
  selectedElementId: string | null
  activeSection: BuilderSection

  // セクションナビゲーション
  setActiveSection: (section: BuilderSection) => void

  // テンプレート操作
  setTemplate: (template: CustomTemplateData) => void
  updateTemplateMeta: (name: string, description?: string) => void
  applyPreset: (presetId: string) => void
  createNewTemplate: () => void

  // 1. 用紙 & ヘッダーフッター
  updatePageSettings: (settings: Partial<PageSettings>) => void
  updateHeaderFooter: (settings: Partial<HeaderFooterSettings>) => void

  // 2. 表紙
  setHasCover: (hasCover: boolean) => void
  addCoverElement: (type: CoverElementType) => void
  updateCoverElement: (id: string, partial: Partial<CoverElement>) => void
  removeCoverElement: (id: string) => void
  selectElement: (id: string | null) => void

  // 3. 目次
  updateTocSettings: (settings: Partial<TocSettings>) => void

  // 4. 本文
  updateElementStyles: (styles: Partial<ElementStyles>) => void

  // PPTX インポート & テーマ
  importFromPptx: (result: import('../../../shared/types').PptxParseResult) => void
  updateTheme: (theme: Partial<import('../../../shared/types').PptxTheme>) => void
  updateSlotMapping: (id: string, partial: Partial<import('../../../shared/types').PptxSlotMapping>) => void
}




export const useTemplateStore = create<TemplateStoreState>((set) => ({
  currentTemplate: DEFAULT_TEMPLATE,
  selectedElementId: 'el-title',
  activeSection: 'cover',

  setActiveSection: (section) =>
    set({
      activeSection: section,
      selectedElementId: section === 'cover' ? 'el-title' : null
    }),

  setTemplate: (template) =>
    set({
      currentTemplate: {
        ...DEFAULT_TEMPLATE,
        ...template,
        hasCover: template.hasCover !== false,
        tocSettings: template.tocSettings || DEFAULT_TEMPLATE.tocSettings,
        headerFooter: template.headerFooter || DEFAULT_TEMPLATE.headerFooter
      },
      selectedElementId: template.coverElements?.[0]?.id || null
    }),

  updateTemplateMeta: (name, description) =>
    set((state) => ({
      currentTemplate: {
        ...state.currentTemplate,
        name,
        description: description ?? state.currentTemplate.description
      }
    })),

  applyPreset: (presetId) =>
    set((state) => {
      const preset = TEMPLATE_PRESETS.find((p) => p.id === presetId)
      if (!preset) return state
      return {
        currentTemplate: {
          ...state.currentTemplate,
          ...preset.template,
          name: `${preset.name} (カスタム)`,
          updatedAt: new Date().toISOString().slice(0, 10)
        },
        selectedElementId: preset.template.coverElements?.[0]?.id || null
      }
    }),

  createNewTemplate: () => {
    const id = `custom-template-${Date.now().toString(36)}`
    set({
      currentTemplate: {
        ...DEFAULT_TEMPLATE,
        id,
        name: '新規カスタムテンプレート',
        updatedAt: new Date().toISOString().slice(0, 10)
      },
      selectedElementId: 'el-title',
      activeSection: 'cover'
    })
  },

  updatePageSettings: (partialSettings) =>
    set((state) => ({
      currentTemplate: {
        ...state.currentTemplate,
        pageSettings: {
          ...state.currentTemplate.pageSettings,
          ...partialSettings,
          margin: {
            ...state.currentTemplate.pageSettings.margin,
            ...(partialSettings.margin || {})
          }
        }
      }
    })),

  updateHeaderFooter: (partial) =>
    set((state) => ({
      currentTemplate: {
        ...state.currentTemplate,
        headerFooter: {
          ...(state.currentTemplate.headerFooter || DEFAULT_TEMPLATE.headerFooter!),
          ...partial
        }
      }
    })),

  setHasCover: (hasCover) =>
    set((state) => ({
      currentTemplate: {
        ...state.currentTemplate,
        hasCover
      }
    })),

  addCoverElement: (type) =>
    set((state) => {
      const id = `el-${type}-${Date.now().toString(36)}`
      const defaults: Record<CoverElementType, Partial<CoverElement>> = {
        title: {
          text: '新規タイトル',
          width: 400,
          height: 60,
          fontSize: '28pt',
          color: '#0f172a',
          fontWeight: 'bold',
          textAlign: 'left'
        },
        subtitle: {
          text: '新規サブタイトル',
          width: 380,
          height: 40,
          fontSize: '15pt',
          color: '#475569',
          textAlign: 'left'
        },
        author: {
          text: '著者名',
          width: 280,
          height: 30,
          fontSize: '13pt',
          color: '#334155',
          textAlign: 'left'
        },
        date: {
          text: `日付: ${new Date().toISOString().slice(0, 10)}`,
          width: 250,
          height: 28,
          fontSize: '12pt',
          color: '#64748b',
          textAlign: 'left'
        },
        text: {
          text: '任意のテキストブロックをここに入力します。',
          width: 350,
          height: 50,
          fontSize: '11pt',
          color: '#334155',
          textAlign: 'left'
        },
        logo: {
          text: '[ ロゴ画像エリア ]',
          width: 140,
          height: 60,
          fontSize: '11pt',
          color: '#64748b',
          backgroundColor: '#f1f5f9',
          borderRadius: '8px'
        },
        divider: {
          text: '',
          width: 420,
          height: 4,
          borderBottom: '2px solid #2563eb'
        }
      }

      const count = state.currentTemplate.coverElements.length
      const newElement: CoverElement = {
        id,
        type,
        x: 40 + (count % 5) * 10,
        y: 200 + (count % 6) * 30,
        width: 300,
        height: 40,
        ...defaults[type]
      }

      return {
        currentTemplate: {
          ...state.currentTemplate,
          hasCover: true,
          coverElements: [...state.currentTemplate.coverElements, newElement]
        },
        selectedElementId: id,
        activeSection: 'cover'
      }
    }),

  updateCoverElement: (id, partial) =>
    set((state) => ({
      currentTemplate: {
        ...state.currentTemplate,
        coverElements: state.currentTemplate.coverElements.map((el) =>
          el.id === id ? { ...el, ...partial } : el
        )
      }
    })),

  removeCoverElement: (id) =>
    set((state) => ({
      currentTemplate: {
        ...state.currentTemplate,
        coverElements: state.currentTemplate.coverElements.filter((el) => el.id !== id)
      },
      selectedElementId:
        state.selectedElementId === id
          ? state.currentTemplate.coverElements.find((el) => el.id !== id)?.id || null
          : state.selectedElementId
    })),

  selectElement: (id) => set({ selectedElementId: id }),

  updateTocSettings: (partial) =>
    set((state) => ({
      currentTemplate: {
        ...state.currentTemplate,
        tocSettings: {
          ...state.currentTemplate.tocSettings,
          ...partial
        }
      }
    })),

  updateElementStyles: (partial) =>
    set((state) => ({
      currentTemplate: {
        ...state.currentTemplate,
        elementStyles: {
          ...state.currentTemplate.elementStyles,
          ...partial
        }
      }
    })),

  importFromPptx: (result) =>
    set((state) => {
      if (!result.generatedTemplate) return state
      return {
        currentTemplate: {
          ...result.generatedTemplate,
          id: `custom-pptx-${Date.now().toString(36)}`,
          updatedAt: new Date().toISOString().slice(0, 10),
          slotMappings: result.slotMappings
        },
        activeSection: 'cover',
        selectedElementId: result.slotMappings?.[0]?.id || null
      }
    }),

  updateSlotMapping: (id, partial) =>
    set((state) => ({
      currentTemplate: {
        ...state.currentTemplate,
        slotMappings: (state.currentTemplate.slotMappings || []).map((s) =>
          s.id === id ? { ...s, ...partial } : s
        )
      }
    })),

  updateTheme: (themePartial) =>
    set((state) => {
      const currentTheme = state.currentTemplate.theme || {
        primaryColor: '#0f5e5a',
        secondaryColor: '#4f46e5',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        headingFont: 'sans-serif',
        bodyFont: 'sans-serif'
      }
      const updatedTheme = { ...currentTheme, ...themePartial }

      return {
        currentTemplate: {
          ...state.currentTemplate,
          theme: updatedTheme,
          elementStyles: {
            ...state.currentTemplate.elementStyles,
            h1: {
              ...state.currentTemplate.elementStyles.h1,
              color: updatedTheme.primaryColor,
              borderBottom: `2px solid ${updatedTheme.primaryColor}`
            },
            h2: {
              ...state.currentTemplate.elementStyles.h2,
              borderLeft: `4px solid ${updatedTheme.primaryColor}`
            }
          }
        }
      }
    })
}))


