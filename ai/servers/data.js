import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import $APP from "/$app.js";

const server = new McpServer({
	name: "app-data-server",
	version: "1.0.0",
});

const availableModels = Object.keys($APP.models || {});

const generateSchemaForModel = (modelName) => {
	const modelDefinition = $APP.models[modelName];
	if (!modelDefinition) return null;

	const properties = {};
	const required = [];

	for (const [propName, propDef] of Object.entries(modelDefinition)) {
		if (propName.startsWith("$")) continue;
		properties[propName] = {
			type: propDef.type || "string",
			description:
				propDef.description || `The ${propName} of the ${modelName}.`,
		};
		if (propDef.required) {
			required.push(propName);
		}
	}

	return {
		type: "object",
		properties,
		...(required.length > 0 && { required }),
	};
};

server.registerTool(
	"data/get_schema",
	{
		description: "Retrieves the JSON schema for a specified data model.",
		inputSchema: {
			model: z.string().describe("A model name to get the schema for."),
		},
		outputSchema: {
			type: z.string(),
			properties: z.record(z.any()),
			required: z.array(z.string()).optional(),
		},
	},
	async ({ model }) => {
		const schema = generateSchemaForModel(model);
		if (!schema) {
			throw new Error(`Model '${model}' not found.`);
		}
		return {
			structuredContent: schema,
		};
	},
);

server.registerTool(
	"data/list",
	{
		description: "Lists entries from a specified data model.",
		inputSchema: {
			model: z.enum(availableModels),
			includes: z.string().optional(),
		},
		outputSchema: {
			model: z.string(),
			result: z.string(),
		},
	},
	async (args = {}) => {
		const { model, ...opts } = args;
		if (!model || !$APP.Model[model]) return {};
		const result = await $APP.Model[model].getAll(opts);
		const structuredContent = { model, result: JSON.stringify(result) };
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(structuredContent, null, 2),
				},
			],
			structuredContent,
		};
	},
);

server.registerTool(
	"data/upsert",
	{
		description: "Creates or updates an entry in a data model.",
		inputSchema: {
			model: z.enum(availableModels),
			data: z.any(),
		},
		outputSchema: {
			result: z.record(z.any()).describe("The created or updated record."),
		},
	},
	async ({ model, data }) => ({
		result: await $APP.Model[model].upsert(data),
	}),
);

export default server;
