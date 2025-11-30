import { html } from "lit-html";

$APP.Testing.suite("View", () => {
  let TestView;
  let testInstance;

  beforeAll(async () => {
    await $APP.bootstrap({ modules: ["view"] });

    TestView = $APP.View;
    customElements.define(
      "test-view",
      class extends TestView {
        static tag = "test-view";
        static properties = {
          count: { type: "number", defaultValue: 0 },
          name: { type: "string", defaultValue: "Test" },
          isEnabled: { type: "boolean", defaultValue: false },
          config: { type: "object", defaultValue: { theme: "light" } },
          items: { type: "array", defaultValue: [] },
          noAttr: { type: "string", attribute: false, defaultValue: "hidden" },
          hasCustomSetter: { type: "string", defaultValue: "", setter: true },
        };

        render() {
          return html`
          <div id="test-component">
            <h1>${this.name}</h1>
            <p>Count: ${this.count}</p>
            <p>Status: ${this.isEnabled ? "Enabled" : "Disabled"}</p>
          </div>
        `;
        }

        connectedCallback() {
          this.initCalled = true;
        }

        willUpdate(changedProps) {
          this.willUpdateCalled = true;
          this.willUpdateProps = changedProps;
        }

        updated(changedProps) {
          this.updatedCalled = true;
          this.updatedProps = changedProps;
        }

        firstUpdated(changedProps) {
          this.firstUpdatedCalled = true;
          this.firstUpdatedProps = changedProps;
        }

        disconnectedCallback() {
          this.disconnectCalled = true;
        }
      },
    );
  });

  beforeEach(() => {
    testInstance = document.createElement("test-view");
    document.body.appendChild(testInstance);
  });

  afterEach(() => {
    // Clean up after each test
    if (testInstance?.parentNode) {
      testInstance.parentNode.removeChild(testInstance);
    }
  });

  describe("Element Creation and Initialization", () => {
    it("should create a custom element with default property values", () => {
      assert.equal(testInstance.count, 0);
      assert.equal(testInstance.name, "Test");
      assert.equal(testInstance.isEnabled, false);
      assert.equal(
        JSON.stringify(testInstance.config),
        JSON.stringify({ theme: "light" }),
      );
      assert.equal(JSON.stringify(testInstance.items), JSON.stringify([]));
    });

    it("should call init() when first connected", () => {
      assert.equal(testInstance.initCalled, true);
    });

    it("should set attributes from properties", () => {
      assert.equal(testInstance.getAttribute("count"), "0");
      assert.equal(testInstance.getAttribute("name"), "Test");
      assert.equal(testInstance.hasAttribute("isEnabled"), false);
      assert.equal(
        testInstance.getAttribute("config"),
        JSON.stringify({ theme: "light" }),
      );
      assert.equal(testInstance.getAttribute("items"), JSON.stringify([]));
    });

    it("should not set attributes for properties with attribute: false", () => {
      assert.equal(testInstance.noAttr, "hidden");
      assert.equal(testInstance.hasAttribute("noAttr"), false);
    });

    it("should add class tags from component hierarchy", () => {
      assert.equal(testInstance.classList.contains("test-view"), true);
    });
  });

  describe("Property Updates", () => {
    it("should update property value and attribute", () => {
      testInstance.count = 5;
      assert.equal(testInstance.count, 5);
      assert.equal(testInstance.getAttribute("count"), "5");
    });

    it("should update boolean attributes correctly", () => {
      testInstance.isEnabled = true;
      assert.equal(testInstance.isEnabled, true);
      assert.equal(testInstance.hasAttribute("isEnabled"), true);

      testInstance.isEnabled = false;
      assert.equal(testInstance.isEnabled, false);
      assert.equal(testInstance.hasAttribute("isEnabled"), false);
    });

    it("should update object properties and serialize to attributes", () => {
      const newConfig = { theme: "dark", fontSize: "large" };
      testInstance.config = newConfig;
      assert.equal(
        JSON.stringify(testInstance.config),
        JSON.stringify(newConfig),
      );
      assert.equal(
        testInstance.getAttribute("config"),
        JSON.stringify(newConfig),
      );
    });

    it("should update arrays and serialize to attributes", () => {
      const newItems = [1, 2, 3];
      testInstance.items = newItems;
      assert.equal(
        JSON.stringify(testInstance.items),
        JSON.stringify(newItems),
      );
      assert.equal(
        testInstance.getAttribute("items"),
        JSON.stringify(newItems),
      );
    });

    it("should call lifecycle hooks during update", async () => {
      testInstance.name = "Updated Name";
      setTimeout(() => {
        assert.equal(testInstance.willUpdateCalled, true);
        assert.equal(testInstance.updatedCalled, true);
        assert.equal(testInstance.willUpdateProps.has("name"), true);
      }, 0);
    });
  });

  describe("Attribute Updates", () => {
    it("should reflect attribute changes to properties", () => {
      testInstance.setAttribute("name", "From Attribute");
      assert.equal(testInstance.name, "From Attribute");
    });

    it("should handle boolean attributes", () => {
      testInstance.setAttribute("isEnabled", "");
      setTimeout(() => {
        assert.equal(testInstance.isEnabled, true);
      }, 0);

      testInstance.removeAttribute("isEnabled");
      assert.equal(testInstance.isEnabled, false);
    });

    it("should handle object attributes", () => {
      const newConfig = { theme: "dark", animations: false };
      testInstance.setAttribute("config", JSON.stringify(newConfig));
      assert.equal(
        JSON.stringify(testInstance.config),
        JSON.stringify(newConfig),
      );
    });

    it("should ignore attribute changes for properties with attribute: false", () => {
      testInstance.setAttribute("noAttr", "changed");
      assert.equal(testInstance.noAttr, "hidden");
    });
  });

  describe("Lifecycle Methods", () => {
    it("should call disconnectedCallback when removed", () => {
      document.body.removeChild(testInstance);
      assert.equal(testInstance.disconnectCalled, true);
    });

    it("should call firstUpdated only once", async () => {
      // Force multiple updates
      testInstance.count = 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      const firstCallState = testInstance.firstUpdatedCalled;

      testInstance.count = 2;
      await new Promise((resolve) => setTimeout(resolve, 10));

      assert.equal(firstCallState, true);
      assert.equal(testInstance.firstUpdatedCalled, true);
    });

    it("should call shouldUpdate before update", async () => {
      // Create a spy on shouldUpdate
      const shouldUpdateSpy = mock.fn();
      const originalShouldUpdate = testInstance.shouldUpdate;
      testInstance.shouldUpdate = function (changedProps) {
        shouldUpdateSpy(changedProps);
        return originalShouldUpdate.call(this, changedProps);
      };

      testInstance.count = 5;
      await new Promise((resolve) => setTimeout(resolve, 10));
      assert.equal(shouldUpdateSpy.mock.calls.length, 1);
      assert.equal("count" in shouldUpdateSpy.mock.calls[0].args[0], true);
    });

    it("should not update when shouldUpdate returns false", async () => {
      // Create a spy on update
      const updateSpy = mock.fn();
      const originalUpdate = testInstance.update;
      testInstance.update = function () {
        updateSpy();
        return originalUpdate.call(this);
      };

      // Override shouldUpdate to return false
      testInstance.shouldUpdate = () => false;

      testInstance.count = 10;
      await new Promise((resolve) => setTimeout(resolve, 10));

      assert.equal(updateSpy.mock.calls.length, 0);
    });
  });

  describe("Helper Methods", () => {
    /* 	it("should query elements within the component with q()", () => {
			setTimeout(() => {
				const heading = testInstance.q("h1");
				assert.equal(heading.textContent, "Test");
			}, 10);
		});

		it("should query all matching elements with $$()", () => {
			setTimeout(() => {
				const paragraphs = testInstance.$$("p");
				assert.equal(paragraphs.length, 2);
			}, 10);
		});
 */
    it("should have access to props through prop() method", () => {
      const nameProp = testInstance.prop("name");
      assert.equal(nameProp.value, "Test");

      nameProp.setValue("New Name");
      assert.equal(testInstance.name, "New Name");
    });

    it("should generate setters for properties with setter: true", () => {
      assert.equal(typeof testInstance.setHasCustomSetter, "function");

      testInstance.setHasCustomSetter("custom value");
      assert.equal(testInstance.hasCustomSetter, "custom value");
    });
  });

  describe("Edge Cases", () => {
    it("should handle setting the same value multiple times without triggering updates", async () => {
      const updateSpy = mock.fn();
      const originalUpdate = testInstance.update;
      testInstance.update = function () {
        updateSpy();
        return originalUpdate.call(this);
      };

      // Set initial value
      testInstance.name = "Test";
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Set the same value again
      testInstance.name = "Test";
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should only update once
      assert.equal(updateSpy.mock.calls.length, 1);
    });

    it("should handle property changes during initialization", () => {
      // Create a new component that changes properties during initialization
      customElements.define(
        "init-test-view",
        class extends TestView {
          static tag = "init-test-view";
          static properties = {
            count: { type: "number", defaultValue: 0 },
          };

          connectedCallback() {
            this.count = 42;
          }
        },
      );

      const initTestInstance = document.createElement("init-test-view");
      document.body.appendChild(initTestInstance);

      assert.equal(initTestInstance.count, 42);
      assert.equal(initTestInstance.getAttribute("count"), "42");

      document.body.removeChild(initTestInstance);
    });

    it("should handle undefined and null property values", async () => {
      testInstance.name = undefined;
      await new Promise((resolve) => setTimeout(resolve, 10));
      assert.equal(testInstance.name, undefined);
      assert.equal(testInstance.hasAttribute("name"), false);

      testInstance.name = null;
      await new Promise((resolve) => setTimeout(resolve, 10));
      assert.equal(testInstance.name, null);
      assert.equal(testInstance.getAttribute("name"), "null");
    });
  });

  describe("Performance", () => {
    it("should batch multiple property updates", async () => {
      const updateSpy = mock.fn();
      testInstance.update = () => {
        updateSpy();
      };

      testInstance.count = 1;
      testInstance.name = "Batched";
      testInstance.isEnabled = true;

      await new Promise((resolve) => setTimeout(resolve, 10));

      assert.equal(updateSpy.mock.calls.length, 1);
    });
  });

  describe("Function Components", () => {
    it("should register and render a function component", async () => {
      // Define a function component
      const HelloWorld = (props) => html`
        <div class="hello">
          <h1>${props.greeting}</h1>
          <p>${props.message}</p>
        </div>
      `;

      HelloWorld.properties = {
        greeting: { type: "string", defaultValue: "Hello" },
        message: { type: "string", defaultValue: "World" },
      };

      // Register the component
      Test$APP.define("hello-world", HelloWorld);
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Create and test the component
      const helloInstance = document.createElement("hello-world");
      document.body.appendChild(helloInstance);
      await new Promise((resolve) => setTimeout(resolve, 50));

      assert.equal(helloInstance.greeting, "Hello");
      assert.equal(helloInstance.message, "World");

      // Cleanup
      document.body.removeChild(helloInstance);
    });

    it("should support property reactivity in function components", async () => {
      // Define a counter function component
      const Counter = (props) => html`
        <div class="counter">
          <button @click=${() => props.count++}>Count: ${props.count}</button>
        </div>
      `;

      Counter.properties = {
        count: { type: "number", defaultValue: 0 },
      };

      Test$APP.define("func-counter", Counter);
      await new Promise((resolve) => setTimeout(resolve, 50));

      const counterInstance = document.createElement("func-counter");
      document.body.appendChild(counterInstance);
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Test initial value
      assert.equal(counterInstance.count, 0);

      // Update property
      counterInstance.count = 5;
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify update
      assert.equal(counterInstance.count, 5);

      // Cleanup
      document.body.removeChild(counterInstance);
    });

    it("should support extends property in function components", async () => {
      // First define a base component
      Test$APP.define("base-component", {
        properties: {
          baseValue: { type: "string", defaultValue: "base" },
        },
        render() {
          return html`<div>Base: ${this.baseValue}</div>`;
        },
      });
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Define a function component that extends the base
      const ExtendedFunc = (props) => html`
        <div>
          <div>Extended: ${props.extendedValue}</div>
          <div>Base: ${props.baseValue}</div>
        </div>
      `;

      ExtendedFunc.properties = {
        extendedValue: { type: "string", defaultValue: "extended" },
      };
      ExtendedFunc.extends = "base-component";

      Test$APP.define("extended-func", ExtendedFunc);
      await new Promise((resolve) => setTimeout(resolve, 50));

      const extendedInstance = document.createElement("extended-func");
      document.body.appendChild(extendedInstance);
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should have both base and extended properties
      assert.equal(extendedInstance.baseValue, "base");
      assert.equal(extendedInstance.extendedValue, "extended");

      // Cleanup
      document.body.removeChild(extendedInstance);
    });

    it("should have access to state object in function components", async () => {
      // Define a component that uses multiple props
      const UserCard = (props) => html`
        <div class="user-card">
          <h2>${props.name}</h2>
          <p>Age: ${props.age}</p>
          <p>Email: ${props.email}</p>
        </div>
      `;

      UserCard.properties = {
        name: { type: "string", defaultValue: "Unknown" },
        age: { type: "number", defaultValue: 0 },
        email: { type: "string", defaultValue: "" },
      };

      Test$APP.define("user-card", UserCard);
      await new Promise((resolve) => setTimeout(resolve, 50));

      const userInstance = document.createElement("user-card");
      document.body.appendChild(userInstance);
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Update all properties
      userInstance.name = "John Doe";
      userInstance.age = 30;
      userInstance.email = "john@example.com";
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify all updates
      assert.equal(userInstance.name, "John Doe");
      assert.equal(userInstance.age, 30);
      assert.equal(userInstance.email, "john@example.com");

      // Cleanup
      document.body.removeChild(userInstance);
    });
  });
});
