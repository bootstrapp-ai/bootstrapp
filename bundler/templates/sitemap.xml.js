export default (settings, pages) => {
  if (!settings.url) {
    console.warn("Cannot generate sitemap.xml: settings.url is not defined.");
    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
  }
  const today = new Date().toISOString().split("T")[0];
  const urls = pages
    .map((page) => {
      let urlPath = page.path.replace(/index\.html$/, "");
      if (urlPath === "") urlPath = "/";
      if (!urlPath.startsWith("/")) urlPath = `/${urlPath}`;
      const loc = new URL(urlPath, settings.url).href;
      const priority = urlPath === "/" ? "1.0" : "0.8";
      return `
    <url>
        <loc>${loc}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>${priority}</priority>
    </url>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`.trim();
};
