/**
 * @file Unified Test Command
 * @description Orchestrates both Node.js and browser tests
 */

import { globSync } from "glob";
import path from "path";
import {
  runBrowserTestFile,
  runBrowserTestSuite,
  runBrowserTests,
} from "./test-browser.js";
import { runNodeTests } from "./test-node.js";

/**
 * Test registry - categorize tests as Node.js or browser-based
 */
const TEST_CATEGORIES = {
  node: [
    // Pure JavaScript tests that don't need browser APIs
    "base/model/database/query-builder.test.js",
    "base/model/database/row-utils.test.js",
    "base/model/database/relationship-loader.test.js",
  ],
  browser: [
    // Tests requiring browser APIs (IndexedDB, DOM, etc.)
    "base/model/database/adapter-indexeddb.test.js",
    "base/component/component-system.test.js",
    "base/model/model.test.js",
  ],
};

/**
 * Determine if a test file should run in Node.js or browser
 * @param {string} filePath - Test file path
 * @returns {'node'|'browser'}
 */
function categorizeTest(filePath) {
  const normalized = filePath.replace(/\\/g, "/");

  // Check explicit categorization
  if (TEST_CATEGORIES.node.some((pattern) => normalized.includes(pattern))) {
    return "node";
  }
  if (TEST_CATEGORIES.browser.some((pattern) => normalized.includes(pattern))) {
    return "browser";
  }

  // Default heuristics
  if (
    normalized.includes("adapter-indexeddb") ||
    normalized.includes("component") ||
    normalized.includes("dom")
  ) {
    return "browser";
  }

  // Default to Node.js for pure utilities
  if (
    normalized.includes("query-builder") ||
    normalized.includes("row-utils") ||
    normalized.includes("relationship")
  ) {
    return "node";
  }

  // Default to Node.js (was 'node', changed from 'browser' as per logic)
  return "node";
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
    ignore: ["node_modules/**", "dist/**", "build/**"],
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
    node = false, // Run only Node.js tests
    browser = false, // Run only browser tests
    file = null, // Run specific file
    suite = null, // Run specific suite
    pattern = null, // Custom file pattern
    headless = true, // Headless browser mode
    verbose = false, // Verbose output
  } = options;

  console.log(
    "\x1b[1m\x1b[35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m",
  );
  console.log("\x1b[1m\x1b[35m                 BOOTSTRAPP TEST SUITE\x1b[0m");
  console.log(
    "\x1b[1m\x1b[35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n",
  );

  // Store detailed results from Node, and simple success from browser (for now)
  let nodeResults = {
    success: true,
    passed: 0,
    failed: 0,
    skipped: 0,
    totalTests: 0,
    files: {},
  };
  let browserSuccess = true; // Assuming browser tests return boolean for now

  // Aggregated totals
  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  let totalTests = 0;

  try {
    // Case 1: Run specific file
    if (file) {
      const category = categorizeTest(file);
      const absolutePath = path.resolve(process.cwd(), file);

      console.log(`\x1b[36mRunning test file: \x1b[0m${file}`);
      console.log(`\x1b[90mCategory: ${category}\x1b[0m\n`);

      if (category === "browser") {
        browserSuccess = await runBrowserTestFile(adapter, absolutePath, {
          headless,
        });
        // Mock results for summary
        if (!browserSuccess) totalFailed = 1;
      } else {
        nodeResults = await runNodeTests(adapter, [absolutePath]);
        totalPassed = nodeResults.passed;
        totalFailed = nodeResults.failed;
        totalSkipped = nodeResults.skipped;
        totalTests = nodeResults.totalTests;
      }

      // Short-circuit to final summary after single file run
      return await printFinalSummary(
        nodeResults,
        browserSuccess,
        { totalPassed, totalFailed, totalSkipped },
        true,
        true,
      );
    }

    // Case 2: Run specific suite (browser only)
    if (suite) {
      console.log(`\x1b[36mRunning test suite: \x1b[0m${suite}\n`);
      browserSuccess = await runBrowserTestSuite(adapter, suite, { headless });
      if (!browserSuccess) totalFailed = 1;
      // Short-circuit to final summary
      return await printFinalSummary(
        nodeResults,
        browserSuccess,
        { totalPassed, totalFailed, totalSkipped },
        false,
        true,
      );
    }

    // Case 3: Run all tests or filtered by type
    const runNodeTestsFlag = !browser; // Run node tests unless --browser is specified
    const runBrowserTestsFlag = !node; // Run browser tests unless --node is specified

    // Find all test files
    const testFiles = findTestFiles({ pattern: pattern || "**/*.test.js" });

    if (testFiles.length === 0) {
      console.log("\x1b[33mNo test files found.\x1b[0m\n");
      return true;
    }

    // Categorize tests
    const nodeTests = [];
    const browserTests = [];

    for (const testFile of testFiles) {
      const category = categorizeTest(testFile);
      if (category === "node") {
        nodeTests.push(testFile);
      } else {
        browserTests.push(testFile);
      }
    }

    if (verbose) {
      console.log(`\x1b[90mFound ${testFiles.length} test files:\x1b[0m`);
      console.log(`\x1b[90m  - ${nodeTests.length} Node.js tests\x1b[0m`);
      console.log(`\x1b[90m  - ${browserTests.length} Browser tests\x1b[0m\n`);
    }

    // Run Node.js tests
    if (runNodeTestsFlag && nodeTests.length > 0) {
      console.log(
        "\x1b[1m\x1b[36m┌─────────────────────────────────────────────────────────┐\x1b[0m",
      );
      console.log(
        "\x1b[1m\x1b[36m│                     NODE.JS TESTS                     │\x1b[0m",
      );
      console.log(
        "\x1b[1m\x1b[36m└─────────────────────────────────────────────────────────┘\x1b[0m\n",
      );

      nodeResults = await runNodeTests(adapter, nodeTests);
      totalPassed += nodeResults.passed;
      totalFailed += nodeResults.failed;
      totalSkipped += nodeResults.skipped;
      totalTests += nodeResults.totalTests;
    }

    // Run browser tests
    if (runBrowserTestsFlag && browserTests.length > 0) {
      if (runNodeTestsFlag && nodeTests.length > 0) {
        console.log("\n"); // Add spacing between test types
      }

      console.log(
        "\x1b[1m\x1b[36m┌─────────────────────────────────────────────────────────┐\x1b[0m",
      );
      console.log(
        "\x1b[1m\x1b[36m│                     BROWSER TESTS                     │\x1b[0m",
      );
      console.log(
        "\x1b[1m\x1b[36m└─────────────────────────────────────────────────────────┘\x1b[0m\n",
      );

      // Run all browser tests together
      // ASSUMPTION: runBrowserTests returns a boolean.
      // TODO: Refactor runBrowserTests to return a detailed result object
      // similar to runNodeTests for a complete summary.
      browserSuccess = await runBrowserTests(adapter, {
        testFiles: browserTests,
        headless,
      });

      if (!browserSuccess) {
        console.log("\n\x1b[1mBrowser Test Summary:\x1b[0m");
        console.log(`\x1b[31m✗ One or more browser tests failed.\x1b[0m`);
        // We can't know the exact number, so we mark at least one
        if (totalFailed === 0) totalFailed = 1;
      } else {
        console.log("\n\x1b[1mBrowser Test Summary:\x1b[0m");
        console.log(`\x1b[32m✓ All browser tests passed.\x1b[0m`);
      }
    }

    // Final summary
    return await printFinalSummary(
      nodeResults,
      browserSuccess,
      { totalPassed, totalFailed, totalSkipped },
      runNodeTestsFlag && nodeTests.length > 0,
      runBrowserTestsFlag && browserTests.length > 0,
    );
  } catch (error) {
    console.error("\x1b[31mTest execution error:\x1b[0m", error);
    return false;
  }
}

/**
 * Prints the final test summary
 * @param {Object} nodeResults - Results from runNodeTests
 * @param {boolean} browserSuccess - Boolean success from browser tests
 * @param {Object} totals - Aggregated totals { totalPassed, totalFailed, totalSkipped }
 * @param {boolean} didRunNode - Flag if node tests were run
 * @param {boolean} didRunBrowser - Flag if browser tests were run
 * @returns {boolean} Overall success
 */
async function printFinalSummary(
  nodeResults,
  browserSuccess,
  totals,
  didRunNode,
  didRunBrowser,
) {
  console.log(
    "\n\x1b[1m\x1b[35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m",
  );
  console.log("\x1b[1m\x1b[35m                 FINAL RESULTS\x1b[0m");
  console.log(
    "\x1b[1m\x1b[35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n",
  );

  const allSuccess = nodeResults.success && browserSuccess;

  if (didRunNode) {
    console.log(
      `Node.js Tests:   ${nodeResults.success ? "\x1b[32m✓ PASSED\x1b[0m" : "\x1b[31m✗ FAILED\x1b[0m"}`,
    );
  }
  if (didRunBrowser) {
    console.log(
      `Browser Tests:   ${browserSuccess ? "\x1b[32m✓ PASSED\x1b[0m" : "\x1b[31m✗ FAILED\x1b[0m"}`,
    );
  }

  if (didRunNode || didRunBrowser) {
    console.log("---");
  }

  // Print aggregate summary
  // Note: This is skewed towards Node tests until browser tests return detailed counts
  if (totals.totalFailed > 0) {
    console.log(
      `\x1b[1mSummary:\x1b[0m         \x1b[31m✗ FAILED\x1b[0m (\x1b[32m${totals.totalPassed}\x1b[0m passed, \x1b[31m${totals.totalFailed}\x1b[0m failed, \x1b[90m${totals.totalSkipped}\x1b[0m skipped)`,
    );
  } else if (totals.totalPassed > 0) {
    console.log(
      `\x1b[1mSummary:\x1b[0m         \x1b[32m✓ PASSED\x1b[0m (${totals.totalPassed} tests passed)`,
    );
  } else if (!didRunNode && !didRunBrowser) {
    // This case should be handled by 'No test files found'
  } else if (totals.totalTests === 0 && totals.totalFailed === 0) {
    // This can happen if only browser tests ran and passed
    console.log("\x1b[1mSummary:\x1b[0m         \x1b[32m✓ PASSED\x1b[0m");
  }

  console.log("");
  if (allSuccess) {
    console.log("\x1b[1m\x1b[32m✓ ALL TESTS PASSED!\x1b[0m\n");
  } else {
    console.log("\x1b[1m\x1b[31m✗ SOME TESTS FAILED\x1b[0m\n");
  }

  return allSuccess;
}

/**
 * Parse CLI arguments for test command
 * @param {Array<string>} args - Command line arguments
 * @returns {Object} Parsed options
 */
export function parseTestArgs(args) {
  const options = {
    node: false,
    browser: false,
    file: null,
    suite: null,
    pattern: null,
    headless: true,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--node":
        options.node = true;
        break;
      case "--browser":
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
