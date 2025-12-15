export default ({ fileMap }) =>
  "const FILE_BUNDLE = " +
  JSON.stringify(fileMap, null, 2) +
  ";" +
  `self.addEventListener("install", (e) => e.waitUntil(self.skipWaiting()));
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  let path = url.pathname;
  if (path.startsWith("/npm/")) {
    path = "/" + path.slice(5);
  }
  const file = FILE_BUNDLE[path];
  if (file) {
    e.respondWith(
      new Response(file.content, {
        headers: { 'Content-Type': file.mimeType || 'application/javascript' }
      })
    );
  }
});`;
