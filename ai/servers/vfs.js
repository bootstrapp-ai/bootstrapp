import {
	McpServer,
	ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";

const server = new McpServer(
	{
		name: "filesystem-server",
		version: "1.0.0",
	},
	{
		capabilities: {
			resources: { subscribe: true },
			completions: {},
			logging: {},
			prompts: {},
			tools: {},
			elicitation: {},
			sampling: {},
		},
	},
);

const VFS = {
	"/": null,
	"/teste.txt": "Teste",
	"/home/": null,
	"/home/user/": null,
	"/home/user/documents/": null,
	"/home/user/documents/welcome.txt": "Welcome to the MCP virtual filesystem!",
	"/home/user/documents/project.plan": "Initial project plan document.",
	"/home/user/downloads/": null,
	"/etc/": null,
	"/etc/config": "max_users=100",
};

const subscriptions = new Set();

// Helper to get direct children of a directory
const getDirectChildren = (dirPath) => {
	if (!dirPath.endsWith("/")) dirPath += "/";
	if (dirPath === "//") dirPath = "/";

	const children = new Set();
	for (const path of Object.keys(VFS)) {
		if (path.startsWith(dirPath) && path !== dirPath) {
			const relativePath = path.substring(dirPath.length);
			const firstSlashIndex = relativePath.indexOf("/");
			const childName =
				firstSlashIndex === -1
					? relativePath
					: relativePath.substring(0, firstSlashIndex + 1);
			if (childName) {
				children.add(childName);
			}
		}
	}
	return Array.from(children);
};

server.registerResource(
	"config",
	"config://app",
	{
		title: "Application Config",
		description: "Application configuration data",
		mimeType: "text/plain",
	},
	async (uri) => ({
		contents: [
			{
				uri: uri.href,
				text: "App configuration here",
			},
		],
	}),
);

Object.entries(VFS).map(([path, content]) => {
	if (!path.endsWith("/"))
		server.registerResource(
			"filesystem",
			`vfs://${path}`,
			{
				title: path,
				mimeType: "text/plain",
			},
			async (uri) => ({
				contents: [
					{
						uri: uri.href,
						text: content,
					},
				],
			}),
		);
});

server.registerResource(
	"filesystem",
	new ResourceTemplate("vfs://{path}", {
		list: undefined,
	}),
	{
		title: "Filesystem Resource",
		description: "Represents a file or directory in the virtual filesystem.",
	},
	async (uri, { path }) => {
		const fullPath = path || "";
		const isDirectoryRequest =
			fullPath.endsWith("/") || path === null || path === "";
		const lookupPath =
			isDirectoryRequest && fullPath !== "/"
				? `${fullPath.replace(/\/$/, "")}/`
				: fullPath;
		if (!(lookupPath in VFS)) {
			throw new Error(`Path not found: ${fullPath}`);
		}
		if (isDirectoryRequest) {
			const dirPath = lookupPath;
			const childrenNames = getDirectChildren(dirPath);

			const links = childrenNames.map((name) => {
				const childPath = `${dirPath === "/" ? "" : dirPath}${name}`;
				const isDirectory = VFS[childPath] === null;
				return {
					type: "resource_link",
					uri: `vfs://${childPath}`,
					name,
					description: `A ${isDirectory ? "directory" : "file"}`,
				};
			});
			return {
				contents: [{ type: "text", text: `Contents of ${dirPath}` }, ...links],
			};
		}
		const content = VFS[lookupPath];
		return { contents: [{ uri: uri.href, text: content }] };
	},
);

const notifySubscribers = (path) => {
	const uri = `vfs://${path}`;
	if (subscriptions.has(uri)) {
		server.notifyResourceUpdated(uri);
	}
	// Also notify the parent directory
	const parentDir = path.substring(
		0,
		path.lastIndexOf("/", path.length - 2) + 1,
	);
	const parentUri = `vfs://${parentDir}`;
	if (subscriptions.has(parentUri)) {
		server.notifyResourceUpdated(parentUri);
	}
};

// --- Original Tools ---
server.registerTool(
	"fs/write",
	{
		title: "Write File",
		description: "Writes content to a file in the virtual filesystem.",
		inputSchema: {
			path: z.string().describe("The full path of the file to write."),
			content: z.string().describe("The content to write to the file."),
		},
	},
	async ({ path, content }) => {
		if (path.endsWith("/"))
			throw new Error("Invalid file path. Path cannot be a directory.");

		const dirPath = path.substring(0, path.lastIndexOf("/") + 1);
		if (VFS[dirPath] !== null && dirPath !== "/") {
			throw new Error(`Directory not found: ${dirPath}`);
		}

		VFS[path] = content;
		notifySubscribers(path);

		return {
			content: [{ type: "text", text: `Successfully wrote to ${path}` }],
		};
	},
);

server.registerTool(
	"fs/create_directory",
	{
		title: "Create Directory",
		description: "Creates a new directory in the virtual filesystem.",
		inputSchema: {
			path: z.string().describe("The full path of the directory to create."),
		},
	},
	async ({ path }) => {
		let newPath = path;
		if (!newPath.startsWith("/")) newPath = "/" + newPath;
		if (!newPath.endsWith("/")) newPath += "/";

		const parentPath = newPath.substring(
			0,
			newPath.lastIndexOf("/", newPath.length - 2) + 1,
		);

		if (VFS[parentPath] !== null && parentPath !== "/") {
			throw new Error(`Parent directory not found: ${parentPath}`);
		}

		if (VFS[newPath] !== undefined) {
			throw new Error(`Directory or file already exists: ${newPath}`);
		}

		VFS[newPath] = null; // Add new directory to VFS
		notifySubscribers(parentPath);

		return {
			content: [
				{ type: "text", text: `Successfully created directory ${newPath}` },
			],
		};
	},
);

server.registerTool(
	"fs/copy",
	{
		title: "Copy File (Slowly)",
		description:
			"Simulates a long-running file copy operation with progress updates.",
		inputSchema: {
			source: z.string().describe("The source file path."),
			destination: z.string().describe("The destination file path."),
		},
	},
	async ({ source, destination }, { progress }) => {
		const sourceContent = VFS[source];
		if (typeof sourceContent !== "string") {
			throw new Error(`Source file not found or is a directory: ${source}`);
		}
		if (destination.endsWith("/")) {
			throw new Error("Invalid destination path. Cannot be a directory.");
		}

		await server.sendLoggingMessage({
			level: "info",
			data: `Starting copy from ${source} to ${destination}`,
		});

		const steps = 5;
		for (let i = 1; i <= steps; i++) {
			await new Promise((res) => setTimeout(res, 500));
			progress({ progress: i, total: steps });
		}

		const destDir = destination.substring(0, destination.lastIndexOf("/") + 1);
		if (VFS[destDir] !== null && destDir !== "/") {
			throw new Error(`Destination directory not found: ${destDir}`);
		}

		VFS[destination] = sourceContent;
		notifySubscribers(destination);

		await server.sendLoggingMessage({
			level: "info",
			data: `Finished copy to ${destination}`,
		});
		return {
			content: [{ type: "text", text: `Copied ${source} to ${destination}` }],
		};
	},
);

server.registerTool(
	"fs/delete_with_confirmation",
	{
		title: "Delete File with Confirmation",
		description:
			"Deletes a file after confirming with the user, with options for handling conflicts.",
		inputSchema: {
			path: z
				.string()
				.describe("The full path of the file or directory to delete."),
			force: z
				.boolean()
				.optional()
				.describe("Skip confirmation if true (default: false)"),
		},
	},
	async ({ path, force = false }) => {
		if (!(path in VFS)) {
			throw new Error(`Path not found: ${path}`);
		}

		const isDirectory = VFS[path] === null;
		const itemType = isDirectory ? "directory" : "file";

		if (!force) {
			const result = await server.server.elicitInput({
				message: `Are you sure you want to delete the ${itemType} "${path}"?${isDirectory ? " This will remove all contents." : ""}`,
				requestedSchema: {
					type: "object",
					properties: {
						confirm: {
							type: "boolean",
							title: "Confirm deletion",
							description: `Confirm deletion of ${itemType} "${path}"`,
						},
						createBackup: {
							type: "boolean",
							title: "Create backup",
							description: "Create a backup before deletion (files only)",
							default: false,
						},
						backupLocation: {
							type: "string",
							title: "Backup location",
							description: "Where to store the backup (optional)",
							default: "/home/user/documents/backups/",
						},
					},
					required: ["confirm"],
				},
			});

			if (result.action !== "accept" || !result.content?.confirm)
				return {
					content: [
						{
							type: "text",
							text: `Deletion cancelled by user for ${path}`,
						},
					],
				};

			if (!isDirectory && result.content?.createBackup) {
				const backupDir =
					result.content.backupLocation || "/home/user/documents/backups/";
				const filename = path.substring(path.lastIndexOf("/") + 1);
				const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
				const backupPath = `${backupDir}${filename}.backup.${timestamp}`;

				if (!(backupDir in VFS)) VFS[backupDir] = null;

				VFS[backupPath] = VFS[path];
				await server.sendLoggingMessage({
					level: "info",
					data: `Created backup at ${backupPath}`,
				});
			}
		}
		if (isDirectory) {
			const keysToDelete = Object.keys(VFS).filter((key) =>
				key.startsWith(path),
			);
			keysToDelete.forEach((key) => delete VFS[key]);
		} else {
			delete VFS[path];
		}
		notifySubscribers(path);

		return {
			content: [
				{
					type: "text",
					text: `Successfully deleted ${itemType}: ${path}`,
				},
			],
		};
	},
);

server.registerTool(
	"fs/generate_content",
	{
		title: "Generate File Content",
		description:
			"Uses AI to generate appropriate content for a file based on its path and type.",
		inputSchema: {
			path: z
				.string()
				.describe("The full path where the file should be created"),
			contentType: z
				.enum([
					"readme",
					"config",
					"script",
					"documentation",
					"letter",
					"report",
					"custom",
				])
				.describe("Type of content to generate"),
			prompt: z
				.string()
				.optional()
				.describe(
					"Custom prompt for content generation (required for 'custom' type)",
				),
			style: z
				.enum(["professional", "casual", "technical", "creative"])
				.optional()
				.default("professional")
				.describe("Writing style for the content"),
		},
	},
	async ({ path, contentType, prompt, style = "professional" }) => {
		if (path.endsWith("/")) {
			throw new Error(
				"Invalid file path. Cannot generate content for a directory.",
			);
		}

		// Determine file extension and adjust content type if needed
		const fileExtension = path
			.substring(path.lastIndexOf(".") + 1)
			.toLowerCase();

		let generationPrompt = "";

		switch (contentType) {
			case "readme":
				generationPrompt = `Create a comprehensive README.md file for a project at path "${path}". Include sections for description, installation, usage, and contributing. Use ${style} tone.`;
				break;
			case "config":
				generationPrompt = `Generate a ${fileExtension} configuration file for "${path}". Include common settings with comments explaining each option. Use ${style} style formatting.`;
				break;
			case "script":
				generationPrompt = `Write a ${fileExtension} script file for "${path}". Include proper headers, comments, and basic functionality. Use ${style} coding style.`;
				break;
			case "documentation":
				generationPrompt = `Create technical documentation for "${path}". Include clear explanations, examples, and proper formatting. Use ${style} writing style.`;
				break;
			case "letter":
				generationPrompt = `Write a ${style} letter and save it to "${path}". Include proper formatting and structure.`;
				break;
			case "report":
				generationPrompt = `Generate a ${style} report document for "${path}". Include executive summary, findings, and recommendations.`;
				break;
			case "custom":
				if (!prompt) {
					throw new Error(
						"Custom prompt is required when contentType is 'custom'",
					);
				}
				generationPrompt = `${prompt}\n\nGenerate content in a ${style} style for file: "${path}"`;
				break;
			default:
				generationPrompt = `Generate appropriate content for the file "${path}" in a ${style} style.`;
		}

		try {
			// Use MCP sampling to generate content
			const response = await server.server.createMessage({
				messages: [
					{
						role: "user",
						content: {
							type: "text",
							text: generationPrompt,
						},
					},
				],
				maxTokens: 1000,
				temperature: style === "creative" ? 0.8 : 0.3,
			});

			let generatedContent = "";
			if (response.content.type === "text") {
				generatedContent = response.content.text;
			} else {
				throw new Error("Failed to generate text content");
			}

			// Ensure the directory exists
			const dirPath = path.substring(0, path.lastIndexOf("/") + 1);
			if (dirPath !== "/" && !(dirPath in VFS)) {
				// Create parent directories if they don't exist
				const pathParts = dirPath.split("/").filter((part) => part !== "");
				let currentPath = "/";
				for (const part of pathParts) {
					currentPath += part + "/";
					if (!(currentPath in VFS)) {
						VFS[currentPath] = null;
					}
				}
			}

			// Write the generated content to the file
			VFS[path] = generatedContent;
			notifySubscribers(path);

			await server.sendLoggingMessage({
				level: "info",
				data: `Generated ${contentType} content for ${path} in ${style} style`,
			});

			return {
				content: [
					{
						type: "text",
						text: `Successfully generated ${contentType} content for ${path}.\n\nGenerated content preview:\n${generatedContent.substring(0, 200)}${generatedContent.length > 200 ? "..." : ""}`,
					},
				],
			};
		} catch (error) {
			await server.sendLoggingMessage({
				level: "error",
				data: `Failed to generate content: ${error.message}`,
			});

			throw new Error(`Content generation failed: ${error.message}`);
		}
	},
);

server.registerPrompt(
	"simple_prompt",
	{
		title: "Simple Prompt",
		description: "A prompt without arguments",
	},
	() => ({
		messages: [
			{
				role: "user",
				content: {
					type: "text",
					text: "This is a simple, static prompt without any arguments.",
				},
			},
		],
	}),
);

server.registerPrompt(
	"complex_prompt",
	{
		title: "Complex Prompt",
		description: "A prompt with arguments",
		argsSchema: {
			temperature: z.string().describe("Temperature Setting (Required)"),
			style: z.string().describe("Output style"),
		},
	},
	({ temperature, style }) => ({
		messages: [
			{
				role: "assistant",
				content: {
					type: "text",
					text: `Please generate a creative story with a temperature of ${temperature} in a ${style} style.`,
				},
			},
		],
	}),
);

server.registerPrompt(
	"resource_prompt",
	{
		title: "Resource-Aware Prompt",
		description: "A prompt that includes an embedded resource reference",
		argsSchema: {
			filePath: z
				.string()
				.describe(
					"Path to the file to summarize (e.g., /home/user/documents/welcome.txt)",
				),
		},
	},
	({ filePath }) => ({
		//TODO: we should fetch the resource
		messages: [
			{
				role: "user",
				content: {
					type: "text",
					text: "Please summarize the following document:",
				},
			},
			{
				role: "user",
				content: {
					type: "resource",
					uri: `vfs://${filePath}`,
				},
			},
		],
	}),
);

export default server;
