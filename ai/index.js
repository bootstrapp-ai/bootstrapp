import $APP from "/node_modules/@bootstrapp/base/app.js";
import chatPlugin from "./plugins/chat.js";
import conversationsPlugin from "./plugins/conversations.js";
import clientsPlugin from "./plugins/core/clients.js";
import eventsPlugin from "./plugins/core/events.js";
import notificationsPlugin from "./plugins/core/notifications.js";
import providersPlugin from "./plugins/core/providers.js";
import requestsPlugin from "./plugins/core/requests.js";
import resourcesPlugin from "./plugins/core/resources.js";
import rootsPlugin from "./plugins/core/roots.js";
import serversPlugin from "./plugins/core/servers.js";
import toolsPlugin from "./plugins/core/tools.js";
import historyPlugin from "./plugins/history.js";
import javascriptTransportPlugin from "./plugins/transports/javascript.js";
import httpTransportPlugin from "./plugins/transports/streamablehttp.js";

const createHost = (initialPlugins = []) => {
	const host = {
		plugins: new Map(),
		transports: new Map(),
		config: {},
		isInitialized: false,
		use(plugin) {
			if (this.plugins.has(plugin.name)) {
				console.warn(`Plugin "${plugin.name}" is already registered.`);
				return this;
			}
			this.plugins.set(plugin.name, plugin);
			if (typeof plugin.initialize === "function") plugin.initialize(this);
			return this;
		},
		addStore(name, store = {}) {
			if (!this[name]) this[name] = store;
		},
		init(initialConfig) {
			if (this.isInitialized)
				return !console.log("AI Host already initialized.") && this;

			this.config = {
				generationConfig: { temperature: 0.7, max_tokens: 2048 },
				...initialConfig,
			};

			const providerApi = this.plugin("providers");
			if (providerApi && initialConfig.providers) {
				initialConfig.providers.forEach((p) => providerApi.addProvider(p));
			}

			if (initialConfig.defaultRoots) {
				const rootApi = this.plugin("roots");
				if (rootApi)
					initialConfig.defaultRoots.forEach((root) => rootApi.addRoot(root));
			}

			this.isInitialized = true;
			console.log("AI Host Initialized.");
			return this;
		},
		plugin(pluginName) {
			const plugin = this.plugins.get(pluginName);
			return plugin ? plugin.api : null;
		},
	};
	initialPlugins.forEach((plugin) => host.use(plugin));
	return host;
};

const defaultPlugins = [
	historyPlugin,
	clientsPlugin,
	requestsPlugin,
	javascriptTransportPlugin,
	httpTransportPlugin,
	eventsPlugin,
	serversPlugin,
	notificationsPlugin,
	resourcesPlugin,
	rootsPlugin,
	toolsPlugin,
	providersPlugin,
	chatPlugin,
	conversationsPlugin,
];

const AI = createHost(defaultPlugins);

for (const plugin of defaultPlugins)
	if (plugin.api) Object.assign(AI, plugin.api);
$APP.addModule({ name: "AI", base: AI });
export default AI;
