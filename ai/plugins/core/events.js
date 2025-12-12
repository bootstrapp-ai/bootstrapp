export default {
	name: "events",

	initialize(host) {
		// A Map to store event listeners, where the key is the event type (string)
		// and the value is an array of handler functions.
		const all = new Map();

		this.api = {
			/**
			 * Register an event handler for the given type.
			 * @param {string} type The event type to listen for.
			 * @param {Function} handler The function to call when the event is emitted.
			 */
			on(type, handler) {
				const handlers = all.get(type);
				if (handlers) {
					handlers.push(handler);
				} else {
					all.set(type, [handler]);
				}
			},

			/**
			 * Remove an event handler for the given type.
			 * @param {string} type The event type to stop listening for.
			 * @param {Function} [handler] The specific handler to remove. If omitted, all handlers for the type are removed.
			 */
			off(type, handler) {
				const handlers = all.get(type);
				if (handlers) {
					if (handler) {
						handlers.splice(handlers.indexOf(handler) >>> 0, 1);
					} else {
						all.set(type, []);
					}
				}
			},

			/**
			 * Emit an event of the given type.
			 * All registered handlers for the type will be called with the event data.
			 * @param {string} type The type of event to emit.
			 * @param {*} [evt] The event data to pass to the handlers.
			 */
			emit(type, evt) {
				const handlers = all.get(type);
				if (handlers) {
					// Use slice to create a copy of the handlers array,
					// in case a handler modifies the original array (e.g., by calling off()).
					handlers.slice().forEach((handler) => handler(evt));
				}
			},
		};

		// Add the event emitter API to the host instance so other plugins can use it.
		host.addStore("events", this.api);
	},

	api: {},
};
