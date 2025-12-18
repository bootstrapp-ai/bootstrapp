import Testing from "../base/test/index.js";
import { slugify, generateUniqueSlug, slugHooks } from "./slug.js";

const { describe, it, assert, mock } = Testing;

Testing.suite("Slug Utilities", () => {
  describe("slugify", () => {
    it("should convert string to lowercase slug", () => {
      assert.equal(slugify("Hello World"), "hello-world");
    });

    it("should replace spaces with hyphens", () => {
      assert.equal(slugify("one two three"), "one-two-three");
    });

    it("should remove special characters", () => {
      assert.equal(slugify("Hello, World!"), "hello-world");
      assert.equal(slugify("Test@#$%String"), "test-string");
    });

    it("should handle accented characters", () => {
      assert.equal(slugify("Café"), "cafe");
      assert.equal(slugify("Açaí"), "acai");
      assert.equal(slugify("Résumé"), "resume");
      assert.equal(slugify("São Paulo"), "sao-paulo");
    });

    it("should collapse multiple hyphens", () => {
      assert.equal(slugify("one  two   three"), "one-two-three");
      assert.equal(slugify("one---two"), "one-two");
    });

    it("should trim leading and trailing hyphens", () => {
      assert.equal(slugify("  hello  "), "hello");
      assert.equal(slugify("-hello-"), "hello");
      assert.equal(slugify("---test---"), "test");
    });

    it("should handle empty or invalid input", () => {
      assert.equal(slugify(""), "");
      assert.equal(slugify(null), "");
      assert.equal(slugify(undefined), "");
      assert.equal(slugify(123), "");
    });

    it("should handle strings with only special characters", () => {
      assert.equal(slugify("@#$%^&*"), "");
      assert.equal(slugify("   "), "");
    });

    it("should preserve numbers", () => {
      assert.equal(slugify("Test 123"), "test-123");
      assert.equal(slugify("2024 Update"), "2024-update");
    });
  });

  describe("generateUniqueSlug", () => {
    it("should return base slug when no duplicates exist", async () => {
      const mockAdapter = {
        getAll: mock.fn().mockResolvedValue([]),
      };

      const result = await generateUniqueSlug(
        mockAdapter,
        "places",
        "slug",
        "My Place"
      );

      assert.equal(result, "my-place");
      assert.equal(mockAdapter.getAll.mock.calls.length, 1);
    });

    it("should append -1 when slug exists", async () => {
      const mockAdapter = {
        getAll: mock.fn()
          .mockResolvedValueOnce([{ id: "1", slug: "my-place" }])
          .mockResolvedValueOnce([]),
      };

      const result = await generateUniqueSlug(
        mockAdapter,
        "places",
        "slug",
        "My Place"
      );

      assert.equal(result, "my-place-1");
      assert.equal(mockAdapter.getAll.mock.calls.length, 2);
    });

    it("should increment suffix until unique", async () => {
      const mockAdapter = {
        getAll: mock.fn()
          .mockResolvedValueOnce([{ id: "1", slug: "test" }])
          .mockResolvedValueOnce([{ id: "2", slug: "test-1" }])
          .mockResolvedValueOnce([{ id: "3", slug: "test-2" }])
          .mockResolvedValueOnce([]),
      };

      const result = await generateUniqueSlug(
        mockAdapter,
        "posts",
        "slug",
        "Test"
      );

      assert.equal(result, "test-3");
      assert.equal(mockAdapter.getAll.mock.calls.length, 4);
    });

    it("should exclude own ID when editing", async () => {
      const mockAdapter = {
        getAll: mock.fn().mockResolvedValue([{ id: "123", slug: "my-place" }]),
      };

      const result = await generateUniqueSlug(
        mockAdapter,
        "places",
        "slug",
        "My Place",
        "123" // Exclude own ID
      );

      assert.equal(result, "my-place"); // Should allow same slug for same record
    });

    it("should return empty string for empty input", async () => {
      const mockAdapter = {
        getAll: mock.fn(),
      };

      const result = await generateUniqueSlug(
        mockAdapter,
        "places",
        "slug",
        ""
      );

      assert.equal(result, "");
      assert.equal(mockAdapter.getAll.mock.calls.length, 0);
    });
  });

  describe("slugHooks", () => {
    it("should return hooks object with beforeAdd and beforeEdit", () => {
      const hooks = slugHooks("name", "slug");

      assert.isFunction(hooks.beforeAdd);
      assert.isFunction(hooks.beforeEdit);
    });

    it("should use default field names", () => {
      const hooks = slugHooks();

      assert.isFunction(hooks.beforeAdd);
      assert.isFunction(hooks.beforeEdit);
    });

    describe("beforeAdd hook", () => {
      it("should generate slug from source field", async () => {
        const hooks = slugHooks("title", "slug");
        const mockAdapter = {
          getAll: mock.fn().mockResolvedValue([]),
        };

        const data = { title: "My Blog Post" };
        const result = await hooks.beforeAdd(data, {
          model: "posts",
          adapter: mockAdapter,
        });

        assert.equal(result.slug, "my-blog-post");
        assert.equal(result.title, "My Blog Post");
      });

      it("should not override existing slug", async () => {
        const hooks = slugHooks("name", "slug");
        const mockAdapter = {
          getAll: mock.fn(),
        };

        const data = { name: "Test", slug: "custom-slug" };
        const result = await hooks.beforeAdd(data, {
          model: "items",
          adapter: mockAdapter,
        });

        assert.equal(result.slug, "custom-slug");
        assert.equal(mockAdapter.getAll.mock.calls.length, 0);
      });

      it("should handle missing source field", async () => {
        const hooks = slugHooks("name", "slug");
        const mockAdapter = {
          getAll: mock.fn(),
        };

        const data = { description: "No name field" };
        const result = await hooks.beforeAdd(data, {
          model: "items",
          adapter: mockAdapter,
        });

        assert.isUndefined(result.slug);
      });
    });

    describe("beforeEdit hook", () => {
      it("should regenerate slug when source field changes", async () => {
        const hooks = slugHooks("name", "slug");
        const mockAdapter = {
          getAll: mock.fn().mockResolvedValue([]),
        };

        const data = { id: "123", name: "Updated Name" };
        const result = await hooks.beforeEdit(data, {
          model: "items",
          adapter: mockAdapter,
        });

        assert.equal(result.slug, "updated-name");
      });

      it("should not regenerate when slug is provided", async () => {
        const hooks = slugHooks("name", "slug");
        const mockAdapter = {
          getAll: mock.fn(),
        };

        const data = { id: "123", name: "New Name", slug: "keep-this-slug" };
        const result = await hooks.beforeEdit(data, {
          model: "items",
          adapter: mockAdapter,
        });

        assert.equal(result.slug, "keep-this-slug");
        assert.equal(mockAdapter.getAll.mock.calls.length, 0);
      });

      it("should exclude own ID when checking duplicates", async () => {
        const hooks = slugHooks("name", "slug");
        const mockAdapter = {
          getAll: mock.fn().mockResolvedValue([{ id: "123", slug: "test" }]),
        };

        const data = { id: "123", name: "Test" };
        const result = await hooks.beforeEdit(data, {
          model: "items",
          adapter: mockAdapter,
        });

        // Should use same slug since it's own record
        assert.equal(result.slug, "test");
      });
    });
  });
});
