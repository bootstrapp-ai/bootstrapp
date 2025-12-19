/**
 * @bootstrapp/view - Type Schema
 * Defines the View class API for TypeScript declaration generation
 */
import T from "../types/index.js";

export default {
  name: "@bootstrapp/view",
  exports: {
    // Default export: View class
    default: {
      $class: true,
      // Static properties
      properties: T.object({ description: "Property definitions for the component" }),
      components: T.object({ description: "Map of registered components" }),
      plugins: T.array({ description: "List of plugins to apply to components" }),
      tag: T.string({ description: "Component tag name" }),

      // Static methods
      createClass: T.function({
        description: "Creates a Web Component class from a definition",
        args: [
          T.string({ name: "tag", description: "The tag name" }),
          T.object({ name: "definition", description: "Component definition object" }),
          T.any({ name: "BaseClass", description: "Optional base class to extend" }),
        ],
        returns: T.any({ description: "The generated class" }),
      }),

      define: T.function({
        description: "Defines and registers a custom element",
        args: [
          T.string({ name: "tag", description: "The tag name" }),
          T.object({ name: "definition", description: "Component definition object" }),
        ],
        returns: T.any({ description: "The registered component class" }),
      }),

      // Instance properties
      state: T.object({ description: "Component state object" }),
      hasUpdated: T.boolean({ description: "Whether component has completed first update" }),

      // Instance methods
      on: T.function({
        description: "Adds an event listener to the component",
        args: [
          T.string({ name: "eventName", description: "Event name or selector#eventType" }),
          T.function({ name: "listener", description: "Event handler function" }),
        ],
        returns: T.function({ description: "The wrapper function for removal" }),
      }),

      off: T.function({
        description: "Removes an event listener",
        args: [
          T.string({ name: "eventName" }),
          T.function({ name: "listener" }),
        ],
        returns: T.any({ description: "void" }),
      }),

      emit: T.function({
        description: "Emits a custom event from the component",
        args: [
          T.string({ name: "eventName" }),
          T.any({ name: "data", description: "Data to pass in event.detail" }),
        ],
        returns: T.any({ description: "void" }),
      }),

      $: T.function({
        description: "Query selector within component (alias for querySelector)",
        args: [T.string({ name: "selector" })],
        returns: T.any({ description: "Element | null" }),
      }),

      $$: T.function({
        description: "Query all selector within component (alias for querySelectorAll)",
        args: [T.string({ name: "selector" })],
        returns: T.array({ description: "NodeList of elements" }),
      }),

      requestUpdate: T.function({
        description: "Requests a component update",
        args: [
          T.string({ name: "key", description: "Optional property key that changed" }),
          T.any({ name: "oldValue", description: "Optional old value" }),
        ],
        returns: T.any({ description: "Promise" }),
      }),

      render: T.function({
        description: "Returns the template to render",
        args: [],
        returns: T.any({ description: "TemplateResult from lit-html" }),
      }),

      // Lifecycle methods
      connectedCallback: T.function({
        description: "Called when element is added to DOM",
        args: [],
        returns: T.any({ description: "void" }),
      }),

      disconnectedCallback: T.function({
        description: "Called when element is removed from DOM",
        args: [],
        returns: T.any({ description: "void" }),
      }),
    },

    // Named export: settings object
    settings: T.object({
      description: "View module settings",
    }),
  },
};
