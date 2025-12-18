import Testing from "../base/test/index.js";
import createEventHandler from "./index.js";

const { describe, it, assert, mock } = Testing;

Testing.suite("Events", () => {
  describe("createEventHandler", () => {
    it("should create an event handler with default methods", () => {
      const handler = createEventHandler();

      assert.isFunction(handler.on, "should have on method");
      assert.isFunction(handler.off, "should have off method");
      assert.isFunction(handler.emit, "should have emit method");
      assert.isFunction(handler.set, "should have set method");
      assert.isFunction(handler.get, "should have get method");
      assert.isFunction(handler.hasListeners, "should have hasListeners method");
    });

    it("should install methods on provided target object", () => {
      const target = { existingProp: "value" };
      const handler = createEventHandler(target);

      assert.equal(handler, target, "should return the same target object");
      assert.equal(handler.existingProp, "value", "should preserve existing props");
      assert.isFunction(handler.on, "should have on method on target");
    });

    it("should not include get method when getter option is false", () => {
      const handler = createEventHandler({}, { getter: false });

      assert.isUndefined(handler.get, "should not have get method");
      assert.isFunction(handler.on, "should still have on method");
    });
  });

  describe("on/off", () => {
    it("should register a listener", () => {
      const handler = createEventHandler();
      const callback = () => {};

      handler.on("test", callback);

      assert.isTrue(handler.hasListeners("test"), "should have listeners for key");
      const callbacks = handler.get("test");
      assert.equal(callbacks.length, 1, "should have one callback");
      assert.equal(callbacks[0], callback, "should be the registered callback");
    });

    it("should register multiple listeners for same key", () => {
      const handler = createEventHandler();
      const callback1 = () => {};
      const callback2 = () => {};

      handler.on("test", callback1);
      handler.on("test", callback2);

      const callbacks = handler.get("test");
      assert.equal(callbacks.length, 2, "should have two callbacks");
    });

    it("should not register duplicate callbacks", () => {
      const handler = createEventHandler();
      const callback = () => {};

      handler.on("test", callback);
      handler.on("test", callback);

      const callbacks = handler.get("test");
      assert.equal(callbacks.length, 1, "should have only one callback (Set behavior)");
    });

    it("should unregister a listener", () => {
      const handler = createEventHandler();
      const callback = () => {};

      handler.on("test", callback);
      handler.off("test", callback);

      assert.isFalse(handler.hasListeners("test"), "should not have listeners after off");
    });

    it("should handle off for non-existent key gracefully", () => {
      const handler = createEventHandler();
      const callback = () => {};

      // Should not throw
      handler.off("nonexistent", callback);
      assert.isFalse(handler.hasListeners("nonexistent"));
    });

    it("should not register listener without callback", () => {
      const handler = createEventHandler();

      handler.on("test", null);
      handler.on("test", undefined);

      assert.isFalse(handler.hasListeners("test"), "should not register null/undefined callbacks");
    });
  });

  describe("emit", () => {
    it("should call registered listeners with data", async () => {
      const handler = createEventHandler();
      const mockFn = mock.fn();

      handler.on("test", mockFn);
      await handler.emit("test", { value: 42 });

      assert.equal(mockFn.mock.calls.length, 1, "callback should be called once");
      assert.deepEqual(mockFn.mock.calls[0].args, [{ value: 42 }], "should receive correct data");
    });

    it("should call multiple listeners", async () => {
      const handler = createEventHandler();
      const mockFn1 = mock.fn();
      const mockFn2 = mock.fn();

      handler.on("test", mockFn1);
      handler.on("test", mockFn2);
      await handler.emit("test", "data");

      assert.equal(mockFn1.mock.calls.length, 1, "first callback should be called");
      assert.equal(mockFn2.mock.calls.length, 1, "second callback should be called");
    });

    it("should return results from all listeners", async () => {
      const handler = createEventHandler();

      handler.on("test", (data) => data * 2);
      handler.on("test", (data) => data * 3);

      const results = await handler.emit("test", 10);

      assert.deepEqual(results, [20, 30], "should return results from both callbacks");
    });

    it("should handle async listeners", async () => {
      const handler = createEventHandler();

      handler.on("test", async (data) => {
        await new Promise((r) => setTimeout(r, 10));
        return data + " async";
      });

      const results = await handler.emit("test", "hello");

      assert.deepEqual(results, ["hello async"], "should resolve async results");
    });

    it("should handle mixed sync and async listeners", async () => {
      const handler = createEventHandler();

      handler.on("test", (data) => data + " sync");
      handler.on("test", async (data) => {
        await new Promise((r) => setTimeout(r, 5));
        return data + " async";
      });

      const results = await handler.emit("test", "hello");

      assert.include(results, "hello sync", "should have sync result");
      assert.include(results, "hello async", "should have async result");
    });

    it("should handle emit with no listeners gracefully", async () => {
      const handler = createEventHandler();

      const results = await handler.emit("nonexistent", "data");

      assert.isArray(results, "should return an array");
      assert.equal(results.length, 0, "should be empty");
    });

    it("should continue executing other listeners if one throws", async () => {
      const handler = createEventHandler();
      const mockFn = mock.fn();

      handler.on("test", () => {
        throw new Error("Test error");
      });
      handler.on("test", mockFn);

      await handler.emit("test", "data");

      assert.equal(mockFn.mock.calls.length, 1, "second callback should still be called");
    });
  });

  describe("set", () => {
    it("should register multiple events at once", () => {
      const handler = createEventHandler();
      const callback1 = () => {};
      const callback2 = () => {};

      handler.set({
        event1: callback1,
        event2: callback2,
      });

      assert.isTrue(handler.hasListeners("event1"), "should have event1 listeners");
      assert.isTrue(handler.hasListeners("event2"), "should have event2 listeners");
      assert.equal(handler.get("event1")[0], callback1);
      assert.equal(handler.get("event2")[0], callback2);
    });
  });

  describe("get", () => {
    it("should return empty array for non-existent key", () => {
      const handler = createEventHandler();

      const callbacks = handler.get("nonexistent");

      assert.isArray(callbacks, "should return an array");
      assert.equal(callbacks.length, 0, "should be empty");
    });

    it("should return a copy of callbacks array", () => {
      const handler = createEventHandler();
      const callback = () => {};

      handler.on("test", callback);
      const callbacks1 = handler.get("test");
      const callbacks2 = handler.get("test");

      assert.notEqual(callbacks1, callbacks2, "should return different array instances");
      assert.deepEqual(callbacks1, callbacks2, "but with same content");
    });
  });

  describe("hasListeners", () => {
    it("should return false for keys with no listeners", () => {
      const handler = createEventHandler();

      assert.isFalse(handler.hasListeners("nonexistent"));
    });

    it("should return true for keys with listeners", () => {
      const handler = createEventHandler();
      handler.on("test", () => {});

      assert.isTrue(handler.hasListeners("test"));
    });

    it("should return false after all listeners are removed", () => {
      const handler = createEventHandler();
      const callback = () => {};

      handler.on("test", callback);
      assert.isTrue(handler.hasListeners("test"));

      handler.off("test", callback);
      assert.isFalse(handler.hasListeners("test"));
    });
  });
});
