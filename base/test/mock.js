// Conditionally import $APP for browser environment
let $APP;
if (typeof window !== "undefined") {
  $APP = (await import("/$app.js")).default;
}

const mock = {
  fn: (implementation) => {
    const mockFn = (...args) => {
      // Record call
      const call = {
        args,
        timestamp: Date.now(),
        result: null,
        error: null,
      };

      mockFn.mock.calls.push(call);
      mockFn.mock.lastCall = call;

      try {
        // Use queued implementation or default
        const impl =
          mockFn.mock.queued.shift() ||
          mockFn.mock.implementation ||
          implementation;

        const result = impl ? impl(...args) : undefined;

        // Record result
        call.result = result;
        mockFn.mock.results.push({ type: "return", value: result });

        return result;
      } catch (error) {
        // Record error
        call.error = error;
        mockFn.mock.results.push({ type: "throw", value: error });
        throw error;
      }
    };

    // Mock tracking properties
    mockFn.mock = {
      calls: [],
      instances: [],
      results: [],
      lastCall: null,
      implementation: null,
      queued: [], // For once implementations
    };

    // Mock control methods
    mockFn.mockImplementation = (fn) => {
      mockFn.mock.implementation = fn;
      return mockFn;
    };

    mockFn.mockImplementationOnce = (fn) => {
      mockFn.mock.queued.push(fn);
      return mockFn;
    };

    mockFn.mockClear = () => {
      mockFn.mock.calls = [];
      mockFn.mock.instances = [];
      mockFn.mock.results = [];
      mockFn.mock.lastCall = null;
      mockFn.mock.queued = [];
      return mockFn;
    };

    mockFn.mockReset = () => {
      mockFn.mockClear();
      mockFn.mock.implementation = null;
      return mockFn;
    };

    mockFn.mockReturnValue = (value) => mockFn.mockImplementation(() => value);

    mockFn.mockReturnValueOnce = (value) =>
      mockFn.mockImplementationOnce(() => value);

    mockFn.mockResolvedValue = (value) =>
      mockFn.mockImplementation(() => Promise.resolve(value));

    mockFn.mockResolvedValueOnce = (value) =>
      mockFn.mockImplementationOnce(() => Promise.resolve(value));

    mockFn.mockRejectedValue = (value) =>
      mockFn.mockImplementation(() => Promise.reject(value));

    mockFn.mockRejectedValueOnce = (value) =>
      mockFn.mockImplementationOnce(() => Promise.reject(value));

    Object.assign(mockFn.mock, {
      clear: mockFn.mockClear,
      reset: mockFn.mockReset,
      implementation: mockFn.mockImplementation,
      implementationOnce: mockFn.mockImplementationOnce,
      returnValue: mockFn.mockReturnValue,
      returnValueOnce: mockFn.mockReturnValueOnce,
      resolvedValue: mockFn.mockResolvedValue,
      resolvedValueOnce: mockFn.mockResolvedValueOnce,
      rejectedValue: mockFn.mockRejectedValue,
      rejectedValueOnce: mockFn.mockRejectedValueOnce,
    });

    return mockFn;
  },
};

// Register with $APP if in browser environment
if ($APP) {
  $APP.devFiles.add(new URL(import.meta.url).pathname);
}

export default mock;
