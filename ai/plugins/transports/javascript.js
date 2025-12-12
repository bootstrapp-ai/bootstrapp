import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import $APP from "/node_modules/@bootstrapp/base/app.js";

export default {
	name: "transport:javascript",
	initialize(host) {
		const transport = {
			name: "JavaScript",
			async createTransport(transportConfig, dependencies) {
				const { host, config } = dependencies;
				let server;

				if (transportConfig.serverInstance) {
					server = transportConfig.serverInstance;
				} else if (transportConfig.command) {
					const module = await import(transportConfig.command);
					if (!module.default && !module.server) {
						throw new Error(
							`Module ${transportConfig.command} does not have a default export function.`,
						);
					}
					server = module.server
						? module.server({
								...$APP,
								$APP,
								host,
								config,
								...transportConfig.args,
							})
						: module.default;

					if (!(server instanceof McpServer)) {
						throw new Error(
							`Module ${transportConfig.command} did not return an McpServer instance.`,
						);
					}
				} else {
					throw new Error(
						"JavaScript transport requires 'serverInstance' or 'command'.",
					);
				}

				const [clientTransport, serverTransport] =
					InMemoryTransport.createLinkedPair();
				await server.connect(serverTransport);
				return clientTransport;
			},
		};
		host.transports.set(transport.name, transport);
	},
	api: {},
};
