/**
 * @file Node.js Test Runner
 * @description Runs pure JavaScript tests in Node.js environment (no browser APIs)
 */
import path from "path";
import { pathToFileURL } from "url";
import Testing from "../../base/test/index.js";

/**
 * Run tests from a file
 * @param {Object} adapter - The CLI adapter (unused, but kept for signature)
 * @param {Array<string>} testFiles - A list of absolute paths to test files
 * @returns {Promise<Object>} An aggregated results object
 */
export async function runNodeTests(adapter, testFiles) {
  console.log("\x1b[1m\x1b[36mRunning Node.js Tests\x1b[0m");
  console.log("\x1b[90m(Pure JavaScript - No Browser APIs)\x1b[0m\n");

  const overallResults = {
    success: true,
    totalSuites: 0,
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    files: {},
  };

  for (const testFile of testFiles) {
    const relativePath = path
      .relative(process.cwd(), testFile)
      .replace(/\\/g, "/");
    try {
      const absolutePath = path.resolve(process.cwd(), testFile);
      const fileUrl = pathToFileURL(absolutePath).href;

      console.log(`\x1b[90mLoading: ${relativePath}\x1b[0m`);

      // The result from Testing.runFile
      const res = await Testing.runFile(fileUrl);

      // Store results by relative path
      overallResults.files[relativePath] = {
        ...res,
        error: null,
      };

      // Aggregate counts
      overallResults.totalSuites += res.totalSuites;
      overallResults.totalTests += res.totalTests;
      overallResults.passed += res.passed;
      overallResults.failed += res.failed;
      overallResults.skipped += res.skipped;

      // Log file-specific summary
      if (res.failed > 0) {
        console.log(
          ` \x1b[31m✗ FAILED\x1b[0m - ${relativePath} (\x1b[32m${res.passed}\x1b[0m passed, \x1b[31m${res.failed}\x1b[0m failed)`,
        );
        overallResults.success = false;
        // Log specific failures
        for (const failure of res.failures) {
          console.log(`   \x1b[31m↳ ${failure.suite}: ${failure.test}\x1b[0m`);
          console.log(`     \x1b[90m${failure.error.message}\x1b[0m`);
        }
      } else {
        console.log(
          ` \x1b[32m✓ PASSED\x1b[0m - ${relativePath} (${res.passed} tests)`,
        );
      }
    } catch (error) {
      console.error(
        `\x1b[31mError loading ${relativePath}:\x1b[0m`,
        error.message,
      );
      overallResults.success = false;
      overallResults.files[relativePath] = {
        totalSuites: 0,
        totalTests: 0,
        passed: 0,
        failed: 1, // Count the load error as a failure
        skipped: 0,
        failures: [],
        error: error.message,
      };
      overallResults.failed += 1; // Increment overall failure count
    }
  }

  console.log("\n\x1b[1mNode.js Test Summary:\x1b[0m");
  if (overallResults.success) {
    console.log(
      `\x1b[32m✓ All ${overallResults.passed} tests passed across ${testFiles.length} files.\x1b[0m`,
    );
  } else {
    console.log(
      `\x1b[31m✗ Failed\x1b[0m: \x1b[32m${overallResults.passed}\x1b[0m passed, \x1b[31m${overallResults.failed}\x1b[0m failed, \x1b[90m${overallResults.skipped}\x1b[0m skipped.`,
    );
  }

  return overallResults;
}
