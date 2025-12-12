export default {
	name: "roots",
	initialize(host) {
		const hostRoots = new Map();
		const serverRootAssignments = new Map();
		const rootChangeListeners = new Set();
		const historyApi = host.plugin("history");

		if (!historyApi)
			throw new Error("Root plugin requires the History plugin.");

		const notifyRootChanges = (action, uri) => {
			const event = {
				action,
				uri,
				root: hostRoots.get(uri),
				timestamp: new Date().toISOString(),
			};
			rootChangeListeners.forEach((listener) => listener(event));
		};

		const notifyServerOfRoots = async (serverAlias) => {
			const client = host.clients.get(serverAlias);
			const assignedRoots = this.api.getServerRoots(serverAlias);
			if (client && typeof client.setRoots === "function") {
				try {
					await client.setRoots(assignedRoots);
				} catch (error) {
					console.error(
						`Failed to notify server ${serverAlias} of roots:`,
						error,
					);
				}
			}
		};

		this.api.addRoot = (rootDefinition) => {
			const { uri, path, name, description } = rootDefinition;
			const rootUri = uri || path;
			if (!rootUri) throw new Error("Root URI or path is required");
			return historyApi.withHistory("root:add", { uri: rootUri }, async () => {
				hostRoots.set(rootUri, {
					uri: rootUri,
					name: name || rootUri,
					description: description || `Root access to ${rootUri}`,
				});
				notifyRootChanges("added", rootUri);
				return { uri: rootUri, success: true };
			});
		};

		this.api.removeRoot = (uri) => {
			return historyApi.withHistory("root:remove", { uri }, async () => {
				if (!hostRoots.has(uri))
					return { success: false, message: "Root does not exist" };
				hostRoots.delete(uri);
				serverRootAssignments.forEach((assigned) => assigned.delete(uri));
				notifyRootChanges("removed", uri);
				return { success: true };
			});
		};

		this.api.assignRootsToServer = (serverAlias, rootUris) => {
			return historyApi.withHistory(
				"root:assign",
				{ serverAlias, rootUris },
				async () => {
					if (!host.clients.has(serverAlias))
						throw new Error(`Server ${serverAlias} is not connected`);
					for (const uri of rootUris) {
						if (!hostRoots.has(uri))
							throw new Error(`Root ${uri} does not exist`);
					}
					serverRootAssignments.set(serverAlias, new Set(rootUris));
					await notifyServerOfRoots(serverAlias);
					return { serverAlias, assignedCount: rootUris.length };
				},
			);
		};

		this.api.validateResourceAccess = (serverAlias, resourceUri) => {
			const assignedRoots = serverRootAssignments.get(serverAlias);
			if (!assignedRoots) return false;
			for (const rootUri of assignedRoots) {
				if (resourceUri.startsWith(rootUri)) return true;
			}
			return false;
		};

		this.api.getServerRoots = (serverAlias) => {
			const assigned = serverRootAssignments.get(serverAlias);
			return assigned
				? Array.from(assigned)
						.map((uri) => hostRoots.get(uri))
						.filter(Boolean)
				: [];
		};

		this.api.onRootChange = (listener) => {
			rootChangeListeners.add(listener);
			return () => rootChangeListeners.delete(listener);
		};
	},
	api: {},
};
