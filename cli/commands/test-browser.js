/**
 * @file Browser Test Runner
 * @description Runs tests in browser via WebSocket and reports results to CLI
 * Uses HTTP endpoints instead of puppeteer for browser automation
 */

/**
 * Run tests in browser via WebSocket
 */
export async function runBrowserTests(adapter, options = {}) {
  const {
    testFiles = [],
    suite = null,
    headless = true, // Kept for API compatibility, but browser always opens visibly now
    projectPath = null,
    port = 1315,
  } = options;

  console.log("\x1b[1m\x1b[36mRunning Browser Tests\x1b[0m");
  console.log("\x1b[90m(Via WebSocket - Full Browser APIs)\x1b[0m\n");

  const baseUrl = `http://localhost:${port}`;

  try {
    // Send test request to server
    console.log("\x1b[90mSending test request to browser...\x1b[0m\n");

    const response = await fetch(`${baseUrl}/tests/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testFiles,
        suite,
        projectPath,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to start tests: ${error}`);
    }

    // Poll for results with long-polling
    console.log("\x1b[90mWaiting for test results...\x1b[0m\n");

    let lastConsoleIndex = 0;
    let results = null;
    const maxAttempts = 120; // 2 minutes max (each poll is ~30s timeout)
    let attempts = 0;

    while (!results && attempts < maxAttempts) {
      attempts++;

      const pollResponse = await fetch(`${baseUrl}/tests/results`);
      const data = await pollResponse.json();

      // Display any new console output
      if (data.console && data.console.length > lastConsoleIndex) {
        for (let i = lastConsoleIndex; i < data.console.length; i++) {
          const entry = data.console[i];
          const text = entry.args.join(" ");

          switch (entry.level) {
            case "error":
              console.error(`\x1b[31m${text}\x1b[0m`);
              break;
            case "warn":
              console.warn(`\x1b[33m${text}\x1b[0m`);
              break;
            case "info":
              console.info(`\x1b[36m${text}\x1b[0m`);
              break;
            default:
              console.log(text);
          }
        }
        lastConsoleIndex = data.console.length;
      }

      if (data.status === "complete") {
        results = data.results;
      }
      // If pending, the long-poll will wait up to 30s before returning
    }

    if (!results) {
      console.error("\x1b[31mTest timeout - no results received\x1b[0m");
      return false;
    }

    // Display results
    console.log("\n" + "=".repeat(60));

    if (results.failed === 0) {
      console.log(`\x1b[32m✓ ${results.passed} tests passed\x1b[0m`);
      console.log("=".repeat(60) + "\n");
      return true;
    } else {
      console.log(`\x1b[31m✗ ${results.failed} tests failed\x1b[0m`);
      console.log(`\x1b[32m✓ ${results.passed} tests passed\x1b[0m`);
      console.log(`\x1b[90m  ${results.total} total\x1b[0m`);

      if (results.failures && results.failures.length > 0) {
        console.log("\n\x1b[31mFailures:\x1b[0m\n");
        results.failures.forEach((failure, i) => {
          console.log(
            `${i + 1}) ${failure.suite || ""} > ${failure.describe || ""} > ${failure.test || ""}`.trim(),
          );
          console.log(`   ${failure.error}`);
          console.log("");
        });
      }

      console.log("=".repeat(60) + "\n");
      return false;
    }
  } catch (error) {
    console.error("\x1b[31mBrowser test error:\x1b[0m", error.message);
    return false;
  }
}

/**
 * Run a specific test file in browser
 */
export async function runBrowserTestFile(adapter, filePath, options = {}) {
  return runBrowserTests(adapter, {
    ...options,
    testFiles: [filePath],
  });
}

/**
 * Run a specific test suite in browser
 */
export async function runBrowserTestSuite(adapter, suiteName, options = {}) {
  return runBrowserTests(adapter, {
    ...options,
    suite: suiteName,
  });
}
