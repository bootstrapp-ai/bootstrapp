export default {
	name: "servers",
	initialize(host) {
		const state = {
			availableServers: [
				{
					id: "default-feature-rich",
					name: "Default Feature-Rich Server",
					description:
						"A comprehensive server with a wide range of capabilities, including tools, resources, and prompts.",
					path: "/modules/mcp/templates/servers/basic.js",
					tags: ["Official", "Recommended", "Full-Featured"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
				},
				{
					id: "eval",
					name: "Simple Greeter Server",
					description:
						"A minimal server that demonstrates basic greeting functionality. Ideal for getting started.",
					path: "/templates/servers/eval.js",
					tags: ["Example", "Beginner"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
				},
				{
					id: "react-agent",
					name: "ReAct Agent",
					description:
						"Reasoning and Acting agent that alternates between thinking and taking actions. Implements the ReAct pattern for systematic problem-solving.",
					path: "/templates/servers/react-agent.js",
					tags: ["AI Reasoning", "Agent", "Official", "Advanced"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m-2 2l-4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m-2-2l-4.2-4.2"></path></svg>`,
				},
				{
					id: "chain-of-thought",
					name: "Chain-of-Thought Reasoner",
					description:
						"Step-by-step reasoning framework that breaks down complex problems into logical sequences. Perfect for mathematical and analytical tasks.",
					path: "/templates/servers/cot-reasoner.js",
					tags: ["AI Reasoning", "Logic", "Official", "Advanced"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
				},
				{
					id: "tree-of-thoughts",
					name: "Tree-of-Thoughts Explorer",
					description:
						"Explores multiple reasoning paths simultaneously, evaluates them, and selects the best solution. Ideal for complex decision-making.",
					path: "/templates/servers/tot-explorer.js",
					tags: ["AI Reasoning", "Decision Making", "Official", "Advanced"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6m0 0l-3-3m3 3l3-3M12 8v8m0 0l-3 3m3-3l3 3M6 8l-3 3 3 3m12-6l3 3-3 3"></path></svg>`,
				},
				{
					id: "reflexion-agent",
					name: "Reflexion Agent",
					description:
						"Self-reflective agent that learns from mistakes, maintains memory of past attempts, and improves over iterations.",
					path: "/templates/servers/reflexion-agent.js",
					tags: ["AI Reasoning", "Learning", "Agent", "Advanced"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>`,
				},
				{
					id: "plan-and-solve",
					name: "Plan-and-Solve Agent",
					description:
						"Creates detailed execution plans before solving problems. Separates planning from execution for better results.",
					path: "/templates/servers/plan-solve-agent.js",
					tags: ["AI Reasoning", "Planning", "Agent", "Advanced"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z"></path><path d="M6 9.01V9"></path><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"></path></svg>`,
				},
				{
					id: "self-consistency",
					name: "Self-Consistency Reasoner",
					description:
						"Generates multiple reasoning paths and uses majority voting to find the most consistent answer. Great for verification.",
					path: "/templates/servers/self-consistency.js",
					tags: ["AI Reasoning", "Verification", "Advanced"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
				},
				{
					id: "metacognitive-controller",
					name: "Metacognitive Controller",
					description:
						"Monitors and controls its own thinking process. Decides which reasoning strategy to use based on the problem type.",
					path: "/templates/servers/metacognitive-controller.js",
					tags: ["AI Reasoning", "Meta", "Advanced", "Controller"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
				},
				{
					id: "frontend-dev-agent",
					name: "Frontend Developer Agent",
					description:
						"Your AI frontend developer. Generate complete SPAs, React components, interactive UIs, and modern web apps - all running in the browser.",
					path: "/templates/servers/frontend-agent.js",
					tags: ["Official", "AI Agent", "Code Generation", "Essential"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
				},
				{
					id: "ui-component-generator",
					name: "UI Component Library",
					description:
						"Generate beautiful, production-ready UI components. Buttons, forms, modals, cards - all with modern styling and animations.",
					path: "/templates/servers/ui-generator.js",
					tags: ["Official", "UI", "Components", "Code Generation"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,
				},
				{
					id: "visualization-generator",
					name: "Data Visualization Generator",
					description:
						"Create stunning charts, graphs, and interactive data visualizations using Chart.js, D3, and Canvas.",
					path: "/templates/servers/viz-generator.js",
					tags: ["Visualization", "Code Generation", "Data"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
				},
				{
					id: "game-animation-generator",
					name: "Game & Animation Studio",
					description:
						"Generate HTML5 games, 3D scenes with Three.js, and stunning CSS/Canvas animations.",
					path: "/templates/servers/game-generator.js",
					tags: ["Games", "Animation", "Code Generation", "Creative"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15.91" y1="11" x2="18.36" y2="8.55"></line><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.91" y1="4.91" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.09" y2="19.09"></line></svg>`,
				},
				{
					id: "landing-page-generator",
					name: "Landing Page Generator",
					description:
						"Create modern, responsive landing pages with hero sections, pricing tables, testimonials, and more.",
					path: "/templates/servers/landing-generator.js",
					tags: ["Web Design", "Code Generation", "Marketing"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
				},
				{
					id: "code-transformer",
					name: "Code Refactoring Agent",
					description:
						"Modernize code, convert to hooks, optimize performance, and improve code quality.",
					path: "/templates/servers/code-transformer.js",
					tags: ["Refactoring", "Code Generation", "AI Agent"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path></svg>`,
				},
				{
					id: "data-processor",
					name: "Data Processing Generator",
					description:
						"Generate scripts for CSV/JSON processing, data transformation, and client-side analysis.",
					path: "/templates/servers/data-processor.js",
					tags: ["Data", "Code Generation", "Utility"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
				},
				// Utility Servers
				{
					id: "virtual-filesystem",
					name: "Virtual Filesystem",
					description:
						"IndexedDB-based file system for managing your projects entirely in the browser.",
					path: "/templates/servers/virtual-fs.js",
					tags: ["Official", "Development", "Storage"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
				},
				{
					id: "http-client",
					name: "HTTP API Client",
					description:
						"Make API requests, test endpoints, and save collections. Perfect for API development.",
					path: "/templates/servers/http-client.js",
					tags: ["API", "Testing", "Utility"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
				},
				{
					id: "github-api",
					name: "GitHub Integration",
					description:
						"Full GitHub workflow via REST API - manage repos, commits, issues, and PRs.",
					path: "/templates/servers/github-api.js",
					tags: ["Git", "Publishing", "Official"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>`,
				},
				// Creative & Interactive
				{
					id: "games-suite",
					name: "Interactive Games",
					description:
						"Text adventures, chess, word games, and coding challenges. Fun way to test the AI!",
					path: "/templates/servers/games.js",
					tags: ["Games", "Entertainment", "Interactive"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="18" y2="12"></line><line x1="12" y1="6" x2="12" y2="18"></line></svg>`,
				},
				{
					id: "canvas-studio",
					name: "Canvas Art Studio",
					description:
						"Create ASCII art, diagrams, charts, and visual content directly in the browser.",
					path: "/templates/servers/canvas-studio.js",
					tags: ["Creative", "Visualization", "Art"],
					icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>`,
				},
			],
			favoriteServerIds: [],
		};

		this.api = {
			listServers: () => [...state.availableServers],
			getFavorites: () => [...state.favoriteServerIds],
			toggleFavorite: (serverId) => {
				const index = state.favoriteServerIds.indexOf(serverId);
				if (index > -1) {
					state.favoriteServerIds.splice(index, 1);
				} else {
					state.favoriteServerIds.push(serverId);
				}
				host.events.emit("servers:favoritesChanged", [
					...state.favoriteServerIds,
				]);
			},
			getServerById: (serverId) => {
				return state.availableServers.find((s) => s.id === serverId);
			},
			getServersByTag: (tag) => {
				return state.availableServers.filter((s) => s.tags.includes(tag));
			},
		};
	},
	api: {},
};
