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

export default ({ headContent, content, settings, needsHydration }) => {
  const script = needsHydration
    ? `<script>setTimeout(() => { ${hydrationScript()} }, 2000); </script>`
    : "";

  return minifyHTML(`<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="view-transition" content="same-origin">
        <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="${settings.theme_color || "#000000"}" />
        ${headContent}
        ${needsHydration && settings.importmap ? `<script type="importmap">${JSON.stringify({ imports: settings.importmap }, null, 2)}</script>` : ""}
        <link id="favicon" rel="icon" type="image/svg+xml" href="${settings.emojiIcon ? `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100%22><text y=%22.9em%22 font-size=%2290%22>${settings.emojiIcon}</text></svg>` : settings.icon}"/>
        <link rel="stylesheet" href="/style.css">
    </head>
    <body class="production flex">
      ${content}
      ${script}
    </body>
</html>`);
};
