const path = require('path');

async function testParse() {
  const { parsePptxFile } = require('../out/main/pptxParser.js');
  const pptxPath = path.join(__dirname, 'perfect_sample.pptx');
  console.log("Parsing pptxgen-generated file:", pptxPath);
  const res = await parsePptxFile(pptxPath);
  console.log("Success:", res.success);
  console.log("Slide count:", res.slideCount);
  console.log("Slot mappings count:", res.slotMappings.length);
  for (const s of res.slotMappings) {
    console.log(` - Slot [${s.slot}]: "${s.originalText.replace(/\n/g, ' ')}" (pos: ${s.xPercent.toFixed(1)}%, ${s.yPercent.toFixed(1)}%)`);
  }
}

testParse().catch(console.error);
