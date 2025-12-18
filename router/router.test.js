import Testing from "../base/test/index.js";
import { createMemoryAdapter } from "./adapters.js";
import { createRouterCore } from "./core.js";

const { describe, it, assert, mock } = Testing;

// Note: Router core tests that use URLPattern require browser environment
// This file tests the memory adapter and utility functions that work in Node.js

Testing.suite("Router", () => {
  describe("createMemoryAdapter", () => {
    it("should create adapter with initial path", () => {
      const adapter = createMemoryAdapter("/test");
      const location = adapter.getLocation();

      assert.equal(location.pathname, "/test");
      assert.equal(location.origin, "http://memory");
      assert.equal(adapter.type, "memory");
    });

    it("should default to root path", () => {
      const adapter = createMemoryAdapter();
      const location = adapter.getLocation();

      assert.equal(location.pathname, "/");
    });

    it("should parse search and hash from initial path", () => {
      const adapter = createMemoryAdapter("/page?foo=bar#section");
      const location = adapter.getLocation();

      assert.equal(location.pathname, "/page");
      assert.equal(location.search, "?foo=bar");
      assert.equal(location.hash, "#section");
    });

    it("should generate correct href", () => {
      const adapter = createMemoryAdapter("/test?q=1#hash");
      const location = adapter.getLocation();

      assert.equal(location.href, "http://memory/test?q=1#hash");
    });

    describe("isSamePath", () => {
      it("should return true for same path", () => {
        const adapter = createMemoryAdapter("/test");
        assert.isTrue(adapter.isSamePath("/test"));
      });

      it("should return false for different path", () => {
        const adapter = createMemoryAdapter("/test");
        assert.isFalse(adapter.isSamePath("/other"));
      });

      it("should handle full URL comparison", () => {
        const adapter = createMemoryAdapter("/test");
        assert.isTrue(adapter.isSamePath("http://memory/test"));
      });
    });

    describe("pushState", () => {
      it("should update location", () => {
        const adapter = createMemoryAdapter("/");
        adapter.pushState({ page: 1 }, "/new-page");

        const location = adapter.getLocation();
        assert.equal(location.pathname, "/new-page");
      });

      it("should build history stack", () => {
        const adapter = createMemoryAdapter("/");
        adapter.pushState({}, "/page1");
        adapter.pushState({}, "/page2");
        adapter.pushState({}, "/page3");

        const history = adapter.getHistory();
        assert.equal(history.entries.length, 3);
        assert.equal(history.index, 2);
      });
    });

    describe("replaceState", () => {
      it("should replace current history entry", () => {
        const adapter = createMemoryAdapter("/");
        adapter.pushState({}, "/page1");
        adapter.replaceState({}, "/replaced");

        const location = adapter.getLocation();
        assert.equal(location.pathname, "/replaced");

        const history = adapter.getHistory();
        assert.equal(history.entries.length, 1);
      });
    });

    describe("back/forward navigation", () => {
      it("should navigate back", () => {
        const adapter = createMemoryAdapter("/");
        adapter.pushState({}, "/page1");
        adapter.pushState({}, "/page2");

        const didNavigate = adapter.back();

        assert.isTrue(didNavigate);
        assert.equal(adapter.getLocation().pathname, "/page1");
      });

      it("should return false when at start of history", () => {
        const adapter = createMemoryAdapter("/");
        adapter.pushState({}, "/page1");
        adapter.back();

        const didNavigate = adapter.back();
        assert.isFalse(didNavigate);
      });

      it("should navigate forward", () => {
        const adapter = createMemoryAdapter("/");
        adapter.pushState({}, "/page1");
        adapter.pushState({}, "/page2");
        adapter.back();

        const didNavigate = adapter.forward();

        assert.isTrue(didNavigate);
        assert.equal(adapter.getLocation().pathname, "/page2");
      });

      it("should return false when at end of history", () => {
        const adapter = createMemoryAdapter("/");
        adapter.pushState({}, "/page1");

        const didNavigate = adapter.forward();
        assert.isFalse(didNavigate);
      });

      it("should truncate forward history on new push", () => {
        const adapter = createMemoryAdapter("/");
        adapter.pushState({}, "/page1");
        adapter.pushState({}, "/page2");
        adapter.pushState({}, "/page3");
        adapter.back();
        adapter.back();
        adapter.pushState({}, "/new-page");

        const history = adapter.getHistory();
        assert.equal(history.entries.length, 2);
        assert.equal(history.entries[1].pathname, "/new-page");
      });
    });
  });

  // Router core utility functions (no URLPattern required)
  describe("createRouterCore utilities", () => {
    describe("flattenRoutes", () => {
      it("should flatten nested routes", () => {
        const adapter = createMemoryAdapter("/");
        const router = createRouterCore(adapter);

        const { flatRoutes, namedRoutes } = router.flattenRoutes({
          "/": { name: "home" },
          "/users": {
            name: "users",
            routes: {
              "/:id": { name: "user-detail" },
            },
          },
        });

        assert.isDefined(flatRoutes["/"]);
        assert.isDefined(flatRoutes["/users"]);
        assert.isDefined(flatRoutes["/users/:id"]);
        assert.equal(namedRoutes.home, "/");
        assert.equal(namedRoutes["user-detail"], "/users/:id");
      });

      it("should handle parent route references", () => {
        const adapter = createMemoryAdapter("/");
        const router = createRouterCore(adapter);

        const parentRoute = { name: "parent" };
        const { flatRoutes } = router.flattenRoutes({
          "/child": { name: "child" },
        }, "", parentRoute);

        assert.equal(flatRoutes["/child"].parent, parentRoute);
      });
    });

    describe("normalizePath", () => {
      it("should remove trailing slashes", () => {
        const adapter = createMemoryAdapter("/");
        const router = createRouterCore(adapter);

        assert.equal(router.normalizePath("/test/"), "/test");
        assert.equal(router.normalizePath("/test///"), "/test");
      });

      it("should remove query string", () => {
        const adapter = createMemoryAdapter("/");
        const router = createRouterCore(adapter);

        assert.equal(router.normalizePath("/test?foo=bar"), "/test");
      });

      it("should remove hash", () => {
        const adapter = createMemoryAdapter("/");
        const router = createRouterCore(adapter);

        assert.equal(router.normalizePath("/test#section"), "/test");
      });

      it("should return / for empty path", () => {
        const adapter = createMemoryAdapter("/");
        const router = createRouterCore(adapter);

        assert.equal(router.normalizePath(""), "/");
        assert.equal(router.normalizePath(), "/");
      });
    });

    describe("_createPatternString", () => {
      it("should create pattern with named params", () => {
        const adapter = createMemoryAdapter("/");
        const router = createRouterCore(adapter);

        const pattern = router._createPatternString({
          path: "/users",
          namedParams: ["page", "sort"],
        });

        assert.equal(pattern, "/users(/page/:page/sort/:sort)?");
      });

      it("should return path as-is without named params", () => {
        const adapter = createMemoryAdapter("/");
        const router = createRouterCore(adapter);

        const pattern = router._createPatternString({ path: "/users" });

        assert.equal(pattern, "/users");
      });
    });
  });

  // Full router tests with URLPattern require browser environment
  // Create a browser test file (router.browser.test.js) for those
});
