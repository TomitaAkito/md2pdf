const pptxgen = require('pptxgenjs');
const fs = require('fs');

async function testPptxGen() {
  console.log("Testing pptxgenjs generation...");
  const pptx = new pptxgen();

  // A4縦サイズ (8.27 x 11.69 インチ)
  pptx.defineLayout({ name: 'A4_PORTRAIT', width: 8.27, height: 11.69 });
  pptx.layout = 'A4_PORTRAIT';

  // ==========================================
  // スライド 1: 表紙 (Cover)
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: 'FFFFFF' };

  // トップのアクセント帯 (Accent Bar)
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.2,
    w: 1.4,
    h: 0.08,
    fill: { color: '0F5E5A' },
    line: { color: '0F5E5A', width: 0 }
  });

  // ドキュメントタイトル (Title)
  slide1.addText('機械学習システム設計ガイド\n{{title}}', {
    x: 0.8,
    y: 3.2,
    w: 6.6,
    h: 1.8,
    fontSize: 28,
    bold: true,
    color: '0F5E5A',
    fontFace: 'Noto Sans JP',
    valign: 'top',
    align: 'left'
  });

  // サブタイトル (Subtitle)
  slide1.addText('実用的なアーキテクチャパターンとベストプラクティス\n{{subtitle}}', {
    x: 0.8,
    y: 5.2,
    w: 6.6,
    h: 1.2,
    fontSize: 14,
    color: '4B5563',
    fontFace: 'Noto Sans JP',
    valign: 'top',
    align: 'left'
  });

  // 著者情報 (Author)
  slide1.addText('著者: 開発推進研究グループ\n{{author}}', {
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

  // 日付 (Date)
  slide1.addText('日付: 2026年10月\n{{date}}', {
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
  // スライド 2: 目次見本 (TOC)
  // ==========================================
  const slide2 = pptx.addSlide();
  slide2.background = { color: 'FFFFFF' };

  slide2.addText('目 次', {
    x: 0.8,
    y: 1.0,
    w: 6.6,
    h: 0.6,
    fontSize: 20,
    bold: true,
    color: '0F5E5A',
    fontFace: 'Noto Sans JP'
  });

  slide2.addShape(pptx.ShapeType.line, {
    x: 0.8,
    y: 1.7,
    w: 6.6,
    h: 0,
    line: { color: '0F5E5A', width: 2 }
  });

  slide2.addText('1. はじめに・システム概要 ................................... 1\n  1.1 開発目標と背景 ..................................... 2\n2. アーキテクチャ設計 ....................................... 3\n  2.1 コンポーネント構成 ................................. 5\n3. まとめと今後の課題 ....................................... 8', {
    x: 0.8,
    y: 2.2,
    w: 6.6,
    h: 4.0,
    fontSize: 11,
    color: '374151',
    fontFace: 'Noto Sans JP',
    lineSpacing: 24
  });

  // ==========================================
  // スライド 3: 本文スタイル見本 (Body)
  // ==========================================
  const slide3 = pptx.addSlide();
  slide3.background = { color: 'FFFFFF' };

  slide3.addText('1. はじめに・システム概要 (H1見出し見本)', {
    x: 0.8,
    y: 1.0,
    w: 6.6,
    h: 0.6,
    fontSize: 18,
    bold: true,
    color: '0F5E5A',
    fontFace: 'Noto Sans JP'
  });

  slide3.addShape(pptx.ShapeType.line, {
    x: 0.8,
    y: 1.6,
    w: 6.6,
    h: 0,
    line: { color: '0F5E5A', width: 1.5 }
  });

  slide3.addText('本文テキストのプレースホルダーです。Markdownを流し込むと、このフォントとカラーテーマが自動的に適用されます。', {
    x: 0.8,
    y: 2.0,
    w: 6.6,
    h: 1.5,
    fontSize: 10.5,
    color: '1F2937',
    fontFace: 'Noto Sans JP'
  });

  const outPath = 'scratch/perfect_sample.pptx';
  await pptx.writeFile({ fileName: outPath });
  console.log('Successfully written perfect PPTX to:', outPath);
}

testPptxGen().catch(console.error);
