import $APP from "/$app.js";
import { deployToTarget, getTargets } from "./targets/index.js";

// Import targets (they self-register)
import "./targets/github.js";
import "./targets/cloudflare.js";
import "./targets/zip.js";
import "./targets/targz.js";
import "./targets/localhost.js";

// Import templates
import indexHTMLTemplate from "./templates/index.html.js";
import manifestJSONTemplate from "./templates/manifest.json.js";
import robotsTXTTemplate from "./templates/robots.txt.js";
import sitemapXMLTemplate from "./templates/sitemap.xml.js";
import staticPageHTMLTemplate from "./templates/static-page.html.js";
import swJSTemplate from "./templates/sw.js.js";

const { Router } = $APP;

// This object is now a client-side wrapper that calls our server proxy
const Cloudflare = {
  async deployWorker({ accountId, apiToken, projectName, scriptContent }) {
    if (!accountId || !apiToken || !projectName || !scriptContent) {
      const errorMsg =
        "Cloudflare deployment requires accountId, apiToken, projectName, and scriptContent.";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      console.log(
        `🚀 Deploying worker to project: ${projectName} via server proxy...`,
      );
      // The fetch call now goes to our local server endpoint
      const response = await fetch("/cloudflare/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          apiToken,
          projectName,
          scriptContent,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error(
          "Cloudflare API Error (via proxy):",
          result.errors || result,
        );
        throw new Error(`Failed to deploy worker. Status: ${response.status}`);
      }

      console.log("✅ Worker deployed successfully!");
      return result;
    } catch (error) {
      console.error("Cloudflare worker deployment failed:", error);
      throw error;
    }
  },
};

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

const esbuildReady = (async () => {
  if (!window.esbuild) {
    await loadScript(
      "https://cdn.jsdelivr.net/npm/esbuild-wasm@0.21.5/lib/browser.min.js",
    );
  }
  await window.esbuild.initialize({
    wasmURL: "https://cdn.jsdelivr.net/npm/esbuild-wasm@0.21.5/esbuild.wasm",
  });
})();

const obfuscatorReady = (async () => {
  if (!window.JavaScriptObfuscator) {
    await loadScript(
      "https://cdn.jsdelivr.net/npm/javascript-obfuscator/dist/index.browser.js",
    );
  }
})();

async function obfuscate(content) {
  await obfuscatorReady;
  if (typeof content !== "string") return content;
  try {
    const obfuscationResult = window.JavaScriptObfuscator.obfuscate(content, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      numbersToExpressions: true,
      simplify: true,
      stringArrayShuffle: true,
      splitStrings: true,
      stringArrayThreshold: 1,
    });
    return obfuscationResult.getObfuscatedCode();
  } catch (error) {
    console.error("JavaScript Obfuscator failed:", error);
    return content;
  }
}

async function minify(content, mimeType) {
  await esbuildReady;
  if (typeof content !== "string") return content;
  const loaderMap = {
    "application/javascript": "js",
    "text/css": "css",
  };
  const loader = loaderMap[mimeType];
  if (!loader) return content;
  try {
    const result = await window.esbuild.transform(content, {
      loader,
      minify: true,
    });
    return result.code;
  } catch (error) {
    console.error(`esbuild minification failed for type ${loader}:`, error);
    return content;
  }
}

const EMBEDDABLE_MIME_TYPES = [
  "text/css",
  "application/javascript",
  "application/json",
  "text/html",
];

const getHydrationComponents = (htmlContent) => {
  if (typeof DOMParser === "undefined") {
    console.warn("DOMParser not available.");
    return [];
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const hydrationRoots = doc.body.querySelectorAll(
    "[client\\:load], [client\\:defer], [client\\:visible], [client\\:hydrate], [client\\:inject]",
  );
  return Array.from(hydrationRoots).map((root) => {
    const clientDirective = Array.from(root.attributes).find((attr) =>
      attr.name.startsWith("client:"),
    );
    const childrenCustomElements = Array.from(root.querySelectorAll("*"))
      .filter((el) => el.localName.includes("-"))
      .map((el) => el.localName);
    return {
      tagName: root.localName,
      directive: clientDirective ? clientDirective.name : null,
      childrenCustomElements: childrenCustomElements,
    };
  });
};

const bundler = {
  getHydrationComponents,
  _createRobotsTXT: robotsTXTTemplate,
  _createSitemapXML: sitemapXMLTemplate,
  _createIndexHTML: indexHTMLTemplate,
  _createServiceWorker(fileMap) {
    return minify(swJSTemplate({ fileMap }), "application/javascript");
  },
  _createManifest: manifestJSONTemplate,
  async extractCSS() {
    return Array.from(document.querySelectorAll("style"))
      .map((style) => style.innerHTML)
      .join("\n");
  },
  async deployWorker(credentials) {
    console.log("🚀 Starting Cloudflare Worker deployment process...");
    const { cloudflare } = credentials;
    if (!cloudflare) {
      throw new Error(
        "Bundler Error: No Cloudflare credentials provided in credentials object.",
      );
    }
    const workerFile = await $APP.fs.text("/server/index.js");
    if (!workerFile) {
      throw new Error(
        "Could not find worker script at /server/index.js. Ensure it is loaded.",
      );
    }
    await esbuildReady;
    try {
      const result = await window.esbuild.build({
        entryPoints: ["server/index.js"],
        bundle: true,
        write: false,
        format: "esm",
        target: "esnext",
        minify: true,
        plugins: [
          {
            name: "in-memory-loader",
            setup(build) {
              build.onResolve({ filter: /^server\/index\.js$/ }, (args) => ({
                path: args.path,
                namespace: "memory-ns",
              }));
              build.onLoad({ filter: /.*/, namespace: "memory-ns" }, () => ({
                contents: workerFile,
                loader: "js",
              }));
            },
          },
        ],
      });
      const bundledScript = result.outputFiles[0].text;
      let finalScript = bundledScript;
      if ($APP.settings.bundle?.obfuscate) {
        console.log("🔒 Obfuscating worker script...");
        finalScript = await obfuscate(bundledScript);
      }
      // Use the new client-side wrapper
      return await Cloudflare.deployWorker({
        ...cloudflare,
        scriptContent: finalScript,
      });
    } catch (error) {
      console.error("esbuild bundling or Cloudflare deployment failed:", error);
      throw error;
    }
  },
  async _bundleSPACore({ mode = "spa" }) {
    console.log(`🚀 Starting ${mode.toUpperCase()} bundle process...`);
    const filesForDeployment = [];
    const filesForSW = await $APP.SW.request("SW:GET_CACHED_FILES");
    const addFilePromises = [];
    const pages = await getStaticHTML({ ssgOnly: false });
    const addFile = async ({ path, content, mimeType, skipSW = false }) => {
      if (!path) {
        console.error("addFile requires a 'path' property.");
        return;
      }
      let resolvedContent = content;
      let resolvedMimeType = mimeType;
      if (typeof resolvedContent === "undefined") {
        try {
          const response = await fetch(`/${path}`);
          if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
          resolvedMimeType =
            resolvedMimeType || response.headers.get("Content-Type");
          if (EMBEDDABLE_MIME_TYPES.includes(resolvedMimeType)) {
            resolvedContent = await response.text();
          } else {
            resolvedContent = await response.blob();
          }
        } catch (error) {
          console.error(`Failed to process path /${path}:`, error);
          return;
        }
      }
      if (
        !skipSW &&
        EMBEDDABLE_MIME_TYPES.includes(resolvedMimeType) &&
        typeof resolvedContent === "string"
      ) {
        filesForSW[`/${path}`] = {
          content: resolvedContent,
          mimeType: resolvedMimeType,
        };
      } else {
        const minifiedContent = await minify(resolvedContent, resolvedMimeType);
        filesForDeployment.push({ path, content: minifiedContent });
      }
    };
    const indexHTML = this._createIndexHTML($APP.settings);
    if (mode === "hybrid") {
      pages.forEach((file) => {
        if (file.ssg)
          filesForDeployment.push({
            path: file.path,
            content: createStaticPage(file),
          });
        else
          filesForDeployment.push({
            path: file.path,
            content: indexHTML,
          });
      });
    }
    const css = await this.extractCSS();
    addFilePromises.push(
      addFile({ path: "style.css", content: css, mimeType: "text/css" }),
    );
    filesForDeployment.push({
      path: "style.css",
      content: css,
      mimeType: "text/css",
    });
    const manifest = this._createManifest($APP.settings);
    manifest.icons.forEach((icon) => {
      const path = icon.src.substring(1);
      addFilePromises.push(
        addFile({ path, mimeType: icon.type, skipSW: true }),
      );
    });
    addFile({
      path: "assets/cover.png",
      mimeType: "image/png",
      skipSW: true,
    });
    await Promise.all(addFilePromises);
    filesForDeployment.push({
      path: "manifest.json",
      content: JSON.stringify(manifest),
    });
    const sitemapXML = this._createSitemapXML($APP.settings, pages);
    filesForDeployment.push({ path: "sitemap.xml", content: sitemapXML });
    const robotsTXT = this._createRobotsTXT($APP.settings);
    filesForDeployment.push({ path: "robots.txt", content: robotsTXT });
    if (!filesForDeployment.some((file) => file.path === "index.html"))
      filesForDeployment.push({ path: "index.html", content: indexHTML });
    filesForDeployment.push({ path: "404.html", content: indexHTML });
    $APP.devFiles.forEach((path) => {
      if (filesForSW[path]) {
        filesForSW[path] = { content: "export default {}" };
      }
    });
    const processedSWEntries = await Promise.all(
      Object.entries(filesForSW).map(async ([path, file]) => {
        const minifiedContent = await minify(file.content, file.mimeType);
        let finalContent = minifiedContent;
        if (
          file.mimeType === "application/javascript" &&
          $APP.settings.obfuscate
        ) {
          console.log(`🔒 Obfuscating ${path}...`);
          finalContent = await obfuscate(minifiedContent);
        }
        return [path, { ...file, content: finalContent }];
      }),
    );
    const processedFilesForSW = Object.fromEntries(processedSWEntries);
    let serviceWorker = await this._createServiceWorker(processedFilesForSW);
    if ($APP.settings.bundle?.obfuscate) {
      console.log("🔒 Obfuscating service worker (sw.js)...");
      serviceWorker = await obfuscate(serviceWorker);
    }
    filesForDeployment.push({ path: "sw.js", content: serviceWorker });
    console.log(
      `✅ ${mode.toUpperCase()} bundle created with ${filesForDeployment.length} files`,
    );
    return filesForDeployment;
  },
  /**
   * Get all available deployment targets
   */
  getTargets,

  /**
   * Build files for deployment
   * @param {string} mode - Build mode: spa, ssg, hybrid
   * @returns {Array} Files ready for deployment [{path, content}]
   */
  async build(mode) {
    switch (mode) {
      case "spa":
        return this._bundleSPACore({ mode: "spa" });
      case "ssg":
        return this.bundleSSG();
      case "hybrid":
        return this._bundleSPACore({ mode: "hybrid" });
      default:
        throw new Error(`Unknown build mode: ${mode}`);
    }
  },

  /**
   * Deploy to a target
   * @param {Object} options - Deployment options
   * @param {string} options.mode - Build mode: spa, ssg, hybrid, worker
   * @param {string} options.target - Deploy target: github, cloudflare, zip, targz
   * @param {Object} options.credentials - Target-specific credentials
   */
  async deploy({ mode, target = "github", ...credentials }) {
    console.log(`🚀 Deploying: mode=${mode}, target=${target}`);
    if (target === "cloudflare" || mode === "worker")
      return this.deployWorker({ cloudflare: credentials });

    const files = await this.build(mode);
    const result = await deployToTarget(target, files, {
      ...credentials,
      name: $APP.settings.name,
      version: credentials.version || Date.now(),
    });
    console.log({ result });
    console.log(`✅ Deployment to ${target} completed!`, result);
    return result;
  },
  async bundleSPA() {
    return this._bundleSPACore({ mode: "spa" });
  },
  async bundleSSG() {
    console.log("🚀 Starting SSG bundle process...");
    const files = [];
    const staticFiles = await getStaticHTML({ ssgOnly: true });
    staticFiles.forEach((file) => {
      files.push({
        path: file.path,
        content: createStaticPage(file),
      });
    });
    const css = await this.extractCSS();
    files.push({ path: "style.css", content: css });
    const data = {};
    files.push({ path: "data.json", content: JSON.stringify(data, null, 2) });
    const sitemapXML = this._createSitemapXML($APP.settings, staticFiles);
    files.push({ path: "sitemap.xml", content: sitemapXML });
    const robotsTXT = this._createRobotsTXT($APP.settings);
    files.push({ path: "robots.txt", content: robotsTXT });
    console.log(`✅ SSG bundle created with ${files.length} files`);
    return files;
  },
  async bundleHybrid(credentials) {
    return this._bundleSPACore({ mode: "hybrid" });
  },
};

const _renameCustomElementTags = (htmlContent) => {
  if (typeof DOMParser === "undefined") {
    console.warn("DOMParser not available.");
    return { content: htmlContent, hydrate: [] };
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const body = doc.body;
  const exclusionSet = new Set();
  const allHydrationRoots = body.querySelectorAll(
    "[client\\:load], [client\\:defer], [client\\:visible], [client\\:hydrate], [client\\:inject]",
  );
  allHydrationRoots.forEach((root) => {
    exclusionSet.add(root);
    if (root.hasAttribute("client:inject")) root.innerHTML = "";
  });
  const allCustomElements = Array.from(body.querySelectorAll("*")).filter(
    (el) => el.localName.includes("-"),
  );
  const tagMap = new Map();
  const elementsToReplace = [];
  allCustomElements.forEach((el) => {
    if (exclusionSet.has(el)) return;
    const originalTag = el.localName;
    if (!tagMap.has(originalTag)) {
      const newTag = `ce-${Math.random().toString(36).substring(2, 12)}`;
      tagMap.set(originalTag, newTag);
    }
    elementsToReplace.push(el);
  });
  elementsToReplace.forEach((oldEl) => {
    const newTagName = tagMap.get(oldEl.localName);
    if (!newTagName || !oldEl.parentNode) return;
    const newEl = doc.createElement(newTagName);
    for (const attr of oldEl.attributes) {
      if (attr.name.trim())
        newEl.setAttribute(attr.name, (attr.value ?? "").trim());
    }
    while (oldEl.firstChild) {
      newEl.appendChild(oldEl.firstChild);
    }
    oldEl.parentNode.replaceChild(newEl, oldEl);
  });
  return {
    content: body.innerHTML,
    hydrate: [...allHydrationRoots].map((c) => c.localName),
  };
};

const createStaticPage = ({ headContent, content }) => {
  const { content: renamedContent, hydrate } =
    _renameCustomElementTags(content);
  const needsHydration = hydrate.length > 0;
  return staticPageHTMLTemplate({
    headContent,
    content: renamedContent,
    settings: $APP.settings,
    needsHydration,
  });
};

const generateStaticHTMLForCurrentRoute = async () => {
  const route = window.location.pathname;
  const bodyContent = document.body.innerHTML;
  const ssg = $APP.Router.currentRoute.route.ssg || false;
  const titleTag =
    document.querySelector("title")?.outerHTML ||
    `<title>${$APP.settings.name}</title>`;
  const metaTags = Array.from(
    document.querySelectorAll("head meta[name], head meta[property]"),
  )
    .map((tag) => tag.outerHTML)
    .join("\n");
  const canonicalLink =
    document.querySelector('head link[rel="canonical"]')?.outerHTML || "";
  const headSeoContent = `${titleTag}\n${metaTags}\n${canonicalLink}`;
  const filePath =
    route === "/" ? "index.html" : `${route.slice(1)}/index.html`;
  return {
    path: filePath,
    content: bodyContent,
    headContent: headSeoContent,
    ssg,
  };
};

const getStaticHTML = async ({ ssgOnly = false }) => {
  const visited = new Set();
  const toVisit = ["/"];
  const files = [];
  while (toVisit.length > 0) {
    const route = toVisit.pop();
    if (visited.has(route)) continue;
    visited.add(route);
    try {
      await Router.go(route);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const file = await generateStaticHTMLForCurrentRoute();
      if (ssgOnly) {
        if (file.ssg) files.push(file);
      } else {
        files.push(file);
      }
      const links = document.querySelectorAll('a[href^="/"]');
      for (const link of links) {
        const href = link.getAttribute("href");
        if (!visited.has(href) && !toVisit.includes(href)) {
          toVisit.push(href);
        }
      }
    } catch (error) {
      console.error(`Error generating static HTML for route ${route}:`, error);
    }
  }
  return files;
};

$APP.devFiles.add(new URL(import.meta.url).pathname);
$APP.addModule({
  name: "bundler",
  path: "/$app/bundler/views",
  dev: true,
  base: bundler,
});
export default bundler;
