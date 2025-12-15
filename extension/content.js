/**
 * Bootstrapp Extension - Content Script
 * Runs in every page with full DOM access
 *
 * Platform-agnostic core with integration handler registration
 */

(function () {
  "use strict";

  // ============================================
  // MESSAGE TYPES
  // ============================================

  const MSG = {
    // Core messages
    SCRAPE: "ext:scrape",
    INJECT: "ext:inject",
    EXECUTE: "ext:execute",
    OBSERVE: "ext:observe",
    START_INTERCEPT: "ext:startIntercept",
    STOP_INTERCEPT: "ext:stopIntercept",
    INTERCEPTED_DATA: "ext:interceptedData",
    DATA: "ext:data",
    ERROR: "ext:error",
    EVENT: "ext:event",

    // Instagram integration
    SCRAPE_INSTAGRAM: "ext:scrapeInstagram",
    FETCH_INSTAGRAM_PROFILE: "ext:fetchInstagramProfile",
    UPDATE_DOC_ID: "ext:updateDocId",

    // Google Maps integration
    SCRAPE_GMAPS_SEARCH: "ext:scrapeGmapsSearch",
    SCRAPE_GMAPS_DETAILS: "ext:scrapeGmapsDetails",
  };

  // ============================================
  // HANDLER REGISTRY
  // ============================================

  // Dynamic handler registry for integration-specific handlers
  const handlers = new Map();

  /**
   * Register a handler for a message type
   */
  function addHandler(type, handler) {
    handlers.set(type, handler);
  }

  // Track active observers
  const observers = new Map();

  // ============================================
  // MESSAGE LISTENER
  // ============================================

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[CS] Message received:", message);
    handleMessage(message)
      .then(sendResponse)
      .catch((error) => {
        console.error("[CS] Error:", error);
        sendResponse({ type: MSG.ERROR, error: error.message });
      });
    return true; // Keep channel open for async
  });

  // ============================================
  // MAIN MESSAGE HANDLER
  // ============================================

  async function handleMessage(message) {
    const { type, ...payload } = message;

    // Check for registered handlers first
    if (handlers.has(type)) {
      const handler = handlers.get(type);
      return handler(payload);
    }

    // Core message handlers
    switch (type) {
      case MSG.SCRAPE:
        return scrape(payload);

      case MSG.INJECT:
        return inject(payload);

      case MSG.EXECUTE:
        return execute(payload);

      case MSG.OBSERVE:
        return observe(payload);

      case MSG.START_INTERCEPT:
        return startInterception(payload);

      case MSG.STOP_INTERCEPT:
        return stopInterception();

      default:
        return { type: MSG.ERROR, error: `Unknown message type: ${type}` };
    }
  }

  // ============================================
  // CORE: SCRAPING
  // ============================================

  function scrape({ selector, options = {} }) {
    try {
      // Handle object selector (multiple fields)
      if (typeof selector === "object" && !Array.isArray(selector)) {
        const results = {};
        for (const [key, sel] of Object.entries(selector)) {
          results[key] = scrapeSelector(sel, options);
        }
        return { type: MSG.DATA, data: results };
      }

      // Single selector
      const data = scrapeSelector(selector, options);
      return { type: MSG.DATA, data };
    } catch (error) {
      return { type: MSG.ERROR, error: error.message };
    }
  }

  function scrapeSelector(selector, options = {}) {
    const {
      multiple = false,
      attribute = null,
      property = "textContent",
      html = false,
      computed = null,
    } = options;

    const elements = multiple
      ? Array.from(document.querySelectorAll(selector))
      : [document.querySelector(selector)].filter(Boolean);

    if (elements.length === 0) {
      return multiple ? [] : null;
    }

    const extract = (el) => {
      if (attribute) {
        return el.getAttribute(attribute);
      }
      if (html) {
        return el.innerHTML;
      }
      if (computed) {
        const styles = window.getComputedStyle(el);
        if (Array.isArray(computed)) {
          const result = {};
          computed.forEach((prop) => (result[prop] = styles[prop]));
          return result;
        }
        return styles[computed];
      }
      return el[property];
    };

    const results = elements.map((el) => ({
      value: extract(el),
      tagName: el.tagName.toLowerCase(),
      id: el.id || null,
      className: el.className || null,
      rect: el.getBoundingClientRect().toJSON(),
    }));

    return multiple ? results : results[0];
  }

  // ============================================
  // CORE: INJECTION
  // ============================================

  function inject({ html, target = "body", position = "beforeend", id = null }) {
    try {
      const targetEl = document.querySelector(target);
      if (!targetEl) {
        return { type: MSG.ERROR, error: `Target not found: ${target}` };
      }

      // Remove existing element with same ID if provided
      if (id) {
        const existing = document.getElementById(id);
        if (existing) existing.remove();
      }

      // Create wrapper and insert HTML
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;

      const injected = [];
      while (wrapper.firstChild) {
        const node = wrapper.firstChild;
        if (id && node.nodeType === 1) {
          node.id = id;
        }
        targetEl.insertAdjacentElement
          ? targetEl.insertAdjacentElement(position, node)
          : targetEl.appendChild(node);

        if (node.nodeType === 1) {
          injected.push({
            tagName: node.tagName.toLowerCase(),
            id: node.id || null,
          });
        }
      }

      return { type: MSG.DATA, data: { injected } };
    } catch (error) {
      return { type: MSG.ERROR, error: error.message };
    }
  }

  // ============================================
  // CORE: EXECUTION
  // ============================================

  function execute({ script, args = [] }) {
    try {
      // Create a function from the script string and execute it
      const fn = new Function(...args.map((_, i) => `arg${i}`), script);
      const result = fn(...args);

      return { type: MSG.DATA, data: result };
    } catch (error) {
      return { type: MSG.ERROR, error: error.message };
    }
  }

  // ============================================
  // CORE: OBSERVATION
  // ============================================

  function observe({ selector, events = ["mutation"], observerId = null }) {
    try {
      const id = observerId || `obs-${Date.now()}`;

      // Stop existing observer with same ID
      if (observers.has(id)) {
        stopObserver(id);
      }

      const target = document.querySelector(selector);
      if (!target) {
        return { type: MSG.ERROR, error: `Target not found: ${selector}` };
      }

      const observerData = { selector, events };

      // Mutation observer
      if (events.includes("mutation")) {
        const mutationObserver = new MutationObserver((mutations) => {
          const changes = mutations.map((m) => ({
            type: m.type,
            target: m.target.tagName?.toLowerCase(),
            addedNodes: m.addedNodes.length,
            removedNodes: m.removedNodes.length,
            attributeName: m.attributeName,
            oldValue: m.oldValue,
          }));

          // Send event to background
          chrome.runtime.sendMessage({
            type: MSG.EVENT,
            observerId: id,
            event: "mutation",
            data: changes,
          });
        });

        mutationObserver.observe(target, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
        });

        observerData.mutationObserver = mutationObserver;
      }

      // DOM event listeners
      const domEvents = events.filter((e) => e !== "mutation");
      if (domEvents.length > 0) {
        observerData.eventListeners = [];

        domEvents.forEach((eventType) => {
          const handler = (e) => {
            chrome.runtime.sendMessage({
              type: MSG.EVENT,
              observerId: id,
              event: eventType,
              data: {
                type: e.type,
                target: e.target?.tagName?.toLowerCase(),
                value: e.target?.value,
                timestamp: Date.now(),
              },
            });
          };

          target.addEventListener(eventType, handler);
          observerData.eventListeners.push({ eventType, handler, target });
        });
      }

      observers.set(id, observerData);

      return {
        type: MSG.DATA,
        data: { observerId: id, selector, events },
      };
    } catch (error) {
      return { type: MSG.ERROR, error: error.message };
    }
  }

  function stopObserver(id) {
    const observer = observers.get(id);
    if (!observer) return;

    if (observer.mutationObserver) {
      observer.mutationObserver.disconnect();
    }

    if (observer.eventListeners) {
      observer.eventListeners.forEach(({ eventType, handler, target }) => {
        target.removeEventListener(eventType, handler);
      });
    }

    observers.delete(id);
  }

  // ============================================
  // CORE: REQUEST INTERCEPTION
  // ============================================

  let interceptorActive = false;
  const INTERCEPT_EVENT = "__bootstrapp_intercepted";

  function startInterception(options = {}) {
    try {
      if (interceptorActive) {
        return { type: MSG.DATA, data: { status: "already_active" } };
      }

      // Inject the interceptor script into page context
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("interceptor.js");
      script.onload = () => script.remove();
      (document.head || document.documentElement).appendChild(script);

      // Listen for intercepted data from page context
      window.addEventListener(INTERCEPT_EVENT, handleInterceptedData);
      interceptorActive = true;

      console.log("[CS] Request interception started");
      return { type: MSG.DATA, data: { status: "started" } };
    } catch (error) {
      return { type: MSG.ERROR, error: error.message };
    }
  }

  function stopInterception() {
    try {
      window.removeEventListener(INTERCEPT_EVENT, handleInterceptedData);
      interceptorActive = false;
      console.log("[CS] Request interception stopped");
      return { type: MSG.DATA, data: { status: "stopped" } };
    } catch (error) {
      return { type: MSG.ERROR, error: error.message };
    }
  }

  function handleInterceptedData(event) {
    const { detail } = event;
    console.log("[CS] Intercepted data:", detail);

    // Send to background script
    // Note: detail.type is the interception type (e.g. "place", "search")
    // We rename it to interceptType to avoid overwriting MSG.INTERCEPTED_DATA
    console.log("[CS] Sending to background...");
    chrome.runtime.sendMessage(
      {
        type: MSG.INTERCEPTED_DATA,
        platform: detail.platform,
        url: detail.url,
        method: detail.method,
        interceptType: detail.type,  // renamed from 'type'
        parsed: detail.parsed,
        timestamp: detail.timestamp,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("[CS] sendMessage error:", chrome.runtime.lastError.message);
        } else {
          console.log("[CS] Background responded:", response);
        }
      }
    );
  }

  // ============================================
  // INTEGRATION: INSTAGRAM
  // ============================================

  const InstagramIntegration = (function () {
    const IG_APP_ID = "936619743392459";

    const DEFAULT_DOC_IDS = {
      profile: null,
      post: "10015901848474",
      reel: "25981206651899035",
      comments: "8845758582119845",
      timeline: "9310670392322965",
    };

    async function getDocIds() {
      try {
        const result = await chrome.storage.local.get("instagramDocIds");
        return { ...DEFAULT_DOC_IDS, ...(result.instagramDocIds || {}) };
      } catch {
        return DEFAULT_DOC_IDS;
      }
    }

    async function updateDocId({ type, docId }) {
      try {
        const current = await getDocIds();
        current[type] = docId;
        await chrome.storage.local.set({ instagramDocIds: current });
        console.log(`[Instagram] Updated doc_id for ${type}: ${docId}`);
        return { type: MSG.DATA, data: { success: true, type, docId } };
      } catch (error) {
        return { type: MSG.ERROR, error: error.message };
      }
    }

    function getLsdToken() {
      const input = document.querySelector('input[name="lsd"]');
      if (input?.value) return input.value;

      const scripts = document.querySelectorAll("script");
      for (const script of scripts) {
        const text = script.textContent || "";
        const match = text.match(/"LSD"\s*,\s*\[\]\s*,\s*\{\s*"token"\s*:\s*"([^"]+)"/);
        if (match) return match[1];
        const altMatch = text.match(/\\"LSD\\"[^}]*\\"token\\":\\"([^"\\]+)\\"/);
        if (altMatch) return altMatch[1];
      }
      return null;
    }

    function scrapeProfile() {
      try {
        const data = {
          username: null,
          fullName: null,
          bio: null,
          avatar: null,
          followers: null,
          following: null,
          posts: null,
          isVerified: false,
          externalLink: null,
          profileUrl: window.location.href,
        };

        const urlMatch = window.location.pathname.match(/^\/([^\/]+)\/?/);
        data.username = urlMatch ? urlMatch[1] : null;

        const metaTitle = document.querySelector('meta[property="og:title"]');
        if (metaTitle) {
          const nameMatch = metaTitle.content.match(/^([^(]+)\s*\(@/);
          if (nameMatch) data.fullName = nameMatch[1].trim();
        }

        const metaDesc = document.querySelector('meta[property="og:description"]');
        if (metaDesc) {
          const desc = metaDesc.content;
          const followersMatch = desc.match(/([\d,.]+[KMB]?)\s*Followers/i);
          const followingMatch = desc.match(/([\d,.]+[KMB]?)\s*Following/i);
          const postsMatch = desc.match(/([\d,.]+[KMB]?)\s*Posts/i);
          if (followersMatch) data.followers = followersMatch[1];
          if (followingMatch) data.following = followingMatch[1];
          if (postsMatch) data.posts = postsMatch[1];
        }

        const avatarImg =
          document.querySelector('header img[alt*="profile picture"]') ||
          document.querySelector("img[alt*=\"'s profile picture\"]") ||
          document.querySelector('header img[data-testid="user-avatar"]');
        if (avatarImg) data.avatar = avatarImg.src;

        data.isVerified = !!document.querySelector('svg[aria-label="Verified"]');

        const headerSection = document.querySelector("header section");
        if (headerSection) {
          const bioSpan = headerSection.querySelector('span[dir="auto"]');
          if (bioSpan && bioSpan.textContent && !bioSpan.textContent.includes("Followers")) {
            data.bio = bioSpan.textContent.trim();
          }
          if (!data.fullName) {
            const h1 = headerSection.querySelector("h1");
            if (h1) data.fullName = h1.textContent.trim();
          }
        }

        const extLink = document.querySelector('header a[href*="l.instagram.com"]');
        if (extLink) data.externalLink = extLink.href;

        console.log("[Instagram] Profile data:", data);
        return { type: MSG.DATA, data };
      } catch (error) {
        console.error("[Instagram] Scrape error:", error);
        return { type: MSG.ERROR, error: error.message };
      }
    }

    async function fetchProfileViaRest(username) {
      try {
        const response = await fetch(
          `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
          {
            headers: {
              "X-IG-App-ID": IG_APP_ID,
              "X-Requested-With": "XMLHttpRequest",
            },
            credentials: "include",
          }
        );
        if (!response.ok) return null;
        const data = await response.json();
        return data?.data?.user || null;
      } catch (error) {
        console.error("[Instagram] REST API error:", error);
        return null;
      }
    }

    async function fetchProfileViaGraphQL(username, docId) {
      const lsd = getLsdToken();
      if (!lsd || !docId) return null;

      try {
        const response = await fetch("https://www.instagram.com/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-IG-App-ID": IG_APP_ID,
            "X-FB-LSD": lsd,
            "X-ASBD-ID": "129477",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: new URLSearchParams({
            variables: JSON.stringify({ username }),
            doc_id: docId,
            lsd: lsd,
          }),
          credentials: "include",
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data?.data?.user || data?.data?.xdt_api__v1__users__web_profile_info?.user || null;
      } catch (error) {
        console.error("[Instagram] GraphQL error:", error);
        return null;
      }
    }

    async function fetchProfileAPI({ username }) {
      console.log(`[Instagram] Fetching profile: ${username}`);
      try {
        let user = await fetchProfileViaRest(username);
        if (user) {
          return { type: MSG.DATA, data: { success: true, user, source: "rest" } };
        }

        const docIds = await getDocIds();
        if (docIds.profile) {
          user = await fetchProfileViaGraphQL(username, docIds.profile);
          if (user) {
            return { type: MSG.DATA, data: { success: true, user, source: "graphql" } };
          }
        }

        return {
          type: MSG.DATA,
          data: { success: false, error: "Could not fetch profile. Make sure you're logged into Instagram." },
        };
      } catch (error) {
        return { type: MSG.ERROR, error: error.message };
      }
    }

    function isMatch() {
      return window.location.hostname.includes("instagram.com");
    }

    function register() {
      addHandler(MSG.SCRAPE_INSTAGRAM, () => scrapeProfile());
      addHandler(MSG.FETCH_INSTAGRAM_PROFILE, (payload) => fetchProfileAPI(payload));
      addHandler(MSG.UPDATE_DOC_ID, (payload) => updateDocId(payload));
      console.log("[Instagram] Handlers registered");
    }

    return { register, isMatch };
  })();

  // ============================================
  // INTEGRATION: GOOGLE MAPS
  // ============================================

  const GMapsIntegration = (function () {
    function isMatch() {
      return (
        window.location.hostname.includes("google.com") &&
        window.location.pathname.includes("/maps")
      );
    }

    function register() {
      // GMaps uses API interception only (via interceptor.js)
      // No DOM scraping handlers needed
      console.log("[GMaps] Integration ready (API interception mode)");
    }

    return { register, isMatch };
  })();

  // ============================================
  // INITIALIZATION
  // ============================================

  // Register integration handlers based on current page
  if (InstagramIntegration.isMatch()) {
    InstagramIntegration.register();
  }

  if (GMapsIntegration.isMatch()) {
    GMapsIntegration.register();
  }

  console.log("[CS] Bootstrapp content script loaded on:", window.location.href);
})();
