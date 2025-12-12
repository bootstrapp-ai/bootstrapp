import $APP from "/node_modules/@bootstrapp/base/app.js";
import T from "/node_modules/@bootstrapp/types/index.js";

$APP.addModule({
  name: "mcp",
  path: "/node_modules/@bootstrapp/mcp/views",
  root: true,
  settings: {
    appbar: {
      label: "MCP Inspector",
      icon: "square-mouse-pointer",
    },
  },
});

$APP.addModule({
  name: "mcp-dev",
  settings: {
    appbar: {
      label: "MCP dev",
      icon: "server-cog",
    },
  },
});

$APP.models.set({
  users: {
    name: T.string(),
    avatar: T.string(),
    conversations: T.many("conversations", "user"),
  },
  tags: {
    name: T.string(),
    tagged: T.many("*", "tags", { polymorphic: true }),
  },
  conversations: {
    name: T.string(),
    user: T.belongs("users", "conversations"),
    server: T.belongs("servers", "conversations"),
    messages: T.many("messages", "chat"),
    createdAt: T.string({ index: true }),
  },
  messages: {
    content: T.string(),
    timestamp: T.string({ index: true }),
    role: T.string({ options: ["user", "assistant", "tool"] }),
    toolCalls: T.array(),
    toolCallId: T.string(),
    result: T.object(),
    chat: T.belongs("conversations", "messages"),
  },
  servers: {
    name: T.string(),
    description: T.string(),
    path: T.string(),
    icon: T.string(),
    config: T.object(),
    favorite: T.boolean({ index: true }),
    tags: T.belongs_many("tags", "tagged", { polymorphic: true }),
    hots: T.number({ index: true, default: 0 }),
    commentsCount: T.number({ default: 0 }),
    hotted: T.boolean({ default: false }),
    comments: T.many("comments", "server"),
    capabilities: T.object(),
    transports: T.object(),
    websiteUrl: T.string(),
    _meta: T.object(),
    version: T.string(),
    packages: T.array(),
    remotes: T.array(),
    repository: T.object(),
    createdAt: T.timestamp(),
    updatedAt: T.timestamp({ update: true }),
  },
  clients: {
    name: T.string(),
    description: T.string(),
    icon: T.string(),
    url: T.string(),
    favorite: T.boolean({ index: true }),
    tags: T.belongs_many("tags", "tagged", { polymorphic: true }),
    hots: T.number({ index: true, default: 0 }),
    commentsCount: T.number({ default: 0 }),
    hotted: T.boolean({ default: false }),
    comments: T.many("comments", "client"),
    capabilities: T.object(),
    createdAt: T.timestamp(),
    updatedAt: T.timestamp({ update: true }),
  },
  agents: {
    name: T.string(),
    description: T.string(),
    icon: T.string(),
    favorite: T.boolean({ index: true }),
    tags: T.belongs_many("tags", "tagged", { polymorphic: true }),
    hots: T.number({ index: true, default: 0 }),
    commentsCount: T.number({ default: 0 }),
    hotted: T.boolean({ default: false }),
    comments: T.many("comments", "agent"),
  },
  discussions: {
    title: T.string(),
    category: T.string(),
    icon: T.string(),
    upvotes: T.number({ index: true, default: 0 }),
    comments: T.number({ default: 0 }),
  },
  providers: {
    name: T.string(),
    type: T.string(),
    baseUrl: T.string(),
    apiKey: T.string(),
    active: T.boolean(),
    models: T.many("models", "provider"),
  },
  models: {
    name: T.string(),
    provider: T.belongs("providers", "models"),
  },
  comments: {
    content: T.string(),
    authorName: T.string(),
    authorAvatar: T.string(),
    createdAt: T.string({ index: true }),
    server: T.belongs("servers", "comments"),
    client: T.belongs("clients", "comments"),
    agent: T.belongs("agents", "comments"),
  },
});

const data = {
  servers: [
    {
      id: "ai.aliengiraffe/spotdb",
      name: "ai.aliengiraffe/spotdb",
      description:
        "Ephemeral data sandbox for AI workflows with guardrails and security",
      version: "0.1.0",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "aliengiraffe/spotdb",
          version: "0.1.0",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Optional API key for request authentication",
              format: "string",
              isSecret: true,
              name: "X-API-Key",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/aliengiraffe/spotdb",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
  ],
  clients: [
    {
      id: "zencoder",
      name: "Zencoder",
      description:
        "Zencoder is a coding agent that's available as an extension for VS Code and JetBrains family of IDEs, meeting developers where they already work. It comes with RepoGrokking (deep contextual codebase understanding), agentic pipeline, and the ability to create and share custom agents.",
      icon: "zap",
      url: "https://zecoder.ai",
      tags: ["coding", "agentic", "ide-integration"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: false,
        prompts: false,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
  ],
  discussions: [
    {
      id: "d1",
      title: "How to optimize the React Agent for complex reasoning?",
      category: "p/agent-react",
      icon: "atom",
      upvotes: 46,
      comments: 8,
    },
    {
      id: "d2",
      title: "New feature idea: Real-time collaboration in Web UI Client",
      category: "p/client-webui",
      icon: "users",
      upvotes: 32,
      comments: 5,
    },
    {
      id: "d3",
      title: "Is the Chain-of-Thought Reasoner production-ready?",
      category: "p/server-cot",
      icon: "workflow",
      upvotes: 19,
      comments: 12,
    },
    {
      id: "d4",
      title: "Showcase: I built a custom data visualizer agent!",
      category: "p/showcase",
      icon: "gem",
      upvotes: 9,
      comments: 2,
    },
    {
      id: "d5",
      title: "Best practices for using the CLI with multiple servers",
      category: "p/client-cli",
      icon: "terminal",
      upvotes: 6,
      comments: 4,
    },
  ],
  comments: [
    {
      id: "comment-1",
      content:
        "This server is incredibly versatile! The built-in tools are a huge time-saver for my development workflow.",
      authorName: "Alex Johnson",
      authorAvatar: "https://i.pravatar.cc/40?u=alex-j",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      server: "default-feature-rich",
    },
    {
      id: "comment-2",
      content:
        "I agree, the documentation is also very clear. Had it up and running in minutes.",
      authorName: "Samantha Lee",
      authorAvatar: "https://i.pravatar.cc/40?u=samantha-l",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      server: "default-feature-rich",
    },
    {
      id: "comment-3",
      content:
        "Is there a plan to add more data analysis tools? Would be a great addition.",
      authorName: "David Chen",
      authorAvatar: "https://i.pravatar.cc/40?u=david-c",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      server: "default-feature-rich",
    },
    {
      id: "comment-4",
      content:
        "The CLI is solid, but a GUI for managing scripts would be awesome for less technical team members.",
      authorName: "Maria Garcia",
      authorAvatar: "https://i.pravatar.cc/40?u=maria-g",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      client: "command-line-interface", // This would need to be updated to a new ID if 'client-2' is removed
    },
  ],
  users: [
    {
      id: "user",
      name: "You",
      avatar: "https://i.pravatar.cc/40?u=user-1",
    },
    {
      id: "assistant",
      name: "Assistant",
      avatar: "https://i.pravatar.cc/40?u=assistant",
    },
  ],
  providers: [
    {
      id: "local",
      name: "Local",
      type: "local",
      baseUrl: "http://localhost:1234/v1/chat/completions",
    },
    {
      id: "anthropic",
      name: "Anthropic",
      type: "anthropic",
    },
    {
      id: "codex",
      name: "OpenAI",
      type: "codex",
    },
    {
      id: "google",
      name: "Google",
      type: "google",
    },
    {
      id: "openrouter",
      name: "OpenRouter",
      type: "openrouter",
      baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    },
  ],
  models: [
    {
      id: "anthropic/claude-code",
      name: "Claude Code",
      provider: "anthropic",
    },
    {
      id: "google/gemini-2.5-pro",
      name: "Gemini 2.5 Pro",
      provider: "google",
    },
    {
      id: "google/gemini-2.5-flash",
      name: "Gemini 2.5 Flash",
      provider: "google",
    },
    {
      id: "openrouter/anthropic/claude-3.5-haiku",
      name: "Claude 3.5 Haiku",
      provider: "openrouter",
    },
    {
      id: "openrouter/x-ai/grok-code-fast-1",
      name: "Grok-1 Fast",
      provider: "openrouter",
    },
    {
      id: "openrouter/openai/gpt-4o",
      name: "GPT-4o",
      provider: "openrouter",
    },
    {
      id: "openrouter/mistralai/mistral-large",
      name: "Mistral Large",
      provider: "openrouter",
    },
    {
      id: "openrouter/qwen/qwen2-72b-instruct",
      name: "Qwen 2 72B",
      provider: "openrouter",
    },
    { id: "local/local-model", name: "Local Model", provider: "local" },
  ],
};

$APP.data.set(data);

export const extension = {};
