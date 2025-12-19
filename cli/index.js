import { generate } from "@bootstrapp/generator/commands/generate.js";
import { newProject } from "@bootstrapp/generator/commands/new.js";
import * as adapter from "./adapter.js";
import { parseTestArgs, test } from "./commands/test.js";

export const electron = async (adapter, args = []) => {
  await adapter.spawn("npx", ["electron", ...args], {
    stdio: "inherit",
    shell: true,
  });
};

export const electronBuild = async (adapter, args = []) => {
  await adapter.spawn("npx", ["electron-builder", ...args], {
    stdio: "inherit",
    shell: true,
  });
};

const serve = async (adapter, args) => {
  const { serve: nodeServe } = await import("./serve.js");
  await nodeServe(adapter, args);
};

const args = process.argv.slice(2);
const command = args[0];

const main = async () => {
  try {
    switch (command) {
      case "electron":
        await electron(adapter, args.slice(1));
        break;

      case "electron:build":
        await electronBuild(adapter, args.slice(1));
        break;

      case "generate":
      case "g": {
        const type = args[1];
        const name = args[2];
        if (!type || !name) {
          adapter.error("Usage: bootstrapp generate <type> <name>");
          process.exit(1);
        }
        await generate(adapter, type, { name, path: args[3] });
        break;
      }

      case "new": {
        const projectType = args[1];
        const name = args[2];
        if (!projectType || !name) {
          adapter.error("Usage: bootstrapp new <type> <name>");
          process.exit(1);
        }
        await newProject(adapter, projectType, name);
        break;
      }

      case "analyze":
      case "a": {
        const { analyze, parseAnalyzeArgs } = await import("./commands/analyze.js");
        const analyzeOptions = parseAnalyzeArgs(args.slice(1));
        await analyze(adapter, analyzeOptions);
        break;
      }

      case "test": {
        const testOptions = parseTestArgs(args.slice(1));
        const success = await test(adapter, testOptions);
        process.exit(success ? 0 : 1);
        break;
      }

      case "types": {
        const { generateTypes, parseTypesArgs } = await import("./commands/types.js");
        const typesOptions = parseTypesArgs(args.slice(1));
        const success = await generateTypes(adapter, typesOptions);
        process.exit(success ? 0 : 1);
        break;
      }

      case "serve":
      case undefined:
        await serve(adapter, args.slice(command === "serve" ? 1 : 0));
        break;

      default:
        adapter.error(`Unknown command: ${command}`);
        adapter.log(`
Available commands:
  bootstrapp [path]              - Start dev server
  bootstrapp serve [path]        - Start dev server (explicit)
  bootstrapp analyze [project]   - Analyze bundle (files, deps, CSS)
    --build <id>                 - Specific build ID (default: latest)
    --json                       - Output as JSON
    --verbose                    - Verbose output
  bootstrapp types [options]     - Generate .d.ts from schema.js
    --input <file>               - Input schema file (default: ./models/schema.js)
    --output <file>              - Output file (default: ./types/global.d.ts)
    --verbose                    - Verbose output
  bootstrapp electron [path]     - Start Electron app
  bootstrapp electron:build      - Build Electron app
  bootstrapp generate <type> <n> - Generate code (component, page, api)
  bootstrapp new <type> <name>   - Create new project
  bootstrapp test [options]      - Run tests
    --node                       - Run only Node.js tests
    --browser                    - Run only browser tests
    --file <path>                - Run specific test file
    --suite <name>               - Run specific test suite
    --pattern <glob>             - Custom file pattern
    --headed                     - Run browser tests in headed mode
    --verbose                    - Verbose output
                `);
        process.exit(1);
    }
  } catch (err) {
    adapter.error("Error:", err.message);
    process.exit(1);
  }
};

export default main;
