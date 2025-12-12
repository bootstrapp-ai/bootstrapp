import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export default {
	name: "transport:http",
	initialize(host) {
		const transport = {
			name: "StreamableHTTP",
			async createTransport(transportConfig) {
				const url = transportConfig.url || transportConfig.command;
				if (!url) {
					throw new Error("StreamableHTTP transport requires a 'url'.");
				}
				return new StreamableHTTPClientTransport(new URL(url));
			},
		};
		host.transports.set(transport.name, transport);
	},
	api: {},
};
