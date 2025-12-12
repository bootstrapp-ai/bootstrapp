import {
	McpServer,
	ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";

const server = new McpServer(
	{
		name: "example-server",
		version: "0.1.0",
	},
	{
		capabilities: {
			tools: {},
			resources: { subscribe: true },
			logging: {},
			prompts: {},
			sampling: {},
			elicitation: {},
		},
	},
);

// In-memory data storage
const dataStore = {
	users: [
		{ id: 1, name: "Alice", email: "alice@example.com", role: "admin" },
		{ id: 2, name: "Bob", email: "bob@example.com", role: "user" },
		{ id: 3, name: "Charlie", email: "charlie@example.com", role: "user" },
	],
	posts: [
		{
			id: 1,
			title: "Welcome Post",
			content: "Welcome to our platform!",
			authorId: 1,
		},
		{
			id: 2,
			title: "Getting Started",
			content: "Here's how to get started...",
			authorId: 1,
		},
	],
	settings: {
		theme: "dark",
		language: "en",
		notifications: true,
		maxUsers: 100,
	},
};

const subscriptions = new Set();

server.registerTool(
	"echo",
	{
		title: "Echo Tool",
		description: "Echo back the input text with optional formatting",
		inputSchema: {
			text: z.string().describe("Text to echo back"),
			uppercase: z.boolean().optional().describe("Convert to uppercase"),
			repeat: z
				.number()
				.min(1)
				.max(5)
				.optional()
				.default(1)
				.describe("Number of times to repeat"),
		},
	},
	async ({ text, uppercase = false, repeat = 1 }) => {
		let result = uppercase ? text.toUpperCase() : text;
		result = Array(repeat).fill(result).join(" | ");

		return {
			content: [
				{
					type: "text",
					text: `Echo: ${result}`,
				},
			],
		};
	},
);

// Math calculator tool
server.registerTool(
	"calculate",
	{
		title: "Calculator",
		description: "Perform basic mathematical operations",
		inputSchema: {
			operation: z
				.enum(["add", "subtract", "multiply", "divide", "power"])
				.describe("Mathematical operation to perform"),
			a: z.number().describe("First number"),
			b: z.number().describe("Second number"),
		},
	},
	async ({ operation, a, b }) => {
		let result;

		switch (operation) {
			case "add":
				result = a + b;
				break;
			case "subtract":
				result = a - b;
				break;
			case "multiply":
				result = a * b;
				break;
			case "divide":
				if (b === 0) throw new Error("Division by zero is not allowed");
				result = a / b;
				break;
			case "power":
				result = a ** b;
				break;
		}

		return {
			content: [
				{
					type: "text",
					text: `${a} ${operation} ${b} = ${result}`,
				},
			],
		};
	},
);

// User management tool with elicitation
server.registerTool(
	"manage_user",
	{
		title: "User Management",
		description: "Create, update, or delete users",
		inputSchema: {
			action: z
				.enum(["create", "update", "delete", "list"])
				.describe("Action to perform"),
			userId: z
				.number()
				.optional()
				.describe("User ID (required for update/delete)"),
			name: z.string().optional().describe("User name (required for create)"),
			email: z
				.string()
				.email()
				.optional()
				.describe("User email (required for create)"),
			role: z.enum(["admin", "user"]).optional().describe("User role"),
		},
	},
	async ({ action, userId, name, email, role }) => {
		switch (action) {
			case "list": {
				return {
					content: [
						{
							type: "text",
							text: `Users:\n${dataStore.users.map((u) => `${u.id}: ${u.name} (${u.email}) - ${u.role}`).join("\n")}`,
						},
					],
				};
			}
			case "create": {
				if (!name || !email)
					throw new Error("Name and email are required for creating a user");
				const newUser = {
					id: Math.max(...dataStore.users.map((u) => u.id)) + 1,
					name,
					email,
					role: role || "user",
				};
				dataStore.users.push(newUser);

				// Notify subscribers
				if (subscriptions.has("data://users")) {
					server.notifyResourceUpdated("data://users");
				}

				return {
					content: [
						{
							type: "text",
							text: `Created user: ${newUser.name} (ID: ${newUser.id})`,
						},
					],
				};
			}
			case "update": {
				if (!userId) throw new Error("User ID is required for updating");
				const userIndex = dataStore.users.findIndex((u) => u.id === userId);
				if (userIndex === -1)
					throw new Error(`User with ID ${userId} not found`);

				if (name) dataStore.users[userIndex].name = name;
				if (email) dataStore.users[userIndex].email = email;
				if (role) dataStore.users[userIndex].role = role;

				// Notify subscribers
				if (subscriptions.has("data://users")) {
					server.notifyResourceUpdated("data://users");
				}
				if (subscriptions.has(`data://users/${userId}`)) {
					server.notifyResourceUpdated(`data://users/${userId}`);
				}

				return {
					content: [
						{
							type: "text",
							text: `Updated user: ${dataStore.users[userIndex].name}`,
						},
					],
				};
			}
			case "delete": {
				if (!userId) throw new Error("User ID is required for deletion");
				const deleteIndex = dataStore.users.findIndex((u) => u.id === userId);
				if (deleteIndex === -1)
					throw new Error(`User with ID ${userId} not found`);

				const deletedUser = dataStore.users.splice(deleteIndex, 1)[0];

				// Notify subscribers
				if (subscriptions.has("data://users")) {
					server.notifyResourceUpdated("data://users");
				}

				return {
					content: [
						{
							type: "text",
							text: `Deleted user: ${deletedUser.name}`,
						},
					],
				};
			}
		}
	},
);

// NEW: Delete user with confirmation using elicitation
server.registerTool(
	"delete_user_with_confirmation",
	{
		title: "Delete User with Confirmation",
		description: "Deletes a user after confirming with the user",
		inputSchema: {
			userId: z.number().describe("ID of the user to delete"),
			force: z
				.boolean()
				.optional()
				.describe("Skip confirmation if true (default: false)"),
		},
	},
	async ({ userId, force = false }) => {
		const userIndex = dataStore.users.findIndex((u) => u.id === userId);
		if (userIndex === -1) {
			throw new Error(`User with ID ${userId} not found`);
		}

		const user = dataStore.users[userIndex];

		if (!force) {
			const result = await server.server.elicitInput({
				message: `Are you sure you want to delete user "${user.name}" (${user.email})?`,
				requestedSchema: {
					type: "object",
					properties: {
						confirm: {
							type: "boolean",
							title: "Confirm deletion",
							description: `Confirm deletion of user "${user.name}"`,
						},
						transferPosts: {
							type: "boolean",
							title: "Transfer posts",
							description: "Transfer user's posts to another user",
							default: false,
						},
						newAuthorId: {
							type: "number",
							title: "New author ID",
							description: "ID of user to transfer posts to (if transferring)",
						},
					},
					required: ["confirm"],
				},
			});

			if (result.action !== "accept" || !result.content?.confirm) {
				return {
					content: [
						{
							type: "text",
							text: `Deletion cancelled by user for ${user.name}`,
						},
					],
				};
			}

			if (result.content?.transferPosts && result.content?.newAuthorId) {
				const newAuthor = dataStore.users.find(
					(u) => u.id === result.content.newAuthorId,
				);
				if (newAuthor) {
					dataStore.posts.forEach((post) => {
						if (post.authorId === userId) {
							post.authorId = result.content.newAuthorId;
						}
					});
					await server.sendLoggingMessage({
						level: "info",
						data: `Transferred posts from ${user.name} to ${newAuthor.name}`,
					});
				}
			}
		}

		// Delete the user
		dataStore.users.splice(userIndex, 1);

		// Notify subscribers
		if (subscriptions.has("data://users")) {
			server.notifyResourceUpdated("data://users");
		}

		return {
			content: [
				{
					type: "text",
					text: `Successfully deleted user: ${user.name}`,
				},
			],
		};
	},
);

// NEW: Generate post content using sampling
server.registerTool(
	"generate_post",
	{
		title: "Generate Post Content",
		description:
			"Uses AI to generate a blog post with the specified parameters",
		inputSchema: {
			title: z.string().describe("Title of the post"),
			authorId: z.number().describe("ID of the author"),
			topic: z.string().optional().describe("Topic or theme for the post"),
			style: z
				.enum(["professional", "casual", "technical", "creative"])
				.optional()
				.default("professional")
				.describe("Writing style for the post"),
		},
	},
	async ({ title, authorId, topic, style = "professional" }) => {
		const author = dataStore.users.find((u) => u.id === authorId);
		if (!author) {
			throw new Error(`Author with ID ${authorId} not found`);
		}

		let generationPrompt = `Write a blog post with the title "${title}"`;
		if (topic) {
			generationPrompt += ` about ${topic}`;
		}
		generationPrompt += `. Use a ${style} writing style. Keep it concise (2-3 paragraphs).`;

		try {
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
				maxTokens: 500,
				temperature: style === "creative" ? 0.8 : 0.3,
			});

			let generatedContent = "";
			if (response.content.type === "text") {
				generatedContent = response.content.text;
			} else {
				throw new Error("Failed to generate text content");
			}

			// Create the new post
			const newPost = {
				id: Math.max(...dataStore.posts.map((p) => p.id)) + 1,
				title,
				content: generatedContent,
				authorId,
			};

			dataStore.posts.push(newPost);

			// Notify subscribers
			if (subscriptions.has("data://posts")) {
				server.notifyResourceUpdated("data://posts");
			}

			await server.sendLoggingMessage({
				level: "info",
				data: `Generated post "${title}" for author ${author.name} in ${style} style`,
			});

			return {
				content: [
					{
						type: "text",
						text: `Successfully generated post "${title}" (ID: ${newPost.id})\n\nContent preview:\n${generatedContent.substring(0, 200)}${generatedContent.length > 200 ? "..." : ""}`,
					},
				],
			};
		} catch (error) {
			await server.sendLoggingMessage({
				level: "error",
				data: `Failed to generate post: ${error.message}`,
			});

			throw new Error(`Post generation failed: ${error.message}`);
		}
	},
);

// Slow operation with progress
server.registerTool(
	"slow_task",
	{
		title: "Slow Task Simulator",
		description: "Simulates a long-running task with progress updates",
		inputSchema: {
			taskName: z.string().describe("Name of the task to simulate"),
			duration: z.number().min(1).max(10).describe("Duration in seconds"),
		},
	},
	async ({ taskName, duration }, { progress }) => {
		await server.sendLoggingMessage({
			level: "info",
			data: `Starting task: ${taskName} (${duration}s)`,
		});

		const steps = duration * 2; // Update every 500ms
		for (let i = 1; i <= steps; i++) {
			await new Promise((resolve) => setTimeout(resolve, 500));
			progress({ progress: i, total: steps });
		}

		await server.sendLoggingMessage({
			level: "info",
			data: `Completed task: ${taskName}`,
		});

		return {
			content: [
				{
					type: "text",
					text: `Task "${taskName}" completed successfully after ${duration} seconds!`,
				},
			],
		};
	},
);

// ===== STATIC RESOURCES =====

// App configuration
server.registerResource(
	"config",
	"config://app",
	{
		title: "App Configuration",
		description: "Application configuration settings",
		mimeType: "application/json",
	},
	async (uri) => ({
		contents: [
			{
				uri: uri.href,
				mimeType: "application/json",
				text: JSON.stringify(
					{
						name: "MCP Dev Server",
						version: "1.0.0",
						features: ["tools", "resources", "templates"],
						status: "active",
						...dataStore.settings,
					},
					null,
					2,
				),
			},
		],
	}),
);

// Users list resource
server.registerResource(
	"data_users",
	"data://users",
	{
		title: "Users List",
		description: "List of all users in the system",
		mimeType: "application/json",
	},
	async (uri) => ({
		contents: [
			{
				uri: uri.href,
				mimeType: "application/json",
				text: JSON.stringify(dataStore.users, null, 2),
			},
		],
	}),
);

// Posts list resource
server.registerResource(
	"data_posts",
	"data://posts",
	{
		title: "Posts List",
		description: "List of all posts in the system",
		mimeType: "application/json",
	},
	async (uri) => ({
		contents: [
			{
				uri: uri.href,
				mimeType: "application/json",
				text: JSON.stringify(dataStore.posts, null, 2),
			},
		],
	}),
);

// ===== RESOURCE TEMPLATES =====

// Individual user resource template
server.registerResource(
	"data_users_template",
	new ResourceTemplate("data://users/{id}", {
		list: undefined,
	}),
	{
		title: "User Resource",
		description: "Individual user data by ID",
	},
	async (uri, { id }) => {
		const userId = Number.parseInt(id);
		const user = dataStore.users.find((u) => u.id === userId);

		if (!user) {
			throw new Error(`User with ID ${userId} not found`);
		}

		// Include user's posts
		const userPosts = dataStore.posts.filter((p) => p.authorId === userId);
		const userData = {
			...user,
			posts: userPosts,
		};

		return {
			contents: [
				{
					uri: uri.href,
					mimeType: "application/json",
					text: JSON.stringify(userData, null, 2),
				},
			],
		};
	},
);

// Individual post resource template
server.registerResource(
	"data_posts_template",
	new ResourceTemplate("data://posts/{id}", {
		list: undefined,
	}),
	{
		title: "Post Resource",
		description: "Individual post data by ID",
	},
	async (uri, { id }) => {
		const postId = Number.parseInt(id);
		const post = dataStore.posts.find((p) => p.id === postId);

		if (!post) {
			throw new Error(`Post with ID ${postId} not found`);
		}

		// Include author information
		const author = dataStore.users.find((u) => u.id === post.authorId);
		const postData = {
			...post,
			author: author ? { name: author.name, email: author.email } : null,
		};

		return {
			contents: [
				{
					uri: uri.href,
					mimeType: "application/json",
					text: JSON.stringify(postData, null, 2),
				},
			],
		};
	},
);

// Dynamic report template
server.registerResource(
	"reports",
	new ResourceTemplate("reports://{type}/{format}", {
		list: undefined,
	}),
	{
		title: "Dynamic Reports",
		description: "Generate various reports in different formats",
	},
	async (uri, { type, format }) => {
		let reportData;
		let mimeType;

		// Generate report based on type
		switch (type) {
			case "users":
				reportData = {
					title: "User Report",
					generated: new Date().toISOString(),
					summary: {
						total: dataStore.users.length,
						admins: dataStore.users.filter((u) => u.role === "admin").length,
						users: dataStore.users.filter((u) => u.role === "user").length,
					},
					users: dataStore.users,
				};
				break;
			case "posts":
				reportData = {
					title: "Posts Report",
					generated: new Date().toISOString(),
					summary: {
						total: dataStore.posts.length,
						byAuthor: dataStore.users.map((u) => ({
							author: u.name,
							count: dataStore.posts.filter((p) => p.authorId === u.id).length,
						})),
					},
					posts: dataStore.posts,
				};
				break;
			default:
				throw new Error(`Unknown report type: ${type}`);
		}

		// Format the report
		let content;
		switch (format) {
			case "json":
				mimeType = "application/json";
				content = JSON.stringify(reportData, null, 2);
				break;
			case "csv":
				mimeType = "text/csv";
				if (type === "users") {
					content =
						"ID,Name,Email,Role\n" +
						dataStore.users
							.map((u) => `${u.id},${u.name},${u.email},${u.role}`)
							.join("\n");
				} else {
					content =
						"ID,Title,Author ID\n" +
						dataStore.posts
							.map((p) => `${p.id},${p.title},${p.authorId}`)
							.join("\n");
				}
				break;
			case "txt":
				mimeType = "text/plain";
				content = `${reportData.title}\nGenerated: ${reportData.generated}\n\n${JSON.stringify(reportData.summary, null, 2)}`;
				break;
			default:
				throw new Error(`Unknown format: ${format}`);
		}

		return {
			contents: [
				{
					uri: uri.href,
					mimeType,
					text: content,
				},
			],
		};
	},
);

// ===== PROMPTS =====

server.registerPrompt(
	"simple_greeting",
	{
		title: "Simple Greeting",
		description: "A basic greeting prompt",
	},
	() => ({
		messages: [
			{
				role: "user",
				content: {
					type: "text",
					text: "Please greet the user in a friendly and professional manner.",
				},
			},
		],
	}),
);

server.registerPrompt(
	"analyze_user_data",
	{
		title: "Analyze User Data",
		description: "Analyze user data with specific parameters",
		argsSchema: {
			userId: z.number().describe("ID of the user to analyze"),
			includeStats: z
				.boolean()
				.default(true)
				.describe("Include statistical analysis"),
		},
	},
	({ userId, includeStats }) => ({
		messages: [
			{
				role: "user",
				content: {
					type: "text",
					text: `Please analyze the user data for user ID ${userId}.${includeStats ? " Include detailed statistics and insights." : " Provide a basic summary only."}`,
				},
			},
			{
				role: "user",
				content: {
					type: "resource",
					uri: `data://users/${userId}`,
				},
			},
		],
	}),
);

server.registerPrompt(
	"summarize_post",
	{
		title: "Summarize Post",
		description: "Generate a summary of a specific post",
		argsSchema: {
			postId: z.number().describe("ID of the post to summarize"),
		},
	},
	({ postId }) => ({
		messages: [
			{
				role: "user",
				content: {
					type: "text",
					text: "Please provide a concise summary of the following post:",
				},
			},
			{
				role: "user",
				content: {
					type: "resource",
					uri: `data://posts/${postId}`,
				},
			},
		],
	}),
);

export default server;
