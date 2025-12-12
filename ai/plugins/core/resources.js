export default {
	name: "resources",

	initialize(host) {
		const resourceCache = new Map();
		const historyApi = host.plugin("history");
		if (!historyApi)
			throw new Error("Resource plugin requires the History plugin.");
		const listItems = async ({ methodName, resultKey, serverAliases }) => {
			const allItems = [];
			const aliasesToList = serverAliases || Array.from(host.clients.keys());
			for (const alias of aliasesToList) {
				const client = host.clients.get(alias);
				if (client && typeof client[methodName] === "function") {
					try {
						const result = await client[methodName]();
						allItems.push(
							...(result[resultKey] || []).map((item) => ({
								...item,
								server: alias,
							})),
						);
					} catch (e) {
						console.error(
							`Could not execute ${methodName} for server ${alias}:`,
							e,
						);
					}
				}
			}
			return { [resultKey]: allItems };
		};

		this.api.readResource = ({ uri, requestingServer = null }) => {
			return historyApi.withHistory(
				"resource:read",
				{ uri, requestingServer },
				async () => {
					const rootApi = host.plugin("roots");
					if (
						requestingServer &&
						rootApi &&
						!rootApi.validateResourceAccess(requestingServer, uri)
					) {
						throw new Error(
							`Server ${requestingServer} does not have access to resource ${uri}`,
						);
					}
					for (const [alias, client] of host.clients.entries()) {
						console.log({
							requestingServer,
							rootApi,
							valid: rootApi.validateResourceAccess(alias, uri),
						});
						if (
							!requestingServer ||
							!rootApi ||
							rootApi.validateResourceAccess(alias, uri)
						) {
							try {
								const result = await client.readResource({ uri });

								console.log({ uri, result });
								if (result !== undefined && result !== null) return result;
							} catch (e) {
								/* Suppress */
							}
						}
					}
					throw new Error(`Resource not found or could not be read: ${uri}`);
				},
			);
		};

		this.api.readResourceCached = async ({
			uri,
			requestingServer = null,
			maxAge = 300000,
		}) => {
			const cacheKey = `${uri}_${requestingServer || "global"}`;
			const cached = resourceCache.get(cacheKey);
			if (cached && Date.now() - cached.timestamp < maxAge) return cached.data;
			const result = await this.api.readResource({ uri, requestingServer });
			resourceCache.set(cacheKey, { data: result, timestamp: Date.now() });
			return result;
		};

		this.api.listResources = ({ servers } = {}) => {
			return historyApi.withHistory("resources:list", { servers }, () =>
				listItems({
					methodName: "listResources",
					resultKey: "resources",
					serverAliases: servers,
				}),
			);
		};

		this.api.listResourceTemplates = ({ servers } = {}) => {
			return historyApi.withHistory("resourceTemplates:list", { servers }, () =>
				listItems({
					methodName: "listResourceTemplates",
					resultKey: "resourceTemplates",
					serverAliases: servers,
				}),
			);
		};
	},

	api: {},
};
