export default {
	name: "tools",
	initialize(host) {
		const historyApi = host.plugin("history");
		if (!historyApi)
			throw new Error("Tooling plugin requires the History plugin.");

		host.addStore("toolToAliasMap", new Map());
		host.addStore("promptToAliasMap", new Map());

		this.api.callTool = (toolName, args) => {
			return historyApi.withHistory(
				"tool:call",
				{ toolName, args },
				async () => {
					let alias = host.toolToAliasMap.get(toolName);
					if (!alias) {
						await host._updateAllToolMaps();
						alias = host.toolToAliasMap.get(toolName);
						if (!alias)
							throw new Error(
								`Tool '${toolName}' not found on any connected server.`,
							);
					}
					const client = host.clients.get(alias);
					return client.callTool({ name: toolName, arguments: args });
				},
			);
		};

		this.api.listTools = ({ servers } = {}) => {
			return historyApi.withHistory("tools:list", { servers }, async () => {
				const allItems = [];
				const aliasesToList = servers || Array.from(host.clients.keys());
				for (const alias of aliasesToList) {
					const client = host.clients.get(alias);
					if (client) {
						try {
							const { tools = [] } = await client.listTools();
							allItems.push(
								...tools.map((tool) => ({ ...tool, server: alias })),
							);
						} catch (e) {
							console.error(`Could not list tools for server ${alias}:`, e);
						}
					}
				}
				return { tools: allItems };
			});
		};

		this.api._updateAllToolMaps = async () => {
			host.toolToAliasMap.clear();
			for (const alias of host.clients.keys()) {
				await host._updateToolMapForAlias(alias);
			}
		};

		this.api._updateToolMapForAlias = async (alias) => {
			const client = host.clients.get(alias);
			if (!client) return;
			try {
				const { tools } = await client.listTools();
				for (const tool of tools) {
					if (host.toolToAliasMap.has(tool.name)) {
						console.warn(
							`Tool name conflict: '${tool.name}' from server '${alias}' is overwriting an existing tool.`,
						);
					}
					host.toolToAliasMap.set(tool.name, alias);
				}
			} catch (error) {
				console.error({ error });
			}
		};

		this.api._cleanupMappingsForAlias = (alias) => {
			for (const [toolName, mapAlias] of host.toolToAliasMap.entries()) {
				if (mapAlias === alias) host.toolToAliasMap.delete(toolName);
			}
			for (const [promptName, mapAlias] of host.promptToAliasMap.entries()) {
				if (mapAlias === alias) host.promptToAliasMap.delete(promptName);
			}
		};

		this.api._updateAllPromptMaps = async () => {
			host.promptToAliasMap.clear();
			for (const alias of host.clients.keys()) {
				await host._updatePromptMapForAlias(alias);
			}
		};

		this.api._updatePromptMapForAlias = async (alias) => {
			const client = host.clients.get(alias);
			if (!client || typeof client.listPrompts !== "function") return;
			try {
				const { prompts } = await client.listPrompts();
				console.log({ prompts });
				for (const prompt of prompts) {
					if (host.promptToAliasMap.has(prompt.name)) {
						console.warn(
							`Prompt name conflict: '${prompt.name}' from server '${alias}' is overwriting an existing prompt.`,
						);
					}
					host.promptToAliasMap.set(prompt.name, alias);
				}
			} catch (e) {
				// Errors here are often expected, suppress logging.
			}
		};

		this.api.getPrompt = ({ name, arguments: args }) => {
			return historyApi.withHistory(
				"prompt:get",
				{ name, arguments: args },
				async () => {
					let alias = host.promptToAliasMap.get(name);
					if (!alias) {
						await host._updateAllPromptMaps();
						alias = host.promptToAliasMap.get(name);
						if (!alias) throw new Error(`Prompt '${name}' not found.`);
					}
					const client = host.clients.get(alias);
					return client.getPrompt({ name, arguments: args });
				},
			);
		};

		this.api.listPrompts = ({ servers } = {}) => {
			return historyApi.withHistory("prompts:list", { servers }, async () => {
				const allItems = [];
				const aliasesToList = servers || Array.from(host.clients.keys());
				for (const alias of aliasesToList) {
					const client = host.clients.get(alias);
					if (client && typeof client.listPrompts === "function") {
						try {
							const { prompts = [] } = await client.listPrompts();
							allItems.push(...prompts.map((p) => ({ ...p, server: alias })));
						} catch (e) {
							console.error(`Could not list prompts for server ${alias}:`, e);
						}
					}
				}
				return { prompts: allItems };
			});
		};

		this.api.processTemplate = (templateName, variables = {}) => {
			return historyApi.withHistory(
				"template:process",
				{ templateName, variables },
				async () => {
					const template = await this.api.getPrompt({
						name: templateName,
						arguments: variables,
					});
					let processed = template.messages || template.content || "";
					if (typeof processed !== "string") {
						processed = JSON.stringify(processed); // Handle non-string templates
					}
					for (const [key, value] of Object.entries(variables)) {
						const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
						processed = processed.replace(regex, String(value));
					}
					return {
						content: processed,
						originalTemplate: template,
						variables,
					};
				},
			);
		};
	},

	api: {},
};
