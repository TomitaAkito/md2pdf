const JSZip = require('jszip');
const { XMLParser } = require('fast-xml-parser');

async function testPptxParser() {
  console.log("JSZip and fast-xml-parser successfully loaded!");
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
  });

  // Create a minimal dummy pptx in memory to test parsing logic
  const zip = new JSZip();
  
  // Minimal presentation.xml
  const presentationXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldSz cx="7560000" cy="10692000" type="A4"/>
</p:presentation>`;
  zip.file("ppt/presentation.xml", presentationXml);

  // Minimal theme1.xml
  const themeXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">
  <a:themeElements>
    <a:clrScheme name="CustomTheme">
      <a:dk1><a:sysClr val="windowText" lastClr="111827"/></a:dk1>
      <a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
      <a:accent1><a:srgbClr val="0F5E5A"/></a:accent1>
      <a:accent2><a:srgbClr val="4F46E5"/></a:accent2>
    </a:clrScheme>
    <a:fontScheme name="Office">
      <a:majorFont>
        <a:latin typeface="Noto Sans JP"/>
        <a:ea typeface="Noto Sans JP"/>
      </a:majorFont>
      <a:minorFont>
        <a:latin typeface="Noto Sans JP"/>
        <a:ea typeface="Noto Sans JP"/>
      </a:minorFont>
    </a:fontScheme>
  </a:themeElements>
</a:theme>`;
  zip.file("ppt/theme/theme1.xml", themeXml);

  // Minimal slide1.xml
  const slide1Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <!-- Title Box -->
      <p:sp>
        <p:spPr>
          <a:xfrm>
            <a:off x="756000" y="3200000"/>
            <a:ext cx="6048000" cy="1500000"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:p>
            <a:pPr algn="l"/>
            <a:r>
              <a:rPr sz="3600" b="1">
                <a:solidFill><a:srgbClr val="0F5E5A"/></a:solidFill>
              </a:rPr>
              <a:t>機械学習システム設計ガイド</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <!-- Subtitle Box -->
      <p:sp>
        <p:spPr>
          <a:xfrm>
            <a:off x="756000" y="4800000"/>
            <a:ext cx="6048000" cy="800000"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:p>
            <a:r>
              <a:rPr sz="1800">
                <a:solidFill><a:srgbClr val="4B5563"/></a:solidFill>
              </a:rPr>
              <a:t>実用的なアーキテクチャパターンとベストプラクティス</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <!-- Author Box -->
      <p:sp>
        <p:spPr>
          <a:xfrm>
            <a:off x="756000" y="8500000"/>
            <a:ext cx="6048000" cy="600000"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:p>
            <a:r>
              <a:rPr sz="1400">
                <a:solidFill><a:srgbClr val="1F2937"/></a:solidFill>
              </a:rPr>
              <a:t>Preferred Research Team</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <!-- Decorative Accent Bar -->
      <p:sp>
        <p:spPr>
          <a:xfrm>
            <a:off x="756000" y="2900000"/>
            <a:ext cx="800000" cy="60000"/>
          </a:xfrm>
          <a:solidFill><a:srgbClr val="0F5E5A"/></a:solidFill>
        </p:spPr>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;
  zip.file("ppt/slides/slide1.xml", slide1Xml);

  const pptxBuffer = await zip.generateAsync({ type: "nodebuffer" });
  console.log("Generated PPTX dummy buffer size:", pptxBuffer.length);

  // Now test unzipping and parsing
  const loadedZip = await JSZip.loadAsync(pptxBuffer);
  const loadedPresXml = await loadedZip.file("ppt/presentation.xml").async("text");
  const presObj = parser.parse(loadedPresXml);
  console.log("Parsed presentation:", JSON.stringify(presObj['p:presentation']['p:sldSz']));

  const loadedSlideXml = await loadedZip.file("ppt/slides/slide1.xml").async("text");
  const slideObj = parser.parse(loadedSlideXml);
  const shapes = slideObj['p:sld']['p:cSld']['p:spTree']['p:sp'];
  console.log(`Found ${shapes.length} shapes in slide 1!`);
  for (const sp of shapes) {
    const xfrm = sp['p:spPr']?.['a:xfrm'];
    const x = xfrm?.['a:off']?.['@_x'];
    const y = xfrm?.['a:off']?.['@_y'];
    const text = sp['p:txBody']?.['a:p']?.['a:r']?.['a:t'] || "(No text, shape only)";
    console.log(` - Shape at (${x}, ${y}): ${text}`);
  }
}

testPptxParser().catch(console.error);
