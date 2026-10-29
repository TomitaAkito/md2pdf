const fs = require('fs');

const lines = fs.readFileSync('C:\\Users\\punch\\.gemini\\antigravity-ide\\brain\\ff25eab6-5b03-40e9-8263-591fdc7cf997\\.system_generated\\logs\\transcript.jsonl', 'utf-8').split('\n');

for (const l of lines) {
  if (l.includes('Pfpdf GUIラッパー＆テンプレートビルダー 要件定義・実装仕様書')) {
    const obj = JSON.parse(l);
    fs.writeFileSync('scratch/original_requirements.txt', obj.content, 'utf-8');
    console.log("Original requirements saved to scratch/original_requirements.txt, length:", obj.content.length);
    break;
  }
}
