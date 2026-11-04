export type AppMode = 'generator' | 'builder';

export interface PfpdfProgressEvent {
  stage: string;
  message: string;
  timestamp?: number;
}

export interface PdfGenerateResult {
  success: boolean;
  outputPdfPath?: string;
  logs: string[];
  error?: string;
  elapsedMs?: number;
  byteSize?: number;
}

export interface MarkdownFrontMatter {
  title?: string;
  author?: string;
  date?: string;
  template?: string;
  toc?: boolean;
  [key: string]: unknown;
}

export interface MarkdownFileData {
  filePath: string;
  fileName: string;
  content: string;
  body: string;
  frontMatter: MarkdownFrontMatter;
}

export interface PdfGenerateOptions {
  inputPath: string;
  contentOverride?: string;
  outputPath: string;
  template: string;
  toc?: boolean;
  title?: string;
}

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: 'official' | 'custom';
  tags?: string[];
  customTemplatePath?: string;
}

// ==========================================
// Phase 3: テンプレートビルダー用 データ構造
// (要件定義書 5. 仕様モックに完全準拠)
// ==========================================

export type PageSize = 'A4' | 'B5' | 'A5' | 'Letter';
export type PageOrientation = 'portrait' | 'landscape';

export interface PageMargin {
  top: string;
  bottom: string;
  left: string;
  right: string;
}

export interface PageSettings {
  size: PageSize;
  orientation?: PageOrientation;
  margin: PageMargin;
  backgroundColor?: string;
}

export type CoverElementType = 'title' | 'subtitle' | 'author' | 'date' | 'text' | 'logo' | 'divider';

export interface CoverElement {
  id: string;
  type: CoverElementType;
  x: number; // キャンバス上のpx座標 (基準キャンバス幅: 500px)
  y: number; // キャンバス上のpx座標
  width: number;
  height: number;
  text?: string;
  fontSize?: string; // 例: "32pt", "16pt"
  color?: string; // 例: "#333333"
  fontWeight?: 'normal' | '500' | '600' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  borderBottom?: string; // 例: "2px solid #0055A4"
  backgroundColor?: string;
  borderRadius?: string;
}

export interface ElementStyles {
  h1?: {
    color?: string;
    borderBottom?: string;
    fontSize?: string;
  };
  h2?: {
    color?: string;
    borderBottom?: string;
    borderLeft?: string;
    fontSize?: string;
  };
  body?: {
    color?: string;
    fontSize?: string;
    lineHeight?: string;
  };
  codeBlock?: {
    backgroundColor?: string;
    color?: string;
  };
}

export interface TocSettings {
  enabled: boolean; // 目次の有無
  title: string; // 目次タイトル（例: "目次", "Contents"）
  levels: 1 | 2 | 3; // 階層 (H1のみ、H2まで、H3まで)
  leaderStyle: 'dots' | 'dashes' | 'solid' | 'none'; // リーダー線
  fontSize?: string;
  color?: string;
}

export interface HeaderFooterSettings {
  showHeader: boolean;
  headerText?: string;
  showPageNumber: boolean;
  pageNumberPosition?: 'bottom-center' | 'bottom-right' | 'top-right';
  pageNumberFormat?: 'number' | 'dash'; // "1" または "- 1 -"
}

export type MarkdownSlotType = 'title' | 'subtitle' | 'author' | 'date' | 'series' | 'confidential' | 'none';

export interface PptxSlotMapping {
  id: string;
  originalText: string;
  slot: MarkdownSlotType;
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
  widthPercent: number; // 0 - 100
  heightPercent: number; // 0 - 100
  fontSizePt?: number;
  color?: string;
  backgroundColor?: string;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  isShape?: boolean; // 図形（帯など）
  imageDataUrl?: string; // 画像（ロゴ等）
}

export interface PptxParsedElement {
  id: string;
  type: 'title' | 'subtitle' | 'author' | 'date' | 'org' | 'shape' | 'image' | 'text';
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
  widthPercent: number; // 0 - 100
  heightPercent: number; // 0 - 100
  text?: string;
  fontSizePt?: number;
  color?: string;
  backgroundColor?: string;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  imageDataUrl?: string; // Base64 Data URL for images
}

export interface PptxTheme {
  primaryColor: string; // アクセント色（見出しライン、リンク等）
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
}

export interface PptxParseResult {
  success: boolean;
  error?: string;
  fileName?: string;
  slideWidthEmu: number;
  slideHeightEmu: number;
  pageSize: PageSize;
  orientation: PageOrientation;
  theme: PptxTheme;
  coverElements: PptxParsedElement[];
  slotMappings: PptxSlotMapping[];
  slideCount?: number;
  generatedTemplate?: CustomTemplateData;
}

export interface CustomTemplateData {
  id: string;
  name: string;
  description?: string;
  updatedAt?: string;
  sourcePptx?: string; // PPTXファイル名（あれば）

  // PPTX スロットマッピング (Markdown置換設定)
  slotMappings?: PptxSlotMapping[];

  // 1. 全体用紙設定
  pageSettings: PageSettings;

  headerFooter?: HeaderFooterSettings;

  // 2. 表紙設定
  hasCover: boolean;
  coverElements: CoverElement[];
  pptxCoverElements?: PptxParsedElement[]; // PPTXから抽出された高度な要素

  // 3. 目次設定
  tocSettings: TocSettings;

  // 4. 本文スタイル設定
  elementStyles: ElementStyles;
  theme?: PptxTheme;
}

export interface PfpdfAPI {
  testDummyPdf: () => Promise<PdfGenerateResult>;
  onProgress: (callback: (event: PfpdfProgressEvent) => void) => () => void;
  selectMarkdownFile: () => Promise<MarkdownFileData | null>;
  readMarkdownFile: (filePath: string) => Promise<MarkdownFileData>;
  selectPdfSavePath: (defaultFileName?: string) => Promise<string | null>;
  generatePdf: (options: PdfGenerateOptions) => Promise<PdfGenerateResult>;
  openPdf: (filePath: string) => Promise<boolean>;
  showInFolder: (filePath: string) => Promise<void>;
  getOfficialTemplates: () => Promise<TemplateInfo[]>;
  getPathForFile: (file: File) => string;
  parseMarkdownContent: (content: string, fileName: string, filePath?: string) => Promise<MarkdownFileData>;
  saveMarkdownFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  selectMarkdownSavePath: (defaultFileName?: string) => Promise<string | null>;

  // テンプレート関連 API
  getCustomTemplates: () => Promise<CustomTemplateData[]>;
  saveCustomTemplate: (template: CustomTemplateData) => Promise<{ success: boolean; error?: string; cssPath?: string }>;
  deleteCustomTemplate: (templateId: string) => Promise<{ success: boolean; error?: string }>;

  // PPTX連携 API
  selectPptxFile: () => Promise<PptxParseResult | null>;
  parsePptxFile: (filePath: string) => Promise<PptxParseResult>;
  parsePptxBuffer: (buffer: ArrayBuffer, fileName: string) => Promise<PptxParseResult>;
  exportPptxSample: (sampleType?: 'business' | 'tech' | 'academic') => Promise<{ success: boolean; filePath?: string; error?: string }>;

  // 数式 (MathJax) & Mermaid リアルタイムプレビューレンダリング API
  renderPreviewBatch?: (req: {
    mathItems: Array<{ id: string; tex: string; display: boolean }>;
    mermaidItems: Array<{ id: string; source: string }>;
  }) => Promise<{
    mathResults: Record<string, string>;
    mermaidResults: Record<string, string>;
  }>;

  // ウィンドウ終了・未保存ガード API
  onRequestClose?: (callback: () => void) => () => void;
  forceCloseApp?: () => void;
}

