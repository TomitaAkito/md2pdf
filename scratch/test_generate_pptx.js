const JSZip = require('jszip');
const fs = require('fs');

async function createSamplePptx() {
  const zip = new JSZip();

  // 1. [Content_Types].xml
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
</Types>`);

  // 2. _rels/.rels
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);

  // 3. ppt/_rels/presentation.xml.rels
  zip.file('ppt/_rels/presentation.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
</Relationships>`);

  // 4. ppt/presentation.xml (A4 portrait: 7560000 x 10692000 EMU)
  zip.file('ppt/presentation.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldMasterIdLst/>
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId1"/>
  </p:sldIdLst>
  <p:sldSz cx="7560000" cy="10692000" type="A4"/>
</p:presentation>`);

  // 5. ppt/theme/theme1.xml
  zip.file('ppt/theme/theme1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="PFN Theme">
  <a:themeElements>
    <a:clrScheme name="PFN">
      <a:dk1><a:sysClr val="windowText" lastClr="1F2937"/></a:dk1>
      <a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
      <a:accent1><a:srgbClr val="0F5E5A"/></a:accent1>
      <a:accent2><a:srgbClr val="4F46E5"/></a:accent2>
    </a:clrScheme>
    <a:fontScheme name="Standard">
      <a:majorFont><a:latin typeface="Noto Sans JP"/><a:ea typeface="Noto Sans JP"/></a:majorFont>
      <a:minorFont><a:latin typeface="Noto Sans JP"/><a:ea typeface="Noto Sans JP"/></a:minorFont>
    </a:fontScheme>
  </a:themeElements>
</a:theme>`);

  // 6. ppt/slides/slide1.xml
  zip.file('ppt/slides/slide1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:grpSpPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
      
      <!-- Top Decorative Accent Bar (Header Bar) -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="AccentBar"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="756000" y="1000000"/><a:ext cx="1200000" cy="80000"/></a:xfrm>
          <a:solidFill><a:srgbClr val="0F5E5A"/></a:solidFill>
        </p:spPr>
      </p:sp>

      <!-- Document Title -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="TitleBox"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="756000" y="3200000"/><a:ext cx="6048000" cy="1800000"/></a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:p>
            <a:r>
              <a:rPr sz="3600" b="1"><a:solidFill><a:srgbClr val="0F5E5A"/></a:solidFill></a:rPr>
              <a:t>ドキュメントタイトル</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>

      <!-- Subtitle -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="4" name="SubtitleBox"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="756000" y="5200000"/><a:ext cx="6048000" cy="1000000"/></a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:p>
            <a:r>
              <a:rPr sz="1800"><a:solidFill><a:srgbClr val="4B5563"/></a:solidFill></a:rPr>
              <a:t>サブタイトル・要約文をここに記述</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>

      <!-- Author -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="5" name="AuthorBox"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="756000" y="8500000"/><a:ext cx="6048000" cy="500000"/></a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:p>
            <a:r>
              <a:rPr sz="1400" b="1"><a:solidFill><a:srgbClr val="1F2937"/></a:solidFill></a:rPr>
              <a:t>著者名 / 執筆組織</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>

      <!-- Date -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="6" name="DateBox"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="756000" y="9100000"/><a:ext cx="6048000" cy="500000"/></a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:p>
            <a:r>
              <a:rPr sz="1200"><a:solidFill><a:srgbClr val="6B7280"/></a:solidFill></a:rPr>
              <a:t>2026年10月</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>

    </p:spTree>
  </p:cSld>
</p:sld>`);

  const buf = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync('scratch/sample_output.pptx', buf);
  console.log('Sample PPTX created! Size:', buf.length);
}

createSamplePptx().catch(console.error);
