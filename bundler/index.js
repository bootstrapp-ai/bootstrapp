import $APP from "/$app.js";
import { deployToTarget, getTargets } from "./targets/index.js";

// Import targets (they self-register)
import "./targets/github.js";
import "./targets/cloudflare.js";
import "./targets/targz.js";
import "./targets/localhost.js"; // Internal only, used by build()
import "./targets/vps.js";

// Import templates
import indexHTMLTemplate from "./templates/index.html.js";
import manifestJSONTemplate from "./templates/manifest.json.js";
import robotsTXTTemplate from "./templates/robots.txt.js";
import sitemapXMLTemplate from "./templates/sitemap.xml.js";
import staticPageHTMLTemplate from "./templates/static-page.html.js";
import swJSTemplate from "./templates/sw.js.js";

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
  // Skip minification if disabled in settings (default: enabled)
  if ($APP.settings.minify === false) return content;

  await esbuildReady;
  if (typeof content !== "string") return content;
  const loaderMap = {
    "application/javascript": "js",
    "text/javascript": "js",
    "application/x-javascript": "js",
    "text/css": "css",
  };
  // Handle mime types with charset (e.g., "text/javascript; charset=utf-8")
  const baseMimeType = mimeType?.split(";")[0]?.trim();
  const loader = loaderMap[baseMimeType];
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
  _createServiceWorker(fileMap, { bundleAdmin = false } = {}) {
    return minify(
      swJSTemplate({ fileMap, bundleAdmin }),
      "application/javascript",
    );
  },
  _createManifest: manifestJSONTemplate,
  async extractCSS(targetDocument = document) {
    // Collect UnoCSS/Tailwind styles (generated at runtime)
    const unoStyles = Array.from(
      targetDocument.querySelectorAll("style[data-unocss-runtime-layer]")
    ).map(s => s.textContent).join("\n");

    // Collect other global styles (theme, base styles)
    const globalStyles = Array.from(targetDocument.querySelectorAll("style"))
      .filter(style => {
        const isComponent = style.getAttribute("data-component-style");
        const isUno = style.getAttribute("data-unocss-runtime-layer");
        return !isComponent && !isUno;
      })
      .map(style => style.innerHTML)
      .join("\n");

    // Collect component CSS paths for @import
    const componentPaths = Array.from(
      targetDocument.querySelectorAll("style[data-component-style]")
    ).map(style => style.getAttribute("data-component-style"));

    // Generate @import statements for component CSS (deduplicated)
    const componentImports = [...new Set(componentPaths)]
      .map(path => `@import url("${path}");`)
      .join("\n");

    return {
      globalCSS: `${componentImports}\n${unoStyles}\n${globalStyles}`,
      componentPaths: [...new Set(componentPaths)]
    };
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
  async _bundleSPACore({ mode = "spa", onProgress }) {
    console.log(`📦 Building ${mode.toUpperCase()} in isolated iframe...`);

    // Cache lifecycle: Clear → Enable → Create iframe → Navigate → Get files → Cleanup
    console.log("📦 Step 1: Clearing existing local cache...");
    await $APP.SW.clearLocalCache();

    console.log("📦 Step 2: Enabling local caching...");
    await $APP.SW.enableLocalCaching();

    let buildContext = null;

    try {
      console.log("📦 Step 3: Creating build iframe...");
      const { createBuildIframe, navigateIframeRoutes } = await import(
        "./iframe-builder.js"
      );
      buildContext = await createBuildIframe();

      console.log("📦 Step 4: Waiting for iframe app initialization...");
      await this._waitForIframeReady(buildContext.iframe);

      console.log("📦 Step 5: Navigating routes in iframe...");
      const pages = await navigateIframeRoutes(buildContext.iframe, onProgress);

      // Small delay to ensure all async resources are cached
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("📦 Step 6: Extracting CSS from iframe...");
      const iframeDoc = buildContext.iframe.contentWindow.document;
      const { globalCSS, componentPaths } = await this.extractCSS(iframeDoc);

      console.log("📦 Step 7: Retrieving cached files...");
      const filesForSW = await $APP.SW.request("SW:GET_CACHED_FILES");

      // Process the bundle
      return await this._processBundleFiles({ filesForSW, pages, mode, globalCSS, componentPaths });
    } finally {
      // Cleanup iframe
      if (buildContext?.cleanup) {
        buildContext.cleanup();
      }
      console.log(
        "📦 Step 7: Cleanup - disabling caching and clearing cache...",
      );
      await $APP.SW.disableLocalCaching();
      await $APP.SW.clearLocalCache();
    }
  },

  async _waitForIframeReady(iframe, timeout = 30000) {
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
      const check = () => {
        if (Date.now() - startTime > timeout) {
          reject(new Error("Iframe initialization timed out"));
          return;
        }
        if (iframe.contentWindow.$APP?.Router?.routes?.length > 0) {
          resolve();
          return;
        }
        setTimeout(check, 100);
      };
      check();
    });
  },

  /**
   * Process collected files into deployment bundle
   * @private
   */
  async _processBundleFiles({ filesForSW, pages, mode, globalCSS, componentPaths }) {
    const filesForDeployment = {};
    const addFilePromises = [];
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
        filesForDeployment[path] = {
          content: minifiedContent,
          mimeType: resolvedMimeType,
        };
      }
    };
    const indexHTML = this._createIndexHTML($APP.settings);
    if (mode === "hybrid") {
      pages.forEach((file) => {
        if (file.ssg)
          filesForDeployment[file.path] = { content: createStaticPage(file) };
        else filesForDeployment[file.path] = { content: indexHTML };
      });
    }
    // style.css contains @imports for component CSS + UnoCSS/Tailwind + global styles
    addFilePromises.push(
      addFile({ path: "style.css", content: globalCSS, mimeType: "text/css" }),
    );
    filesForDeployment["style.css"] = {
      content: globalCSS,
      mimeType: "text/css",
    };
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
    filesForDeployment["manifest.json"] = { content: JSON.stringify(manifest) };
    const sitemapXML = this._createSitemapXML($APP.settings, pages);
    filesForDeployment["sitemap.xml"] = { content: sitemapXML };
    const robotsTXT = this._createRobotsTXT($APP.settings);
    filesForDeployment["robots.txt"] = { content: robotsTXT };
    // Always set index.html - object assignment ensures the correct version wins
    filesForDeployment["index.html"] = { content: indexHTML };
    filesForDeployment["404.html"] = { content: indexHTML };
    // Handle devFiles - stub them out
    $APP.devFiles.forEach((path) => {
      if (filesForSW[path]) {
        filesForSW[path] = { content: "export default {}" };
      }
    });

    // Check bundleAdmin setting (default: false - exclude admin from production)
    const bundleAdmin = $APP.settings.bundleAdmin === true;

    if (!bundleAdmin) {
      // Filter out admin/bundler/fflate files from production bundle
      const adminPatterns = [
        /^\/$app\/admin\//,
        /^\/$app\/bundler\//,
        /^\/fflate/,
        /^\/npm\/fflate/,
      ];

      for (const path of Object.keys(filesForSW)) {
        if (adminPatterns.some((pattern) => pattern.test(path))) {
          delete filesForSW[path];
        }
      }
      console.log("📦 Admin excluded from bundle (bundleAdmin: false)");
    } else {
      // Generate admin/index.html when bundleAdmin is true
      const adminHTML = this._createIndexHTML($APP.settings, { isAdmin: true });
      filesForDeployment["admin/index.html"] = { content: adminHTML };
      filesForSW["/admin/index.html"] = {
        content: adminHTML,
        mimeType: "text/html",
      };
      console.log("📦 Admin included in bundle (bundleAdmin: true)");
    }

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
    let serviceWorker = await this._createServiceWorker(processedFilesForSW, {
      bundleAdmin,
    });
    if ($APP.settings.bundle?.obfuscate) {
      console.log("🔒 Obfuscating service worker (sw.js)...");
      serviceWorker = await obfuscate(serviceWorker);
    }
    filesForDeployment["sw.js"] = { content: serviceWorker };
    const fileCount = Object.keys(filesForDeployment).length;
    console.log(
      `✅ ${mode.toUpperCase()} bundle created with ${fileCount} files`,
    );
    // Convert object to array format for deployment targets
    return Object.entries(filesForDeployment).map(([path, file]) => ({
      path,
      content: file.content,
      mimeType: file.mimeType,
    }));
  },
  /**
   * Get all available deployment targets
   */
  getTargets,

  /**
   * Build files internally (without deploying)
   * @private
   */
  async _buildFiles(mode, onProgress) {
    switch (mode) {
      case "spa":
        return this._bundleSPACore({ mode: "spa", onProgress });
      case "ssg":
        return this.bundleSSG(onProgress);
      case "hybrid":
        return this._bundleSPACore({ mode: "hybrid", onProgress });
      default:
        throw new Error(`Unknown build mode: ${mode}`);
    }
  },

  /**
   * Build and save to localhost (creates versioned build in .deployed/builds/)
   * @param {string} mode - Build mode: spa, ssg, hybrid
   * @param {Function} onProgress - Optional callback for progress updates
   * @returns {Object} Build result with buildId and file count
   */
  async build(mode, onProgress) {
    const files = await this._buildFiles(mode, onProgress);

    // Deploy to localhost to create versioned build
    const result = await deployToTarget("localhost", files, {
      name: $APP.settings.name,
      version: Date.now(),
    });

    return {
      buildId: result.buildId,
      fileCount: files.length,
      mode,
      timestamp: Date.now(),
    };
  },

  /**
   * Deploy an existing build to a target
   * @param {Object} options - Deployment options
   * @param {string} options.buildId - Existing build ID to deploy (required)
   * @param {string} options.target - Deploy target: github, cloudflare, vps, targz
   * @param {Object} options.credentials - Target-specific credentials
   */
  async deploy({ buildId, target = "github", ...credentials }) {
    console.log(`🚀 Deploying build ${buildId} to ${target}...`);

    // Cloudflare worker is special case
    if (target === "cloudflare") {
      return this.deployWorker({ cloudflare: credentials });
    }

    if (!buildId) {
      throw new Error(
        "buildId is required. Run build() first to create a build.",
      );
    }

    // Targets that need actual file content (fetch from build)
    let files = [];
    if (target === "targz") {
      console.log(`📦 Fetching files from build ${buildId}...`);
      const response = await fetch(`/builds/${buildId}/files`);
      if (!response.ok) {
        throw new Error(`Failed to fetch build files: ${response.status}`);
      }
      const data = await response.json();
      files = data.files || [];
    }

    // Deploy from existing build
    const result = await deployToTarget(target, files, {
      ...credentials,
      buildId,
      name: $APP.settings.name,
      version: credentials.version || Date.now(),
    });

    console.log(`✅ Deployment to ${target} completed!`, result);
    return result;
  },
  async bundleSPA() {
    return this._bundleSPACore({ mode: "spa" });
  },
  async bundleSSG(onProgress) {
    console.log("📦 Building SSG in isolated iframe...");
    const files = {};

    // Use iframe to navigate routes
    const { createBuildIframe, navigateIframeRoutes } = await import(
      "./iframe-builder.js"
    );
    const buildContext = await createBuildIframe();

    try {
      await this._waitForIframeReady(buildContext.iframe);
      const allPages = await navigateIframeRoutes(
        buildContext.iframe,
        onProgress,
      );

      // Filter only SSG pages
      const staticFiles = allPages.filter((file) => file.ssg);
      staticFiles.forEach((file) => {
        files[file.path] = { content: createStaticPage(file) };
      });

      // Extract CSS from iframe (where UnoCSS generated styles)
      const iframeDoc = buildContext.iframe.contentWindow.document;
      const { globalCSS } = await this.extractCSS(iframeDoc);

      // style.css contains @imports + UnoCSS/Tailwind + global styles
      files["style.css"] = { content: globalCSS };
      const data = {};
      files["data.json"] = { content: JSON.stringify(data, null, 2) };
      const sitemapXML = this._createSitemapXML($APP.settings, staticFiles);
      files["sitemap.xml"] = { content: sitemapXML };
      const robotsTXT = this._createRobotsTXT($APP.settings);
      files["robots.txt"] = { content: robotsTXT };
      const fileCount = Object.keys(files).length;
      console.log(`✅ SSG bundle created with ${fileCount} files`);
      // Convert object to array format for deployment targets
      return Object.entries(files).map(([path, file]) => ({
        path,
        content: file.content,
        mimeType: file.mimeType,
      }));
    } finally {
      buildContext?.cleanup?.();
    }
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

$APP.devFiles.add(new URL(import.meta.url).pathname);
$APP.addModule({
  name: "bundler",
  path: "/$app/bundler/views",
  dev: true,
  base: bundler,
});
export default bundler;
