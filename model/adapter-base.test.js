import Testing from "../base/test/index.js";
import { DatabaseAdapterBase, validateAdapter } from "./adapter-base.js";

const { describe, it, assert, mock } = Testing;

Testing.suite("Database Adapter Base", () => {
  describe("constructor", () => {
    it("should set properties from config", () => {
      const models = { users: {} };
      const onConnected = () => {};
      const adapter = new DatabaseAdapterBase({
        name: "test-db",
        version: 1,
        models,
        system: true,
        onConnected,
      });

      assert.equal(adapter.name, "test-db");
      assert.equal(adapter.version, 1);
      assert.equal(adapter.models, models);
      assert.isTrue(adapter.system);
      assert.equal(adapter.onConnected, onConnected);
    });
  });

  describe("abstract methods", () => {
    it("should throw on init()", async () => {
      const adapter = new DatabaseAdapterBase({});
      await assert.rejects(adapter.init(), /must be implemented/);
    });

    it("should throw on get()", async () => {
      const adapter = new DatabaseAdapterBase({});
      await assert.rejects(adapter.get("users", "1"), /must be implemented/);
    });

    it("should throw on getAll()", async () => {
      const adapter = new DatabaseAdapterBase({});
      await assert.rejects(adapter.getAll("users"), /must be implemented/);
    });

    it("should throw on add()", async () => {
      const adapter = new DatabaseAdapterBase({});
      await assert.rejects(adapter.add("users", {}), /must be implemented/);
    });

    it("should throw on edit()", async () => {
      const adapter = new DatabaseAdapterBase({});
      await assert.rejects(adapter.edit("users", "1", {}), /must be implemented/);
    });

    it("should throw on remove()", async () => {
      const adapter = new DatabaseAdapterBase({});
      await assert.rejects(adapter.remove("users", "1"), /must be implemented/);
    });

    it("should throw on count()", async () => {
      const adapter = new DatabaseAdapterBase({});
      await assert.rejects(adapter.count("users"), /must be implemented/);
    });

    it("should throw on transaction()", async () => {
      const adapter = new DatabaseAdapterBase({});
      await assert.rejects(adapter.transaction(() => {}), /must be implemented/);
    });

    it("should throw on close()", async () => {
      const adapter = new DatabaseAdapterBase({});
      await assert.rejects(adapter.close(), /must be implemented/);
    });
  });

  describe("addMany", () => {
    it("should call add for each item", async () => {
      const adapter = new DatabaseAdapterBase({});
      let addCount = 0;
      const addMock = mock.fn();
      addMock.mockImplementation(async (model, data) => {
        addCount++;
        return { id: addCount, ...data };
      });
      adapter.add = addMock;

      const results = await adapter.addMany("users", [
        { name: "Alice" },
        { name: "Bob" },
      ]);

      assert.equal(results.length, 2);
      assert.equal(results[0].name, "Alice");
      assert.equal(results[1].name, "Bob");
      assert.equal(addMock.mock.calls.length, 2);
    });
  });

  describe("getMetadata", () => {
    it("should return adapter metadata", () => {
      const adapter = new DatabaseAdapterBase({
        name: "test",
        version: 2,
        models: { users: {}, posts: {} },
        system: false,
      });

      const metadata = adapter.getMetadata();

      assert.equal(metadata.name, "DatabaseAdapterBase");
      assert.equal(metadata.version, 2);
      assert.deepEqual(metadata.models, ["users", "posts"]);
      assert.isFalse(metadata.system);
    });

    it("should handle empty models", () => {
      const adapter = new DatabaseAdapterBase({});
      const metadata = adapter.getMetadata();

      assert.deepEqual(metadata.models, []);
    });
  });

  describe("exportData", () => {
    it("should return empty object by default", async () => {
      const adapter = new DatabaseAdapterBase({});
      const data = await adapter.exportData();
      assert.deepEqual(data, {});
    });
  });

  describe("getSystemModelManager", () => {
    it("should return null by default", () => {
      const adapter = new DatabaseAdapterBase({});
      assert.isNull(adapter.getSystemModelManager());
    });
  });

  describe("Hook System", () => {
    describe("runBeforeAdd", () => {
      it("should call beforeAdd hook and return modified data", async () => {
        const beforeAdd = mock.fn();
        beforeAdd.mockImplementation((data) => ({ ...data, slug: "auto-slug" }));
        const adapter = new DatabaseAdapterBase({
          models: {
            posts: {
              $hooks: { beforeAdd },
            },
          },
        });

        const result = await adapter.runBeforeAdd("posts", { title: "Test" });

        assert.equal(result.title, "Test");
        assert.equal(result.slug, "auto-slug");
        assert.equal(beforeAdd.mock.calls.length, 1);
        assert.deepEqual(beforeAdd.mock.calls[0].args[0], { title: "Test" });
        assert.equal(beforeAdd.mock.calls[0].args[1].model, "posts");
        assert.equal(beforeAdd.mock.calls[0].args[1].operation, "add");
      });

      it("should return data unchanged if no hook", async () => {
        const adapter = new DatabaseAdapterBase({
          models: { posts: {} },
        });

        const data = { title: "Test" };
        const result = await adapter.runBeforeAdd("posts", data);

        assert.deepEqual(result, data);
      });

      it("should return data unchanged if model not found", async () => {
        const adapter = new DatabaseAdapterBase({ models: {} });

        const data = { title: "Test" };
        const result = await adapter.runBeforeAdd("unknown", data);

        assert.deepEqual(result, data);
      });
    });

    describe("runAfterAdd", () => {
      it("should call afterAdd hook", async () => {
        const afterAdd = mock.fn();
        afterAdd.mockImplementation(() => {});
        const adapter = new DatabaseAdapterBase({
          models: {
            posts: {
              $hooks: { afterAdd },
            },
          },
        });

        const result = { id: "1", title: "Test" };
        await adapter.runAfterAdd("posts", result);

        assert.equal(afterAdd.mock.calls.length, 1);
        assert.deepEqual(afterAdd.mock.calls[0].args[0], result);
      });

      it("should return result unchanged", async () => {
        const adapter = new DatabaseAdapterBase({
          models: {
            posts: {
              $hooks: { afterAdd: () => ({ modified: true }) },
            },
          },
        });

        const result = await adapter.runAfterAdd("posts", { id: "1" });
        assert.deepEqual(result, { id: "1" });
      });
    });

    describe("runBeforeEdit", () => {
      it("should call beforeEdit hook and return modified data", async () => {
        const beforeEdit = mock.fn();
        beforeEdit.mockImplementation((data) => ({ ...data, updated: true }));
        const adapter = new DatabaseAdapterBase({
          models: {
            posts: {
              $hooks: { beforeEdit },
            },
          },
        });

        const result = await adapter.runBeforeEdit("posts", { id: "1", title: "Updated" });

        assert.equal(result.title, "Updated");
        assert.isTrue(result.updated);
        assert.equal(beforeEdit.mock.calls[0].args[1].operation, "edit");
      });
    });

    describe("runAfterEdit", () => {
      it("should call afterEdit hook", async () => {
        const afterEdit = mock.fn();
        afterEdit.mockImplementation(() => {});
        const adapter = new DatabaseAdapterBase({
          models: {
            posts: {
              $hooks: { afterEdit },
            },
          },
        });

        await adapter.runAfterEdit("posts", { id: "1" });

        assert.equal(afterEdit.mock.calls.length, 1);
        assert.equal(afterEdit.mock.calls[0].args[1].operation, "edit");
      });
    });

    describe("runBeforeRemove", () => {
      it("should call beforeRemove hook", async () => {
        const beforeRemove = mock.fn();
        beforeRemove.mockImplementation(() => true);
        const adapter = new DatabaseAdapterBase({
          models: {
            posts: {
              $hooks: { beforeRemove },
            },
          },
        });

        const result = await adapter.runBeforeRemove("posts", "1", { id: "1" });

        assert.isTrue(result);
        assert.equal(beforeRemove.mock.calls.length, 1);
        assert.equal(beforeRemove.mock.calls[0].args[1].id, "1");
        assert.equal(beforeRemove.mock.calls[0].args[1].operation, "remove");
      });

      it("should return false if hook returns false (cancel deletion)", async () => {
        const adapter = new DatabaseAdapterBase({
          models: {
            posts: {
              $hooks: { beforeRemove: () => false },
            },
          },
        });

        const result = await adapter.runBeforeRemove("posts", "1", { id: "1" });

        assert.isFalse(result);
      });

      it("should return true if no hook", async () => {
        const adapter = new DatabaseAdapterBase({
          models: { posts: {} },
        });

        const result = await adapter.runBeforeRemove("posts", "1", { id: "1" });

        assert.isTrue(result);
      });
    });

    describe("runAfterRemove", () => {
      it("should call afterRemove hook", async () => {
        const afterRemove = mock.fn();
        afterRemove.mockImplementation(() => {});
        const adapter = new DatabaseAdapterBase({
          models: {
            posts: {
              $hooks: { afterRemove },
            },
          },
        });

        await adapter.runAfterRemove("posts", "1", { id: "1", title: "Deleted" });

        assert.equal(afterRemove.mock.calls.length, 1);
        assert.equal(afterRemove.mock.calls[0].args[0].title, "Deleted");
      });
    });
  });

  describe("stripImmutableFields", () => {
    it("should remove immutable fields from data", () => {
      const adapter = new DatabaseAdapterBase({
        models: {
          posts: {
            title: {},
            slug: { immutable: true },
            createdAt: { immutable: true },
          },
        },
      });

      const data = { title: "New", slug: "old-slug", createdAt: "2024-01-01" };
      const result = adapter.stripImmutableFields("posts", data);

      assert.equal(result.title, "New");
      assert.isUndefined(result.slug);
      assert.isUndefined(result.createdAt);
    });

    it("should not remove id even if immutable", () => {
      const adapter = new DatabaseAdapterBase({
        models: {
          posts: {
            id: { immutable: true },
            title: {},
          },
        },
      });

      const data = { id: "123", title: "Test" };
      const result = adapter.stripImmutableFields("posts", data);

      assert.equal(result.id, "123");
    });

    it("should skip $hooks key", () => {
      const adapter = new DatabaseAdapterBase({
        models: {
          posts: {
            $hooks: { beforeAdd: () => {} },
            title: {},
          },
        },
      });

      const data = { title: "Test" };
      const result = adapter.stripImmutableFields("posts", data);

      assert.equal(result.title, "Test");
    });

    it("should return data unchanged if no schema", () => {
      const adapter = new DatabaseAdapterBase({ models: {} });

      const data = { title: "Test" };
      const result = adapter.stripImmutableFields("unknown", data);

      assert.deepEqual(result, data);
    });
  });

  describe("validateAdapter", () => {
    it("should return true for fully implemented adapter", () => {
      class TestAdapter extends DatabaseAdapterBase {
        async init() {}
        async get() {}
        async getAll() {}
        async add() {}
        async edit() {}
        async remove() {}
        async count() {}
        async transaction() {}
        async close() {}
      }

      const adapter = new TestAdapter({});
      assert.isTrue(validateAdapter(adapter));
    });

    it("should throw for missing methods", () => {
      const adapter = new DatabaseAdapterBase({});
      // Base class has methods that throw, so they exist but don't work
      // Let's test with a minimal object
      const incompleteAdapter = { init: () => {} };

      assert.throws(
        () => validateAdapter(incompleteAdapter),
        /missing required methods/
      );
    });
  });
});
