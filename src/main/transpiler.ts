import { CustomTemplateData } from '../shared/types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * CustomTemplateData から pfpdf ネイティブのテンプレートディレクトリを生成する
 */
export async function saveTemplateAsNativeDir(
  template: CustomTemplateData,
  templatesBaseDir: string,
  appPath: string
): Promise<string> {
  const templateDir = path.join(templatesBaseDir, template.id);
  await fs.promises.mkdir(templateDir, { recursive: true });

  // 1. 共通 CSS (common.css, common-vivliostyle.css) を templatesBaseDir にコピー
  const officialTemplatesDir = path.join(
    appPath,
    'node_modules/@pfnet-research/pfpdf/resources/templates'
  );

  try {
    const commonCssSrc = path.join(officialTemplatesDir, 'common.css');
    const commonVivlioSrc = path.join(officialTemplatesDir, 'common-vivliostyle.css');
    const commonCssDst = path.join(templatesBaseDir, 'common.css');
    const commonVivlioDst = path.join(templatesBaseDir, 'common-vivliostyle.css');

    if (fs.existsSync(commonCssSrc) && !fs.existsSync(commonCssDst)) {
      await fs.promises.copyFile(commonCssSrc, commonCssDst);
    }
    if (fs.existsSync(commonVivlioSrc) && !fs.existsSync(commonVivlioDst)) {
      await fs.promises.copyFile(commonVivlioSrc, commonVivlioDst);
    }
  } catch (e) {
    console.error('Failed to copy common css:', e);
  }

  // 2. 表紙 HTML スロット生成 (PPTX スロットマッピングから展開)
  let coverHtmlContent = '';
  const slots = template.slotMappings || [];

  if (slots.length > 0) {
    slots.forEach((s) => {
      const posStyle = `position: absolute; left: ${s.xPercent}%; top: ${s.yPercent}%; width: ${s.widthPercent}%; min-height: ${s.heightPercent}%;`;
      const fontStyle = `font-size: ${s.fontSizePt ? `${s.fontSizePt}pt` : 'inherit'}; color: ${s.color || 'inherit'}; font-weight: ${s.fontWeight || 'normal'}; text-align: ${s.textAlign || 'left'};`;
      const bgStyle = s.backgroundColor ? `background-color: ${s.backgroundColor};` : '';

      if (s.isShape) {
        coverHtmlContent += `      <div class="pptx-shape" style="${posStyle} height: ${s.heightPercent}%; ${bgStyle} border-radius: 2px;"></div>\n`;
      } else if (s.imageDataUrl) {
        coverHtmlContent += `      <img src="${s.imageDataUrl}" alt="logo" class="pptx-image" style="${posStyle} height: ${s.heightPercent}%; object-fit: contain;" />\n`;
      } else if (s.slot === 'title') {
        coverHtmlContent += `      <h1 data-pfpdf-slot="title" class="pfpdf-cover-title pptx-slot-title" style="${posStyle} ${fontStyle} ${bgStyle}">${s.originalText}</h1>\n`;
      } else if (s.slot === 'subtitle') {
        coverHtmlContent += `      <p data-pfpdf-slot="subtitle" class="pfpdf-cover-subtitle pptx-slot-subtitle" style="${posStyle} ${fontStyle} ${bgStyle}">${s.originalText}</p>\n`;
      } else if (s.slot === 'author') {
        coverHtmlContent += `      <p data-pfpdf-slot="author" class="pfpdf-cover-author pptx-slot-author" style="${posStyle} ${fontStyle} ${bgStyle}">${s.originalText}</p>\n`;
      } else if (s.slot === 'date') {
        coverHtmlContent += `      <p data-pfpdf-slot="date" class="pfpdf-cover-date pptx-slot-date" style="${posStyle} ${fontStyle} ${bgStyle}">${s.originalText}</p>\n`;
      } else if (s.slot === 'series') {
        coverHtmlContent += `      <p data-pfpdf-slot="series" class="pfpdf-cover-series pptx-slot-series" style="${posStyle} ${fontStyle} ${bgStyle}">${s.originalText}</p>\n`;
      } else if (s.slot === 'confidential') {
        coverHtmlContent += `      <p data-pfpdf-slot="confidential" class="pfpdf-cover-confidential pptx-slot-confidential" style="${posStyle} ${fontStyle} ${bgStyle}">${s.originalText}</p>\n`;
      } else {
        // 固定テキスト
        coverHtmlContent += `      <div class="pptx-fixed-text" style="${posStyle} ${fontStyle} ${bgStyle}">${s.originalText}</div>\n`;
      }
    });
  } else {
    // デフォルトフォールバック
    coverHtmlContent = `      <div class="custom-cover-accent-bar"></div>
      <h1 data-pfpdf-slot="title" class="pfpdf-cover-title"></h1>
      <p data-pfpdf-slot="series" class="pfpdf-cover-series"></p>
      <p data-pfpdf-slot="author" class="pfpdf-cover-author"></p>
      <p data-pfpdf-slot="date" class="pfpdf-cover-date"></p>`;
  }

  // 3. template.html
  const hasCover = template.hasCover !== false;
  const templateHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <title></title>
  </head>
  <body>
    ${
      hasCover
        ? `<header class="pfpdf-cover">
${coverHtmlContent}
    </header>`
        : ''
    }
    ${template.tocSettings.enabled ? `<div data-pfpdf-slot="toc" class="pfpdf-toc-container"></div>` : ''}
    <main data-pfpdf-slot="content" class="pfpdf-content"></main>
  </body>
</html>`;
  await fs.promises.writeFile(path.join(templateDir, 'template.html'), templateHtml, 'utf-8');

  // 4. style.css の生成
  const primary = template.theme?.primaryColor || template.elementStyles.h1?.color || '#0f5e5a';
  const textColor = template.theme?.textColor || template.elementStyles.body?.color || '#1f2937';
  const bgColor = template.theme?.backgroundColor || template.pageSettings.backgroundColor || '#ffffff';
  const headingFont = template.theme?.headingFont || "'Noto Sans JP', 'Hiragino Sans', sans-serif";
  const bodyFont = template.theme?.bodyFont || "'Noto Sans JP', 'Hiragino Sans', sans-serif";

  let baseStyleCss = '';
  try {
    const defaultStyleSrc = path.join(officialTemplatesDir, 'default', 'style.css');
    if (fs.existsSync(defaultStyleSrc)) {
      baseStyleCss = await fs.promises.readFile(defaultStyleSrc, 'utf-8');
    }
  } catch {}

  const styleCss = `${baseStyleCss}

/* ============================================================
   pfpdf-studio Custom Overrides (from PPTX)
   Template: ${template.name}
============================================================ */

:root {
  --color-primary: ${primary};
  --color-text: ${textColor};
  --color-bg: ${bgColor};
  --font-heading: ${headingFont};
  --font-body: ${bodyFont};
}

body {
  font-family: var(--font-body);
  color: var(--color-text);
  line-height: ${template.elementStyles.body?.lineHeight || '1.75'};
  font-size: ${template.elementStyles.body?.fontSize || '10.5pt'};
}

/* Cover Styling (PPTX Layout) */
.pfpdf-cover {
  position: relative;
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  page-break-after: always;
  background-color: var(--color-bg);
}

.pptx-slot-title, .pptx-slot-subtitle, .pptx-slot-author, .pptx-slot-date, .pptx-slot-series, .pptx-fixed-text {
  margin: 0;
  line-height: 1.3;
  box-sizing: border-box;
  white-space: pre-wrap;
}

.pptx-slot-title {
  font-family: var(--font-heading) !important;
}

/* Headings */
h1 {
  font-family: var(--font-heading) !important;
  color: var(--color-primary) !important;
  font-size: ${template.elementStyles.h1?.fontSize || '20pt'} !important;
  border-bottom: 2px solid var(--color-primary) !important;
  padding-bottom: 0.3em !important;
  margin-top: 2em !important;
  margin-bottom: 0.8em !important;
  break-before: page;
}

h2 {
  font-family: var(--font-heading) !important;
  color: var(--color-text) !important;
  font-size: ${template.elementStyles.h2?.fontSize || '14pt'} !important;
  border-left: 4px solid var(--color-primary) !important;
  padding-left: 0.6em !important;
  margin-top: 1.5em !important;
  margin-bottom: 0.6em !important;
}

/* TOC Styling */
${!template.tocSettings.enabled ? '.pfpdf-toc-container { display: none !important; }' : ''}
`;
  await fs.promises.writeFile(path.join(templateDir, 'style.css'), styleCss, 'utf-8');

  // 5. vivliostyle.css の生成
  let baseVivlioCss = '';
  try {
    const defaultVivlioSrc = path.join(officialTemplatesDir, 'default', 'vivliostyle.css');
    if (fs.existsSync(defaultVivlioSrc)) {
      baseVivlioCss = await fs.promises.readFile(defaultVivlioSrc, 'utf-8');
    }
  } catch {}

  const vivlioCss = `${baseVivlioCss}

/* Page Setup Overrides */
@page {
  size: ${template.pageSettings.size} ${template.pageSettings.orientation || 'portrait'};
  margin-top: ${template.pageSettings.margin.top};
  margin-bottom: ${template.pageSettings.margin.bottom};
  margin-left: ${template.pageSettings.margin.left};
  margin-right: ${template.pageSettings.margin.right};

  @bottom-center {
    content: ${template.headerFooter?.pageNumberFormat === 'dash' ? `"- " counter(page) " -"` : `counter(page)`};
    font-size: 8.5pt;
    color: #64748b;
  }
}

@page :first {
  ${hasCover ? `margin: 0;\n  @bottom-center { content: none; }` : ''}
}
`;
  await fs.promises.writeFile(path.join(templateDir, 'vivliostyle.css'), vivlioCss, 'utf-8');

  return templateDir;
}
