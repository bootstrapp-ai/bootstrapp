const serialize = (value) => {
  if ((typeof value === "object" && value !== null) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  return value;
};

const deserialize = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const get = (storage) => (key) => {
  const value = storage.getItem(key);
  return value !== null ? deserialize(value) : null;
};

const set = (storage) => (key, value) => {
  storage.setItem(key, serialize(value));
  return { key };
};

const remove = (storage) => (key) => {
  storage.removeItem(key);
  return { key };
};
const keys = (storage) => () => {
  return Object.keys(storage);
};

const has = (storage) => (key) => {
  return storage.getItem(key) !== null && storage.getItem(key) !== undefined;
};

const createStorageAdapter = (storage) => {
  return {
    has: has(storage),
    set: set(storage),
    remove: remove(storage),
    get: get(storage),
    keys: keys(storage),
  };
};

const ramStore = new Map();
const ram = {
  has: (key) => {
    return ramStore.has(key);
  },
  get: (key) => {
    return ramStore.get(key);
  },
  set: (key, value) => {
    ramStore.set(key, value);
    return { key };
  },
  remove: (key) => {
    ramStore.delete(key);
    return { key };
  },
  keys: () => ramStore.keys(),
};

const local = createStorageAdapter(window.localStorage);
const session = createStorageAdapter(window.sessionStorage);
export default { local, ram, session };
