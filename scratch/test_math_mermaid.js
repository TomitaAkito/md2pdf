const path = require('path');

async function test() {
  try {
    // 1. MathJax のテスト
    console.log('Testing MathJax...');
    const mathModule = await import('../node_modules/@pfnet-research/pfpdf/dist/math.js');
    console.log('mathModule loaded:', Object.keys(mathModule));
    
    // 2. Mermaid のテスト
    console.log('Testing Mermaid...');
    const mermaidModule = await import('../node_modules/@pfnet-research/pfpdf/dist/mermaid.js');
    console.log('mermaidModule loaded:', Object.keys(mermaidModule));

    // 数式レンダリング
    const mathRes = await mathModule.renderMathToHast('E = mc^2', true);
    console.log('mathRes error:', mathRes.error);
    console.log('mathRes nodes count:', mathRes.nodes.length);

    console.log('SUCCESS!');
  } catch (err) {
    console.error('ERROR in test:', err);
  }
}

test();

