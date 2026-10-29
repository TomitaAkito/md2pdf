const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function testFinalIntegration() {
  console.log("=== Final Integration Test: PPTX -> Template Dir -> PDF ===");

  const { parsePptxFile } = require('../out/main/pptxParser.js');
  const { saveTemplateAsNativeDir } = require('../out/main/transpiler.js');

  const pptxPath = path.join(__dirname, 'sample_output.pptx');
  const appPath = path.join(__dirname, '..');
  const customTemplatesBaseDir = path.join(__dirname, 'test_custom_templates');
  const launcherPath = path.join(appPath, 'node_modules/@pfnet-research/pfpdf/dist/launcher.js');
  const inputMdPath = path.join(appPath, 'test.md');
  const outputPdfPath = path.join(__dirname, 'final_output_test.pdf');

  console.log("1. Parsing PPTX...");
  const parseResult = await parsePptxFile(pptxPath);
  console.log("Parse success:", parseResult.success);
  console.log("Template name:", parseResult.generatedTemplate.name);

  console.log("2. Transpiling to native template directory...");
  const templateDir = await saveTemplateAsNativeDir(
    parseResult.generatedTemplate,
    customTemplatesBaseDir,
    appPath
  );
  console.log("Template directory created at:", templateDir);
  console.log("Files in template dir:", fs.readdirSync(templateDir));

  console.log("3. Generating PDF with pfpdf CLI using custom template dir...");
  const args = [
    launcherPath,
    '--input', inputMdPath,
    '--output', outputPdfPath,
    '--template', templateDir,
    '--title', 'PowerPoint連携 総合テスト文書'
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
      console.log('pfpdf process exited with code:', code);
      if (code === 0 && fs.existsSync(outputPdfPath)) {
        const stats = fs.statSync(outputPdfPath);
        console.log(`🏆🏆🏆 PERFECT END-TO-END SUCCESS! Generated PDF: ${stats.size} bytes`);
        resolve();
      } else {
        reject(new Error(`Failed with code ${code}`));
      }
    });
  });
}

testFinalIntegration().catch(console.error);
