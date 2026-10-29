const JSZip = require('jszip');
const { XMLParser } = require('fast-xml-parser');
const fs = require('fs');
const path = require('path');

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
});

async function parsePptx(filePath) {
  const buffer = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(buffer);

  const presXml = await zip.file('ppt/presentation.xml').async('text');
  const presObj = xmlParser.parse(presXml);
  const sldSz = presObj?.['p:presentation']?.['p:sldSz'];
  const slideWidthEmu = parseInt(sldSz?.['@_cx'] || '7560000', 10);
  const slideHeightEmu = parseInt(sldSz?.['@_cy'] || '10692000', 10);
  console.log(`Slide dimensions: ${slideWidthEmu} x ${slideHeightEmu} EMU`);

  const slide1Xml = await zip.file('ppt/slides/slide1.xml').async('text');
  const slideObj = xmlParser.parse(slide1Xml);
  const spTree = slideObj?.['p:sld']?.['p:cSld']?.['p:spTree'];

  let rawShapes = spTree?.['p:sp'] || [];
  if (!Array.isArray(rawShapes)) rawShapes = [rawShapes];

  console.log(`Found ${rawShapes.length} shapes in slide 1:`);
  for (const sp of rawShapes) {
    const xfrm = sp['p:spPr']?.['a:xfrm'];
    const offX = parseInt(xfrm?.['a:off']?.['@_x'] || '0', 10);
    const offY = parseInt(xfrm?.['a:off']?.['@_y'] || '0', 10);
    const extCx = parseInt(xfrm?.['a:ext']?.['@_cx'] || '0', 10);
    const extCy = parseInt(xfrm?.['a:ext']?.['@_cy'] || '0', 10);

    const xPercent = (offX / slideWidthEmu) * 100;
    const yPercent = (offY / slideHeightEmu) * 100;

    const txBody = sp['p:txBody'];
    let text = '';
    if (txBody) {
      let pList = txBody['a:p'];
      if (!Array.isArray(pList)) pList = [pList];
      for (const p of pList) {
        let rList = p['a:r'];
        if (rList) {
          if (!Array.isArray(rList)) rList = [rList];
          for (const r of rList) {
            if (r['a:t']) text += (text ? '\n' : '') + r['a:t'];
          }
        }
      }
    }

    if (text) {
      console.log(` - Text at (${xPercent.toFixed(1)}%, ${yPercent.toFixed(1)}%): "${text.replace(/\n/g, ' ')}"`);
    } else {
      console.log(` - Shape/Rect at (${xPercent.toFixed(1)}%, ${yPercent.toFixed(1)}%) size (${(extCx/slideWidthEmu*100).toFixed(1)}% x ${(extCy/slideHeightEmu*100).toFixed(1)}%)`);
    }
  }
}

parsePptx(path.join(__dirname, 'perfect_sample.pptx')).catch(console.error);
