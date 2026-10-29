const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const JSZip = require('jszip');
const { XMLParser } = require('fast-xml-parser');

async function testE2EPptx() {
  console.log("=== End-to-End PPTX to PDF Test ===");

  const launcherPath = path.join(__dirname, '../node_modules/@pfnet-research/pfpdf/dist/launcher.js');
  const pptxPath = path.join(__dirname, 'sample_output.pptx');
  const inputMdPath = path.join(__dirname, '../test.md');
  const outputPdfPath = path.join(__dirname, 'output_from_pptx.pdf');

  console.log("1. Checking files...");
  console.log("PPTX exists:", fs.existsSync(pptxPath));
  console.log("test.md exists:", fs.existsSync(inputMdPath));

  // 2. Parse PPTX using the logic we wrote
  const buffer = fs.readFileSync(pptxPath);
  const zip = await JSZip.loadAsync(buffer);
  const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

  const themeXml = await zip.file('ppt/theme/theme1.xml').async('text');
  const themeObj = xmlParser.parse(themeXml);
  const acc1 = themeObj?.['a:theme']?.['a:themeElements']?.['a:clrScheme']?.['a:accent1']?.['a:srgbClr']?.['@_val'] || '0F5E5A';
  console.log("Extracted Accent Color:", '#' + acc1);

  // 3. Generate CSS
  const css = `/* Generated from PPTX */
:root {
  --color-primary: #${acc1};
}
@page {
  size: A4 portrait;
  margin: 20mm;
  @bottom-center {
    content: "- " counter(page) " -";
    font-size: 9pt;
    color: #64748b;
  }
}
@page:first {
  margin: 0;
  @bottom-center { content: none; }
}
h1 {
  color: #${acc1};
  border-bottom: 2px solid #${acc1};
  padding-bottom: 0.3em;
  break-before: page;
}
h2 {
  border-left: 4px solid #${acc1};
  padding-left: 0.6em;
}
`;
  const cssPath = path.join(__dirname, 'custom-test.css');
  fs.writeFileSync(cssPath, css, 'utf-8');
  console.log("Generated CSS saved to:", cssPath);

  // 4. Run pfpdf with --style
  console.log("Running pfpdf with custom PPTX style...");
  const args = [
    launcherPath,
    '--input', inputMdPath,
    '--output', outputPdfPath,
    '--template', 'default',
    '--style', cssPath
  ];

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1'
      }
    });

    child.stdout.on('data', (d) => console.log('[pfpdf stdout]', d.toString().trim()));
    child.stderr.on('data', (d) => console.log('[pfpdf stderr]', d.toString().trim()));

    child.on('close', (code) => {
      console.log('pfpdf exited with code:', code);
      if (code === 0 && fs.existsSync(outputPdfPath)) {
        const stats = fs.statSync(outputPdfPath);
        console.log(`🎉 SUCCESS! Generated PDF size: ${stats.size} bytes`);
        resolve();
      } else {
        reject(new Error(`Failed with code ${code}`));
      }
    });
  });
}

testE2EPptx().catch(console.error);
