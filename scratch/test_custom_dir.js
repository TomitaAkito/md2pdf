const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function testCustomDir() {
  const launcherPath = path.join(__dirname, '../node_modules/@pfnet-research/pfpdf/dist/launcher.js');
  const inputMdPath = path.join(__dirname, '../test.md');
  const outputPdfPath = path.join(__dirname, 'output_native_custom.pdf');
  const customTemplateDir = path.join(__dirname, 'my_custom_template');

  // Copy common files to parent directory or copy base template
  const resourcesTemplatesDir = path.join(__dirname, '../node_modules/@pfnet-research/pfpdf/resources/templates');
  fs.copyFileSync(path.join(resourcesTemplatesDir, 'common.css'), path.join(__dirname, 'common.css'));
  fs.copyFileSync(path.join(resourcesTemplatesDir, 'common-vivliostyle.css'), path.join(__dirname, 'common-vivliostyle.css'));

  console.log("Running pfpdf with custom template directory and common css in place...");
  const args = [
    launcherPath,
    '--input', inputMdPath,
    '--output', outputPdfPath,
    '--template', customTemplateDir,
    '--title', 'カスタムPPTXテンプレートテスト'
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
        console.log(`🎉🎉🎉 SPECTACULAR SUCCESS! Generated PDF size: ${stats.size} bytes`);
        resolve();
      } else {
        reject(new Error(`Failed with code ${code}`));
      }
    });
  });
}

testCustomDir().catch(console.error);
