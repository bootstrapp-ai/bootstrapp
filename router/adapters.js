/**
 * @bootstrapp/router - Platform Adapters
 * Abstracts browser and memory-based platform operations
 */

/**
 * Browser Platform Adapter
 * Uses window.location, window.history, and document APIs
 */
export const createBrowserAdapter = () => ({
  type: "browser",

  // Get current location information
  getLocation() {
    return {
      href: window.location.href,
      origin: window.location.origin,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    };
  },

  // Check if current URL matches path
  isSamePath(path) {
    return window.location.href === path;
  },

  // Navigate to new path (SSG support)
  hardNavigate(path) {
    window.location.href = path;
  },

  // Push state to history
  pushState(state, path) {
    const url = new URL(path, window.location.origin);
    if (url.href !== window.location.href) {
      window.history.pushState(state, "", path);
    }
  },

  // Replace current state
  replaceState(state, path) {
    window.history.replaceState(state, "", path);
  },

  // Navigate back in history
  back() {
    window.history.back();
  },

  // Navigate forward in history
  forward() {
    window.history.forward();
  },

  // Set document title
  setTitle(title) {
    document.title = title;
  },
});

/**
 * Memory Platform Adapter
 * Maintains location and history state in memory
 */
export const createMemoryAdapter = (initialPath = "/") => {
  // Parse initial path
  const initialUrl = new URL(initialPath, "http://memory");

  // Internal state
  const state = {
    pathname: initialUrl.pathname,
    search: initialUrl.search,
    hash: initialUrl.hash,
    origin: "http://memory",
  };

  // History stack for back/forward
  const history = [];
  let historyIndex = -1;

  return {
    type: "memory",

    getLocation() {
      return {
        href: `${state.origin}${state.pathname}${state.search}${state.hash}`,
        origin: state.origin,
        pathname: state.pathname,
        search: state.search,
        hash: state.hash,
      };
    },

    isSamePath(path) {
      const url = new URL(path, state.origin);
      const currentHref = `${state.pathname}${state.search}${state.hash}`;
      const newHref = `${url.pathname}${url.search}${url.hash}`;
      return currentHref === newHref;
    },

    hardNavigate(path) {
      // Memory routers don't support SSG hard navigation
      // Just update state instead
      const url = new URL(path, state.origin);
      state.pathname = url.pathname;
      state.search = url.search;
      state.hash = url.hash;
    },

    pushState(stateData, path) {
      const url = new URL(path, state.origin);

      // Update current state
      state.pathname = url.pathname;
      state.search = url.search;
      state.hash = url.hash;

      // Truncate forward history if we're not at the end
      if (historyIndex < history.length - 1) {
        history.splice(historyIndex + 1);
      }

      // Add to history
      history.push({
        pathname: state.pathname,
        search: state.search,
        hash: state.hash,
        state: stateData,
      });
      historyIndex = history.length - 1;
    },

    replaceState(stateData, path) {
      const url = new URL(path, state.origin);

      // Update current state
      state.pathname = url.pathname;
      state.search = url.search;
      state.hash = url.hash;

      // Replace current history entry
      if (historyIndex >= 0) {
        history[historyIndex] = {
          pathname: state.pathname,
          search: state.search,
          hash: state.hash,
          state: stateData,
        };
      }
    },

    back() {
      if (historyIndex > 0) {
        historyIndex--;
        const entry = history[historyIndex];
        state.pathname = entry.pathname;
        state.search = entry.search;
        state.hash = entry.hash;
        return true; // Indicate navigation occurred
      }
      return false; // No navigation (at start of history)
    },

    forward() {
      if (historyIndex < history.length - 1) {
        historyIndex++;
        const entry = history[historyIndex];
        state.pathname = entry.pathname;
        state.search = entry.search;
        state.hash = entry.hash;
        return true; // Indicate navigation occurred
      }
      return false; // No navigation (at end of history)
    },

    setTitle(title) {
      // Memory routers don't update document.title
      // This is a no-op, but keeps the interface consistent
    },

    // Memory-specific: Get current history state for inspection
    getHistory() {
      return {
        entries: [...history],
        index: historyIndex,
      };
    },
  };
};
