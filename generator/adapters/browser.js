// In-memory file system
const fileSystem = new Map();
const env = new Map();

// File System operations
export const readFile = async (filePath, encoding = "utf-8") => {
    const content = fileSystem.get(filePath);
    if (content === undefined) {
        throw new Error(`File not found: ${filePath}`);
    }
    return encoding === "utf-8" ? content : new TextEncoder().encode(content);
};

export const writeFile = async (filePath, content, encoding = "utf-8") => {
    const text = typeof content === "string" ? content : new TextDecoder().decode(content);
    fileSystem.set(filePath, text);
};

export const exists = async (filePath) => {
    return fileSystem.has(filePath);
};

export const stat = async (filePath) => {
    const fileExists = await exists(filePath);
    if (!fileExists) throw new Error(`File not found: ${filePath}`);
    
    const content = fileSystem.get(filePath);
    return {
        isFile: () => true,
        isDirectory: () => false,
        size: content.length,
    };
};

export const mkdir = async (dirPath, options) => {
    // No-op in browser
    return dirPath;
};

export const readdir = async (dirPath) => {
    const files = [];
    for (const [path] of fileSystem) {
        if (path.startsWith(dirPath)) {
            files.push(path);
        }
    }
    return files;
};

// Path operations (simplified for browser)
export const join = (...paths) => {
    return paths.join("/").replace(/\/+/g, "/");
};

export const resolve = (...paths) => join(...paths);

export const dirname = (filePath) => {
    return filePath.split("/").slice(0, -1).join("/") || "/";
};

export const basename = (filePath) => {
    return filePath.split("/").pop();
};

export const extname = (filePath) => {
    const match = filePath.match(/\.[^.]+$/);
    return match ? match[0] : "";
};

export const normalize = (filePath) => {
    return filePath.replace(/\/+/g, "/");
};

// Process operations
export const getCwd = () => "/";
export const getEnv = (key) => env.get(key);
export const setEnv = (key, value) => env.set(key, value);

// Logging
export const log = (...args) => console.log(...args);
export const error = (...args) => console.error(...args);
export const warn = (...args) => console.warn(...args);

// Network operations
export const createServer = async (handler) => {
    throw new Error("Server creation not supported in browser");
};

export const fetch = async (url, options) => globalThis.fetch(url, options);

// Child process operations
export const spawn = async (command, args, options) => {
    throw new Error("Process spawning not supported in browser");
};

// File watching
export const watch = async (paths, options, callback) => {
    warn("File watching not supported in browser");
    return { close: () => {} };
};

// Export adapter object
export const browserAdapter = {
    readFile,
    writeFile,
    exists,
    stat,
    mkdir,
    readdir,
    join,
    resolve,
    dirname,
    basename,
    extname,
    normalize,
    getCwd,
    getEnv,
    setEnv,
    log,
    error,
    warn,
    createServer,
    fetch,
    spawn,
    watch,
};
