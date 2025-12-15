export default (settings) => {
  if (!settings.url) {
    console.warn("Cannot generate robots.txt: settings.url is not defined.");
    return "User-agent: *\nAllow: /\n";
  }
  const sitemapURL = new URL("sitemap.xml", settings.url).href;
  return `User-agent: *\nAllow: /\nSitemap: ${sitemapURL}`;
};
