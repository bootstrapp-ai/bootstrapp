export default ({ fileMap, bundleAdmin = false }) =>
  "const FILE_BUNDLE = " +
  JSON.stringify(fileMap, null, 2) +
  ";" +
  `const BUNDLE_ADMIN = ${bundleAdmin};
self.addEventListener("install", (e) => {
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
    return;
  }

  // SPA fallback for HTML routes (no file extension)
  const hasExtension = path.includes('.') && !path.endsWith('/');
  if (!hasExtension && e.request.mode === 'navigate') {
    // Admin routes get admin/index.html (only if bundleAdmin is true)
    if (BUNDLE_ADMIN && path.startsWith('/admin')) {
      const adminIndex = FILE_BUNDLE['/admin/index.html'];
      if (adminIndex) {
        e.respondWith(
          new Response(adminIndex.content, {
            headers: { 'Content-Type': 'text/html' }
          })
        );
        return;
      }
    }
    // Main app routes get index.html
    const mainIndex = FILE_BUNDLE['/index.html'];
    if (mainIndex) {
      e.respondWith(
        new Response(mainIndex.content, {
          headers: { 'Content-Type': 'text/html' }
        })
      );
      return;
    }
  }
});`;
