export default ({ fileMap }) =>
  "const FILE_BUNDLE = " +
  JSON.stringify(fileMap, null, 2) +
  ";" +
  `self.addEventListener("install", (e) => {
  console.log("SW: Installing new version...");
  // Don't skipWaiting automatically - let the app control when to activate
});
self.addEventListener("activate", (e) => {
  console.log("SW: Activated");
  e.waitUntil(self.clients.claim());
});
self.addEventListener("message", (e) => {
  if (e.data?.type === "SKIP_WAITING") {
    console.log("SW: Skip waiting requested, activating...");
    self.skipWaiting();
  }
});
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
