fetch('https://pfpdf.preferred.tech/ja/gallery/')
  .then(r => r.text())
  .then(t => {
    const regex = /<a[^>]+href="([^"]+)"[^>]*>[\s\S]*?<\/a>/g;
    let m;
    while ((m = regex.exec(t)) !== null) {
      if (m[1].includes('pdf') || m[1].includes('template') || m[1].includes('github')) {
        console.log(m[1], m[0].replace(/<[^>]+>/g, '').trim());
      }
    }
    const imgRegex = /<img[^>]+src="([^"]+)"/g;
    while ((m = imgRegex.exec(t)) !== null) {
      console.log("IMG:", m[1]);
    }
  });
