let ts;
let tsLibCache = {};
async function loadCjsModule(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const scriptText = await response.text();
		const module = { exports: {} };
		const exports = module.exports;
		const scriptFunc = new Function("module", "exports", scriptText);
		scriptFunc(module, exports);
		const exportedModule = module.exports;
		if (Object.keys(exportedModule).length === 0) {
			return exports;
		}

		return exportedModule;
	} catch (error) {
		console.error(`Failed to load module from ${url}:`, error);
		throw error;
	}
}

const loadTypeScript = async () => {
	if (ts) return;
	try {
		const tsModule = await loadCjsModule(
			"https://unpkg.com/typescript@latest/lib/typescript.js",
		);
		ts = tsModule;
		self.ts = ts;
	} catch (error) {
		console.error("Failed to load TypeScript:", error);
	}
};

const loadTypeScriptLibs = async () => {
	if (Object.keys(tsLibCache).length > 0) return;
	const libsToFetch = [
		"lib.es2020.d.ts",
		"lib.es2018.d.ts",
		"lib.es2019.d.ts",
		"lib.es2019.string.d.ts",
		"lib.es2019.array.d.ts",
		"lib.es2019.object.d.ts",
		"lib.es2020.bigint.d.ts",
		"lib.es2020.date.d.ts",
		"lib.es2020.number.d.ts",
		"lib.es2020.promise.d.ts",
		"lib.es2020.sharedmemory.d.ts",
		"lib.es2020.string.d.ts",
		"lib.es2020.symbol.wellknown.d.ts",
		"lib.es2015.symbol.d.ts",
		"lib.es2019.symbol.d.ts",
		"lib.es2019.intl.d.ts",
		"lib.es2015.iterable.d.ts",
		"lib.es2018.intl.d.ts",
		"lib.es2020.intl.d.ts",
		"lib.es5.d.ts",
		"lib.dom.d.ts",
		"lib.es2017.d.ts",
		"lib.es2018.asynciterable.d.ts",
		"lib.es2018.asyncgenerator.d.ts",
		"lib.es2018.promise.d.ts",
		"lib.es2018.regexp.d.ts",
		"lib.es2016.d.ts",
		"lib.es2017.arraybuffer.d.ts",
		"lib.es2017.date.d.ts",
		"lib.es2017.intl.d.ts",
		"lib.es2017.object.d.ts",
		"lib.es2017.sharedmemory.d.ts",
		"lib.es2017.string.d.ts",
		"lib.es2017.typedarrays.d.ts",
		"lib.es2015.d.ts",
		"lib.es2016.array.include.d.ts",
		"lib.es2016.intl.d.ts",
		"lib.es2015.symbol.wellknown.d.ts",
		"lib.es2015.core.d.ts",
		"lib.es2015.collection.d.ts",
		"lib.es2015.generator.d.ts",
		"lib.es2015.promise.d.ts",
		"lib.es2015.proxy.d.ts",
		"lib.es2015.reflect.d.ts",
		"lib.decorators.d.ts",
		"lib.decorators.legacy.d.ts",
	];

	try {
		const promises = libsToFetch.map((lib) =>
			fetch(`https://unpkg.com/typescript@latest/lib/${lib}`).then((res) => {
				if (!res.ok) throw new Error(`Failed to fetch ${lib}`);
				return res.text();
			}),
		);
		const contents = await Promise.all(promises);
		const newCache = {};
		libsToFetch.forEach((lib, index) => {
			newCache[lib] = contents[index];
		});

		return newCache;
	} catch (e) {
		console.error(
			"Could not fetch TypeScript library definitions. Type checking will be less accurate.",
			e,
		);
	}
};

self.onmessage = async (e) => {
	const { type, payload } = e.data;
	switch (type) {
		case "init":
			await loadTypeScript();
			tsLibCache = await loadTypeScriptLibs();
			break;
		case "validate": {
			if (!ts) return;
			const validationErrors = validate(payload.code, payload.filePath);
			self.postMessage({
				type: "validationComplete",
				payload: { errors: validationErrors },
			});
			break;
		}
		case "transpile": {
			if (!ts) {
				// Fallback if TS isn't loaded yet
				self.postMessage({
					type: "transpileComplete",
					payload: {
						transpiledCode: payload.code,
						requestId: payload.requestId,
					},
				});
				return;
			}
			const transpiledResult = transpile(payload.code);
			self.postMessage({
				type: "transpileComplete",
				payload: {
					transpiledCode: transpiledResult,
					requestId: payload.requestId,
				},
			});
			break;
		}
	}
};

const validate = (code, filePath) => {
	try {
		const defaultLibFileName = "lib.es2020.d.ts";
		const compilerOptions = {
			target: ts.ScriptTarget.ES2020,
			module: ts.ModuleKind.CommonJS,
			allowJs: true,
			esModuleInterop: true,
			noEmit: true,
		};

		const host = {
			getSourceFile: (fileName, languageVersion) => {
				const sourceText =
					tsLibCache[fileName] || (fileName === filePath ? code : undefined);
				return sourceText !== undefined
					? ts.createSourceFile(fileName, sourceText, languageVersion)
					: undefined;
			},
			writeFile: () => {},
			getDefaultLibFileName: () => defaultLibFileName,
			useCaseSensitiveFileNames: () => false,
			getCanonicalFileName: (fileName) => fileName,
			getCurrentDirectory: () => "/",
			getNewLine: () => "\n",
			fileExists: (fileName) => fileName === filePath || !!tsLibCache[fileName],
			readFile: (fileName) =>
				fileName === filePath ? code : tsLibCache[fileName],
		};

		const program = ts.createProgram([filePath], compilerOptions, host);
		const diagnostics = ts.getPreEmitDiagnostics(program);

		return diagnostics.map((diagnostic) => {
			const message = ts.flattenDiagnosticMessageText(
				diagnostic.messageText,
				"\n",
			);
			if (diagnostic.file && diagnostic.start) {
				const { line, character } = ts.getLineAndCharacterOfPosition(
					diagnostic.file,
					diagnostic.start,
				);
				return { line: line + 1, character: character + 1, message };
			}
			return { line: 0, character: 0, message };
		});
	} catch (error) {
		console.error("Error during code validation in worker:", error);
		return [
			{
				line: 0,
				character: 0,
				message: "An unexpected error occurred during validation.",
			},
		];
	}
};

const transpile = (code) => {
	try {
		const jsResult = ts.transpileModule(code, {
			compilerOptions: {
				module: ts.ModuleKind.CommonJS,
				target: ts.ScriptTarget.ES2020,
			},
		});
		return jsResult.outputText;
	} catch (error) {
		console.error("TypeScript compilation failed in worker:", error);
		return code;
	}
};
