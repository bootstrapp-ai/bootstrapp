/**
 * @file Browser Test Runner
 * @description Runs tests in headless Chrome via Puppeteer and reports results to CLI
 */

import puppeteer from "puppeteer";

/**
 * Run tests in headless browser
 */
export async function runBrowserTests(adapter, options = {}) {
  const {
    testUrl = "http://localhost:1315/node_modules/@bootstrapp/base/test.html",
    testFiles = [],
    suite = null,
    headless = true,
  } = options;

  console.log("\x1b[1m\x1b[36mRunning Browser Tests\x1b[0m");
  console.log("\x1b[90m(Headless Chrome - Full Browser APIs)\x1b[0m\n");

  let browser;
  let success = false;

  try {
    // Launch browser
    console.log("\x1b[90mLaunching headless Chrome...\x1b[0m\n");
    browser = await puppeteer.launch({
      headless: headless ? "new" : false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Collect console messages
    const consoleMessages = [];
    page.on("console", (msg) => {
      const type = msg.type();
      const text = msg.text();

      // Forward console messages to CLI with colors
      if (type === "log") {
        console.log(text);
      } else if (type === "error") {
        console.error(`\x1b[31m${text}\x1b[0m`);
      } else if (type === "warn") {
        console.warn(`\x1b[33m${text}\x1b[0m`);
      } else if (type === "info") {
        console.info(`\x1b[36m${text}\x1b[0m`);
      }

      consoleMessages.push({ type, text });
    });

    // Collect errors
    page.on("pageerror", (error) => {
      console.error("\x1b[31mPage Error:\x1b[0m", error.message);
    });

    // Build URL with parameters
    let url = testUrl;
    const params = new URLSearchParams();

    if (testFiles.length > 0) {
      params.set("run", "file");
      params.set("filePath", testFiles[0]); // Run first file for now
      if (suite) {
        params.set("suiteName", suite);
      }
    } else if (suite) {
      params.set("run", "suite");
      params.set("suiteName", suite);
    }

    if (params.toString()) {
      url += "?" + params.toString();
    }

    console.log(`\x1b[90mNavigating to: ${url}\x1b[0m\n`);

    // Navigate to test page
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for tests to complete
    // The test.html should set window.testResults when done
    await page.waitForFunction(() => window.testResults !== undefined, {
      timeout: 60000,
    });

    // Get test results
    const results = await page.evaluate(() => window.testResults);

    if (results) {
      console.log("\n" + "=".repeat(60));

      if (results.failed === 0) {
        console.log(`\x1b[32m✓ ${results.passed} tests passed\x1b[0m`);
        success = true;
      } else {
        console.log(`\x1b[31m✗ ${results.failed} tests failed\x1b[0m`);
        console.log(`\x1b[32m✓ ${results.passed} tests passed\x1b[0m`);
        console.log(`\x1b[90m  ${results.total} total\x1b[0m`);

        if (results.failures && results.failures.length > 0) {
          console.log("\n\x1b[31mFailures:\x1b[0m\n");
          results.failures.forEach((failure, i) => {
            console.log(
              `${i + 1}) ${failure.suite} > ${failure.describe} > ${failure.test}`,
            );
            console.log(`   ${failure.error}`);
            console.log("");
          });
        }
      }

      console.log("=".repeat(60) + "\n");
    } else {
      console.error("\x1b[31mNo test results received from browser\x1b[0m");
    }
  } catch (error) {
    console.error("\x1b[31mBrowser test error:\x1b[0m", error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return success;
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
