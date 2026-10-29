import pptxgen from 'pptxgenjs';

export interface SamplePptxConfig {
  sampleType: 'business' | 'tech' | 'academic';
  title: string;
  subtitle: string;
  author: string;
  date: string;
  primaryColor: string; // HEX (e.g. '0F5E5A')
  secondaryColor: string;
}

export async function exportSamplePptxFile(
  savePath: string,
  sampleType: 'business' | 'tech' | 'academic' = 'business'
): Promise<void> {
  const pptx = new pptxgen();

  // A4縦サイズ (8.27 x 11.69 インチ)
  pptx.defineLayout({ name: 'A4_PORTRAIT', width: 8.27, height: 11.69 });
  pptx.layout = 'A4_PORTRAIT';

  let primaryColor = '0F5E5A'; // PFN Teal
  let title = '機械学習システム設計ガイド\n{{title}}';
  let subtitle = '実用的なアーキテクチャパターンとベストプラクティス\n{{subtitle}}';
  let author = '著者: Preferred Research Team\n{{author}}';
  let date = '日付: 2026年10月\n{{date}}';

  if (sampleType === 'tech') {
    primaryColor = '1D4ED8'; // Blue
    title = 'API & マイクロサービス設計仕様書\n{{title}}';
    subtitle = 'コア基盤システムアーキテクチャ・エンドポイントリファレンス\n{{subtitle}}';
    author = '著者: コア技術推進本部\n{{author}}';
    date = 'ステータス: Production Ready\n{{date}}';
  } else if (sampleType === 'academic') {
    primaryColor = '1E293B'; // Dark Slate
    title = 'クロノス時間跳躍アルゴリズムの実証評価\n{{title}}';
    subtitle = '超高密度量子アニーリングによる最適化アプローチの考察\n{{subtitle}}';
    author = '著者: 先端数理科学研究所\n{{author}}';
    date = '発行: 2026年10月\n{{date}}';
  }

  // ==========================================
  // スライド 1: 表紙 (Cover Slide)
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: 'FFFFFF' };

  // 装飾アクセント帯 (Accent Bar)
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.2,
    w: 1.5,
    h: 0.08,
    fill: { color: primaryColor },
    line: { color: primaryColor, width: 0 }
  });

  // ドキュメントタイトル (Title Slot)
  slide1.addText(title, {
    x: 0.8,
    y: 3.0,
    w: 6.6,
    h: 1.8,
    fontSize: 28,
    bold: true,
    color: primaryColor,
    fontFace: 'Noto Sans JP',
    valign: 'top',
    align: 'left'
  });

  // サブタイトル (Subtitle Slot)
  slide1.addText(subtitle, {
    x: 0.8,
    y: 5.0,
    w: 6.6,
    h: 1.2,
    fontSize: 14,
    color: '4B5563',
    fontFace: 'Noto Sans JP',
    valign: 'top',
    align: 'left'
  });

  // 著者情報 (Author Slot)
  slide1.addText(author, {
    x: 0.8,
    y: 9.0,
    w: 6.6,
    h: 0.5,
    fontSize: 12,
    bold: true,
    color: '1F2937',
    fontFace: 'Noto Sans JP',
    align: 'left'
  });

  // 日付 (Date Slot)
  slide1.addText(date, {
    x: 0.8,
    y: 9.6,
    w: 6.6,
    h: 0.5,
    fontSize: 11,
    color: '6B7280',
    fontFace: 'Noto Sans JP',
    align: 'left'
  });

  // ==========================================
  // スライド 2: 目次見本 (TOC Slide)
  // ==========================================
  const slide2 = pptx.addSlide();
  slide2.background = { color: 'FFFFFF' };

  slide2.addText('目 次 (Contents)', {
    x: 0.8,
    y: 1.0,
    w: 6.6,
    h: 0.6,
    fontSize: 20,
    bold: true,
    color: primaryColor,
    fontFace: 'Noto Sans JP'
  });

  slide2.addShape(pptx.ShapeType.line, {
    x: 0.8,
    y: 1.7,
    w: 6.6,
    h: 0,
    line: { color: primaryColor, width: 2 }
  });

  slide2.addText(
    '1. はじめに・システム設計目標 ...................................... 1\n   1.1 開発背景と対象ユーザー ..................................... 2\n2. アーキテクチャ概要 .............................................. 3\n   2.1 コンポーネント構成とデータフロー ........................... 5\n3. 実装詳細とAPI仕様 ............................................... 7\n4. まとめ・今後の展開 ............................................. 10',
    {
      x: 0.8,
      y: 2.2,
      w: 6.6,
      h: 4.5,
      fontSize: 11,
      color: '374151',
      fontFace: 'Noto Sans JP',
      lineSpacing: 22
    }
  );

  // ==========================================
  // スライド 3: 本文スタイル見本 (Body Slide)
  // ==========================================
  const slide3 = pptx.addSlide();
  slide3.background = { color: 'FFFFFF' };

  slide3.addText('1. はじめに・システム設計目標 (見出しH1)', {
    x: 0.8,
    y: 1.0,
    w: 6.6,
    h: 0.6,
    fontSize: 18,
    bold: true,
    color: primaryColor,
    fontFace: 'Noto Sans JP'
  });

  slide3.addShape(pptx.ShapeType.line, {
    x: 0.8,
    y: 1.6,
    w: 6.6,
    h: 0,
    line: { color: primaryColor, width: 1.5 }
  });

  slide3.addText(
    '本文テキストのプレースホルダーです。Markdownファイルを流し込むと、このフォントとカラーテーマが自動的に適用されて出版品質の組版PDFが生成されます。\n\nPowerPointで自由に図形やロゴを追加し、保存してアプリにドロップしてください。',
    {
      x: 0.8,
      y: 2.0,
      w: 6.6,
      h: 2.0,
      fontSize: 10.5,
      color: '1F2937',
      fontFace: 'Noto Sans JP',
      lineSpacing: 18
    }
  );

  await pptx.writeFile({ fileName: savePath });
}
