/**
 * Browser-side test runner for WebSocket-triggered tests
 * Replaces puppeteer by running tests in browser and sending results back to server
 */

/**
 * Run tests triggered by WebSocket message
 * @param {Object} options - Test options from CLI
 * @param {Array<string>} options.testFiles - Test files to run
 * @param {string} options.suite - Specific suite to run
 * @param {string} options.projectPath - Project path for resolving files
 */
export async function runTests(options = {}) {
  const { testFiles = [], suite = null, projectPath = null } = options;

  // Intercept console to stream to CLI
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  const sendConsole = async (level, args) => {
    try {
      // Convert args to serializable format
      const serializedArgs = args.map((arg) => {
        if (arg instanceof Error) {
          return `${arg.name}: ${arg.message}\n${arg.stack}`;
        }
        if (typeof arg === "object") {
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      });

      await fetch("/tests/console", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, args: serializedArgs }),
      });
    } catch (e) {
      originalConsole.error("Failed to send console:", e);
    }
  };

  // Override console methods
  console.log = (...args) => {
    originalConsole.log(...args);
    sendConsole("log", args);
  };
  console.error = (...args) => {
    originalConsole.error(...args);
    sendConsole("error", args);
  };
  console.warn = (...args) => {
    originalConsole.warn(...args);
    sendConsole("warn", args);
  };
  console.info = (...args) => {
    originalConsole.info(...args);
    sendConsole("info", args);
  };

  try {
    // Import testing framework
    const Testing = (await import("/$app/base/test/index.js")).default;

    let results;

    if (testFiles.length > 0) {
      // Run specific test file
      let filePath = testFiles[0];

      // Convert absolute path to project-relative if needed
      if (projectPath && filePath.startsWith(projectPath)) {
        filePath = filePath.slice(projectPath.length);
        if (!filePath.startsWith("/")) filePath = "/" + filePath;
      }

      console.log(`Running test file: ${filePath}`);
      results = await Testing.runFile(filePath);
    } else if (suite) {
      // Run specific suite
      console.log(`Running test suite: ${suite}`);
      results = await Testing.run(suite);
    } else {
      // Run all tests
      console.log("Running all tests");
      results = await Testing.run();
    }

    // Send results back to server
    const testResults = {
      passed: results.passed || 0,
      failed: results.failed || 0,
      total: results.totalTests || 0,
      totalSuites: results.totalSuites || 0,
      failures: (results.failures || []).map((f) => ({
        suite: f.suite,
        describe: f.describe,
        test: f.test,
        error: f.error?.message || String(f.error),
      })),
    };

    await fetch("/tests/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testResults),
    });

    console.log(`Tests complete: ${testResults.passed} passed, ${testResults.failed} failed`);

    // Also set window.testResults for backwards compatibility
    window.testResults = testResults;

    return testResults;
  } catch (error) {
    console.error("Test runner error:", error);

    const errorResults = {
      passed: 0,
      failed: 1,
      total: 1,
      totalSuites: 0,
      failures: [{ error: error.message }],
    };

    await fetch("/tests/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(errorResults),
    });

    window.testResults = errorResults;
    return errorResults;
  } finally {
    // Restore original console
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  }
}

export default runTests;
