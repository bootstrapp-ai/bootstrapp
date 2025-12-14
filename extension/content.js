/**
 * Bootstrapp Extension - Content Script
 * Runs in every page with full DOM access
 */

(function () {
  "use strict";

  // Message types
  const MSG = {
    SCRAPE: "ext:scrape",
    INJECT: "ext:inject",
    EXECUTE: "ext:execute",
    OBSERVE: "ext:observe",
    DATA: "ext:data",
    ERROR: "ext:error",
    EVENT: "ext:event",
  };

  // Track active observers
  const observers = new Map();

  // Listen for messages from background script
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

  // Main message handler
  async function handleMessage(message) {
    const { type, ...payload } = message;

    switch (type) {
      case MSG.SCRAPE:
        return scrape(payload);

      case MSG.INJECT:
        return inject(payload);

      case MSG.EXECUTE:
        return execute(payload);

      case MSG.OBSERVE:
        return observe(payload);

      default:
        return { type: MSG.ERROR, error: `Unknown message type: ${type}` };
    }
  }

  // ============================================
  // SCRAPING
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
  // INJECTION
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
  // EXECUTION
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
  // OBSERVATION
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
  // INITIALIZATION
  // ============================================

  console.log("[CS] Bootstrapp content script loaded on:", window.location.href);
})();
