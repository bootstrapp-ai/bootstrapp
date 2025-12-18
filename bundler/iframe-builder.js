/**
 * Iframe-based build process controller
 * Creates an isolated iframe to navigate routes and collect cached files
 */

const IFRAME_TIMEOUT = 60000; // 1 minute max build time
const ROUTE_WAIT_TIME = 500; // Wait time per route

/**
 * Create a hidden iframe for build process
 * @returns {Promise<{iframe: HTMLIFrameElement, cleanup: Function}>}
 */
export function createBuildIframe() {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");

    // Hidden iframe styling
    iframe.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      left: -9999px;
      visibility: hidden;
    `;

    iframe.src = "/";

    const cleanup = () => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Iframe build timed out"));
    }, IFRAME_TIMEOUT);

    iframe.onload = () => {
      clearTimeout(timeout);
      resolve({ iframe, cleanup });
    };

    iframe.onerror = (error) => {
      clearTimeout(timeout);
      cleanup();
      reject(error);
    };

    document.body.appendChild(iframe);
  });
}

/**
 * Navigate through all routes in the iframe
 * @param {HTMLIFrameElement} iframe
 * @returns {Promise<Array>} Array of page info objects
 */
export async function navigateIframeRoutes(iframe) {
  const iframeWindow = iframe.contentWindow;
  const iframeRouter = iframeWindow.$APP?.Router;

  if (!iframeRouter) {
    throw new Error("Iframe $APP.Router not available");
  }

  const visited = new Set();
  const toVisit = ["/"];
  const pages = [];

  while (toVisit.length > 0) {
    const route = toVisit.pop();
    if (visited.has(route)) continue;
    visited.add(route);

    try {
      // Navigate in iframe context
      iframeRouter.go(route);
      await new Promise((resolve) => setTimeout(resolve, ROUTE_WAIT_TIME));

      // Collect page info from iframe
      const pageInfo = collectPageInfo(iframeWindow, route);
      pages.push(pageInfo);

      // Discover new routes from links in iframe
      const links = iframeWindow.document.querySelectorAll(
        'uix-link[href^="/"]',
      );
      for (const link of links) {
        const href = link.getAttribute("href");
        if (!visited.has(href) && !toVisit.includes(href)) {
          toVisit.push(href);
        }
      }
    } catch (error) {
      console.error(`Error navigating iframe to ${route}:`, error);
    }
  }

  return pages;
}

/**
 * Collect page info from iframe's current state
 * @param {Window} iframeWindow
 * @param {string} route
 * @returns {Object} Page info object
 */
function collectPageInfo(iframeWindow, route) {
  const doc = iframeWindow.document;
  const ssg = iframeWindow.$APP?.Router?.currentRoute?.route?.ssg || false;

  const titleTag =
    doc.querySelector("title")?.outerHTML ||
    `<title>${iframeWindow.$APP?.settings?.name || "App"}</title>`;
  const metaTags = Array.from(
    doc.querySelectorAll("head meta[name], head meta[property]"),
  )
    .map((tag) => tag.outerHTML)
    .join("\n");
  const canonicalLink =
    doc.querySelector('head link[rel="canonical"]')?.outerHTML || "";

  const filePath =
    route === "/" ? "index.html" : `${route.slice(1)}/index.html`;

  return {
    path: filePath,
    content: doc.body.innerHTML,
    headContent: `${titleTag}\n${metaTags}\n${canonicalLink}`,
    ssg,
  };
}
