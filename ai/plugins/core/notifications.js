import { ServerNotificationSchema } from "@modelcontextprotocol/sdk/types.js";
export default {
	name: "notifications",
	initialize(host) {
		for (const schema of ServerNotificationSchema.options) {
			const method = schema.shape.method.value;
			host.requestHandlers.add([
				schema,
				(notification) => {
					console.log("MCP Notification Received", {
						method,
						notification,
					});
				},
			]);
		}
	},
	api: {},
};
