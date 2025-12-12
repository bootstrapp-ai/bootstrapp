import { Client as McpClient } from "@modelcontextprotocol/sdk/client/index.js";

export default {
	name: "clients",

	initialize(host) {
		const historyApi = host.plugin("history");
		if (!historyApi) {
			throw new Error("Clients plugin requires the History plugin.");
		}

		host.addStore("clients", new Map());
		host.addStore("clientSubscribers", new Set());

		// Internal method to notify subscribers
		const notifySubscribers = (event) => {
			host.clientSubscribers.forEach((callback) => {
				try {
					callback(event);
				} catch (error) {
					console.error("Error in client subscriber:", error);
				}
			});
		};

		// Subscribe to connection changes
		this.api.subscribe = (callback) => {
			if (typeof callback !== "function") {
				throw new Error("Subscriber callback must be a function.");
			}
			host.clientSubscribers.add(callback);

			// Return unsubscribe function
			return () => {
				host.clientSubscribers.delete(callback);
			};
		};

		// Unsubscribe from connection changes
		this.api.unsubscribe = (callback) => {
			return host.clientSubscribers.delete(callback);
		};

		// Get subscriber count (useful for debugging)
		this.api.getSubscriberCount = () => {
			return host.clientSubscribers.size;
		};

		// List all client aliases
		this.api.listClients = () => {
			return Array.from(host.clients.keys());
		};

		// List all connections with their details
		this.api.listConnections = () => {
			return Array.from(host.clients.entries()).map(([alias, client]) => ({
				alias,
				client,
				connected: client.transport !== null,
			}));
		};

		// Check if a connection exists
		this.api.hasConnection = (alias) => {
			return host.clients.has(alias);
		};

		// Get a specific connection by alias
		this.api.getConnection = (alias) => {
			const client = host.clients.get(alias);
			if (!client) {
				return null;
			}
			return {
				alias,
				client,
				connected: client.transport !== null,
			};
		};

		// Connect to an MCP server
		this.api.connect = async (transportConfig, options = {}) => {
			return historyApi.withHistory(
				"server:connect",
				{ transportConfig, options },
				async () => {
					const { alias, assignedRoots = [] } = options;

					if (!alias) {
						throw new Error("Connection alias is required.");
					}

					if (host.clients.has(alias)) {
						throw new Error(`Client with alias '${alias}' already exists.`);
					}

					const transportPlugin = host.transports.get(transportConfig.type);
					if (!transportPlugin) {
						throw new Error(
							`Unsupported transport type: '${transportConfig.type}'`,
						);
					}

					// Create transport
					const transport = await transportPlugin.createTransport(
						transportConfig,
						{
							...host.dependencies,
							host: host,
							config: host.config,
						},
					);

					// Create and connect client
					const client = new McpClient(
						{ name: `host-client-for-${alias}`, version: "1.0.0" },
						{
							capabilities: {
								sampling: {},
								elicitation: {},
								logging: {},
								roots: { listChanged: true },
							},
						},
					);

					await client.connect(transport);
					host.clients.set(alias, client);

					// Set up request handlers
					[...host.requestHandlers].forEach(([schema, requestHandler]) =>
						client.setRequestHandler(schema, (request) =>
							requestHandler(request, alias),
						),
					);

					// Assign roots if provided
					if (assignedRoots.length > 0) {
						const rootApi = host.plugin("roots");
						if (rootApi) {
							await rootApi.assignRootsToServer(alias, assignedRoots);
						}
					}

					// Update tool and prompt maps
					await host._updateToolMapForAlias(alias);
					await host._updatePromptMapForAlias(alias);

					console.log(
						`Client '${alias}' connected via ${transportConfig.type}.`,
					);

					// Notify subscribers
					notifySubscribers({
						type: "connected",
						alias,
						transportType: transportConfig.type,
						timestamp: Date.now(),
						connections: this.api.listConnections(),
					});

					return {
						alias,
						transportType: transportConfig.type,
						success: true,
					};
				},
			);
		};

		// Disconnect from an MCP server
		this.api.disconnect = async (alias) => {
			return historyApi.withHistory(
				"server:disconnect",
				{ alias },
				async () => {
					const client = host.clients.get(alias);
					if (!client) {
						console.warn(`No client with alias '${alias}' to disconnect.`);
						return {
							success: false,
							message: `Client '${alias}' not found`,
						};
					}

					await client.close();
					host.clients.delete(alias);
					host._cleanupMappingsForAlias(alias);

					console.log(`Client '${alias}' disconnected.`);

					// Notify subscribers
					notifySubscribers({
						type: "disconnected",
						alias,
						timestamp: Date.now(),
						connections: this.api.listConnections(),
					});

					return {
						alias,
						success: true,
					};
				},
			);
		};

		// Disconnect all clients
		this.api.disconnectAll = async () => {
			const aliases = this.api.listClients();
			const results = await Promise.allSettled(
				aliases.map((alias) => this.api.disconnect(alias)),
			);

			return {
				total: aliases.length,
				results: results.map((result, index) => ({
					alias: aliases[index],
					success: result.status === "fulfilled" && result.value.success,
					error: result.status === "rejected" ? result.reason : null,
				})),
			};
		};
	},

	api: {},
};
