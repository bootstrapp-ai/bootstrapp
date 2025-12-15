export default (settings = {}) => ({
  name: settings.name,
  short_name: settings.short_name || settings.name,
  start_url: settings.url || "/",
  scope: settings.scope || settings.url || "/",
  display: "standalone",
  background_color: settings.theme_color || "#ffffff",
  theme_color: settings.theme_color || "#000000",
  description: settings.description || "",
  icons: [
    {
      src: "/assets/icons/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/assets/icons/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable",
    },
  ],
});
