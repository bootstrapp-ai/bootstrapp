import Github from "/$app/github/index.js";

export const migration = true;

import $APP from "@bootstrapp/base/app.js";

const { Router } = $APP;

/**
 * The script content for bootstrapping the PWA.
 * This is used in both the main index.html and statically generated pages.
 */
const PWA_HYDRATION_SCRIPT = `
        const ensureSWController = () => {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Service Worker timed out.")), 100);
            });
            const controllerPromise = new Promise((resolve) => {
                if (navigator.serviceWorker.controller) {
                    return resolve();
                }
                navigator.serviceWorker.addEventListener("controllerchange", () => {
                    return resolve();
                });
            });
            return Promise.race([controllerPromise, timeoutPromise]);
        };

        const startApp = async () => {
            if (!("serviceWorker" in navigator)) {
                console.warn("Service Worker not supported.");
                throw new Error("Platform not supported");
            }

            await navigator.serviceWorker.register("/sw.js", {
                scope: "/",
                type: "module",
            });

            try {
                console.log("Waiting for Service Worker to take control...");
                await ensureSWController();
                console.log("✅ Service Worker is in control!");
                const { default: $APP } = await import("/app.js");
                await $APP.load(true);
            } catch (error) {
                console.log({ error });
                console.warn("Service Worker did not take control in time. Reloading...");
                window.location.reload();
            }
        };

        startApp();`;

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

const minifyHTML = (content) => {
	if (typeof content !== "string") {
		return "";
	}
	return content
		.replace(/<!--.*?-->/gs, "")
		.replace(/>\s+</g, "><")
		.replace(/\s+/g, " ")
		.replace(/ >/g, ">")
		.replace(/< /g, "<")
		.trim();
};

const html = (strings, ...values) => {
	const fullHTML = strings.reduce(
		(acc, str, i) => acc + str + (values[i] || ""),
		"",
	);
	return minifyHTML(fullHTML);
};

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
	_createRobotsTXT(settings) {
		if (!settings.url) {
			console.warn("Cannot generate robots.txt: settings.url is not defined.");
			return "User-agent: *\nAllow: /\n";
		}
		const sitemapURL = new URL("sitemap.xml", settings.url).href;
		return `User-agent: *\nAllow: /\nSitemap: ${sitemapURL}`;
	},
	_createSitemapXML(settings, pages) {
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
	},
	_createIndexHTML(settings) {
		return html`<!DOCTYPE html>
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
    ${
			!$APP.settings.importmap
				? ""
				: html`<script type="importmap">
            ${JSON.stringify({ imports: $APP.settings.importmap }, null, 2)}
    </script>`
		}
    <link id="favicon" rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLW1vdW50YWluIj48cGF0aCBkPSJtOCAzIDQgOCA1LTUgNSAxNUgyTDggM3oiLz48L3N2Zz4="/>
    <script>${PWA_HYDRATION_SCRIPT}</script>
</head>
<body class="production flex">
    <app-container></app-container>
</body>
</html>`;
	},
	_createServiceWorker(fileMap) {
		const swContent =
			"const FILE_BUNDLE = " +
			JSON.stringify(fileMap, null, 2) +
			";" +
			`self.addEventListener("install", (e) => e.waitUntil(self.skipWaiting()));
      self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
      self.addEventListener("fetch", (e) => {
        const url = new URL(e.request.url);
        const file = FILE_BUNDLE[url.pathname];
        if (file) {
          e.respondWith(
            new Response(file.content, {
              headers: { 'Content-Type': file.mimeType || 'application/javascript' }
            })
          );
        }
      });`;
		return minify(swContent, "application/javascript");
	},
	_createManifest(settings = {}) {
		return {
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
		};
	},
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
	async _bundleSPACore(credentials, { mode = "spa" }) {
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
		if (mode === "hybrid")
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
				console.log($APP.settings.obfuscate, file.mimeType);
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
		await Github.deploy({
			...credentials,
			files: filesForDeployment,
		});
		console.log(`✅ ${mode.toUpperCase()} bundle deployed successfully!`);
		return filesForDeployment;
	},
	async deploy({ mode, ...credentials }) {
		switch (mode) {
			case "spa":
				return this.bundleSPA(credentials);
			case "ssg":
				return this.bundleSSG(credentials);
			case "hybrid":
				return this.bundleHybrid(credentials);
			case "worker":
				return this.deployWorker(credentials);
			default:
				console.error(`Unknown deployment mode: ${mode}`);
				throw new Error(`Unknown deployment mode: ${mode}`);
		}
	},
	async bundleSPA(credentials) {
		return this._bundleSPACore(credentials, { mode: "spa" });
	},
	async bundleSSG(credentials) {
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
		staticFiles.map(async (file) => {
			try {
				const title = `${file.title} - ${file.path}`;
				const body = `${file.title} - ${file.path}`;
				await Github.ensureDiscussionExists({
					...credentials,
					categoryName: "Announcements",
					title,
					body,
				});
			} catch (error) {
				console.error(
					"Failed to create GitHub discussion announcement:",
					error,
				);
			}
		});
		await Github.deploy({ ...credentials, files });
		return files;
	},
	async bundleHybrid(credentials) {
		return this._bundleSPACore(credentials, { mode: "hybrid" });
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
		if (root.hasAttribute("client:inject")) {
			root.innerHTML = ""; // Remove inner content for client:inject
		}
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
	const hydrationScript = needsHydration
		? `<script>setTimeout(() => { 
                ${PWA_HYDRATION_SCRIPT}
            }, 2000); </script>`
		: "";
	return minifyHTML(
		`<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="view-transition" content="same-origin">
        <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="${$APP.settings.theme_color || "#000000"}" />
        ${headContent}
                                                ${
																									needsHydration &&
																									$APP.settings.importmap
																										? html`<script type="importmap">
                        ${JSON.stringify({ imports: $APP.settings.importmap }, null, 2)}
                </script>`
																										: ""
																								}
        <link rel="stylesheet" href="/style.css">
            <link id="favicon" rel="icon" type="image/svg+xml" href="${$APP.settings.emojiIcon ? `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100%22><text y=%22.9em%22 font-size=%2290%22>${$APP.settings.emojiIcon}</text></svg>` : $APP.settings.icon}"/>
    </head>
    <body class="production flex">
      ${renamedContent}
      ${hydrationScript}
    </body>
</html>`.trim(),
	);
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
	path: "bundler/views",
	dev: true,
	base: bundler,
	settings: {
		appbar: {
			label: "Bundler",
			icon: "cog",
		},
	},
});
export default bundler;
