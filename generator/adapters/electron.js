const isRenderer = typeof window !== "undefined";

// File System operations
export const readFile = async (filePath, encoding = "utf-8") => {
	if (isRenderer) {
		return window.electron.readFile(filePath, encoding);
	}
	const fs = await import("node:fs/promises");
	return fs.readFile(filePath, encoding);
};

export const writeFile = async (filePath, content, encoding = "utf-8") => {
	if (isRenderer) {
		return window.electron.writeFile(filePath, content, encoding);
	}
	const fs = await import("node:fs/promises");
	return fs.writeFile(filePath, content, encoding);
};

export const exists = async (filePath) => {
	if (isRenderer) {
		return window.electron.exists(filePath);
	}
	const fs = await import("node:fs/promises");
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
};

export const stat = async (filePath) => {
	if (isRenderer) {
		return window.electron.stat(filePath);
	}
	const fs = await import("node:fs/promises");
	return fs.stat(filePath);
};

export const mkdir = async (dirPath, options) => {
	if (isRenderer) {
		return window.electron.mkdir(dirPath, options);
	}
	const fs = await import("node:fs/promises");
	return fs.mkdir(dirPath, options);
};

export const readdir = async (dirPath) => {
	if (isRenderer) {
		return window.electron.readdir(dirPath);
	}
	const fs = await import("node:fs/promises");
	return fs.readdir(dirPath);
};

// Path operations
export const join = (...paths) => {
	if (isRenderer) {
		return window.electron.path.join(...paths);
	}
	const path = require("node:path");
	return path.join(...paths);
};

export const resolve = (...paths) => {
	if (isRenderer) {
		return window.electron.path.resolve(...paths);
	}
	const path = require("node:path");
	return path.resolve(...paths);
};

export const dirname = (filePath) => {
	if (isRenderer) {
		return window.electron.path.dirname(filePath);
	}
	const path = require("node:path");
	return path.dirname(filePath);
};

export const basename = (filePath) => {
	if (isRenderer) {
		return window.electron.path.basename(filePath);
	}
	const path = require("node:path");
	return path.basename(filePath);
};

export const extname = (filePath) => {
	if (isRenderer) {
		return window.electron.path.extname(filePath);
	}
	const path = require("node:path");
	return path.extname(filePath);
};

export const normalize = (filePath) => {
	if (isRenderer) {
		return window.electron.path.normalize(filePath);
	}
	const path = require("node:path");
	return path.normalize(filePath);
};

// Process operations
export const getCwd = () => {
	if (isRenderer) {
		return window.electron.getCwd();
	}
	return process.cwd();
};

export const getEnv = (key) => {
	if (isRenderer) {
		return window.electron.getEnv(key);
	}
	return process.env[key];
};

export const setEnv = (key, value) => {
	if (isRenderer) {
		return window.electron.setEnv(key, value);
	}
	process.env[key] = value;
};

// Logging
export const log = (...args) => console.log(...args);
export const error = (...args) => console.error(...args);
export const warn = (...args) => console.warn(...args);

// Network operations
export const createServer = async (handler) => {
	if (isRenderer) {
		throw new Error("Server creation must be done in main process");
	}
	const http = await import("node:http");
	return http.createServer(handler);
};

export const fetch = async (url, options) => globalThis.fetch(url, options);

// Child process operations
export const spawn = async (command, args, options) => {
	if (isRenderer) {
		return window.electron.spawn(command, args, options);
	}
	const { spawn: nodeSpawn } = await import("node:child_process");
	return new Promise((resolve, reject) => {
		const proc = nodeSpawn(command, args, options);
		proc.on("exit", (code) => {
			if (code === 0) resolve();
			else reject(new Error(`Process exited with code ${code}`));
		});
	});
};

// File watching
export const watch = async (paths, options, callback) => {
	if (isRenderer) {
		return window.electron.watch(paths, options, callback);
	}
	const chokidar = await import("chokidar");
	const watcher = chokidar.watch(paths, options);
	watcher.on("change", callback);
	return watcher;
};

// Export adapter object
export const electronAdapter = {
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
