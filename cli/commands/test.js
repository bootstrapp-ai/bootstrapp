/**
 * @file Unified Test Command
 * @description Orchestrates both Node.js and browser tests
 */

import { globSync } from "glob";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import {
  runBrowserTestFile,
  runBrowserTestSuite,
  runBrowserTests,
} from "./test-browser.js";
import { runNodeTests } from "./test-node.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dedicated port for test server (different from dev server default 1315)
const TEST_SERVER_PORT = 2215;

/**
 * Start a test server for browser tests
 * @param {string} projectDir - Directory to serve
 * @returns {Promise<{process: ChildProcess, port: number}>}
 */
async function startTestServer(projectDir) {
  const cliPath = path.resolve(__dirname, "..", "bin", "bootstrapp.js");

  return new Promise((resolve, reject) => {
    // Run server from the CLI directory for consistent behavior
    const cliDir = path.resolve(__dirname, "..");
    const serverProcess = spawn("node", [cliPath, "serve", projectDir, "--port", String(TEST_SERVER_PORT)], {
      stdio: ["ignore", "pipe", "pipe"],
      detached: false,
      cwd: cliDir,
    });

    let started = false;
    const timeout = setTimeout(() => {
      if (!started) {
        serverProcess.kill();
        reject(new Error("Test server startup timeout"));
      }
    }, 15000);

    const checkOutput = (data) => {
      const output = data.toString();
      // Server outputs "Server running at" when ready
      if (output.includes("Server running at") || output.includes("localhost:" + TEST_SERVER_PORT)) {
        started = true;
        clearTimeout(timeout);
        // Small delay to ensure server is fully ready
        setTimeout(() => {
          resolve({ process: serverProcess, port: TEST_SERVER_PORT });
        }, 1000);
      }
    };

    serverProcess.stdout.on("data", checkOutput);
    serverProcess.stderr.on("data", checkOutput);

    serverProcess.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    serverProcess.on("exit", (code) => {
      if (!started) {
        clearTimeout(timeout);
        reject(new Error(`Test server exited with code ${code}`));
      }
    });
  });
}

/**
 * Stop the test server
 * @param {{process: ChildProcess}} server
 */
function stopTestServer(server) {
  if (server && server.process) {
    server.process.kill("SIGTERM");
  }
}

/**
 * Detect if a directory is a bootstrapp project
 * @param {string} dir - Directory to check
 * @returns {boolean}
 */
function isBootstrappProject(dir) {
  const pkgPath = path.join(dir, "package.json");
  if (!fs.existsSync(pkgPath)) return false;

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    return Object.keys(deps).some(dep => dep.startsWith("@bootstrapp/"));
  } catch {
    return false;
  }
}

/**
 * Find all test files
 * @param {Object} options - Search options
 * @returns {Array<string>}
 */
function findTestFiles(options = {}) {
  const { pattern = "**/*.test.js", cwd = process.cwd() } = options;

  const files = globSync(pattern, {
    cwd,
    ignore: ["**/node_modules/**", "dist/**", "build/**"],
  });

  return files.map((file) => path.resolve(cwd, file));
}

/**
 * Main test command
 * @param {Object} adapter - CLI adapter
 * @param {Object} options - Test options
 */
export async function test(adapter, options = {}) {
  const {
    browser = false, // Run in browser (via Puppeteer), default is Node.js
    file = null, // Run specific file
    suite = null, // Run specific suite (browser only)
    pattern = null, // Custom file pattern
    headless = true, // Headless browser mode
    verbose = false, // Verbose output
    project = null, // Project directory path
  } = options;

  // Determine if we're testing a project
  const cwd = process.cwd();
  const projectPath = project ? path.resolve(cwd, project) : null;
  const isProject = projectPath
    ? isBootstrappProject(projectPath)
    : isBootstrappProject(cwd);
  const testDir = projectPath || (isProject ? cwd : null);

  console.log(
    "\x1b[1m\x1b[35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m",
  );
  console.log("\x1b[1m\x1b[35m                 BOOTSTRAPP TEST SUITE\x1b[0m");
  console.log(
    "\x1b[1m\x1b[35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n",
  );

  const mode = browser ? "browser" : "node";
  console.log(`\x1b[90mMode: ${mode}\x1b[0m`);
  if (isProject && testDir) {
    console.log(`\x1b[90mProject: ${path.basename(testDir)}\x1b[0m`);
  }
  console.log("");

  try {
    // Run specific suite (browser only)
    if (suite) {
      if (!browser) {
        console.log("\x1b[33mNote: --suite requires --browser flag\x1b[0m\n");
      }
      console.log(`\x1b[36mRunning test suite: \x1b[0m${suite}\n`);
      const success = await runBrowserTestSuite(adapter, suite, { headless });
      return success;
    }

    // Determine test pattern
    // For projects, default to tests/ directory; otherwise search everywhere
    const defaultPattern = isProject ? "tests/**/*.test.js" : "**/*.test.js";
    const searchPattern = pattern || defaultPattern;
    const searchDir = testDir || cwd;

    // Find test files
    const testFiles = file
      ? [path.resolve(searchDir, file)]
      : findTestFiles({ pattern: searchPattern, cwd: searchDir });

    if (testFiles.length === 0) {
      console.log("\x1b[33mNo test files found.\x1b[0m\n");
      if (isProject) {
        console.log(`\x1b[90mHint: Create test files in ${searchDir}/tests/*.test.js\x1b[0m\n`);
      }
      return true;
    }

    if (verbose) {
      console.log(`\x1b[90mFound ${testFiles.length} test file(s)\x1b[0m\n`);
    }

    // Run tests in chosen mode
    if (browser) {
      // Determine the server directory (project dir or framework dir)
      const serverDir = testDir || path.resolve(__dirname, "..", "..");

      console.log(`\x1b[90mStarting test server on port ${TEST_SERVER_PORT}...\x1b[0m`);
      let testServer = null;

      try {
        testServer = await startTestServer(serverDir);
        console.log(`\x1b[90mTest server ready\x1b[0m\n`);

        const success = await runBrowserTests(adapter, {
          testFiles,
          headless,
          projectPath: testDir,
          port: testServer.port,
        });
        return success;
      } finally {
        if (testServer) {
          console.log(`\x1b[90mStopping test server...\x1b[0m`);
          stopTestServer(testServer);
        }
      }
    } else {
      const results = await runNodeTests(adapter, testFiles);
      return results.success;
    }
  } catch (error) {
    console.error("\x1b[31mTest execution error:\x1b[0m", error);
    return false;
  }
}

/**
 * Parse CLI arguments for test command
 * @param {Array<string>} args - Command line arguments
 * @returns {Object} Parsed options
 */
export function parseTestArgs(args) {
  const options = {
    browser: false, // Default is Node.js
    file: null,
    suite: null,
    pattern: null,
    headless: true,
    verbose: false,
    project: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--browser":
      case "--web":
        options.browser = true;
        break;
      case "--file":
      case "-f":
        options.file = args[++i];
        break;
      case "--suite":
      case "-s":
        options.suite = args[++i];
        break;
      case "--pattern":
      case "-p":
        options.pattern = args[++i];
        break;
      case "--project":
        options.project = args[++i];
        break;
      case "--headed":
        options.headless = false;
        break;
      case "--verbose":
      case "-v":
        options.verbose = true;
        break;
    }
  }

  return options;
}

export default test;
