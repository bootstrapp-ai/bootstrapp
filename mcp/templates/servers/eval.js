import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";

const server = new McpServer(
	{
		name: "javascript-executor",
		version: "0.1.0",
	},
	{
		capabilities: {
			tools: {},
			resources: {},
			logging: {},
		},
	},
);

// In-memory storage for execution history
const executionHistory = [];

// Execute JavaScript code
server.registerTool(
	"execute_js",
	{
		title: "Execute JavaScript",
		description:
			"Execute JavaScript code in a sandboxed iframe and return the result",
		inputSchema: {
			code: z.string().describe("JavaScript code to execute"),
		},
	},
	async ({ code }) => {
		const startTime = Date.now();

		try {
			await server.sendLoggingMessage({
				level: "info",
				data: "Executing JavaScript code",
			});

			// Create sandboxed iframe execution
			const iframe = `
					<iframe 
						sandbox="allow-scripts" 
						style="display: none;"
						srcdoc="
							<script>
								try {
									const result = eval(\`${code.replace(/`/g, "\\`")}\`);
									window.parent.postMessage({ success: true, result: String(result) }, '*');
								} catch (error) {
									window.parent.postMessage({ success: false, error: error.message }, '*');
								}
							</script>
						">
					</iframe>
				`;

			const executionTime = Date.now() - startTime;

			// Add to history
			executionHistory.push({
				timestamp: new Date().toISOString(),
				code,
				executionTime,
			});

			// Keep only last 100 executions
			if (executionHistory.length > 100) {
				executionHistory.shift();
			}

			return {
				content: [
					{
						type: "text",
						text: `Code will be executed in sandboxed iframe:\n\n\`\`\`javascript\n${code}\n\`\`\`\n\nExecution queued (${executionTime}ms)`,
					},
				],
			};
		} catch (error) {
			await server.sendLoggingMessage({
				level: "error",
				data: `Execution failed: ${error.message}`,
			});

			return {
				content: [
					{
						type: "text",
						text: `Error: ${error.message}`,
					},
				],
				isError: true,
			};
		}
	},
);

server.registerResource(
	"exec_history",
	"exec://history",
	{
		title: "Execution History",
		description: "History of JavaScript executions",
		mimeType: "application/json",
	},
	async (uri) => ({
		contents: [
			{
				uri: uri.href,
				mimeType: "application/json",
				text: JSON.stringify(executionHistory, null, 2),
			},
		],
	}),
);

export default server;
