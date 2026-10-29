import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';
import {
  PptxParseResult,
  PptxParsedElement,
  PptxSlotMapping,
  MarkdownSlotType,
  PptxTheme,
  CustomTemplateData,
  PageSize,
  PageOrientation
} from '../shared/types';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
});

function hexColor(raw: string | undefined, defaultColor: string): string {
  if (!raw) return defaultColor;
  const cleaned = raw.replace('#', '').trim();
  if (cleaned.length === 6) return `#${cleaned}`;
  if (cleaned.length === 8) return `#${cleaned.substring(2)}`; // ARGB
  return defaultColor;
}

export async function parsePptxBuffer(buffer: Buffer | ArrayBuffer, fileName: string = 'slide.pptx'): Promise<PptxParseResult> {
  try {
    const zip = await JSZip.loadAsync(buffer);

    // 1. スライド枚数の確認
    const slideEntries = Object.keys(zip.files).filter((k) => k.match(/^ppt\/slides\/slide\d+\.xml$/));
    const slideCount = slideEntries.length || 1;

    // 2. スライドサイズ解析 (ppt/presentation.xml)
    let slideWidthEmu = 7560000; // デフォルト A4縦
    let slideHeightEmu = 10692000;
    let pageSize: PageSize = 'A4';
    let orientation: PageOrientation = 'portrait';

    const presFile = zip.file('ppt/presentation.xml');
    if (presFile) {
      const presXml = await presFile.async('text');
      const presObj = xmlParser.parse(presXml);
      const sldSz = presObj?.['p:presentation']?.['p:sldSz'];
      if (sldSz) {
        slideWidthEmu = parseInt(sldSz['@_cx'] || '7560000', 10);
        slideHeightEmu = parseInt(sldSz['@_cy'] || '10692000', 10);
        orientation = slideWidthEmu > slideHeightEmu ? 'landscape' : 'portrait';
      }
    }

    // 3. テーマ解析 (ppt/theme/theme1.xml)
    const theme: PptxTheme = {
      primaryColor: '#0f5e5a', // デフォルト: PFN風ターコイズ/ディープティール
      secondaryColor: '#4f46e5',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      headingFont: 'Noto Sans JP, sans-serif',
      bodyFont: 'Noto Sans JP, sans-serif'
    };

    const themeFile = zip.file('ppt/theme/theme1.xml');
    if (themeFile) {
      const themeXml = await themeFile.async('text');
      const themeObj = xmlParser.parse(themeXml);
      const clrScheme = themeObj?.['a:theme']?.['a:themeElements']?.['a:clrScheme'];
      if (clrScheme) {
        const acc1 = clrScheme['a:accent1']?.['a:srgbClr']?.['@_val'];
        if (acc1) theme.primaryColor = hexColor(acc1, theme.primaryColor);

        const acc2 = clrScheme['a:accent2']?.['a:srgbClr']?.['@_val'];
        if (acc2) theme.secondaryColor = hexColor(acc2, theme.secondaryColor);

        const dk1 = clrScheme['a:dk1']?.['a:srgbClr']?.['@_val'] || clrScheme['a:dk1']?.['a:sysClr']?.['@_lastClr'];
        if (dk1) theme.textColor = hexColor(dk1, theme.textColor);

        const lt1 = clrScheme['a:lt1']?.['a:srgbClr']?.['@_val'] || clrScheme['a:lt1']?.['a:sysClr']?.['@_lastClr'];
        if (lt1) theme.backgroundColor = hexColor(lt1, theme.backgroundColor);
      }

      const fontScheme = themeObj?.['a:theme']?.['a:themeElements']?.['a:fontScheme'];
      if (fontScheme) {
        const majorLatin = fontScheme['a:majorFont']?.['a:latin']?.['@_typeface'];
        const majorEa = fontScheme['a:majorFont']?.['a:ea']?.['@_typeface'];
        if (majorEa || majorLatin) {
          theme.headingFont = `${majorEa || majorLatin}, sans-serif`;
        }

        const minorLatin = fontScheme['a:minorFont']?.['a:latin']?.['@_typeface'];
        const minorEa = fontScheme['a:minorFont']?.['a:ea']?.['@_typeface'];
        if (minorEa || minorLatin) {
          theme.bodyFont = `${minorEa || minorLatin}, sans-serif`;
        }
      }
    }

    // 4. リレーション解析 (ppt/slides/_rels/slide1.xml.rels)
    const relsMap: Record<string, string> = {};
    const relsFile = zip.file('ppt/slides/_rels/slide1.xml.rels');
    if (relsFile) {
      const relsXml = await relsFile.async('text');
      const relsObj = xmlParser.parse(relsXml);
      const relList = relsObj?.['Relationships']?.['Relationship'];
      if (Array.isArray(relList)) {
        for (const r of relList) {
          relsMap[r['@_Id']] = r['@_Target'];
        }
      } else if (relList) {
        relsMap[relList['@_Id']] = relList['@_Target'];
      }
    }

    // 5. スライド1（表紙スライド）のシェイプ解析
    const coverElements: PptxParsedElement[] = [];
    const slotMappings: PptxSlotMapping[] = [];

    const slide1File = zip.file('ppt/slides/slide1.xml');
    if (slide1File) {
      const slide1Xml = await slide1File.async('text');
      const slideObj = xmlParser.parse(slide1Xml);
      const spTree = slideObj?.['p:sld']?.['p:cSld']?.['p:spTree'];

      // シェイプ一覧 (<p:sp>)
      let rawShapes = spTree?.['p:sp'];
      if (rawShapes && !Array.isArray(rawShapes)) rawShapes = [rawShapes];
      if (Array.isArray(rawShapes)) {
        for (let i = 0; i < rawShapes.length; i++) {
          const sp = rawShapes[i];
          const xfrm = sp['p:spPr']?.['a:xfrm'];
          if (!xfrm) continue;

          const offX = parseInt(xfrm['a:off']?.['@_x'] || '0', 10);
          const offY = parseInt(xfrm['a:off']?.['@_y'] || '0', 10);
          const extCx = parseInt(xfrm['a:ext']?.['@_cx'] || '0', 10);
          const extCy = parseInt(xfrm['a:ext']?.['@_cy'] || '0', 10);

          const xPercent = Math.max(0, Math.min(100, (offX / slideWidthEmu) * 100));
          const yPercent = Math.max(0, Math.min(100, (offY / slideHeightEmu) * 100));
          const widthPercent = Math.max(1, Math.min(100, (extCx / slideWidthEmu) * 100));
          const heightPercent = Math.max(0.5, Math.min(100, (extCy / slideHeightEmu) * 100));

          // 塗りつぶし色
          let bgColor: string | undefined = undefined;
          const solidFill = sp['p:spPr']?.['a:solidFill'];
          if (solidFill?.['a:srgbClr']?.['@_val']) {
            bgColor = hexColor(solidFill['a:srgbClr']['@_val'], theme.primaryColor);
          } else if (solidFill?.['a:schemeClr']?.['@_val'] === 'accent1') {
            bgColor = theme.primaryColor;
          }

          // テキスト情報
          const txBody = sp['p:txBody'];
          if (txBody) {
            let paragraphs = txBody['a:p'];
            if (paragraphs && !Array.isArray(paragraphs)) paragraphs = [paragraphs];

            let fullText = '';
            let fontSizePt = 16;
            let textColor = theme.textColor;
            let textAlign: 'left' | 'center' | 'right' = 'left';
            let isBold = false;

            if (Array.isArray(paragraphs)) {
              for (const p of paragraphs) {
                const algn = p['a:pPr']?.['@_algn'];
                if (algn === 'ctr') textAlign = 'center';
                else if (algn === 'r') textAlign = 'right';

                let runs = p['a:r'];
                if (runs && !Array.isArray(runs)) runs = [runs];
                if (Array.isArray(runs)) {
                  for (const r of runs) {
                    const t = r['a:t'];
                    if (t) fullText += (fullText ? '\n' : '') + String(t);

                    const rPr = r['a:rPr'];
                    if (rPr) {
                      if (rPr['@_sz']) {
                        fontSizePt = Math.round(parseInt(rPr['@_sz'], 10) / 100);
                      }
                      if (rPr['@_b'] === '1' || rPr['@_b'] === 'true') {
                        isBold = true;
                      }
                      const runFill = rPr['a:solidFill']?.['a:srgbClr']?.['@_val'];
                      if (runFill) textColor = hexColor(runFill, textColor);
                    }
                  }
                }
              }
            }

            fullText = fullText.trim();
            if (fullText) {
              // Markdown Front Matter スロットの自動判定
              let slot: MarkdownSlotType = 'none';
              const lower = fullText.toLowerCase();

              if (lower.includes('{{title}}') || lower.includes('タイトル') || fontSizePt >= 26) {
                slot = 'title';
              } else if (lower.includes('{{subtitle}}') || lower.includes('サブタイトル') || (fontSizePt >= 16 && fontSizePt < 26 && yPercent > 20)) {
                slot = 'subtitle';
              } else if (lower.includes('{{author}}') || lower.includes('著者') || lower.includes('作成') || lower.includes('author') || (yPercent >= 65 && !fullText.match(/\d{4}/))) {
                slot = 'author';
              } else if (lower.includes('{{date}}') || fullText.match(/20\d{2}[-/.年]/) || lower.includes('date')) {
                slot = 'date';
              } else if (lower.includes('{{series}}') || lower.includes('シリーズ') || lower.includes('volume') || lower.includes('vol.')) {
                slot = 'series';
              } else if (lower.includes('{{confidential}}') || lower.includes('社外秘') || lower.includes('confidential')) {
                slot = 'confidential';
              }

              const elemId = `elem-${i}-${Date.now()}`;
              const element: PptxParsedElement = {
                id: elemId,
                type: slot === 'title' ? 'title' : slot === 'subtitle' ? 'subtitle' : slot === 'author' ? 'author' : slot === 'date' ? 'date' : 'text',
                xPercent,
                yPercent,
                widthPercent,
                heightPercent,
                text: fullText,
                fontSizePt,
                color: textColor,
                backgroundColor: bgColor,
                fontWeight: isBold ? 'bold' : 'normal',
                textAlign
              };
              coverElements.push(element);

              slotMappings.push({
                id: elemId,
                originalText: fullText,
                slot,
                xPercent,
                yPercent,
                widthPercent,
                heightPercent,
                fontSizePt,
                color: textColor,
                backgroundColor: bgColor,
                fontWeight: isBold ? 'bold' : 'normal',
                textAlign
              });
              continue;
            }
          }

          // テキストなしの図形（帯やアクセントブロック）
          if (bgColor) {
            const shapeId = `shape-${i}-${Date.now()}`;
            coverElements.push({
              id: shapeId,
              type: 'shape',
              xPercent,
              yPercent,
              widthPercent,
              heightPercent,
              backgroundColor: bgColor
            });

            slotMappings.push({
              id: shapeId,
              originalText: '',
              slot: 'none',
              isShape: true,
              xPercent,
              yPercent,
              widthPercent,
              heightPercent,
              backgroundColor: bgColor
            });
          }
        }
      }

      // 画像の取得 (<p:pic>)
      let rawPics = spTree?.['p:pic'];
      if (rawPics && !Array.isArray(rawPics)) rawPics = [rawPics];
      if (Array.isArray(rawPics)) {
        for (let j = 0; j < rawPics.length; j++) {
          const pic = rawPics[j];
          const xfrm = pic['p:spPr']?.['a:xfrm'];
          if (!xfrm) continue;

          const offX = parseInt(xfrm['a:off']?.['@_x'] || '0', 10);
          const offY = parseInt(xfrm['a:off']?.['@_y'] || '0', 10);
          const extCx = parseInt(xfrm['a:ext']?.['@_cx'] || '0', 10);
          const extCy = parseInt(xfrm['a:ext']?.['@_cy'] || '0', 10);

          const xPercent = Math.max(0, Math.min(100, (offX / slideWidthEmu) * 100));
          const yPercent = Math.max(0, Math.min(100, (offY / slideHeightEmu) * 100));
          const widthPercent = Math.max(1, Math.min(100, (extCx / slideWidthEmu) * 100));
          const heightPercent = Math.max(1, Math.min(100, (extCy / slideHeightEmu) * 100));

          // リレーションから画像ファイルを解決
          const embedId = pic['p:blipFill']?.['a:blip']?.['@_r:embed'];
          let imageDataUrl: string | undefined = undefined;

          if (embedId && relsMap[embedId]) {
            const targetPath = relsMap[embedId].replace(/^\.\.\//, 'ppt/');
            const imageFile = zip.file(targetPath);
            if (imageFile) {
              const mime = targetPath.endsWith('.png') ? 'image/png' : targetPath.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg';
              const base64Data = await imageFile.async('base64');
              imageDataUrl = `data:${mime};base64,${base64Data}`;
            }
          }

          const picId = `pic-${j}-${Date.now()}`;
          coverElements.push({
            id: picId,
            type: 'image',
            xPercent,
            yPercent,
            widthPercent,
            heightPercent,
            imageDataUrl
          });

          slotMappings.push({
            id: picId,
            originalText: '',
            slot: 'none',
            xPercent,
            yPercent,
            widthPercent,
            heightPercent,
            imageDataUrl
          });
        }
      }
    }

    // 6. CustomTemplateData の自動生成
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const generatedTemplate: CustomTemplateData = {
      id: `custom-pptx-${Date.now()}`,
      name: `${baseName} (PPTX)`,
      description: `PowerPoint「${fileName}」から自動インポートされたテンプレート`,
      updatedAt: new Date().toISOString(),
      sourcePptx: fileName,
      slotMappings,
      pageSettings: {
        size: pageSize,
        orientation,
        margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
        backgroundColor: theme.backgroundColor
      },
      headerFooter: {
        showHeader: true,
        headerText: '',
        showPageNumber: true,
        pageNumberPosition: 'bottom-center',
        pageNumberFormat: 'number'
      },
      hasCover: true,
      coverElements: [],
      pptxCoverElements: coverElements,
      tocSettings: {
        enabled: true,
        title: '目次',
        levels: 2,
        leaderStyle: 'dots',
        color: theme.primaryColor
      },
      elementStyles: {
        h1: {
          color: theme.primaryColor,
          borderBottom: `2px solid ${theme.primaryColor}`,
          fontSize: '20pt'
        },
        h2: {
          color: theme.textColor,
          borderLeft: `4px solid ${theme.primaryColor}`,
          fontSize: '14pt'
        },
        body: {
          color: theme.textColor,
          fontSize: '10.5pt',
          lineHeight: '1.75'
        },
        codeBlock: {
          backgroundColor: '#f8fafc',
          color: '#1e293b'
        }
      },
      theme
    };

    return {
      success: true,
      fileName,
      slideCount,
      slideWidthEmu,
      slideHeightEmu,
      pageSize,
      orientation,
      theme,
      coverElements,
      slotMappings,
      generatedTemplate
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Failed to parse PPTX:', err);
    return {
      success: false,
      error: `PowerPointファイルの解析に失敗しました: ${errorMsg}`,
      slideWidthEmu: 7560000,
      slideHeightEmu: 10692000,
      pageSize: 'A4',
      orientation: 'portrait',
      theme: {
        primaryColor: '#0f5e5a',
        secondaryColor: '#4f46e5',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        headingFont: 'sans-serif',
        bodyFont: 'sans-serif'
      },
      coverElements: [],
      slotMappings: []
    };
  }
}

export async function parsePptxFile(filePath: string): Promise<PptxParseResult> {
  const buffer = await fs.promises.readFile(filePath);
  const pathParts = filePath.split(/[/\\]/);
  const fileName = pathParts[pathParts.length - 1] || 'slide.pptx';
  return parsePptxBuffer(buffer, fileName);
}
