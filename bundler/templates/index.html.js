import hydrationScript from "./hydration-script.js";

const minifyHTML = (content) => {
  if (typeof content !== "string") return "";
  return content
    .replace(/<!--.*?-->/gs, "")
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .replace(/ >/g, ">")
    .replace(/< /g, "<")
    .trim();
};

export default (settings) => minifyHTML(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>${settings.name}</title>
    <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0" />
    <meta name="theme-color" content="${settings.theme_color || "#000000"}" />
    <meta name="description" content="${settings.description || "A PWA application."}" />
    <meta property="og:title" content="${settings.name}" />
    <meta property="og:description" content="${settings.description || "A PWA application."}" />
    <meta property="og:image" content="${settings.og_image || "/assets/icons/icon-512x512.png"}" />
    <meta property="og:url" content="${settings.canonicalUrl || "/"}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${settings.name}" />
    <meta name="twitter:description" content="${settings.description || "A PWA application."}" />
    <meta name="twitter:image" content="${settings.og_image || "/assets/icons/icon-512x512.png"}" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="stylesheet" href="/style.css">
    ${settings.importmap ? `<script type="importmap">${JSON.stringify({ imports: settings.importmap }, null, 2)}</script>` : ""}
    <link id="favicon" rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLW1vdW50YWluIj48cGF0aCBkPSJtOCAzIDQgOCA1LTUgNSAxNUgyTDggM3oiLz48L3N2Zz4="/>
    <script>${hydrationScript()}</script>
</head>
<body class="production flex">
    <app-container></app-container>
</body>
</html>`);
