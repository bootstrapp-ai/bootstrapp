// Conditionally import $APP for browser environment
let $APP;
if (typeof window !== "undefined") {
  $APP = (await import("/$app.js")).default;
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}

const formatError = (defaultMsg, message) => {
  const error = new Error(message || defaultMsg);
  if (error.stack) {
    error.stack = error.stack
      .split("\n")
      .filter((line) => line.includes(".test.js"))
      .join("\n");
  }
  return error;
};

const throwIf = (condition, defaultMsg, message) => {
  if (condition) throw formatError(defaultMsg, message);
};

const stringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch (e) {
    if (e.message.includes("circular structure")) {
      throw formatError(
        "Cannot perform deepEqual: Circular structure detected.",
      );
    }
    throw e;
  }
};

Object.assign(assert, {
  equal: (a, b, msg) =>
    throwIf(
      a !== b,
      `Expected ===: ${b} (${typeof b}) vs ${a} (${typeof a})`,
      msg,
    ),
  notEqual: (a, b, msg) =>
    throwIf(a === b, `Expected !==: ${b} (${typeof b})`, msg),
  deepEqual: (a, b, msg) => {
    if (a === b) return;
    const aStr = stringify(a);
    const bStr = stringify(b);
    throwIf(
      aStr !== bStr,
      `Expected deepEqual:\nExpected: ${bStr}\nActual:   ${aStr}`,
      msg,
    );
  },
  isUndefined: (val, msg) =>
    throwIf(
      val !== undefined,
      `Expected undefined, got: ${val} (${typeof val})`,
      msg,
    ),
  isDefined: (val, msg) =>
    throwIf(
      val === undefined,
      "Expected value to be defined, but got: undefined",
      msg,
    ),
  isObject: (val, msg) =>
    throwIf(
      typeof val !== "object",
      `Expected object, got: ${val} (${typeof val})`,
      msg,
    ),
  isNotObject: (val, msg) =>
    throwIf(
      typeof val === "object" && val !== null,
      `Expected not a object, but got: ${val}`,
      msg,
    ),
  isFunction: (val, msg) =>
    throwIf(
      typeof val !== "function",
      `Expected function, got: ${val} (${typeof val})`,
      msg,
    ),
  isNotFunction: (val, msg) =>
    throwIf(
      typeof val === "function",
      `Expected not a function, but got: ${val}`,
      msg,
    ),
  isTrue: (val, msg) =>
    throwIf(val !== true, `Expected true, got: ${val} (${typeof val})`, msg),
  isFalse: (val, msg) =>
    throwIf(val !== false, `Expected false, got: ${val} (${typeof val})`, msg),
  isNull: (val, msg) =>
    throwIf(val !== null, `Expected null, got: ${val} (${typeof val})`, msg),
  isNotNull: (val, msg) =>
    throwIf(val === null, "Expected value not to be null, but got: null", msg),
  isArray: (val, msg) =>
    throwIf(
      !Array.isArray(val),
      `Expected array, got: ${val} (${typeof val})`,
      msg,
    ),
  isNotArray: (val, msg) =>
    throwIf(Array.isArray(val), `Expected not array, but got: ${val}`, msg),
  include: (haystack, needle, msg) => {
    const valid = typeof haystack === "string" || Array.isArray(haystack);
    throwIf(
      !valid,
      `assert.include requires string or array, got: ${typeof haystack}`,
    );
    throwIf(!haystack.includes(needle), `Expected to include: ${needle}`, msg);
  },
  notInclude: (haystack, needle, msg) => {
    const valid = typeof haystack === "string" || Array.isArray(haystack);
    throwIf(
      !valid,
      `assert.notInclude requires string or array, got: ${typeof haystack}`,
    );
    throwIf(
      haystack.includes(needle),
      `Expected NOT to include: ${needle}`,
      msg,
    );
  },
  ok: (val, msg) =>
    throwIf(!val, `Expected truthy, got: ${val} (${typeof val})`, msg),
  isOk: (val, msg) => assert.ok(val, msg),
  notOk: (val, msg) =>
    throwIf(val, `Expected falsy, got: ${val} (${typeof val})`, msg),
  isNotOk: (val, msg) => assert.notOk(val, msg),
  throws: (fn, expectedPattern, msg) => {
    let threw = false;
    let error;
    try {
      fn();
    } catch (e) {
      threw = true;
      error = e;
    }
    throwIf(!threw, "Expected function to throw, but it did not", msg);
    if (expectedPattern instanceof RegExp) {
      throwIf(
        !expectedPattern.test(error.message),
        `Expected error message to match ${expectedPattern}, got: ${error.message}`,
        msg,
      );
    }
  },
  rejects: async (promise, expectedPattern, msg) => {
    let rejected = false;
    let error;
    try {
      await promise;
    } catch (e) {
      rejected = true;
      error = e;
    }
    throwIf(!rejected, "Expected promise to reject, but it resolved", msg);
    if (expectedPattern instanceof RegExp) {
      throwIf(
        !expectedPattern.test(error.message),
        `Expected error message to match ${expectedPattern}, got: ${error.message}`,
        msg,
      );
    }
  },
});

// Register with $APP if in browser environment
if ($APP) {
  $APP.devFiles.add(new URL(import.meta.url).pathname);
}

export default assert;
