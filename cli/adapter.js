import { spawn as nodeSpawn } from "node:child_process";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";

// File System operations
export const readFile = async (filePath, encoding = "utf-8") => {
	return fs.readFile(filePath, encoding);
};

export const writeFile = async (filePath, content, encoding = "utf-8") => {
	return fs.writeFile(filePath, content, encoding);
};

export const exists = async (filePath) => {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
};

export const stat = async (filePath) => {
	return fs.stat(filePath);
};

export const mkdir = async (dirPath, options = { recursive: true }) => {
	return fs.mkdir(dirPath, options);
};

export const readdir = async (dirPath) => {
	return fs.readdir(dirPath);
};

// Path operations
export const join = (...paths) => path.join(...paths);
export const resolve = (...paths) => path.resolve(...paths);
export const dirname = (filePath) => path.dirname(filePath);
export const basename = (filePath) => path.basename(filePath);
export const extname = (filePath) => path.extname(filePath);
export const normalize = (filePath) => path.normalize(filePath);

// Process operations
export const getCwd = () => process.cwd();
export const getEnv = (key) => process.env[key];
export const setEnv = (key, value) => {
	process.env[key] = value;
};

// Logging
export const log = (...args) => console.log(...args);
export const error = (...args) => console.error(...args);
export const warn = (...args) => console.warn(...args);

// Network operations
export const createServer = async (handler) => http.createServer(handler);
export const fetch = async (url, options) => globalThis.fetch(url, options);

// Child process operations
export const spawn = async (command, args, options) => {
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
	const chokidar = await import("chokidar");
	const watcher = chokidar.watch(paths, options);
	watcher.on("change", callback);
	return watcher;
};

// Node-specific: sync access for legacy code
export const accessSync = (filePath, mode) => fsSync.accessSync(filePath, mode);
export const constants = () => fsSync.constants;

// Export adapter object for convenience
export const nodeAdapter = {
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
	accessSync,
	constants,
};
