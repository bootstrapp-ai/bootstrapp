import assert from "./assert.js";
import mock from "./mock.js";

// Conditionally import $APP and config for browser environment
let $APP, config;
if (typeof window !== "undefined") {
  $APP = (await import("/$app.js")).default;
  config = (await import("../config.js")).default;
}

function createTestEngine({ terminal = console } = {}) {
  // Private state
  const suites = new Map();
  let currentSuite = null;
  let currentDescribe = null;
  let beforeEachFns = [];
  let afterEachFns = [];
  // Console styling
  const styles = {
    title:
      "font-size: 18px; font-weight: bold; color: #e1e1e1; background: #1e1e1e; padding: 4px 8px; border-radius: 4px;",
    suite:
      "font-size: 16px; font-weight: bold; color: #e1e1e1; background: #0d4a8f; padding: 4px 8px; border-radius: 4px;",
    describe:
      "font-size: 14px; color: #58a6ff; font-weight: bold; border-left: 4px solid #58a6ff; padding-left: 8px;",
    passed: "color: #3fb950; font-weight: bold;",
    failed: "color: #f85149; font-weight: bold;",
    testName: "color: #c9d1d9;",
    errorMsg:
      "color: #f85149; background: #3b1e1f; padding: 2px 4px; border-radius: 2px;",
    summary: "font-size: 15px; font-weight: bold; color: #c9d1d9;",
    summaryPass: "color: #3fb950; font-size: 15px; font-weight: bold;",
    summaryFail: "color: #f85149; font-size: 15px; font-weight: bold;",
    time: "color: #8b949e; font-style: italic;",
  };

  // Create the API
  function suite(name, fn) {
    if (suites.has(name)) {
      throw new Error(`Suite '${name}' already exists`);
    }

    currentSuite = {
      name,
      describes: [],
      beforeEach: null,
      afterEach: null,
      beforeAll: [],
      afterAll: [],
    };

    suites.set(name, currentSuite);
    fn();
    currentSuite = null;
  }

  function describe(description, fn) {
    if (!currentSuite) {
      throw new Error("describe() must be called within a suite()");
    }

    const prevDescribe = currentDescribe;
    const parentDescribe = currentDescribe;
    currentDescribe = {
      description,
      tests: [],
      beforeEach: [],
      afterEach: [],
      beforeAll: [],
      afterAll: [],
      parent: parentDescribe,
    };

    currentSuite.describes.push(currentDescribe);

    // Save current beforeEach/afterEach functions
    const prevBeforeEach = [...beforeEachFns];
    const prevAfterEach = [...afterEachFns];

    // Run the describe function
    fn();

    // Restore state
    currentDescribe = prevDescribe;
    beforeEachFns = prevBeforeEach;
    afterEachFns = prevAfterEach;
  }

  function it(testName, fn) {
    if (!currentDescribe) {
      throw new Error("it() must be called within a describe()");
    }

    currentDescribe.tests.push({
      name: testName,
      fn,
    });
  }

  function beforeEach(fn) {
    if (currentDescribe) {
      beforeEachFns.push(fn);
      currentDescribe.beforeEach.push(fn);
    } else if (currentSuite) {
      currentSuite.beforeEach = fn;
    } else {
      throw new Error(
        "beforeEach() must be called within a suite() or describe()",
      );
    }
  }

  function afterEach(fn) {
    if (currentDescribe) {
      afterEachFns.push(fn);
      currentDescribe.afterEach.push(fn);
    } else if (currentSuite) {
      currentSuite.afterEach = fn;
    } else {
      throw new Error(
        "afterEach() must be called within a suite() or describe()",
      );
    }
  }

  function beforeAll(fn) {
    if (currentDescribe) {
      currentDescribe.beforeAll.push(fn);
    } else if (currentSuite) {
      currentSuite.beforeAll.push(fn);
    } else {
      throw new Error(
        "beforeAll() must be called within a suite() or describe()",
      );
    }
  }

  function afterAll(fn) {
    if (currentDescribe) {
      currentDescribe.afterAll.push(fn);
    } else if (currentSuite) {
      currentSuite.afterAll.push(fn);
    } else {
      throw new Error(
        "afterAll() must be called within a suite() or describe()",
      );
    }
  }

  async function run(suiteName) {
    terminal.info("%c🧪 TEST ENGINE RUNNING", styles.title);

    const startTime = performance.now();

    const results = {
      totalSuites: 0,
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      failures: [],
    };

    // Run specific suite or all suites
    const suitesToRun = suiteName
      ? suites.has(suiteName)
        ? [suites.get(suiteName)]
        : []
      : Array.from(suites.values());

    if (suiteName && !suites.has(suiteName)) {
      terminal.info(`%c❌ Suite '${suiteName}' not found`, styles.failed);
      return results;
    }

    results.totalSuites = suitesToRun.length;
    // Run each suite
    for (const suite of suitesToRun) {
      // Run suite-level beforeAll if defined (once per suite)
      if (suite.beforeAll?.length && !suite._beforeAllRun) {
        for (const fn of suite.beforeAll) {
          await fn();
        }
        suite._beforeAllRun = true;
      }

      terminal.info(`%c📦 SUITE: ${suite.name}`, styles.suite);

      for (const describe of suite.describes) {
        // Run describe-level beforeAll hooks
        if (describe.beforeAll?.length) {
          for (const fn of describe.beforeAll) {
            await fn();
          }
        }
        terminal.info(`  %c${describe.description}`, styles.describe);
        results.totalTests += describe.tests.length;

        // Run each test
        for (const test of describe.tests) {
          try {
            const collectHooks = (desc) => {
              const hooks = [];
              while (desc) {
                hooks.unshift(...desc.beforeEach);
                desc = desc.parent;
              }
              return hooks;
            };
            // Run suite-level beforeEach if defined
            if (suite.beforeEach) {
              await suite.beforeEach();
            }

            // Run all beforeEach functions for this describe block
            for (const beforeFn of collectHooks(describe)) {
              await beforeFn();
            }

            // Run the test
            await test.fn();

            // Run all afterEach functions for this describe block
            for (const afterFn of describe.afterEach) {
              await afterFn();
            }

            // Run suite-level afterEach if defined
            if (suite.afterEach) {
              await suite.afterEach();
            }

            terminal.info(
              `%c    ✓%c ${test.name}`,
              styles.passed,
              styles.testName,
            );
            results.passed++;
          } catch (error) {
            terminal.info(
              `%c    ✗%c ${test.name}`,
              styles.failed,
              styles.testName,
            );
            terminal.info(`      %c${error.message}`, styles.errorMsg);
            results.failed++;
            results.failures.push({
              suite: suite.name,
              describe: describe.description,
              test: test.name,
              error,
            });
          }
        }
        // Run describe-level afterAll hooks
        if (describe.afterAll?.length) {
          for (const fn of describe.afterAll) {
            await fn();
          }
        }
      }
      // Run suite-level afterAll hooks
      if (suite.afterAll?.length) {
        for (const fn of suite.afterAll) {
          await fn();
        }
      }
      terminal.info("");
    }

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    terminal.info("%c📊 TEST RESULTS:", styles.summary);
    terminal.info(`%c✅ Passed: ${results.passed}`, styles.summaryPass);

    if (results.failed > 0) {
      terminal.info(`%c❌ Failed: ${results.failed}`, styles.summaryFail);
      terminal.info("\n%cFailure Details:", styles.summaryFail);
      results.failures.forEach((failure, index) => {
        terminal.info(
          `%c${index + 1}) ${failure.suite} > ${failure.describe} > ${failure.test}`,
          styles.failed,
        );
        terminal.info(`   %c${failure.error.message}`, styles.errorMsg);
        terminal.info(`   %c${failure.error.stack}`, styles.errorMsg);
      });
    }

    terminal.info(`%cTotal Suites: ${results.totalSuites}`, styles.summary);
    terminal.info(`%cTotal Tests: ${results.totalTests}`, styles.summary);
    terminal.info(`%cTime: ${duration}s`, styles.time);

    return results;
  }

  async function runFile(filePath) {
    try {
      await import(filePath);
      return run();
    } catch (error) {
      terminal.info(
        `%c❌ Error loading test file: ${error.message}`,
        styles.errorMsg,
      );
      terminal.info(error.stack);
      return {
        totalSuites: 0,
        totalTests: 0,
        passed: 0,
        failed: 1,
        failures: [
          {
            error: `File load failed: ${error.message}`,
          },
        ],
      };
    }
  }

  // Browser-only iframe utilities
  const iframe = typeof window !== "undefined" ? {
    run(suiteName) {
      const testUrl = config?.test?.getUrl?.("/test.html") || "/$app/base/test.html";
      const iframe = document.createElement("iframe");
      iframe.src = `${testUrl}?run=suite&suiteName=${encodeURIComponent(suiteName ?? "")}`;
      iframe.style.width = "100%";
      iframe.style.height = "600px";
      document.body.appendChild(iframe);
    },
    runFile(filePath, suiteName) {
      const testUrl = config?.test?.getUrl?.("/test.html") || "/$app/base/test.html";
      const iframe = document.createElement("iframe");
      iframe.src = `${testUrl}?run=file&filePath=${encodeURIComponent(filePath ?? "")}&suiteName=${encodeURIComponent(suiteName ?? "")}`;
      iframe.style.width = "100%";
      iframe.style.height = "600px";
      document.body.appendChild(iframe);
    },
    runDescribe(filePath, suiteName) {
      const testUrl = config?.test?.getUrl?.("/test.html") || "/$app/base/test.html";
      const iframe = document.createElement("iframe");
      iframe.src = `${testUrl}?run=describe&filePath=${encodeURIComponent(filePath ?? "")}&suiteName=${encodeURIComponent(suiteName ?? "")}`;
      iframe.style.width = "100%";
      iframe.style.height = "600px";
      document.body.appendChild(iframe);
    },
  } : null;
  async function runDescribe(filePath, describeName, suiteName) {
    terminal.clear();
    terminal.info("%c🧪 TEST ENGINE RUNNING SPECIFIC DESCRIBE", styles.title);

    const startTime = performance.now();

    const results = {
      totalSuites: 0,
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      failures: [],
    };

    try {
      // First load the test file if provided
      if (filePath) {
        try {
          await import(filePath);
        } catch (error) {
          terminal.info(
            `%c❌ Error loading test file: ${error.message}`,
            styles.errorMsg,
          );
          terminal.info(error.stack);
          return {
            totalSuites: 0,
            totalTests: 0,
            passed: 0,
            failed: 1,
            failures: [
              {
                error: `File load failed: ${error.message}`,
              },
            ],
          };
        }
      }

      let suite;
      if (suiteName) suite = suites.get(suiteName);
      if (!suite) suite = suites.entries().next().value?.[1];
      if (!suite) {
        terminal.info(`%c❌ Suite '${suiteName}' not found`, styles.failed);
        return results;
      }

      results.totalSuites = 1;
      // Find the requested suite
      // Find the requested describe block
      const targetDescribe = suite.describes.find(
        (d) => d.description === describeName,
      );

      if (!targetDescribe) {
        terminal.info(
          `%c❌ Describe block '${describeName}' not found in suite '${suiteName}'`,
          styles.failed,
        );
        return results;
      }

      // Run suite-level beforeAll if defined (once per suite)
      if (suite.beforeAll?.length && !suite._beforeAllRun) {
        for (const fn of suite.beforeAll) {
          await fn();
        }
        suite._beforeAllRun = true;
      }

      terminal.info(`%c📦 SUITE: ${suite.name}`, styles.suite);

      // Run describe-level beforeAll hooks
      if (targetDescribe.beforeAll?.length) {
        for (const fn of targetDescribe.beforeAll) {
          await fn();
        }
      }

      terminal.info(`  %c${targetDescribe.description}`, styles.describe);
      results.totalTests += targetDescribe.tests.length;

      // Collect all parent beforeEach hooks
      const collectHooks = (desc) => {
        const hooks = [];
        let currentDesc = desc;
        while (currentDesc) {
          hooks.unshift(...currentDesc.beforeEach);
          currentDesc = currentDesc.parent;
        }
        return hooks;
      };

      // Run each test
      for (const test of targetDescribe.tests) {
        try {
          // Run suite-level beforeEach if defined
          if (suite.beforeEach) {
            await suite.beforeEach();
          }

          // Run all beforeEach functions for this describe block
          for (const beforeFn of collectHooks(targetDescribe)) {
            await beforeFn();
          }

          // Run the test
          await test.fn();

          // Run all afterEach functions for this describe block
          for (const afterFn of targetDescribe.afterEach) {
            await afterFn();
          }

          // Run suite-level afterEach if defined
          if (suite.afterEach) {
            await suite.afterEach();
          }

          terminal.info(
            `%c    ✓%c ${test.name}`,
            styles.passed,
            styles.testName,
          );
          results.passed++;
        } catch (error) {
          terminal.info(
            `%c    ✗%c ${test.name}`,
            styles.failed,
            styles.testName,
          );
          terminal.info(`      %c${error.message}`, styles.errorMsg);
          results.failed++;
          results.failures.push({
            suite: suite.name,
            describe: targetDescribe.description,
            test: test.name,
            error,
          });
        }
      }

      // Run describe-level afterAll hooks
      if (targetDescribe.afterAll?.length) {
        for (const fn of targetDescribe.afterAll) {
          await fn();
        }
      }

      // Run suite-level afterAll hooks
      if (suite.afterAll?.length) {
        for (const fn of suite.afterAll) {
          await fn();
        }
      }

      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      terminal.info("\n%c📊 TEST RESULTS:", styles.summary);
      terminal.info(`%c✅ Passed: ${results.passed}`, styles.summaryPass);

      if (results.failed > 0) {
        terminal.info(`%c❌ Failed: ${results.failed}`, styles.summaryFail);
        terminal.info("\n%cFailure Details:", styles.summaryFail);
        results.failures.forEach((failure, index) => {
          terminal.info(
            `%c${index + 1}) ${failure.suite} > ${failure.describe} > ${
              failure.test
            }`,
            styles.failed,
          );
          terminal.info(
            `   %c${failure.error.message}`,
            styles.errorMsg,
            failure.error.stack,
          );
        });
      }

      terminal.info(`%cTotal Suites: ${results.totalSuites}`, styles.summary);
      terminal.info(`%cTotal Tests: ${results.totalTests}`, styles.summary);
      terminal.info(`%cTime: ${duration}s`, styles.time);

      return results;
    } catch (error) {
      terminal.info(
        `%c❌ Error running tests: ${error.message}`,
        styles.errorMsg,
      );
      terminal.info(error.stack);
      return {
        totalSuites: 0,
        totalTests: 0,
        passed: 0,
        failed: 1,
        failures: [
          {
            error: `Test execution failed: ${error.message}`,
          },
        ],
      };
    }
  }

  return {
    suite,
    describe,
    it,
    beforeEach,
    afterEach,
    beforeAll,
    afterAll,
    run,
    runFile,
    runDescribe,
    assert,
    mock,
    iframe,
    _getState: () => ({
      suites: Object.fromEntries(suites.entries()),
      currentSuite,
      currentDescribe,
    }),
  };
}

const Testing = createTestEngine();
Testing.createTestEngine = createTestEngine;

// Register with $APP if in browser environment
if ($APP) {
  $APP.addModule({
    name: "test",
    alias: "Testing",
    base: Testing,
    dev: true,
  });
  $APP.devFiles.add(new URL(import.meta.url).pathname);
}

export default Testing;
