/**
 * @file CLI command for generating TypeScript types from schema.js
 * @description Generates .d.ts files from T.* schema definitions
 */

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

/**
 * Generate TypeScript declarations from schema.js
 * @param {Object} adapter - CLI adapter
 * @param {Object} options - Command options
 */
export async function generateTypes(adapter, options = {}) {
  const {
    input = "./models/schema.js",
    output = "./types/global.d.ts",
    verbose = false,
  } = options;

  console.log(
    "\x1b[1m\x1b[35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m"
  );
  console.log("\x1b[1m\x1b[35m              GENERATE TYPES FROM SCHEMA\x1b[0m");
  console.log(
    "\x1b[1m\x1b[35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n"
  );

  const inputPath = path.resolve(process.cwd(), input);
  const outputPath = path.resolve(process.cwd(), output);

  console.log(`\x1b[90mInput:  ${inputPath}\x1b[0m`);
  console.log(`\x1b[90mOutput: ${outputPath}\x1b[0m\n`);

  // Check input file exists
  if (!fs.existsSync(inputPath)) {
    console.log("\x1b[31mSchema file not found.\x1b[0m");
    console.log(`\x1b[90mExpected: ${input}\x1b[0m\n`);
    return false;
  }

  // Load codegen from types package
  const { generateTypesFromSchema, generateAppDts } = await import(
    "../../types/codegen.js"
  );

  // Register /$app/ loader for virtual path resolution
  const { register } = await import("node:module");
  register("../loader-hooks.js", import.meta.url);

  // Import schema.js
  const fileUrl = pathToFileURL(inputPath).href;
  const importUrl = `${fileUrl}?t=${Date.now()}`;

  let schemaModule;
  try {
    schemaModule = await import(importUrl);
  } catch (error) {
    console.log(`\x1b[31mFailed to import schema:\x1b[0m ${error.message}`);
    if (verbose) {
      console.error(error.stack);
    }
    return false;
  }

  const models = schemaModule.default;
  if (!models) {
    console.log("\x1b[33mNo default export found in schema.js\x1b[0m");
    console.log(
      "\x1b[90mHint: Use 'export default { users: {...}, places: {...} }'\x1b[0m"
    );
    return false;
  }

  // Generate TypeScript using types/codegen
  const { content: globalDtsContent, modelCount } = generateTypesFromSchema(
    models,
    {
      schemaName: path.basename(input),
    }
  );

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write global.d.ts
  fs.writeFileSync(outputPath, globalDtsContent);

  // Write $app.d.ts
  const appDtsPath = path.join(outputDir, "$app.d.ts");
  fs.writeFileSync(appDtsPath, generateAppDts());

  if (verbose) {
    console.log(`  \x1b[32m✓\x1b[0m Generated ${modelCount} model interfaces`);
  }

  console.log(
    `\x1b[32mGenerated ${modelCount} model(s) + AppModel → ${path.relative(process.cwd(), outputPath)}\x1b[0m`
  );
  console.log(
    `\x1b[32mGenerated $app.d.ts → ${path.relative(process.cwd(), appDtsPath)}\x1b[0m`
  );
  return true;
}

/**
 * Parse CLI arguments for types command
 */
export function parseTypesArgs(args) {
  const options = {
    input: "./models/schema.js",
    output: "./types/global.d.ts",
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--input":
      case "-i":
        options.input = args[++i];
        break;
      case "--output":
      case "-o":
        options.output = args[++i];
        break;
      case "--verbose":
      case "-v":
        options.verbose = true;
        break;
    }
  }

  return options;
}

export default generateTypes;
