const getHashParams = () => {
  const hash = window.location.hash.substring(1);
  return new URLSearchParams(hash);
};

const setHashParams = (params) => {
  const newHash = params.toString();
  window.location.hash = newHash;
};

const hash = {
  get: (key) => {
    const params = getHashParams();
    return params.get(key);
  },
  has: (key) => {
    const params = getHashParams();
    return params.has(key);
  },
  set: (key, value) => {
    const params = getHashParams();
    if (value === null || value === undefined) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setHashParams(params);
    window.dispatchEvent(new Event("popstate"));
    return { key };
  },
  remove: (key) => {
    const params = getHashParams();
    params.delete(key);
    setHashParams(params);
    return { key };
  },
  keys: () => {
    const params = getHashParams();
    return [...params.keys()];
  },
  entries: () => {
    const params = getHashParams();
    return [...params.entries()];
  },
};

const querystring = {
  get(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  },

  set(key, value) {
    const params = new URLSearchParams(window.location.search);
    if (value === null || value === undefined) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    window.history?.pushState?.(
      {},
      "",
      `${window.location.pathname}?${params}`,
    );
    window.dispatchEvent(new Event("popstate"));
    return { key };
  },

  remove(key) {
    const params = new URLSearchParams(window.location.search);
    params.delete(key);
    window.history.pushState?.({}, "", `${window.location.pathname}?${params}`);
    return { key };
  },
  keys() {
    const params = new URLSearchParams(window.location.search);
    return [...params.keys()];
  },
  has(key) {
    const params = new URLSearchParams(window.location.search);
    return params.has(key);
  },
  entries: () => {
    const params = new URLSearchParams(window.location.search);
    return [...params.entries()];
  },
};

export default { querystring, hash };
