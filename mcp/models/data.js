export const version = 2;

import $APP from "/$app.js";
import T from "/$app/types/index.js";

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
  tags: [
    { id: "official", name: "Official" },
    { id: "recommended", name: "Recommended" },
    { id: "full-featured", name: "Full-Featured" },
    { id: "example", name: "Example" },
    { id: "beginner", name: "Beginner" },
    { id: "ai-reasoning", name: "AI/Reasoning" },
    { id: "logic", name: "Logic" },
    { id: "advanced", name: "Advanced" },
    { id: "web", name: "Web" },
    { id: "ui", name: "UI" },
    { id: "developer-tools", name: "Developer Tools" },
    { id: "cli", name: "CLI" },
    { id: "data", name: "Data" },
    { id: "beta", name: "Beta" },
    { id: "coding", name: "Coding" },
    { id: "agentic", name: "Agentic" },
    { id: "desktop", name: "Desktop" },
    { id: "framework", name: "Framework" },
    { id: "mobile", name: "Mobile" },
    { id: "ide-integration", name: "IDE Integration" },
    { id: "open-source", name: "Open Source" },
    { id: "workflow", name: "Workflow" },
    { id: "chat", name: "Chat" },
    { id: "automation", name: "Automation" },
  ],
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
    {
      id: "ai.alpic.test/test-mcp-server",
      name: "ai.alpic.test/test-mcp-server",
      description: "Alpic Test MCP Server - great server!",
      version: "0.0.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://test.alpic.ai/",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.explorium/mcp-explorium",
      name: "ai.explorium/mcp-explorium",
      description:
        "Access live company and contact data from Explorium's AgentSource B2B platform.",
      version: "1.0.0",
      remotes: [
        {
          type: "sse",
          url: "https://mcp-github-registry.explorium.ai/sse",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "ai.klavis/strata",
      name: "ai.klavis/strata",
      description:
        "MCP server for progressive tool usage at any scale (see https://klavis.ai)",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://strata.klavis.ai/mcp/",
        },
      ],
      repository: {
        url: "https://github.com/Klavis-AI/klavis",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.mcpanalytics/analytics",
      name: "ai.mcpanalytics/analytics",
      description:
        "MCP Analytics, searchable tools and reports with interactive HTML visualization",
      version: "1.0.3",
      remotes: [
        {
          type: "streamable-http",
          url: "https://api.mcpanalytics.ai/auth0",
        },
      ],
      repository: {
        url: "https://github.com/embeddedlayers/mcp-analytics",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.mcpcap/mcpcap",
      name: "ai.mcpcap/mcpcap",
      description: "An MCP server for analyzing PCAP files.",
      version: "0.6.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "mcpcap",
          version: "0.4.4",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/mcpcap/mcpcap",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "ai.shawndurrani/mcp-merchant",
      name: "ai.shawndurrani/mcp-merchant",
      description: "Search-only commerce MCP server backed by Stripe (test)",
      version: "0.1.3",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-merchant",
          version: "0.1.3",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Stripe secret key (test mode)",
              isRequired: true,
              isSecret: true,
              name: "STRIPE_SECRET_KEY",
            },
            {
              description: "Max products to cache",
              default: "100",
              name: "PRODUCT_LIMIT",
            },
            {
              description: "Catalog refresh interval in seconds",
              default: "600",
              name: "REFRESH_INTERVAL_SEC",
            },
          ],
        },
      ],
      remotes: [
        {
          type: "sse",
          url: "https://mcp.shawndurrani.ai/sse",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "ai.shawndurrani/mcp-registry",
      name: "ai.shawndurrani/mcp-registry",
      description:
        "Search the public MCP Registry; discover servers and copy SSE URLs.",
      version: "0.1.3",
      remotes: [
        {
          type: "sse",
          url: "https://mcp-registry.shawndurrani.ai/sse",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "ai.smithery/222wcnm-bilistalkermcp",
      name: "ai.smithery/222wcnm-bilistalkermcp",
      description:
        "Track Bilibili creators and get the latest updates on videos, dynamics, and articles. Fetch user p…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@222wcnm/bilistalkermcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/222wcnm/BiliStalkerMCP",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/Aman-Amith-Shastry-scientific_computation_mcp",
      name: "ai.smithery/Aman-Amith-Shastry-scientific_computation_mcp",
      description:
        "This MCP server enables users to perform scientific computations regarding linear algebra and vect…",
      version: "1.13.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@Aman-Amith-Shastry/scientific_computation_mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Aman-Amith-Shastry/scientific_computation_mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/Artin0123-gemini-image-mcp-server",
      name: "ai.smithery/Artin0123-gemini-image-mcp-server",
      description:
        "Analyze images and videos with Gemini to get fast, reliable visual insights. Handle content from U…",
      version: "1.4.3",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@Artin0123/gemini-image-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Artin0123/gemini-vision-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/BadRooBot-my_test_mcp",
      name: "ai.smithery/BadRooBot-my_test_mcp",
      description:
        "Get current weather for any city and create images from your prompts. Streamline planning, reports…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@BadRooBot/my_test_mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/BadRooBot/python_mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/BadRooBot-test_m",
      name: "ai.smithery/BadRooBot-test_m",
      description:
        "Send quick greetings, scrape website content, and generate text or images on demand. Perform web s…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@BadRooBot/test_m/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/BadRooBot/test_m",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/BigVik193-reddit-ads-mcp",
      name: "ai.smithery/BigVik193-reddit-ads-mcp",
      description:
        "Manage Reddit advertising across accounts, campaigns, ad groups, posts, and ads. List accounts, fu…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@BigVik193/reddit-ads-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/BigVik193/reddit-ads-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/BigVik193-reddit-ads-mcp-api",
      name: "ai.smithery/BigVik193-reddit-ads-mcp-api",
      description:
        "Manage Reddit advertising end to end across accounts, funding methods, campaigns, ad groups, and a…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@BigVik193/reddit-ads-mcp-api/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/BigVik193/reddit-ads-mcp-api",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/BigVik193-reddit-ads-mcp-test",
      name: "ai.smithery/BigVik193-reddit-ads-mcp-test",
      description:
        "Manage Reddit advertising end-to-end: browse ad accounts and payment methods, and organize campaig…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@BigVik193/reddit-ads-mcp-test/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/BigVik193/reddit-ads-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/BigVik193-reddit-user-mcp",
      name: "ai.smithery/BigVik193-reddit-user-mcp",
      description:
        "Browse and manage Reddit posts, comments, and threads. Fetch user activity, explore hot/new/rising…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@BigVik193/reddit-user-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/BigVik193/reddit-user-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/BowenXU0126-aistudio_hw3",
      name: "ai.smithery/BowenXU0126-aistudio_hw3",
      description:
        "Send personalized greetings with optional pirate flair. Compose friendly salutations for any name…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@BowenXU0126/aistudio_hw3/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/BowenXU0126/aistudio_hw3",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/ChiR24-unreal_mcp",
      name: "ai.smithery/ChiR24-unreal_mcp",
      description:
        "Control Unreal Engine to browse assets, import content, and manage levels and sequences. Automate…",
      version: "0.4.6",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@ChiR24/unreal_mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/ChiR24/Unreal_mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/ChiR24-unreal_mcp_server",
      name: "ai.smithery/ChiR24-unreal_mcp_server",
      description:
        "A comprehensive Model Context Protocol (MCP) server that enables AI assistants to control Unreal E…",
      version: "0.4.4",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@ChiR24/unreal_mcp_server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/ChiR24/Unreal_mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/CollectiveSpend-collectivespend-smithery-mcp",
      name: "ai.smithery/CollectiveSpend-collectivespend-smithery-mcp",
      description:
        "Connect CollectiveSpend with Xero to manage contacts. Retrieve, create, and update contact records…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@CollectiveSpend/collectivespend-smithery-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/CryptoCultCurt-appfolio-mcp-server",
      name: "ai.smithery/CryptoCultCurt-appfolio-mcp-server",
      description:
        "Provide seamless access to Appfolio Property Manager Reporting API through a standardized MCP serv…",
      version: "1.0.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@CryptoCultCurt/appfolio-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/CryptoCultCurt/appfolio-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/Danushkumar-V-mcp-discord",
      name: "ai.smithery/Danushkumar-V-mcp-discord",
      description:
        "An MCP server that integrates with Discord to provide AI-powered features.",
      version: "1.2.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@Danushkumar-V/mcp-discord/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Danushkumar-V/mcp-discord",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/DynamicEndpoints-autogen_mcp",
      name: "ai.smithery/DynamicEndpoints-autogen_mcp",
      description:
        "Create and manage AI agents that collaborate and solve problems through natural language interacti…",
      version: "0.3.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@DynamicEndpoints/autogen_mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/DynamicEndpoints/Autogen_MCP",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/DynamicEndpoints-m365-core-mcp",
      name: "ai.smithery/DynamicEndpoints-m365-core-mcp",
      description:
        "*Updated June 17th 2025** Manage your Microsoft 365 services effortlessly. Create and manage distr…",
      version: "1.1.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@DynamicEndpoints/m365-core-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/DynamicEndpoints/m365-core-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/DynamicEndpoints-powershell-exec-mcp-server",
      name: "ai.smithery/DynamicEndpoints-powershell-exec-mcp-server",
      description:
        "Execute PowerShell commands securely with controlled timeouts and input validation. Retrieve syste…",
      version: "1.13.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@DynamicEndpoints/powershell-exec-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/DynamicEndpoints/PowerShell-Exec-MCP-Server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/FelixYifeiWang-felix-mcp-smithery",
      name: "ai.smithery/FelixYifeiWang-felix-mcp-smithery",
      description:
        "Streamline your workflow with Felix. Integrate it into your workspace and tailor its behavior to y…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@FelixYifeiWang/felix-mcp-smithery/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/FelixYifeiWang/felix-mcp-smithery",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/Funding-Machine-ghl-mcp-fundingmachine",
      name: "ai.smithery/Funding-Machine-ghl-mcp-fundingmachine",
      description:
        "Automate GoHighLevel across CRM, messaging, calendars, marketing, e-commerce, and billing. Manage…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@Funding-Machine/ghl-mcp-fundingmachine/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/HARJAP-SINGH-3105-splitwise_mcp",
      name: "ai.smithery/HARJAP-SINGH-3105-splitwise_mcp",
      description:
        "Manage Splitwise balances, expenses, and groups from your workspace. Fetch friends and recent acti…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@HARJAP-SINGH-3105/splitwise_mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/HARJAP-SINGH-3105/Splitwise_MCP",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/Hint-Services-obsidian-github-mcp",
      name: "ai.smithery/Hint-Services-obsidian-github-mcp",
      description:
        "Connect AI assistants to your GitHub-hosted Obsidian vault to seamlessly access, search, and analy…",
      version: "0.4.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@Hint-Services/obsidian-github-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Hint-Services/obsidian-github-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/IlyaGusev-academia_mcp",
      name: "ai.smithery/IlyaGusev-academia_mcp",
      description:
        "Search arXiv and ACL Anthology, retrieve citations and references, and browse web sources to accel…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@IlyaGusev/academia_mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/IlyaGusev/academia_mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/ImRonAI-mcp-server-browserbase",
      name: "ai.smithery/ImRonAI-mcp-server-browserbase",
      description:
        "Automate cloud browsers to navigate websites, interact with elements, and extract structured data.…",
      version: "2.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@ImRonAI/mcp-server-browserbase/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/ImRonAI/mcp-server-browserbase",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/IndianAppGuy-magicslide-mcp",
      name: "ai.smithery/IndianAppGuy-magicslide-mcp",
      description:
        "Generate professional PowerPoint presentations from text, YouTube videos, or structured JSON data.…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@IndianAppGuy/magicslide-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/IndianAppGuy-magicslide-mcp-actual-test",
      name: "ai.smithery/IndianAppGuy-magicslide-mcp-actual-test",
      description:
        "Generate polished PowerPoint presentations from text prompts, YouTube videos, or structured outlin…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@IndianAppGuy/magicslide-mcp-actual-test/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/JMoak-chrono-mcp",
      name: "ai.smithery/JMoak-chrono-mcp",
      description:
        "Convert and compare dates and times across any timezone with flexible, locale-aware formatting. Ad…",
      version: "0.2.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@JMoak/chrono-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/JMoak/chrono-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/JunoJunHyun-festival-finder-mcp",
      name: "ai.smithery/JunoJunHyun-festival-finder-mcp",
      description:
        "Discover festivals worldwide by location, date, and genre. Compare options with key details like d…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@JunoJunHyun/festival-finder-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/JunoJunHyun/Festival-Finder-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/Kim-soung-won-mcp-smithery-exam",
      name: "ai.smithery/Kim-soung-won-mcp-smithery-exam",
      description:
        "Craft quick, personalized greetings by name. Generate ready-to-use greeting prompts for a consiste…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@Kim-soung-won/mcp-smithery-exam/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Kim-soung-won/mcp-smithery-exam",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/Kryptoskatt-mcp-server",
      name: "ai.smithery/Kryptoskatt-mcp-server",
      description:
        "Enable AI assistants to interact seamlessly with the DefiLlama API by translating MCP tool calls i…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@Kryptoskatt/mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/Leghis-smart-thinking",
      name: "ai.smithery/Leghis-smart-thinking",
      description:
        "Find relevant Smart‑Thinking memories fast. Fetch full entries by ID to get complete context. Spee…",
      version: "0.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@Leghis/smart-thinking/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Leghis/Smart-Thinking",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/MetehanGZL-pokemcp",
      name: "ai.smithery/MetehanGZL-pokemcp",
      description:
        "Provide detailed Pokémon data and information through a standardized MCP interface. Enable LLMs an…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@MetehanGZL/pokemcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/MetehanGZL/PokeMCP",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/MisterSandFR-supabase-mcp-selfhosted",
      name: "ai.smithery/MisterSandFR-supabase-mcp-selfhosted",
      description:
        "Manage Supabase projects end to end across database, auth, storage, realtime, and migrations. Moni…",
      version: "1.14.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@MisterSandFR/supabase-mcp-selfhosted/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/MisterSandFR/Supabase-MCP-SelfHosted",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/Nekzus-npm-sentinel-mcp",
      name: "ai.smithery/Nekzus-npm-sentinel-mcp",
      description:
        "Provide AI-powered real-time analysis and intelligence on NPM packages, including security, depend…",
      version: "1.11.8",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@Nekzus/npm-sentinel-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Nekzus/npm-sentinel-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/Open-Scout-mcp",
      name: "ai.smithery/Open-Scout-mcp",
      description:
        "Create and publish one-pagers and boards for your organization. Upload images from the web, update…",
      version: "0.1.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@Open-Scout/mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/PabloLec-keyprobe-mcp",
      name: "ai.smithery/PabloLec-keyprobe-mcp",
      description:
        "Audit certificates and keystores to surface expiry risks, weak algorithms, and misconfigurations.…",
      version: "1.13.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@PabloLec/keyprobe-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/PabloLec/KeyProbe-MCP",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/Parc-Dev-task-breakdown-server",
      name: "ai.smithery/Parc-Dev-task-breakdown-server",
      description:
        "Break down complex problems into clear, actionable steps. Adapt on the fly by iterating, revising,…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@Parc-Dev/task-breakdown-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/Phionx-mcp-hello-server",
      name: "ai.smithery/Phionx-mcp-hello-server",
      description:
        "Send personalized greetings to anyone. Enable Pirate Mode for swashbuckling salutations. Explore t…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@Phionx/mcp-hello-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Phionx/mcp-hello-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/PixdataOrg-coderide",
      name: "ai.smithery/PixdataOrg-coderide",
      description:
        "CodeRide eliminates the context reset cycle once and for all. Through MCP integration, it seamless…",
      version: "0.9.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@PixdataOrg/coderide/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/PixdataOrg/coderide-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/Pratiksha-Kanoja-magicslide-mcp-test",
      name: "ai.smithery/Pratiksha-Kanoja-magicslide-mcp-test",
      description:
        "Create polished slide decks from text or YouTube links in seconds. Fetch video transcripts to tran…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@Pratiksha-Kanoja/magicslide-mcp-test/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Pratiksha-Kanoja/magicslide-mcp-test",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/ProfessionalWiki-mediawiki-mcp-server",
      name: "ai.smithery/ProfessionalWiki-mediawiki-mcp-server",
      description:
        "Enable Large Language Model clients to interact seamlessly with any MediaWiki wiki. Perform action…",
      version: "0.1.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@ProfessionalWiki/mediawiki-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/RectiFlex-centerassist-mcp",
      name: "ai.smithery/RectiFlex-centerassist-mcp",
      description:
        "Streamline field service and construction operations with CenterPoint Connect. Manage companies, o…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@RectiFlex/centerassist-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/RectiFlex-centerassist-mcp-cp",
      name: "ai.smithery/RectiFlex-centerassist-mcp-cp",
      description:
        "Streamline property management, construction, and service workflows with CenterPoint Connect. Sear…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@RectiFlex/centerassist-mcp-cp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/RectiFlex-centerassist-mcp-cp1",
      name: "ai.smithery/RectiFlex-centerassist-mcp-cp1",
      description:
        "Access and manage CenterPoint Connect data for property management, construction, and service oper…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@RectiFlex/centerassist-mcp-cp1/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/RectiFlex-centerassist-mcp1",
      name: "ai.smithery/RectiFlex-centerassist-mcp1",
      description:
        "Manage CenterPoint Connect data across properties, companies, employees, invoices, materials, and…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@RectiFlex/centerassist-mcp1/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/STUzhy-py_execute_mcp",
      name: "ai.smithery/STUzhy-py_execute_mcp",
      description:
        "Run Python code in a secure sandbox without local setup. Declare inline dependencies and execute s…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@STUzhy/py_execute_mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/TakoData-tako-mcp",
      name: "ai.smithery/TakoData-tako-mcp",
      description:
        "Provide real-time data querying and visualization by integrating Tako with your agents. Generate o…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@TakoData/tako-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/TakoData/tako-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/a-ariff-canvas-instant-mcp",
      name: "ai.smithery/a-ariff-canvas-instant-mcp",
      description:
        "Manage your Canvas coursework with quick access to courses, assignments, and grades. Track upcomin…",
      version: "2.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@a-ariff/canvas-instant-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/a-ariff/canvas-instant-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/aamangeldi-dad-jokes-mcp",
      name: "ai.smithery/aamangeldi-dad-jokes-mcp",
      description:
        "Get a random dad joke or search by keyword to fit any moment. Retrieve specific jokes by ID for re…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@aamangeldi/dad-jokes-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/aamangeldi/dad-jokes-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/adamamer20-paper-search-mcp-openai",
      name: "ai.smithery/adamamer20-paper-search-mcp-openai",
      description:
        "Search and download academic papers from arXiv, PubMed, bioRxiv, medRxiv, Google Scholar, Semantic…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@adamamer20/paper-search-mcp-openai/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/adamamer20/paper-search-mcp-openai",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/afgong-sqlite-mcp-server",
      name: "ai.smithery/afgong-sqlite-mcp-server",
      description:
        "Explore your Messages SQLite database to browse tables and inspect schemas with ease. Run flexible…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@afgong/sqlite-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/afgong/sqlite-mcp-server",
        source: "github",
        subfolder: "sqlite-explorer-fastmcp-mcp-server",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/aicastle-school-openai-api-agent-project",
      name: "ai.smithery/aicastle-school-openai-api-agent-project",
      description:
        "Fetch current stock prices and key data for symbols across global markets. Look up companies like…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@aicastle-school/openai-api-agent-project/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/aicastle-school/openai-api-agent-project",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/aicastle-school-openai-api-agent-project11",
      name: "ai.smithery/aicastle-school-openai-api-agent-project11",
      description:
        "Fetch the latest available stock quotes by ticker symbol across international markets. Check price…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@aicastle-school/openai-api-agent-project11/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/aicastle-school/openai-api-agent-project",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/airmang-hwpx-mcp",
      name: "ai.smithery/airmang-hwpx-mcp",
      description:
        "자동화하여 HWPX 문서의 로딩, 탐색, 편집, 검증을 한 번에 처리합니다. 문단·표·주석 추가, 텍스트 일괄 치환, 머리말·꼬리말 설정 등 반복 작업을 신속히 수행합니다. 기…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@airmang/hwpx-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/airmang/hwpx-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/akilat-spec-leave-manager-mcp",
      name: "ai.smithery/akilat-spec-leave-manager-mcp",
      description:
        "Track and manage employee time off with quick balance lookups and streamlined applications. Find t…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@akilat-spec/leave-manager-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/akilat-spec/leave-manager-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/alex-llm-attack-mcp-server",
      name: "ai.smithery/alex-llm-attack-mcp-server",
      description:
        "Query and retrieve information about various adversarial tactics and techniques used in cyber atta…",
      version: "2.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@alex-llm/attack-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/alex-llm/attAck-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/alphago2580-naramarketmcp",
      name: "ai.smithery/alphago2580-naramarketmcp",
      description:
        "Access Korea’s G2B procurement and Nara Market data for bid notices, awards, contracts, statistics…",
      version: "1.14.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@alphago2580/naramarketmcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/alphago2580/naramarketmcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/anirbanbasu-frankfurtermcp",
      name: "ai.smithery/anirbanbasu-frankfurtermcp",
      description:
        "A MCP server for the Frankfurter API for currency exchange rates.",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@anirbanbasu/frankfurtermcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/anirbanbasu/frankfurtermcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/anirbanbasu-pymcp",
      name: "ai.smithery/anirbanbasu-pymcp",
      description:
        "Primarily to be used as a template repository for developing MCP servers with FastMCP in Python, P…",
      version: "0.1.7",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@anirbanbasu/pymcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/anirbanbasu/pymcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-ahoy",
      name: "ai.smithery/arjunkmrm-ahoy",
      description:
        "Send friendly, personalized greetings by name. Switch to a playful pirate voice for themed salutat…",
      version: "1.13.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/ahoy/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/arjunkmrm/ahoy",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-ahoy2",
      name: "ai.smithery/arjunkmrm-ahoy2",
      description:
        "Create friendly greetings by name, with an optional pirate tone. Explore the origin of 'Hello, Wor…",
      version: "1.13.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/ahoy2/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/arjunkmrm/ahoy",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-boba-tea",
      name: "ai.smithery/arjunkmrm-boba-tea",
      description:
        "Send friendly greetings to people by name. Discover the origin story behind 'Hello, World' for qui…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/boba-tea/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-bobo",
      name: "ai.smithery/arjunkmrm-bobo",
      description:
        "Send friendly, personalized greetings on command. Explore the origin of 'Hello, World' for quick c…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/bobo/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-brave-search-mcp-server",
      name: "ai.smithery/arjunkmrm-brave-search-mcp-server",
      description:
        "Search the web, images, videos, news, and local businesses with robust filters, freshness controls…",
      version: "2.0.25",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/brave-search-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/arjunkmrm/brave-search-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-clock",
      name: "ai.smithery/arjunkmrm-clock",
      description:
        "Check the current time instantly and explore world timezones by region. Browse available continent…",
      version: "1.14.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/clock/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/arjunkmrm/clock",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-fetch",
      name: "ai.smithery/arjunkmrm-fetch",
      description:
        "Fetch web pages and extract exactly the content you need. Select elements with CSS and retrieve co…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/fetch/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/arjunkmrm/fetch",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-local-test2",
      name: "ai.smithery/arjunkmrm-local-test2",
      description:
        "Send friendly greetings instantly. Learn the origin of 'Hello, World' to add a fun fact to your me…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/local-test2/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-local001",
      name: "ai.smithery/arjunkmrm-local001",
      description:
        "Get the current time in your preferred timezone or any region you specify. Browse concise informat…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/local001/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/arjunkmrm/time",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-local01",
      name: "ai.smithery/arjunkmrm-local01",
      description:
        "Greet people warmly or roast them with playful banter. Explore the origin of 'Hello, World' for qu…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/local01/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-local02",
      name: "ai.smithery/arjunkmrm-local02",
      description:
        "Get the current time in your chosen timezone and view common timezone information. Simplify schedu…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/local02/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/arjunkmrm/time",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-lta-mcp",
      name: "ai.smithery/arjunkmrm-lta-mcp",
      description:
        "Provide real-time transportation data including bus arrivals, train service alerts, carpark availa…",
      version: "0.1.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/lta-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/arjunkmrm/lta-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-mango-sago",
      name: "ai.smithery/arjunkmrm-mango-sago",
      description:
        "Create cheerful, personalized greetings in seconds. Switch to playful pirate-speak for extra flair…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/mango-sago/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/arjunkmrm/mango-sago",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-perplexity-search",
      name: "ai.smithery/arjunkmrm-perplexity-search",
      description:
        "Enable AI assistants to perform web searches using Perplexity's Sonar Pro.",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/perplexity-search/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/arjunkmrm/perplexity-search",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-py-test-0",
      name: "ai.smithery/arjunkmrm-py-test-0",
      description:
        "Send personalized greetings by name, with an optional pirate tone. Generate greeting prompts and e…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/py-test-0/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-py-test-2",
      name: "ai.smithery/arjunkmrm-py-test-2",
      description:
        "Greet people by name with friendly, customizable messages. Toggle Pirate Mode to speak like a swas…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/py-test-2/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/arjunkmrm/mango-sago",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-scrapermcp_el",
      name: "ai.smithery/arjunkmrm-scrapermcp_el",
      description:
        "Extract and parse web pages into clean HTML, links, or Markdown. Handle dynamic, complex, or block…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/scrapermcp_el/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/arjunkmrm/ScraperMcp_el",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-sg-bus-test",
      name: "ai.smithery/arjunkmrm-sg-bus-test",
      description:
        "Get real-time bus arrival times for any Singapore bus stop by code, with optional service filterin…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/sg-bus-test/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/arjunkmrm/sg-bus-test",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-test0",
      name: "ai.smithery/arjunkmrm-test0",
      description:
        "Get the current time in any timezone and quickly look up common timezone info. Set a default timez…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/test0/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/arjunkmrm/time",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-test01",
      name: "ai.smithery/arjunkmrm-test01",
      description:
        "Get the current time in any timezone. Explore concise timezone info to pick the right region. Simp…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/test01/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/arjunkmrm/time",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-test2",
      name: "ai.smithery/arjunkmrm-test2",
      description:
        "Greet anyone by name with a friendly message. Explore the origin of 'Hello, World' to add context…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/test2/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-time",
      name: "ai.smithery/arjunkmrm-time",
      description:
        "Get the current time anywhere and access concise timezone information. Set your preferred timezone…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/time/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/arjunkmrm/time",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-ts-test-2",
      name: "ai.smithery/arjunkmrm-ts-test-2",
      description:
        "Greet anyone with a friendly, personalized hello. Explore the origin story of 'Hello, World.' Jump…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/ts-test-2/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-tutorials",
      name: "ai.smithery/arjunkmrm-tutorials",
      description:
        "Analyze stocks and SEC filings to surface key insights, from price and volume to insider activity…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/tutorials/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/arjunkmrm/tutorials",
        source: "github",
        subfolder: "smithery-example/financial-server",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/arjunkmrm-watch2",
      name: "ai.smithery/arjunkmrm-watch2",
      description:
        "Get the current time in your chosen timezone. Browse available continents and regions to pick the…",
      version: "1.14.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@arjunkmrm/watch2/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/arjunkmrm/clock",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/aryankeluskar-poke-video-mcp",
      name: "ai.smithery/aryankeluskar-poke-video-mcp",
      description:
        "Search your Flashback video library with natural language to instantly find relevant moments. Get…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@aryankeluskar/poke-video-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/aryankeluskar/poke-video-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/bergeramit-bergeramit-hw3-tech",
      name: "ai.smithery/bergeramit-bergeramit-hw3-tech",
      description:
        "Create friendly greetings and add two numbers instantly. Speed up simple tasks and streamline ligh…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@bergeramit/bergeramit-hw3-tech/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/bergeramit/bergeramit-hw3-tech",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/bergeramit-bergeramit-hw3-tech-1",
      name: "ai.smithery/bergeramit-bergeramit-hw3-tech-1",
      description:
        "Add two numbers instantly and generate friendly greetings on demand. Speed up quick math and perso…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@bergeramit/bergeramit-hw3-tech-1/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/bergeramit/bergeramit-hw3-tech",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/bhushangitfull-file-mcp-smith",
      name: "ai.smithery/bhushangitfull-file-mcp-smith",
      description:
        "Manage files and folders directly from your workspace. Read and write files, list directories, cre…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@bhushangitfull/file-mcp-smith/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/bhushangitfull/file-mcp-smith",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/bielacki-igdb-mcp-server",
      name: "ai.smithery/bielacki-igdb-mcp-server",
      description:
        "Explore and discover video games from the Internet Game Database. Search titles, view detailed inf…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@bielacki/igdb-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/bielacki/igdb-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/blacklotusdev8-test_m",
      name: "ai.smithery/blacklotusdev8-test_m",
      description:
        "Greet anyone by name with a friendly hello. Scrape webpages to extract content for quick reference…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@blacklotusdev8/test_m/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/blacklotusdev8/test_m",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/blbl147-xhs-mcp",
      name: "ai.smithery/blbl147-xhs-mcp",
      description:
        "搜索笔记、浏览首页推荐、查看笔记内容与评论，并发表你的评论。直接在工作流中与小红书内容互动，高效跟进话题。",
      version: "1.6.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@blbl147/xhs-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/blbl147/xhs-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/blockscout-mcp-server",
      name: "ai.smithery/blockscout-mcp-server",
      description:
        "Provide AI agents and automation tools with contextual access to blockchain data including balance…",
      version: "1.13.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@blockscout/mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/blockscout/mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/brandonbosco-sigao-scf-mcp",
      name: "ai.smithery/brandonbosco-sigao-scf-mcp",
      description:
        "Provides access to Civic Plus - See Click Fix, allowing you to interact with your data via an LLM.…",
      version: "1.0.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@brandonbosco/sigao-scf-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/brave",
      name: "ai.smithery/brave",
      description:
        "Visit https://brave.com/search/api/ for a free API key. Search the web, local businesses, images,…",
      version: "2.0.52",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/brave/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/brave/brave-search-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/browserbasehq-mcp-browserbase",
      name: "ai.smithery/browserbasehq-mcp-browserbase",
      description:
        "Provides cloud browser automation capabilities using Stagehand and Browserbase, enabling LLMs to i…",
      version: "2.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@browserbasehq/mcp-browserbase/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/browserbase/mcp-server-browserbase",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/callmybot-cookbook-mcp-server",
      name: "ai.smithery/callmybot-cookbook-mcp-server",
      description:
        "Count occurrences of any character in your text instantly. Specify the character and get precise c…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@callmybot/cookbook-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/callmybot/cookbook-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/callmybot-domoticz",
      name: "ai.smithery/callmybot-domoticz",
      description:
        "Greet anyone by name with a friendly hello. Explore the origin of 'Hello, World' for context in de…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@callmybot/domoticz/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/callmybot/domoticz",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/callmybot-hello-mcp-server",
      name: "ai.smithery/callmybot-hello-mcp-server",
      description:
        "Generate quick, friendly greetings by name. Personalize salutations for any context. Explore the o…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@callmybot/hello-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/callmybot/hello-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/cc25a-openai-api-agent-project123123123",
      name: "ai.smithery/cc25a-openai-api-agent-project123123123",
      description:
        "Look up the latest stock prices by ticker symbol across global markets. Get current price and esse…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@cc25a/openai-api-agent-project123123123/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/cc25a/openai-api-agent-project",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/cindyloo-dropbox-mcp-server",
      name: "ai.smithery/cindyloo-dropbox-mcp-server",
      description:
        "Search, browse, and read your Dropbox files. Find documents by name or content, list folders, and…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@cindyloo/dropbox-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/cindyloo/dropbox-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/clpi-clp-mcp",
      name: "ai.smithery/clpi-clp-mcp",
      description:
        "Manage simple context workflows with quick init and add actions. Access the 'Hello, World' origin…",
      version: "0.0.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@clpi/clp-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/clpi/clp-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/cpretzinger-ai-assistant-simple",
      name: "ai.smithery/cpretzinger-ai-assistant-simple",
      description:
        "UPDATED 9/1/2025! NEW TOOLS! Use the Redis Stream tools with n8n MCP Client Node for use anywhere!…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@cpretzinger/ai-assistant-simple/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/cristianoaredes-mcp-dadosbr",
      name: "ai.smithery/cristianoaredes-mcp-dadosbr",
      description:
        "# MCP DadosBR Servidor MCP focado em dados públicos do Brasil. Oferece duas ferramentas simples e…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@cristianoaredes/mcp-dadosbr/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/cristianoaredes/mcp-dadosbr",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/ctaylor86-mcp-video-download-server",
      name: "ai.smithery/ctaylor86-mcp-video-download-server",
      description:
        "Connect your video workflows to cloud storage. Organize and access video assets across projects wi…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@ctaylor86/mcp-video-download-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/ctaylor86/mcp-video-download-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/cuongpo-coti-mcp",
      name: "ai.smithery/cuongpo-coti-mcp",
      description:
        "Connect to the COTI blockchain to manage accounts, transfer native tokens, and deploy and operate…",
      version: "0.2.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@cuongpo/coti-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/cuongpo/coti-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/cuongpo-coti-mcp-1",
      name: "ai.smithery/cuongpo-coti-mcp-1",
      description:
        "Manage COTI accounts, deploy private ERC20 and ERC721 contracts, and transfer tokens and NFTs with…",
      version: "0.2.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@cuongpo/coti-mcp-1/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/cuongpo/coti-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/data-mindset-sts-google-forms-mcp",
      name: "ai.smithery/data-mindset-sts-google-forms-mcp",
      description:
        "Create and manage Google Forms to run surveys and collect data. Add text and multiple-choice quest…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@data-mindset/sts-google-forms-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/data-mindset/sts-google-forms-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/demomagic-duckchain-mcp",
      name: "ai.smithery/demomagic-duckchain-mcp",
      description:
        "Explore blockchain data across addresses, tokens, blocks, and transactions. Investigate any transa…",
      version: "1.13.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@demomagic/duckchain-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/demomagic/duckchain-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/devbrother2024-typescript-mcp-server-boilerplate",
      name: "ai.smithery/devbrother2024-typescript-mcp-server-boilerplate",
      description:
        "Kickstart development with a customizable TypeScript template featuring sample tools for greeting,…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@devbrother2024/typescript-mcp-server-boilerplate/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/devbrother2024/typescript-mcp-server-boilerplate",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/docfork-mcp",
      name: "ai.smithery/docfork-mcp",
      description:
        "@latest documentation and code examples to 9000+ libraries for LLMs and AI code editors in a singl…",
      version: "0.7.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@docfork/mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/docfork/docfork-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/dsharipova-mcp-hw",
      name: "ai.smithery/dsharipova-mcp-hw",
      description:
        "Create personalized greetings by name in the tone you choose. Get quick suggestions for friendly i…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@dsharipova/mcp-hw/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/dsharipova/mcp-hw",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/duvomike-mcp",
      name: "ai.smithery/duvomike-mcp",
      description:
        "Transform numbers by doubling them and adding 5. Get instant results with a clear breakdown of the…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@duvomike/mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/eliu243-oura-mcp-server",
      name: "ai.smithery/eliu243-oura-mcp-server",
      description:
        "Connect your Oura Ring account and enable access to your wellness data in apps and automations. In…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@eliu243/oura-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/eliu243/oura-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/eliu243-oura-mcp-server-2",
      name: "ai.smithery/eliu243-oura-mcp-server-2",
      description:
        "Connect your Oura Ring account to enable secure, authenticated access in your workflows. Generate…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@eliu243/oura-mcp-server-2/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/eliu243/oura-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/eliu243-oura-mcp-server-eliu",
      name: "ai.smithery/eliu243-oura-mcp-server-eliu",
      description:
        "Connect your Oura Ring account securely in minutes. Enable authorized access to your sleep, activi…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@eliu243/oura-mcp-server-eliu/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/eliu243/oura-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/exa-labs-exa-code-mcp",
      name: "ai.smithery/exa-labs-exa-code-mcp",
      description:
        "Find open-source libraries and fetch contextual code snippets by version to accelerate development…",
      version: "0.0.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@exa-labs/exa-code-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/exa-labs/exa-code-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/faithk7-gmail-mcp",
      name: "ai.smithery/faithk7-gmail-mcp",
      description:
        "Manage Gmail messages, threads, labels, drafts, and settings from your workflows. Send and organiz…",
      version: "1.7.4",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@faithk7/gmail-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/faithk7/gmail-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/feeefapp-mcp",
      name: "ai.smithery/feeefapp-mcp",
      description:
        "Enable AI assistants to interact seamlessly with Feeef e-commerce stores, products, and orders usi…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@feeefapp/mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/fengyinxia-jimeng-mcp",
      name: "ai.smithery/fengyinxia-jimeng-mcp",
      description:
        "Create images and videos from prompts, with options for image mixing, reference images, and start/…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@fengyinxia/jimeng-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/fengyinxia/jimeng-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/fitaf-ai-fitaf-ai-mcp",
      name: "ai.smithery/fitaf-ai-fitaf-ai-mcp",
      description:
        "Manage workouts, nutrition, goals, and progress across the FitAF platform. Connect wearables, sync…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@fitaf-ai/fitaf-ai-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/fitaf-ai-fitaf-mcp",
      name: "ai.smithery/fitaf-ai-fitaf-mcp",
      description:
        "Track workouts, nutrition, body metrics, habits, and SMART goals with insights and trends. Connect…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@fitaf-ai/fitaf-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/flight505-mcp_dincoder",
      name: "ai.smithery/flight505-mcp_dincoder",
      description:
        "Driven Intent Negotiation — Contract-Oriented Deterministic Executable Runtime DinCoder brings the…",
      version: "0.1.15",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@flight505/mcp_dincoder/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/flight505/MCP_DinCoder",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/hithereiamaliff-mcp-datagovmy",
      name: "ai.smithery/hithereiamaliff-mcp-datagovmy",
      description:
        "This MCP server provides seamless access to Malaysia's government open data, including datasets, w…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@hithereiamaliff/mcp-datagovmy/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/hithereiamaliff/mcp-datagovmy",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/hithereiamaliff-mcp-nextcloud",
      name: "ai.smithery/hithereiamaliff-mcp-nextcloud",
      description:
        "A comprehensive Model Context Protocol (MCP) server that enables AI assistants to interact with yo…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@hithereiamaliff/mcp-nextcloud/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/hithereiamaliff/mcp-nextcloud",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/hjsh200219-pharminfo-mcp",
      name: "ai.smithery/hjsh200219-pharminfo-mcp",
      description:
        "Look up Korean drug ingredient and product data by HIRA component and product codes via Pilldoc. V…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@hjsh200219/pharminfo-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/hjsh200219/pharminfo-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/hollaugo-financial-research-mcp-server",
      name: "ai.smithery/hollaugo-financial-research-mcp-server",
      description:
        "Analyze stocks with summaries, price targets, and analyst recommendations. Track SEC filings, divi…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@hollaugo/financial-research-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/hollaugo/tutorials",
        source: "github",
        subfolder: "smithery-example/financial-server",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/hustcc-mcp-mermaid",
      name: "ai.smithery/hustcc-mcp-mermaid",
      description:
        "Generate dynamic Mermaid diagrams and charts with AI assistance. Customize styles and export diagr…",
      version: "0.1.3",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@hustcc/mcp-mermaid/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/hustcc/mcp-mermaid",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/huuthangntk-claude-vision-mcp-server",
      name: "ai.smithery/huuthangntk-claude-vision-mcp-server",
      description:
        "Analyze images from multiple angles to extract detailed insights or quick summaries. Describe visu…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@huuthangntk/claude-vision-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/huuthangntk/claude-vision-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/infranodus-mcp-server-infranodus",
      name: "ai.smithery/infranodus-mcp-server-infranodus",
      description:
        "Map text into knowledge graphs to create a structured representation of conceptual relations and t…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@infranodus/mcp-server-infranodus/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/infranodus/mcp-server-infranodus",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/isnow890-data4library-mcp",
      name: "ai.smithery/isnow890-data4library-mcp",
      description:
        "책 싫어하는 제가 책에 대해 아는척하고 싶어서 만들었습니다.. 내 주변 도서관 실시간 대출 확인 읽고 싶은 책을 검색하면 주변 도서관 대출 가능 여부를 즉시 확인 굳이 도서관…",
      version: "1.0.5",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@isnow890/data4library-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/isnow890/data4library-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/jekakos-mcp-user-data-enrichment",
      name: "ai.smithery/jekakos-mcp-user-data-enrichment",
      description:
        "Enrich user data by adding social network links based on provided personal information. Integrate…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@jekakos/mcp-user-data-enrichment/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/jekakos/mcp-user-data-enrichment",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/jenniferjiang0511-mit-ai-studio-hw3",
      name: "ai.smithery/jenniferjiang0511-mit-ai-studio-hw3",
      description:
        "Greet people by name and check local forecasts and weather alerts across the U.S. Switch to a play…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@jenniferjiang0511/mit-ai-studio-hw3/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/jenniferjiang0511/MIT-AI-studio-HW3",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/jessicayanwang-test",
      name: "ai.smithery/jessicayanwang-test",
      description:
        "Fetch latest and historical currency exchange rates from Frankfurter. Convert amounts between curr…",
      version: "1.13.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@jessicayanwang/test/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/jessicayanwang/frankfurtermcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/jirispilka-actors-mcp-server",
      name: "ai.smithery/jirispilka-actors-mcp-server",
      description:
        "Greet anyone by name with friendly, personalized messages. Explore the origin of Hello, World thro…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@jirispilka/actors-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/jirispilka/actors-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/jjlabsio-korea-stock-mcp",
      name: "ai.smithery/jjlabsio-korea-stock-mcp",
      description:
        "Search company disclosures and financial statements from the Korean market. Retrieve stock profile…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@jjlabsio/korea-stock-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/jjlabsio/korea-stock-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/jweingardt12-mlb_mcp",
      name: "ai.smithery/jweingardt12-mlb_mcp",
      description:
        "Provides easy access to MLB, Baseball Savant, Statcast, and Fangraphs baseball data. Query detaile…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@jweingardt12/mlb_mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/kaszek-kaszek-attio-mcp",
      name: "ai.smithery/kaszek-kaszek-attio-mcp",
      description:
        "Automate Attio CRM workflows with fast search and bulk operations across companies, people, deals,…",
      version: "0.2.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@kaszek/kaszek-attio-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/keithah-hostex-mcp",
      name: "ai.smithery/keithah-hostex-mcp",
      description:
        "Manage your Hostex vacation rentals—properties, reservations, availability, listings, and guest me…",
      version: "0.2.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@keithah/hostex-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/keithah/hostex-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/keithah-tessie-mcp",
      name: "ai.smithery/keithah-tessie-mcp",
      description:
        "Unofficial integration! ## ✨ Key Features ### 💰 Financial Intelligence - **Smart Charging Cost An…",
      version: "1.1.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@keithah/tessie-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/keithah/tessie-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/keremurat-json",
      name: "ai.smithery/keremurat-json",
      description:
        "Compare two JSON files deeply without worrying about key or array order. Detect missing, extra, an…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@keremurat/json/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/keremurat/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/keremurat-jsonmcp",
      name: "ai.smithery/keremurat-jsonmcp",
      description:
        "Compare two JSON files deeply, ignoring order, to surface every difference. Get a clear, structure…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@keremurat/jsonmcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/keremurat/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/keremurat-mcp",
      name: "ai.smithery/keremurat-mcp",
      description:
        "Compare two JSON files deeply, regardless of order. Get a detailed difference report highlighting…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@keremurat/mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/keremurat/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/kesslerio-attio-mcp-server",
      name: "ai.smithery/kesslerio-attio-mcp-server",
      description:
        "Connect AI to your Attio CRM. Manage contacts, companies, deals, and sales pipelines. Create tasks…",
      version: "1.1.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@kesslerio/attio-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/kesslerio/attio-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/kesslerio-attio-mcp-server-beta",
      name: "ai.smithery/kesslerio-attio-mcp-server-beta",
      description:
        "Streamline your Attio workflows using natural language to search, create, update, and organize com…",
      version: "1.1.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@kesslerio/attio-mcp-server-beta/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/kesslerio/attio-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/kirbah-mcp-youtube",
      name: "ai.smithery/kirbah-mcp-youtube",
      description:
        "Provide token-optimized, structured YouTube data to enhance your LLM applications. Access efficien…",
      version: "0.2.6",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@kirbah/mcp-youtube/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/kirbah/mcp-youtube",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/kkjdaniel-bgg-mcp",
      name: "ai.smithery/kkjdaniel-bgg-mcp",
      description:
        "BGG MCP provides access to the BoardGameGeek API through the Model Context Protocol, enabling retr…",
      version: "1.3.2",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@kkjdaniel/bgg-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/kkjdaniel/bgg-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/kodey-ai-mapwise-mcp",
      name: "ai.smithery/kodey-ai-mapwise-mcp",
      description:
        "Send friendly, personalized greetings on demand. Generate quick salutations with a simple prompt.…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@kodey-ai/mapwise-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/kodey-ai-salesforce-mcp",
      name: "ai.smithery/kodey-ai-salesforce-mcp",
      description:
        "Run SOQL queries to explore and retrieve Salesforce data. Inspect records, fields, and relationshi…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@kodey-ai/salesforce-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/kodey-ai/salesforce-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/kodey-ai-salesforce-mcp-kodey",
      name: "ai.smithery/kodey-ai-salesforce-mcp-kodey",
      description:
        "Run SOQL queries against your Salesforce org to explore and retrieve data. Quickly iterate on filt…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@kodey-ai/salesforce-mcp-kodey/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/kodey-ai/salesforce-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/kodey-ai-salesforce-mcp-minimal",
      name: "ai.smithery/kodey-ai-salesforce-mcp-minimal",
      description:
        "Run SOQL queries to explore and retrieve Salesforce data. Access accounts, contacts, opportunities…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@kodey-ai/salesforce-mcp-minimal/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/kodey-ai/salesforce-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/kodey-ai-salesforce-mcp-server",
      name: "ai.smithery/kodey-ai-salesforce-mcp-server",
      description:
        "Run SOQL queries against your Salesforce org to retrieve records and insights. Explore objects, fi…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@kodey-ai/salesforce-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/kodey-ai/salesforce-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/kwp-lab-rss-reader-mcp",
      name: "ai.smithery/kwp-lab-rss-reader-mcp",
      description:
        "Track and browse RSS feeds with ease. Fetch the latest entries from any feed URL and extract full…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@kwp-lab/rss-reader-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/kwp-lab/rss-reader-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/leandrogavidia-vechain-mcp-server",
      name: "ai.smithery/leandrogavidia-vechain-mcp-server",
      description:
        "Search VeChain documentation, query on-chain data, and fetch fee suggestions with direct links to…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@leandrogavidia/vechain-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/leandrogavidia/vechain-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/lineex-pubmed-mcp-smithery",
      name: "ai.smithery/lineex-pubmed-mcp-smithery",
      description:
        "Search PubMed with precision using keyword and journal filters and smart sorting. Uncover MeSH ter…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@lineex/pubmed-mcp-smithery/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/lineex/pubmed-mcp-smithery",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/lukaskostka99-marketing-miner-mcp",
      name: "ai.smithery/lukaskostka99-marketing-miner-mcp",
      description:
        "Discover high-impact keyword ideas across Central and Eastern European and English markets. Analyz…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@lukaskostka99/marketing-miner-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/lukaskostka99/marketing-miner-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/luminati-io-brightdata-mcp",
      name: "ai.smithery/luminati-io-brightdata-mcp",
      description:
        "One MCP for the Web. Easily search, crawl, navigate, and extract websites without getting blocked.…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@luminati-io/brightdata-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/brightdata/brightdata-mcp-sse",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/magenie33-quality-dimension-generator",
      name: "ai.smithery/magenie33-quality-dimension-generator",
      description:
        "Generate tailored quality criteria and scoring guides from your task descriptions. Refine objectiv…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@magenie33/quality-dimension-generator/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/magenie33/quality-dimension-generator",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/mayla-debug-mcp-google-calendar2",
      name: "ai.smithery/mayla-debug-mcp-google-calendar2",
      description:
        "Schedule and manage Google Calendar events directly from your workspace. Check availability, view…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@mayla-debug/mcp-google-calendar2/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/mayla-debug/mcp-google-calendar2",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/mfukushim-map-traveler-mcp",
      name: "ai.smithery/mfukushim-map-traveler-mcp",
      description:
        "Create immersive travel experiences by instructing an avatar to navigate Google Maps. Report on th…",
      version: "0.2.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@mfukushim/map-traveler-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/mfukushim/map-traveler-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/miguelgarzons-mcp-cun",
      name: "ai.smithery/miguelgarzons-mcp-cun",
      description:
        "Greet people by name with friendly, personalized messages. Add a warm touch to onboarding, demos,…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@miguelgarzons/mcp-cun/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/miguelgarzons/mcp-cun",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/minionszyw-bazi",
      name: "ai.smithery/minionszyw-bazi",
      description:
        "Generate BaZi charts from birth details. Explore Four Pillars, solar terms, and Luck Pillars for d…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@minionszyw/bazi/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/minionszyw/bazi",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/mjucius-cozi_mcp",
      name: "ai.smithery/mjucius-cozi_mcp",
      description:
        "Manage your family's calendars and lists in Cozi. View, create, and update appointments; organize…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@mjucius/cozi_mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/mjucius/cozi_mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/morosss-sdfsdf",
      name: "ai.smithery/morosss-sdfsdf",
      description:
        "Find academic papers across major sources like arXiv, PubMed, bioRxiv, and more. Download PDFs whe…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@morosss/sdfsdf/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/morosss/sdfsdf",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/motorboy1-my-mcp-server",
      name: "ai.smithery/motorboy1-my-mcp-server",
      description:
        "Send friendly greetings by name. Discover the origin story of 'Hello, World' for quick context.",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@motorboy1/my-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/motorboy1/my-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/mrugankpednekar-bill_splitter_mcp",
      name: "ai.smithery/mrugankpednekar-bill_splitter_mcp",
      description:
        "Track and split shared expenses across trips, events, and groups. Create groups, add expenses, and…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@mrugankpednekar/bill_splitter_mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/mrugankpednekar/bill_splitter_mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/mrugankpednekar-mcp-optimizer",
      name: "ai.smithery/mrugankpednekar-mcp-optimizer",
      description:
        "Optimize crew and workforce schedules, resource allocation, and routing with linear and mixed-inte…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@mrugankpednekar/mcp-optimizer/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/mrugankpednekar/mcp-optimizer",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/neverinfamous-memory-journal-mcp",
      name: "ai.smithery/neverinfamous-memory-journal-mcp",
      description:
        "A MCP server built for developers enabling Git based project management with project and personal…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@neverinfamous/memory-journal-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/neverinfamous/memory-journal-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/nickthelegend-test-mcp",
      name: "ai.smithery/nickthelegend-test-mcp",
      description:
        "Create friendly, personalized greetings in seconds. Toggle Pirate Mode to speak like a pirate for…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@nickthelegend/test-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/oxylabs-oxylabs-mcp",
      name: "ai.smithery/oxylabs-oxylabs-mcp",
      description:
        "Fetch and process content from specified URLs using the Oxylabs Web Scraper API.",
      version: "1.13.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@oxylabs/oxylabs-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/oxylabs/oxylabs-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/pinion05-supabase-mcp-lite",
      name: "ai.smithery/pinion05-supabase-mcp-lite",
      description:
        "Same functionality, consuming only 1/20 of the context window tokens.",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@pinion05/supabase-mcp-lite/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/pinion05/supabase-mcp-lite",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/pinkpixel-dev-web-scout-mcp",
      name: "ai.smithery/pinkpixel-dev-web-scout-mcp",
      description:
        "Search the web and extract clean, readable text from webpages. Process multiple URLs at once to sp…",
      version: "1.5.5",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@pinkpixel-dev/web-scout-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/pinkpixel-dev/web-scout-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/plainyogurt21-clintrials-mcp",
      name: "ai.smithery/plainyogurt21-clintrials-mcp",
      description:
        "Provide structured access to ClinicalTrials.gov data for searching, retrieving, and analyzing clin…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@plainyogurt21/clintrials-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/plainyogurt21-sec-edgar-mcp",
      name: "ai.smithery/plainyogurt21-sec-edgar-mcp",
      description:
        "Provide AI assistants with real-time access to official SEC EDGAR filings and financial data. Enab…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@plainyogurt21/sec-edgar-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/plainyogurt21/sec-edgar-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/proflulab-documentassistant",
      name: "ai.smithery/proflulab-documentassistant",
      description:
        "Convert files between formats without quality loss. Speed up your workflow with fast, reliable con…",
      version: "1.14.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@proflulab/documentassistant/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/pythondev-pro-egw_writings_mcp_server",
      name: "ai.smithery/pythondev-pro-egw_writings_mcp_server",
      description:
        "Search Ellen G. White’s writings by keyword to surface relevant quotations. Retrieve exact passage…",
      version: "1.12.4",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@pythondev-pro/egw_writings_mcp_server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/pythondev-pro/egw_writings_mcp_server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/rainbowgore-stealthee-mcp-tools",
      name: "ai.smithery/rainbowgore-stealthee-mcp-tools",
      description:
        "Spot pre-launch products before they trend. Search the web and tech sites, extract and parse pages…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@rainbowgore/stealthee-mcp-tools/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/rainbowgore/stealthee-MCP-tools",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/ramadasmr-networkcalc-mcp",
      name: "ai.smithery/ramadasmr-networkcalc-mcp",
      description:
        "Look up DNS information for any domain to troubleshoot issues and gather insights. Get fast, relia…",
      version: "1.13.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@ramadasmr/networkcalc-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/ramadasmr/networkcalc-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/renCosta2025-context7fork",
      name: "ai.smithery/renCosta2025-context7fork",
      description:
        "Get up-to-date, version-specific documentation and code examples from official sources directly in…",
      version: "1.0.13",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@renCosta2025/context7fork/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/renCosta2025/context7fork",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/rfdez-pvpc-mcp-server",
      name: "ai.smithery/rfdez-pvpc-mcp-server",
      description:
        "Retrieve daily PVPC electricity tariffs for 2.0 TD consumers, published by Red Eléctrica.",
      version: "3.2.3",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@rfdez/pvpc-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/rfdez/pvpc-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/sachicali-discordmcp-suite",
      name: "ai.smithery/sachicali-discordmcp-suite",
      description:
        "Control your Discord community: send/read messages, manage channels and forums, and handle webhook…",
      version: "1.2.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@sachicali/discordmcp-suite/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/saidsef-mcp-github-pr-issue-analyser",
      name: "ai.smithery/saidsef-mcp-github-pr-issue-analyser",
      description:
        "A Model Context Protocol (MCP) application for automated GitHub PR analysis and issue management.…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@saidsef/mcp-github-pr-issue-analyser/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/saidsef/mcp-github-pr-issue-analyser",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/samihalawa-whatsapp-go-mcp",
      name: "ai.smithery/samihalawa-whatsapp-go-mcp",
      description:
        "Scan QR codes and go! No more troublesome autos or APIs! Send text messages, images, links, locati…",
      version: "v7.5.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@samihalawa/whatsapp-go-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/samihalawa/whatsapp-go-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/sasabasara-where_is_my_bus_mcp",
      name: "ai.smithery/sasabasara-where_is_my_bus_mcp",
      description:
        "Get real-time NYC bus arrivals, live vehicle locations, and service alerts. Plan trips between any…",
      version: "2.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@sasabasara/where_is_my_bus_mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/sebastianall1977-gmail-mcp",
      name: "ai.smithery/sebastianall1977-gmail-mcp",
      description:
        "Manage Gmail end-to-end: search, read, send, draft, label, and organize threads. Automate workflow…",
      version: "1.7.4",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@sebastianall1977/gmail-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/sebastianall1977/gmail-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/serkan-ozal-driflyte-mcp-server",
      name: "ai.smithery/serkan-ozal-driflyte-mcp-server",
      description:
        "Discover available topics and explore up-to-date, topic-tagged web content. Search to surface the…",
      version: "0.1.15",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@serkan-ozal/driflyte-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/serkan-ozal/driflyte-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/shoumikdc-arxiv-mcp",
      name: "ai.smithery/shoumikdc-arxiv-mcp",
      description:
        "Discover the latest arXiv papers by category and keyword. Control how many results you get to spee…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@shoumikdc/arxiv-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/shoumikdc/arXiv-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/skr-cloudify-clickup-mcp-server-new",
      name: "ai.smithery/skr-cloudify-clickup-mcp-server-new",
      description:
        "Manage your ClickUp workspace by creating, updating, and organizing tasks, lists, folders, and tag…",
      version: "0.8.5",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@skr-cloudify/clickup-mcp-server-new/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/skr-cloudify/clickup-mcp-server-new",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/slhad-aha-mcp",
      name: "ai.smithery/slhad-aha-mcp",
      description:
        "A TypeScript MCP server for Home Assistant, enabling programmatic management of entities, automati…",
      version: "0.1.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@slhad/aha-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/slhad/aha-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/smithery-ai-cookbook-python-quickstart",
      name: "ai.smithery/smithery-ai-cookbook-python-quickstart",
      description: "A simple MCP server built with FastMCP and python",
      version: "1.13.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@smithery-ai/cookbook-python-quickstart/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/smithery-ai/smithery-cookbook",
        source: "github",
        subfolder: "servers/python/quickstart",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/smithery-ai-cookbook-ts-smithery-cli",
      name: "ai.smithery/smithery-ai-cookbook-ts-smithery-cli",
      description:
        "A simple Typescript MCP server built using the official MCP Typescript SDK and smithery/cli. This…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@smithery-ai/cookbook-ts-smithery-cli/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/smithery-ai/smithery-cookbook",
        source: "github",
        subfolder:
          "servers/typescript/migrate_stdio_to_http/server_with_smithery_cli",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/smithery-ai-github",
      name: "ai.smithery/smithery-ai-github",
      description:
        "Access the GitHub API, enabling file operations, repository management, search functionality, and…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@smithery-ai/github/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/smithery-ai/mcp-servers",
        source: "github",
        subfolder: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/smithery-ai-national-weather-service",
      name: "ai.smithery/smithery-ai-national-weather-service",
      description:
        "Provide real-time and forecast weather information for locations in the United States using natura…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@smithery-ai/national-weather-service/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/smithery-ai/mcp-servers",
        source: "github",
        subfolder: "weather",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/smithery-ai-slack",
      name: "ai.smithery/smithery-ai-slack",
      description:
        "Enable interaction with Slack workspaces. Supports subscribing to Slack events through Resources.",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@smithery-ai/slack/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/smithery-ai/mcp-servers",
        source: "github",
        subfolder: "slack",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/smithery-notion",
      name: "ai.smithery/smithery-notion",
      description:
        "A Notion workspace is a collaborative environment where teams can organize work, manage projects,…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@smithery/notion/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/smithery-ai/mcp-servers",
        source: "github",
        subfolder: "notion",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/smithery-toolbox",
      name: "ai.smithery/smithery-toolbox",
      description:
        "Toolbox dynamically routes to all MCPs in the Smithery registry based on your agent's need. When a…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@smithery/toolbox/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/sunub-obsidian-mcp-server",
      name: "ai.smithery/sunub-obsidian-mcp-server",
      description:
        "Search your Obsidian vault to quickly find notes by title or keyword, summarize related content, a…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@sunub/obsidian-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/sunub/obsidian-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/szge-lolwiki-mcp",
      name: "ai.smithery/szge-lolwiki-mcp",
      description:
        "Generate friendly greetings for any audience. Toggle Pirate Mode for a playful, swashbuckling styl…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@szge/lolwiki-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/szge/lolwiki-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/truss44-mcp-crypto-price",
      name: "ai.smithery/truss44-mcp-crypto-price",
      description:
        "Provide real-time cryptocurrency price data and market analysis.",
      version: "2.1.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@truss44/mcp-crypto-price/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/truss44/mcp-crypto-price",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/turnono-datacommons-mcp-server",
      name: "ai.smithery/turnono-datacommons-mcp-server",
      description:
        "Discover statistical indicators and topics in Data Commons. Retrieve observations for specific var…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@turnono/datacommons-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/turnono/datacommons-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/wgong-sqlite-mcp-server",
      name: "ai.smithery/wgong-sqlite-mcp-server",
      description:
        "Explore, query, and inspect SQLite databases with ease. List tables, preview results, and view det…",
      version: "1.16.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@wgong/sqlite-mcp-server/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/wgong/sqlite-mcp-server",
        source: "github",
        subfolder: "sqlite-explorer-fastmcp-mcp-server",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/xinkuang-china-stock-mcp",
      name: "ai.smithery/xinkuang-china-stock-mcp",
      description:
        "Access real-time and historical market data for China A-shares and Hong Kong stocks, along with ne…",
      version: "1.15.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@xinkuang/china-stock-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/xinkuang/china-stock-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/yuhuison-mediawiki-mcp-server-auth",
      name: "ai.smithery/yuhuison-mediawiki-mcp-server-auth",
      description:
        "Connect to your MediaWiki using simple credentials and manage content without OAuth. Search, read,…",
      version: "1.0.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@yuhuison/mediawiki-mcp-server-auth/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/yuna0x0-anilist-mcp",
      name: "ai.smithery/yuna0x0-anilist-mcp",
      description:
        "Access and interact with anime and manga data seamlessly. Retrieve detailed information about your…",
      version: "1.3.7",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@yuna0x0/anilist-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/yuna0x0/anilist-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/yuna0x0-hackmd-mcp",
      name: "ai.smithery/yuna0x0-hackmd-mcp",
      description:
        "Interact with your HackMD notes and teams seamlessly. Manage your notes, view reading history, and…",
      version: "1.5.3",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@yuna0x0/hackmd-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/yuna0x0/hackmd-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/zeta-chain-cli",
      name: "ai.smithery/zeta-chain-cli",
      description:
        "Create friendly, customizable greetings for any name or audience. Break the ice in demos, onboardi…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@zeta-chain/cli/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/zeta-chain/cli",
        source: "github",
        subfolder: "src/mcp",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/zhaoganghao-hellomcp",
      name: "ai.smithery/zhaoganghao-hellomcp",
      description:
        "Greet people by name with friendly, concise messages. Explore the origin of 'Hello, World' for fun…",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@zhaoganghao/hellomcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              value: "Bearer {smithery_api_key}",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/zhaoganghao/hellomcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.smithery/zwldarren-akshare-one-mcp",
      name: "ai.smithery/zwldarren-akshare-one-mcp",
      description:
        "Provide access to Chinese stock market data including historical prices, real-time data, news, and…",
      version: "1.14.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://server.smithery.ai/@zwldarren/akshare-one-mcp/mcp",
          headers: [
            {
              description: "Bearer token for Smithery authentication",
              isRequired: true,
              value: "Bearer {smithery_api_key}",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/zwldarren/akshare-one-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.tickettailor/mcp",
      name: "ai.tickettailor/mcp",
      description:
        "Provides event organisers with tools to interact with a Ticket Tailor box office account.",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.tickettailor.ai/mcp",
        },
        {
          type: "sse",
          url: "https://mcp.tickettailor.ai/sse",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.toolprint/hypertool-mcp",
      name: "ai.toolprint/hypertool-mcp",
      description:
        "Dynamically expose tools from proxied servers based on an Agent Persona",
      version: "0.0.42",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@toolprint/hypertool-mcp",
          version: "0.0.42",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/toolprint/hypertool-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "ai.waystation/airtable",
      name: "ai.waystation/airtable",
      description:
        "Access and manage your Airtable bases, tables, and records seamlessly",
      version: "0.3.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://waystation.ai/airtable/mcp",
        },
        {
          type: "sse",
          url: "https://waystation.ai/airtable/mcp/sse",
        },
      ],
      repository: {
        url: "https://github.com/waystation-ai/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.waystation/gmail",
      name: "ai.waystation/gmail",
      description:
        "Read emails, send messages, and manage labels in your Gmail account.",
      version: "0.3.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://waystation.ai/gmail/mcp",
        },
        {
          type: "sse",
          url: "https://waystation.ai/gmail/mcp/sse",
        },
      ],
      repository: {
        url: "https://github.com/waystation-ai/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.waystation/jira",
      name: "ai.waystation/jira",
      description:
        "Track issues, manage projects, and streamline workflows in Jira.",
      version: "0.3.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://waystation.ai/jira/mcp",
        },
        {
          type: "sse",
          url: "https://waystation.ai/jira/mcp/sse",
        },
      ],
      repository: {
        url: "https://github.com/waystation-ai/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.waystation/mcp",
      name: "ai.waystation/mcp",
      description:
        "Ultimate toolbox to connect your LLM to popular productivity tools such as Monday, AirTable, Slack",
      version: "0.3.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://waystation.ai/mcp",
        },
        {
          type: "sse",
          url: "https://waystation.ai/mcp/sse",
        },
      ],
      repository: {
        url: "https://github.com/waystation-ai/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.waystation/miro",
      name: "ai.waystation/miro",
      description:
        "Collaborate on visual boards with your team using Miro integration.",
      version: "0.3.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://waystation.ai/miro/mcp",
        },
        {
          type: "sse",
          url: "https://waystation.ai/miro/mcp/sse",
        },
      ],
      repository: {
        url: "https://github.com/waystation-ai/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.waystation/monday",
      name: "ai.waystation/monday",
      description:
        "Access and manage your Monday.com boards, items, and updates seamlessly",
      version: "0.3.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://waystation.ai/monday/mcp",
        },
        {
          type: "sse",
          url: "https://waystation.ai/monday/mcp/sse",
        },
      ],
      repository: {
        url: "https://github.com/waystation-ai/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.waystation/office",
      name: "ai.waystation/office",
      description:
        "Create, edit, and collaborate on Office documents and spreadsheets.",
      version: "0.3.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://waystation.ai/office/mcp",
        },
        {
          type: "sse",
          url: "https://waystation.ai/office/mcp/sse",
        },
      ],
      repository: {
        url: "https://github.com/waystation-ai/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.waystation/postgres",
      name: "ai.waystation/postgres",
      description:
        "Connect to your PostgreSQL database to query data and schemas.",
      version: "0.3.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://waystation.ai/postgres/mcp",
        },
        {
          type: "sse",
          url: "https://waystation.ai/postgres/mcp/sse",
        },
      ],
      repository: {
        url: "https://github.com/waystation-ai/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.waystation/slack",
      name: "ai.waystation/slack",
      description:
        "Send messages, access channels, and manage files in your Slack workspace.",
      version: "0.3.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://waystation.ai/slack/mcp",
        },
        {
          type: "sse",
          url: "https://waystation.ai/slack/mcp/sse",
        },
      ],
      repository: {
        url: "https://github.com/waystation-ai/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.waystation/supabase",
      name: "ai.waystation/supabase",
      description:
        "Connect to your Supabase database to query data and schemas.",
      version: "0.3.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://waystation.ai/supabase/mcp",
        },
        {
          type: "sse",
          url: "https://waystation.ai/supabase/mcp/sse",
        },
      ],
      repository: {
        url: "https://github.com/waystation-ai/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.waystation/teams",
      name: "ai.waystation/teams",
      description: "Collaborate, chat, and manage meetings in Microsoft Teams.",
      version: "0.3.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://waystation.ai/teams/mcp",
        },
        {
          type: "sse",
          url: "https://waystation.ai/teams/mcp/sse",
        },
      ],
      repository: {
        url: "https://github.com/waystation-ai/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.waystation/wrike",
      name: "ai.waystation/wrike",
      description:
        "Manage projects, tasks, and workflows with Wrike project management.",
      version: "0.3.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://waystation.ai/wrike/mcp",
        },
        {
          type: "sse",
          url: "https://waystation.ai/wrike/mcp/sse",
        },
      ],
      repository: {
        url: "https://github.com/waystation-ai/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "ai.wild-card/deepcontext",
      name: "ai.wild-card/deepcontext",
      description: "Advanced codebase indexing and semantic search MCP server",
      version: "0.1.15",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@wildcard-ai/deepcontext",
          version: "0.1.15",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Jina AI API key for embeddings generation",
              format: "string",
              isSecret: true,
              name: "JINA_API_KEY",
            },
            {
              description: "Turbopuffer API key for vector storage",
              format: "string",
              isSecret: true,
              name: "TURBOPUFFER_API_KEY",
            },
            {
              description: "Wildcard API key for authentication",
              format: "string",
              isSecret: true,
              name: "WILDCARD_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Wildcard-Official/deepcontext",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "ai.zine/mcp",
      name: "ai.zine/mcp",
      description:
        "Your memory, everywhere AI goes. Build knowledge once, access it via MCP anywhere.",
      version: "1.0.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://www.zine.ai/mcp",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "app.getdialer/dialer",
      name: "app.getdialer/dialer",
      description:
        "An MCP server that provides lets you make outbound phone calls using your own phone number",
      version: "1.0.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://getdialer.app/mcp",
        },
        {
          type: "sse",
          url: "https://getdialer.app/sse",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "app.linear/linear",
      name: "app.linear/linear",
      description:
        "MCP server for Linear project management and issue tracking",
      version: "1.0.0",
      remotes: [
        {
          type: "sse",
          url: "https://mcp.linear.app/sse",
        },
        {
          type: "streamable-http",
          url: "https://mcp.linear.app/mcp",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "app.thoughtspot/mcp-server",
      name: "app.thoughtspot/mcp-server",
      description:
        "MCP Server for ThoughtSpot - provides OAuth authentication and tools for querying data",
      version: "1.0.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://agent.thoughtspot.app/mcp",
        },
        {
          type: "sse",
          url: "https://agent.thoughtspot.app/sse",
        },
        {
          type: "streamable-http",
          url: "https://agent.thoughtspot.app/bearer/mcp",
          headers: [
            {
              description:
                "Bearer token for authentication, have the ts-host as 'token@ts-host' or as a separate 'x-ts-host' header",
              isRequired: true,
              isSecret: true,
              name: "Authorization",
            },
            {
              description:
                "ThoughtSpot instance URL, if not provided in the authorization header",
              name: "X-TS-Host",
            },
          ],
        },
        {
          type: "sse",
          url: "https://agent.thoughtspot.app/bearer/sse",
          headers: [
            {
              description:
                "Bearer token for authentication, have the ts-host as 'token@ts-host' or as a separate 'x-ts-host' header",
              isRequired: true,
              isSecret: true,
              name: "Authorization",
            },
            {
              description:
                "ThoughtSpot instance URL, if not provided in the authorization header",
              name: "X-TS-Host",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/thoughtspot/mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "app.zenable/zenable",
      name: "app.zenable/zenable",
      description:
        "Zenable cleans up sloppy AI code and prevents vulnerabilities with deterministic guardrails",
      version: "2.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.zenable.app/",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "ch.martinelli/jooq-mcp",
      name: "ch.martinelli/jooq-mcp",
      description:
        "An MCP server that provides access to the jOOQ documentation",
      version: "1.0.0",
      remotes: [
        {
          type: "sse",
          url: "https://jooq-mcp.martinelli.ch/sse",
        },
      ],
      repository: {
        url: "https://github.com/martinellich/jooq-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "ci.git/mymlh-mcp-server",
      name: "ci.git/mymlh-mcp-server",
      description: "OAuth-enabled MyMLH MCP server for accessing MyMLH data.",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mymlh-mcp.git.ci/mcp",
        },
        {
          type: "sse",
          url: "https://mymlh-mcp.git.ci/sse",
        },
      ],
      repository: {
        url: "https://github.com/wei/mymlh-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "co.axiom/mcp",
      name: "co.axiom/mcp",
      description:
        "List datasets, schemas, run APL queries, and use prompts for exploration, anomalies, and monitoring.",
      version: "1.0.0",
      remotes: [
        {
          type: "sse",
          url: "https://mcp.axiom.co/sse",
        },
        {
          type: "streamable-http",
          url: "https://mcp.axiom.co/mcp",
        },
      ],
      repository: {
        url: "https://github.com/axiomhq/mcp",
        source: "github",
        subfolder: "apps/mcp",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "co.contraption/mcp",
      name: "co.contraption/mcp",
      description:
        "An MCP server that provides [describe what your server does]",
      version: "1.0.0",
      remotes: [
        {
          type: "sse",
          url: "https://mcp.contraption.co/",
        },
      ],
      repository: {
        url: "https://github.com/contraptionco/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "co.pipeboard/meta-ads-mcp",
      name: "co.pipeboard/meta-ads-mcp",
      description:
        "Facebook / Meta Ads automation with AI: analyze performance, test creatives, optimize spend.",
      version: "1.0.13",
      packages: [
        {
          registryType: "pypi",
          identifier: "meta-ads-mcp",
          version: "1.0.13",
          transport: {
            type: "stdio",
          },
        },
      ],
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.pipeboard.co/meta-ads-mcp",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.1stdibs/1stDibs",
      name: "com.1stdibs/1stDibs",
      description:
        "MCP server for browsing and searching items on 1stDibs marketplace.",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://www.1stdibs.com/soa/mcp/",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.agilitycms/mcp-server",
      name: "com.agilitycms/mcp-server",
      description:
        "An MCP server that provides access to Agility CMS.  See https://mcp.agilitycms.com for more details.",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.agilitycms.com/api/mcp",
        },
      ],
      repository: {
        url: "https://github.com/agility/agility-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.apify/apify-mcp-server",
      name: "com.apify/apify-mcp-server",
      description:
        "Apify MCP server provides access to a marketplace for web scraping and data extraction tools.",
      version: "0.4.15",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.apify.com/",
          headers: [
            {
              description:
                "Apify API token for authentication with Apify platform services. For example 'Bearer <apify-api-token>'",
              isRequired: true,
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/apify/apify-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.apple-rag/mcp-server",
      name: "com.apple-rag/mcp-server",
      description:
        "Apple Developer Documentation with Semantic Search, RAG, and AI reranking for MCP clients",
      version: "2.9.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.apple-rag.com",
          headers: [
            {
              description:
                "MCP Token for authentication (optional - free tier available without token)",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/BingoWon/apple-rag-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.biodnd/agent-fin",
      name: "com.biodnd/agent-fin",
      description: "Agent Fin: finance MCP server with market data tools",
      version: "0.1.2",
      remotes: [
        {
          type: "sse",
          url: "https://agent-fin.biodnd.com/sse",
        },
      ],
      repository: {
        url: "https://github.com/markchiang/go-agents",
        source: "github",
        subfolder: "src/go_agents/agents/fin",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "com.biodnd/agent-ip",
      name: "com.biodnd/agent-ip",
      description: "Agent IP: MCP server with patents search tools",
      version: "0.1.2",
      remotes: [
        {
          type: "sse",
          url: "https://agent-ip.biodnd.com/sse",
        },
      ],
      repository: {
        url: "https://github.com/markchiang/go-agents",
        source: "github",
        subfolder: "src/go_agents/agents/ip",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "com.biodnd/agent-press",
      name: "com.biodnd/agent-press",
      description: "Agent Press: news MCP server streaming company headlines",
      version: "0.1.2",
      remotes: [
        {
          type: "sse",
          url: "https://agent-press.biodnd.com/sse",
        },
      ],
      repository: {
        url: "https://github.com/markchiang/go-agents",
        source: "github",
        subfolder: "src/go_agents/agents/press",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "com.blockscout/mcp-server",
      name: "com.blockscout/mcp-server",
      description: "MCP server for Blockscout",
      version: "0.11.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.blockscout.com/mcp",
        },
      ],
      repository: {
        url: "https://github.com/blockscout/mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.brokerchooser/broker-safety",
      name: "com.brokerchooser/broker-safety",
      description:
        "MCP server offering regulator-sourced legitimacy checks on investment entities by name or URL.",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.brokerchooser.com/servers/mcp",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.close/close-mcp",
      name: "com.close/close-mcp",
      description:
        "Close CRM to manage your sales pipeline. Learn more at https://close.com or https://mcp.close.com",
      version: "1.0.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.close.com/mcp",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.cloudflare.mcp/mcp",
      name: "com.cloudflare.mcp/mcp",
      description: "Cloudflare MCP servers",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://docs.mcp.cloudflare.com/mcp",
        },
        {
          type: "streamable-http",
          url: "https://observability.mcp.cloudflare.com/mcp",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "streamable-http",
          url: "https://bindings.mcp.cloudflare.com/mcp",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "streamable-http",
          url: "https://builds.mcp.cloudflare.com/mcp",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "streamable-http",
          url: "https://radar.mcp.cloudflare.com/mcp",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "streamable-http",
          url: "https://containers.mcp.cloudflare.com/mcp",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "streamable-http",
          url: "https://browser.mcp.cloudflare.com/mcp",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "streamable-http",
          url: "https://logs.mcp.cloudflare.com/mcp",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "streamable-http",
          url: "https://ai-gateway.mcp.cloudflare.com/mcp",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "streamable-http",
          url: "https://autorag.mcp.cloudflare.com/mcp",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "streamable-http",
          url: "https://auditlogs.mcp.cloudflare.com/mcp",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "streamable-http",
          url: "https://dns-analytics.mcp.cloudflare.com/mcp",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "streamable-http",
          url: "https://dex.mcp.cloudflare.com/mcp",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "streamable-http",
          url: "https://casb.mcp.cloudflare.com/mcp",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "streamable-http",
          url: "https://graphql.mcp.cloudflare.com/mcp",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "sse",
          url: "https://docs.mcp.cloudflare.com/sse",
        },
        {
          type: "sse",
          url: "https://observability.mcp.cloudflare.com/sse",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "sse",
          url: "https://bindings.mcp.cloudflare.com/sse",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "sse",
          url: "https://builds.mcp.cloudflare.com/sse",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "sse",
          url: "https://radar.mcp.cloudflare.com/sse",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "sse",
          url: "https://containers.mcp.cloudflare.com/sse",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "sse",
          url: "https://browser.mcp.cloudflare.com/sse",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "sse",
          url: "https://logs.mcp.cloudflare.com/sse",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "sse",
          url: "https://ai-gateway.mcp.cloudflare.com/sse",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "sse",
          url: "https://autorag.mcp.cloudflare.com/sse",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "sse",
          url: "https://auditlogs.mcp.cloudflare.com/sse",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "sse",
          url: "https://dns-analytics.mcp.cloudflare.com/sse",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "sse",
          url: "https://dex.mcp.cloudflare.com/sse",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "sse",
          url: "https://casb.mcp.cloudflare.com/sse",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
        {
          type: "sse",
          url: "https://graphql.mcp.cloudflare.com/sse",
          headers: [
            {
              description:
                "Optional Cloudflare API key for authentication if not using OAuth. Can use User or Account owned tokens as a Bearer token.",
              isSecret: true,
              name: "Authentication",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/cloudflare/mcp-server-cloudflare",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "com.devcycle/mcp",
      name: "com.devcycle/mcp",
      description: "DevCycle MCP server for feature flag management",
      version: "6.1.2",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.devcycle.com/mcp",
        },
        {
          type: "sse",
          url: "https://mcp.devcycle.com/sse",
        },
      ],
      repository: {
        url: "https://github.com/DevCycleHQ/cli",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "com.devopness.mcp/server",
      name: "com.devopness.mcp/server",
      description:
        "Devopness MCP server for DevOps happiness! Empower AI Agents to deploy apps and infra, to any cloud.",
      version: "1.0.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.devopness.com/mcp/",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.docfork/docfork-mcp",
      name: "com.docfork/docfork-mcp",
      description:
        "Up-to-date documentation to 9,000+ libraries for devs and AI agents.",
      version: "1.0.0",
      packages: [
        {
          registryType: "npm",
          identifier: "docfork",
          version: "1.0.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.docfork.com/mcp",
        },
      ],
      repository: {
        url: "https://github.com/docfork/docfork-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.driflyte/driflyte-mcp-server",
      name: "com.driflyte/driflyte-mcp-server",
      description:
        "Driflyte MCP server which lets AI assistants query topic-specific knowledge from web and GitHub.",
      version: "0.1.15",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@driflyte/mcp-server",
          version: "0.1.15",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
        },
      ],
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.driflyte.com/mcp",
        },
        {
          type: "streamable-http",
          url: "https://mcp.driflyte.com/openai",
        },
      ],
      repository: {
        url: "https://github.com/serkan-ozal/driflyte-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.enigma/enigma-mcp-server",
      name: "com.enigma/enigma-mcp-server",
      description:
        "An MCP server that provides access to trusted data about business identity and activity",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.enigma.com/http",
        },
        {
          type: "streamable-http",
          url: "https://mcp.enigma.com/http-token",
          headers: [
            {
              description:
                "Bearer token of Enigma API key. Used to enable authentication without presenting the user with an oAuth login.",
              isRequired: true,
              isSecret: true,
              name: "X-API-Key",
            },
          ],
        },
        {
          type: "sse",
          url: "https://mcp.enigma.com/sse",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "com.epidemicsound/mcp-server",
      name: "com.epidemicsound/mcp-server",
      description: "Cloud-hosted MCP server for Epidemic Sound",
      websiteUrl: "https://www.epidemicsound.com",
      version: "1.0.0",
      remotes: [
        {
          type: "sse",
          url: "https://www.epidemicsound.com/a/mcp-server/mcp",
        },
        {
          type: "streamable-http",
          url: "https://www.epidemicsound.com/a/mcp-server/mcp",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "com.falkordb/QueryWeaver",
      name: "com.falkordb/QueryWeaver",
      description:
        "An MCP server for Text2SQL: transforms natural language into SQL using graph schema understanding.",
      version: "0.0.11",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "falkordb/queryweaver",
          version: "0.0.11",
          transport: {
            type: "streamable-http",
            url: "https://localhost:5000/mcp",
          },
        },
      ],
      repository: {
        url: "https://github.com/FalkorDB/QueryWeaver",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.figma.mcp/mcp",
      name: "com.figma.mcp/mcp",
      description:
        "The Figma MCP server brings Figma context directly into your AI workflow.",
      version: "1.0.2",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.figma.com/mcp",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.files/python-mcp",
      name: "com.files/python-mcp",
      description:
        "Securely give LLMs controlled access to real-world operations inside your Files.com environment",
      version: "1.0.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "files-com-mcp",
          version: "1.0.34",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Files.com API Key. Create at <your-site>.files.com/ui/apiKeys.",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "FILES_COM_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Files-com/files-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "com.findyourfivepm/mcp-server",
      name: "com.findyourfivepm/mcp-server",
      description:
        "Discover cities where it's currently 5PM around the world with timezone and location data.",
      version: "1.0.2",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.findyourfivepm.com",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.getclockwise/clockwise-mcp",
      name: "com.getclockwise/clockwise-mcp",
      description: "An MCP server for managing your calendar, via Clockwise",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.getclockwise.com/mcp",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.getunblocked/unblocked-mcp",
      name: "com.getunblocked/unblocked-mcp",
      description: "Unblocked MCP Server",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://getunblocked.com/api/mcpsse",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.gibsonai/mcp",
      name: "com.gibsonai/mcp",
      description:
        "GibsonAI MCP server: manage your databases with natural language",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.gibsonai.com/",
        },
      ],
      repository: {
        url: "https://github.com/gibsonai/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.gitlab/mcp",
      name: "com.gitlab/mcp",
      description: "Official GitLab MCP Server",
      version: "0.0.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://gitlab.com/api/v4/mcp",
        },
      ],
      repository: {
        url: "https://gitlab.com/gitlab-org/gitlab",
        source: "gitlab",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.iunera/druid-mcp-server",
      name: "com.iunera/druid-mcp-server",
      description:
        "AI-powered MCP server for Apache Druid cluster management and analytic",
      version: "1.5.0",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "iunera/druid-mcp-server",
          version: "1.5.0",
          runtimeHint: "docker",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Druid router URL for connecting to the Druid cluster",
              format: "string",
              name: "DRUID_ROUTER_URL",
            },
            {
              description:
                "Druid coordinator URL for querying metadata endpoints (optional)",
              format: "string",
              name: "DRUID_COORDINATOR_URL",
            },
            {
              description: "Username for Druid authentication (optional)",
              format: "string",
              name: "DRUID_AUTH_USERNAME",
            },
            {
              description: "Password for Druid authentication (optional)",
              format: "string",
              name: "DRUID_AUTH_PASSWORD",
            },
            {
              description: "Enable SSL/TLS support for Druid connections",
              format: "boolean",
              name: "DRUID_SSL_ENABLED",
            },
            {
              description:
                "Skip SSL certificate verification (for development/testing only)",
              format: "boolean",
              name: "DRUID_SSL_SKIP_VERIFICATION",
            },
            {
              description:
                "Enable read-only mode (only GET requests and SQL queries allowed)",
              format: "boolean",
              name: "DRUID_MCP_READONLY_ENABLED",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/iunera/druid-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "com.jepto/mcp",
      name: "com.jepto/mcp",
      description:
        "Jepto MCP server that provides access to client knowledgebase & analytics for connected data sources",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.jepto.com",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.joelverhagen.mcp/Knapcode.SampleMcpServer",
      name: "com.joelverhagen.mcp/Knapcode.SampleMcpServer",
      description:
        "A sample MCP server using the MCP C# SDK. Generates random numbers and random weather.",
      version: "0.7.0-beta",
      packages: [
        {
          registryType: "nuget",
          registryBaseUrl: "https://api.nuget.org",
          identifier: "Knapcode.SampleMcpServer",
          version: "0.7.0-beta",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              value: "mcp",
              type: "positional",
              valueHint: "mcp",
            },
            {
              value: "start",
              type: "positional",
              valueHint: "start",
            },
          ],
          environmentVariables: [
            {
              value: "{weather_choices}",
              variables: {
                weather_choices: {
                  description:
                    "Comma separated list of weather descriptions to randomly select.",
                  isRequired: true,
                },
              },
              name: "WEATHER_CHOICES",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/joelverhagen/Knapcode.SampleMcpServer.git",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "com.jotform/mcp",
      name: "com.jotform/mcp",
      description: "Jotform MCP",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.jotform.com/",
        },
      ],
      repository: {
        url: "https://github.com/jotform/mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.jumpcloud/jumpcloud-genai",
      name: "com.jumpcloud/jumpcloud-genai",
      description:
        "An MCP server that provides an API to LLMs to manage their JumpCloud resources.",
      version: "0.0.38",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.jumpcloud.com/v1",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.letta/memory-mcp",
      name: "com.letta/memory-mcp",
      description:
        "MCP server for AI memory management using Letta - Standard MCP format",
      version: "2.0.2",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@letta-ai/memory-mcp",
          version: "2.0.2",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Letta API key for memory operations",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "LETTA_API_KEY",
            },
            {
              description: "Unique user identifier for associated memories",
              format: "string",
              name: "LETTA_USER_ID",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/letta-ai/memory-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "com.make/mcp-server",
      name: "com.make/mcp-server",
      description:
        "MCP server for building, running, and managing Make automations.",
      version: "1.0.0",
      remotes: [
        {
          type: "sse",
          url: "https://mcp.make.com/sse",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "com.mermaidchart/mermaid-mcp",
      name: "com.mermaidchart/mermaid-mcp",
      description: "MCP server for Mermaid diagram validation and rendering",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.mermaidchart.com/mcp",
        },
        {
          type: "sse",
          url: "https://mcp.mermaidchart.com/sse",
        },
      ],
      repository: {
        url: "https://github.com/Mermaid-Chart/mermaid-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "com.mintmcp/gcal",
      name: "com.mintmcp/gcal",
      description:
        "A MCP server that works with Google Calendar to manage event listing, reading, and updates.",
      version: "1.0.4",
      remotes: [
        {
          type: "streamable-http",
          url: "https://gcal.mintmcp.com/mcp",
        },
      ],
      repository: {
        url: "https://github.com/mintmcp/servers",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.mintmcp/gmail",
      name: "com.mintmcp/gmail",
      description:
        "A MCP server for Gmail that lets you search, read, and draft emails and replies.",
      version: "1.0.5",
      remotes: [
        {
          type: "streamable-http",
          url: "https://gmail.mintmcp.com/mcp",
        },
      ],
      repository: {
        url: "https://github.com/mintmcp/servers",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.mintmcp/outlook-calendar",
      name: "com.mintmcp/outlook-calendar",
      description:
        "A MCP server that works with Outlook Calendar to manage event listing, reading, and updates.",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://outlook-calendar.mintmcp.com/mcp",
        },
      ],
      repository: {
        url: "https://github.com/mintmcp/servers",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.mintmcp/outlook-email",
      name: "com.mintmcp/outlook-email",
      description:
        "A MCP server for Outlook email that lets you search, read, and draft emails and replies.",
      version: "1.0.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://outlook-email.mintmcp.com/mcp",
        },
      ],
      repository: {
        url: "https://github.com/mintmcp/servers",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.mux/mcp",
      name: "com.mux/mcp",
      description: "The official MCP Server for the Mux API",
      version: "12.8.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@mux/mcp",
          version: "12.8.0",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your Mux access token ID",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "MUX_TOKEN_ID",
            },
            {
              description: "Your Mux access token secret",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "MUX_TOKEN_SECRET",
            },
            {
              description:
                "Your JWT signing key ID, for use with signed playback IDs",
              format: "string",
              isSecret: true,
              name: "MUX_SIGNING_KEY",
            },
            {
              description:
                "Your JWT private key, for use with signed playback IDs",
              format: "string",
              isSecret: true,
              name: "MUX_PRIVATE_KEY",
            },
          ],
        },
      ],
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.mux.com",
          headers: [
            {
              description:
                "Optional basic authorization header you can include, combining your Access Token and Secret using HTTP Basic Auth. If not provided, authorization will be handled via OAuth.",
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/muxinc/mux-node-sdk",
        source: "github",
        subfolder: "packages/mcp-server",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.notion/mcp",
      name: "com.notion/mcp",
      description: "Official Notion MCP server",
      version: "1.0.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.notion.com/mcp",
        },
        {
          type: "sse",
          url: "https://mcp.notion.com/sse",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "com.onkernel/kernel-mcp-server",
      name: "com.onkernel/kernel-mcp-server",
      description:
        "Access Kernel's cloud-based browsers and app actions via MCP (remote HTTP + OAuth).",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.onkernel.com/mcp",
        },
      ],
      repository: {
        url: "https://github.com/onkernel/kernel-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.opsmill/infrahub-mcp",
      name: "com.opsmill/infrahub-mcp",
      description:
        "An MCP server connects your AI assistants to Infrahub using the open MCP standard.",
      version: "0.1.2",
      packages: [
        {
          registryType: "pypi",
          identifier: "infrahub-mcp",
          version: "0.1.2",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "The URL/address of your Infrahub instance",
              isRequired: true,
              format: "string",
              name: "INFRAHUB_ADDRESS",
            },
            {
              description: "Your Infrahub API token for authentication",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "INFRAHUB_API_TOKEN",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/opsmill/infrahub-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "com.pearl.mcp/pearl-api-mcp-server",
      name: "com.pearl.mcp/pearl-api-mcp-server",
      description:
        "Hybrid human + AI expertise for faster, trusted answers and decisions via MCP Server.",
      version: "1.0.0",
      remotes: [
        {
          type: "sse",
          url: "https://mcp.pearl.com/sse",
          headers: [
            {
              description: "Pearl API key for authenticated tool access.",
              name: "X-API-Key",
            },
          ],
        },
        {
          type: "streamable-http",
          url: "https://mcp.pearl.com/mcp",
          headers: [
            {
              description: "Pearl API key for authenticated tool access.",
              name: "X-API-Key",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "com.peek/mcp",
      name: "com.peek/mcp",
      description:
        "Build travel itineraries with Peek's 300k+ experiences. Search, details, and availability.",
      version: "0.1.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.peek.com",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.pga/pga-golf",
      name: "com.pga/pga-golf",
      description:
        "PGA's official MCP Server for all things golf-related. Find a coach, play golf, improve your game.",
      version: "0.0.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.pga.com/mcp",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.proxylink-mcp/mcp-server",
      name: "com.proxylink-mcp/mcp-server",
      description:
        "ProxyLink MCP server for finding and booking home service professionals",
      version: "2.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://proxylink-mcp.com",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.pulsemcp.servers/pulse-fetch",
      name: "com.pulsemcp.servers/pulse-fetch",
      description:
        "MCP server that extracts clean, structured content from web pages with anti-bot bypass capabilities.",
      version: "0.2.14",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@pulsemcp/pulse-fetch",
          version: "0.2.14",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "API key for Firecrawl service to bypass anti-bot measures",
              isSecret: true,
              name: "FIRECRAWL_API_KEY",
            },
            {
              description: "Bearer token for BrightData Web Unlocker service",
              isSecret: true,
              name: "BRIGHTDATA_API_KEY",
            },
            {
              description:
                "Path to markdown file containing scraping strategy configuration",
              default: "/tmp/pulse-fetch/strategy.md",
              name: "STRATEGY_CONFIG_PATH",
            },
            {
              description: "Optimization strategy for scraping: cost or speed",
              default: "cost",
              choices: ["cost", "speed"],
              name: "OPTIMIZE_FOR",
            },
            {
              description:
                "Storage backend for saved resources: memory or filesystem",
              default: "memory",
              choices: ["memory", "filesystem"],
              name: "MCP_RESOURCE_STORAGE",
            },
            {
              description:
                "Directory for filesystem storage (only used with filesystem type)",
              default: "/tmp/pulse-fetch/resources",
              name: "MCP_RESOURCE_FILESYSTEM_ROOT",
            },
            {
              description: "Skip API authentication health checks at startup",
              format: "boolean",
              default: "false",
              name: "SKIP_HEALTH_CHECKS",
            },
            {
              description:
                "LLM provider for extract feature: anthropic, openai, openai-compatible",
              choices: ["anthropic", "openai", "openai-compatible"],
              name: "LLM_PROVIDER",
            },
            {
              description: "API key for the chosen LLM provider",
              isSecret: true,
              name: "LLM_API_KEY",
            },
            {
              description: "Base URL for OpenAI-compatible providers",
              name: "LLM_API_BASE_URL",
            },
            {
              description: "Specific model to use for extraction",
              name: "LLM_MODEL",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/pulsemcp/mcp-servers",
        source: "github",
        subfolder: "productionized/pulse-fetch",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "com.redpanda/docs-mcp",
      name: "com.redpanda/docs-mcp",
      description: "Get authoritative answers to questions about Redpanda.",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://docs.redpanda.com/mcp",
        },
      ],
      repository: {
        url: "https://github.com/redpanda-data/docs-site",
        source: "github",
        subfolder: "netlify",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.remote-mcp/registry-mcp",
      name: "com.remote-mcp/registry-mcp",
      description:
        "An MCP server that serves informtaion from the official MCP registry",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://registry-mcp.remote-mcp.com",
        },
        {
          type: "sse",
          url: "https://registry-mcp.remote-mcp.com/sse",
        },
      ],
      repository: {
        url: "https://github.com/jaw9c/mcp-registry-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "com.ritzademo/acme-todo",
      name: "com.ritzademo/acme-todo",
      description: "An MCP server for a simple todo list",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.ritzademo.com/mcp/ritza-rzx-our91",
        },
      ],
      repository: {
        url: "https://github.com/ritza-co/acme-todo",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.smartbear/smartbear-mcp",
      name: "com.smartbear/smartbear-mcp",
      description:
        "MCP server for AI access to SmartBear tools, including BugSnag, Reflect, API Hub, PactFlow.",
      version: "0.7.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@smartbear/mcp",
          version: "0.7.0",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "BugSnag auth token. Leave empty to disable BugSnag tools. Learn more: https://developer.smartbear.com/smartbear-mcp/docs/bugsnag-integration",
              isSecret: true,
              name: "BUGSNAG_AUTH_TOKEN",
            },
            {
              description:
                "BugSnag project API key (optional; narrows interactions to a single project). Learn more: https://developer.smartbear.com/smartbear-mcp/docs/bugsnag-integration",
              name: "BUGSNAG_PROJECT_API_KEY",
            },
            {
              description:
                "Reflect API token. Leave empty to disable Reflect tools. Learn more: https://developer.smartbear.com/smartbear-mcp/docs/test-hub-integration",
              isSecret: true,
              name: "REFLECT_API_TOKEN",
            },
            {
              description:
                "API Hub API key. Leave empty to disable API Hub tools. Learn more: https://developer.smartbear.com/smartbear-mcp/docs/api-hub-integration",
              isSecret: true,
              name: "API_HUB_API_KEY",
            },
            {
              description:
                "PactFlow/Pact Broker base URL. Leave empty to disable Pact tools. Learn more: https://developer.smartbear.com/smartbear-mcp/docs/contract-testing-with-pactflow",
              name: "PACT_BROKER_BASE_URL",
            },
            {
              description:
                "PactFlow authentication token. Learn more: https://developer.smartbear.com/smartbear-mcp/docs/contract-testing-with-pactflow",
              isSecret: true,
              name: "PACT_BROKER_TOKEN",
            },
            {
              description:
                "Pact Broker username (alternative to token). Learn more: https://developer.smartbear.com/smartbear-mcp/docs/contract-testing-with-pactflow",
              name: "PACT_BROKER_USERNAME",
            },
            {
              description:
                "Pact Broker password (alternative to token). Learn more: https://developer.smartbear.com/smartbear-mcp/docs/contract-testing-with-pactflow",
              isSecret: true,
              name: "PACT_BROKER_PASSWORD",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/SmartBear/smartbear-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "com.statsig/statsig-mcp-server",
      name: "com.statsig/statsig-mcp-server",
      description:
        "MCP server for Statsig API - interact with Statsig's feature flags, experiments, and analytics",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://api.statsig.com/v1/mcp",
          headers: [
            {
              description: "Statsig Console API key for authentication",
              isRequired: true,
              isSecret: true,
              name: "statsig-api-key",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.supabase/mcp",
      name: "com.supabase/mcp",
      description: "MCP server for interacting with the Supabase platform",
      websiteUrl: "https://supabase.com/mcp",
      version: "0.5.6",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@supabase/mcp-server-supabase",
          version: "0.5.6",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
          runtimeArguments: [
            {
              description: "Supabase project reference ID",
              format: "string",
              type: "named",
              name: "--project-ref",
            },
            {
              description: "Enable read-only mode",
              format: "boolean",
              type: "named",
              name: "--read-only",
            },
            {
              description: "Comma-separated list of features to enable",
              format: "string",
              type: "named",
              name: "--features",
            },
            {
              description: "Custom API URL",
              format: "string",
              type: "named",
              name: "--api-url",
            },
          ],
          environmentVariables: [
            {
              description: "Personal access token for Supabase API",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "SUPABASE_ACCESS_TOKEN",
            },
          ],
        },
      ],
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.supabase.com/mcp",
        },
      ],
      repository: {
        url: "https://github.com/supabase-community/supabase-mcp",
        source: "github",
        subfolder: "packages/mcp-server-supabase",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.tableall/mcp",
      name: "com.tableall/mcp",
      description:
        "Access Japan's finest Michelin-starred restaurants. Search, check availability, and browse menus.",
      version: "1.0.0",
      remotes: [
        {
          type: "sse",
          url: "https://mcp.tableall.com/sse",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "com.teamwork/mcp",
      name: "com.teamwork/mcp",
      description:
        "The Teamwork.com official MCP server helps teams efficiently manage client projects with AI.",
      version: "1.6.3",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "teamwork/mcp",
          version: "v1.6.3",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "API key generated from the Teamwork.com OAuth2 process: https://apidocs.teamwork.com/guides/teamwork/app-login-flow",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "TW_MCP_BEARER_TOKEN",
            },
            {
              description:
                "Choose log output format between 'text' or 'json'. Default is 'text'.",
              format: "string",
              name: "TW_MCP_LOG_FORMAT",
            },
            {
              description:
                "Choose log level between 'debug', 'info', 'warn' or 'error'. Default is 'info'.",
              format: "string",
              name: "TW_MCP_LOG_LEVEL",
            },
          ],
        },
      ],
      remotes: [
        {
          type: "sse",
          url: "https://mcp.ai.teamwork.com",
          headers: [
            {
              description:
                "API key generated from the Teamwork.com OAuth2 process: https://apidocs.teamwork.com/guides/teamwork/app-login-flow",
              isRequired: true,
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
        {
          type: "streamable-http",
          url: "https://mcp.ai.teamwork.com",
          headers: [
            {
              description:
                "API key generated from the Teamwork.com OAuth2 process: https://apidocs.teamwork.com/guides/teamwork/app-login-flow",
              isRequired: true,
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/teamwork/mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "com.textarttools/textarttools-mcp",
      name: "com.textarttools/textarttools-mcp",
      description:
        "Unicode text styling and ASCII art generation with 23 styles and 322+ figlet fonts",
      version: "1.1.1",
      remotes: [
        {
          type: "sse",
          url: "https://mcp.textarttools.com/",
        },
      ],
      repository: {
        url: "https://github.com/humanjesse/textarttools-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "com.timeslope/timeslope-mcp",
      name: "com.timeslope/timeslope-mcp",
      description:
        "Equip AI with tools for researching economic data from Federal Reserve Economic Data (FRED).",
      version: "0.1.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.timeslope.com/mcp",
          headers: [
            {
              description:
                "Authorization Bearer header containing API key or OAuth token",
              isRequired: true,
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.vaadin/docs-mcp",
      name: "com.vaadin/docs-mcp",
      description:
        "Provides Vaadin Documentation and help with development tasks",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.vaadin.com/docs/mcp",
        },
      ],
      repository: {
        url: "https://github.com/vaadin/vaadin-documentation-services",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.vercel/vercel-mcp",
      name: "com.vercel/vercel-mcp",
      description: "An MCP server for Vercel",
      version: "0.0.2",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.vercel.com",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "com.windowsforum/mcp-server",
      name: "com.windowsforum/mcp-server",
      description:
        "MCP server for WindowsForum.com with search, document retrieval, and real-time forum analytics.",
      version: "1.0.0",
      remotes: [
        {
          type: "sse",
          url: "https://mcp.windowsforum.com",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "com.wix/mcp",
      name: "com.wix/mcp",
      description: "A Model Context Protocol server for Wix AI tools",
      version: "1.0.0",
      remotes: [
        {
          type: "sse",
          url: "https://mcp.wix.com/sse",
        },
        {
          type: "streamable-http",
          url: "https://mcp.wix.com/mcp",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "com.xcodebuildmcp/XcodeBuildMCP",
      name: "com.xcodebuildmcp/XcodeBuildMCP",
      description:
        "XcodeBuildMCP provides tools for Xcode project management, simulator management, and app utilities.",
      version: "1.14.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "xcodebuildmcp",
          version: "1.14.1",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Enable experimental xcodemake incremental builds (true/false or 1/0).",
              format: "boolean",
              default: "false",
              choices: ["true", "false", "1", "0"],
              name: "INCREMENTAL_BUILDS_ENABLED",
            },
            {
              description:
                "Enable AI-powered dynamic tool discovery to load only relevant workflows.",
              format: "boolean",
              default: "false",
              choices: ["true", "false"],
              name: "XCODEBUILDMCP_DYNAMIC_TOOLS",
            },
            {
              description:
                "Comma-separated list of workflows to load in Static Mode (e.g., 'simulator,device,project-discovery').",
              format: "string",
              name: "XCODEBUILDMCP_ENABLED_WORKFLOWS",
            },
            {
              description: "Disable Sentry error reporting (preferred flag).",
              format: "boolean",
              default: "false",
              choices: ["true", "false"],
              name: "XCODEBUILDMCP_SENTRY_DISABLED",
            },
            {
              description: "Enable verbose debug logging from the server.",
              format: "boolean",
              default: "false",
              choices: ["true", "false"],
              name: "XCODEBUILDMCP_DEBUG",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/cameroncooke/XcodeBuildMCP",
        source: "github",
        id: "945551361",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "com.zomato/mcp",
      name: "com.zomato/mcp",
      description:
        "An MCP server that exposes functionalities to use Zomato's services.",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp-server.zomato.com/mcp",
        },
      ],
      repository: {
        url: "https://github.com/Zomato/mcp-server-manifest",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "dev.anotherai/anotherai",
      name: "dev.anotherai/anotherai",
      description:
        "MCP server for building and testing AI agents with multi-model experimentation and insights.",
      version: "0.1.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://api.anotherai.dev/mcp",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "dev.augments/mcp",
      name: "dev.augments/mcp",
      description:
        "Augments MCP Server - A comprehensive framework documentation provider for Claude Code",
      version: "2.0.2",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "augments-mcp-server",
          version: "2.0.2",
          transport: {
            type: "stdio",
          },
        },
      ],
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.augments.dev/mcp",
        },
      ],
      repository: {
        url: "https://github.com/augmnt/augments-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "dev.composio.rube/rube",
      name: "dev.composio.rube/rube",
      description:
        "Connect your AI to 500+ apps like Gmail, Slack, GitHub, and Notion with streamable HTTP transport.",
      version: "0.0.2",
      remotes: [
        {
          type: "streamable-http",
          url: "https://rube.composio.dev/mcp",
        },
      ],
      repository: {
        url: "https://github.com/ComposioHQ/Rube",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "dev.lingo/main",
      name: "dev.lingo/main",
      description:
        "Lingo.dev MCP Server - World-class i18n implementation with ICU MessageFormat.",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.lingo.dev/main",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "dev.looptool/looptool",
      name: "dev.looptool/looptool",
      description:
        "An MCP server that automatically collects feedback on your MCP server.",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://www.api.looptool.dev/mcp",
          headers: [
            {
              description: "Authorization Bearer header containing API key",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "dev.promplate/hmr",
      name: "dev.promplate/hmr",
      description:
        "Docs for hot-module-reload and reactive programming for Python (`hmr` on PyPI)",
      version: "1.0.2",
      remotes: [
        {
          type: "streamable-http",
          url: "https://pyth-on-line.promplate.dev/hmr/mcp",
        },
      ],
      repository: {
        url: "https://github.com/promplate/hmr",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "dev.rostro/rostro",
      name: "dev.rostro/rostro",
      description:
        "Turn any LLM multimodal; generate images, voices, videos, 3D models, music, and more.",
      _meta: {
        "io.modelcontextprotocol.registry/publisher-provided": {
          build_info: {
            commit: "f7e8d9c2b1a0",
            deployment_id: "remote-fs-deploy-456",
            region: "us-west-2",
            timestamp: "2023-12-05T08:45:00Z",
          },
          tool: "cloud-deployer",
          version: "2.4.0",
        },
      },
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://proto.rostro.dev/mcp",
        },
      ],
      repository: {
        url: "https://github.com/francis-ros/rostro-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "dev.svelte/mcp",
      name: "dev.svelte/mcp",
      description:
        "The official Svelte MCP server providing docs and autofixing tools for Svelte development",
      websiteUrl: "https://svelte.dev/docs/mcp/overview",
      version: "0.1.5",
      packages: [
        {
          registryType: "npm",
          identifier: "@sveltejs/mcp",
          version: "0.1.5",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
        },
      ],
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.svelte.dev/mcp",
        },
      ],
      repository: {
        url: "https://github.com/sveltejs/mcp",
        source: "github",
        id: "1054419133",
        subfolder: "packages/mcp-stdio",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "garden.stanislav.svelte-llm/svelte-llm-mcp",
      name: "garden.stanislav.svelte-llm/svelte-llm-mcp",
      description:
        "An MCP server that provides access to Svelte 5 and SvelteKit documentation",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://svelte-llm.stanislav.garden/mcp/mcp",
        },
        {
          type: "sse",
          url: "https://svelte-llm.stanislav.garden/mcp/sse",
        },
      ],
      repository: {
        url: "https://github.com/khromov/svelte-llm-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "host.justcall.mcp/justcall-mcp-server",
      name: "host.justcall.mcp/justcall-mcp-server",
      description: "JustCall MCP Server",
      version: "0.0.4",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.justcall.host/mcp",
          headers: [
            {
              description:
                "API key and Secret for authentication in the format of <API_KEY>:<API_SECRET>",
              isRequired: true,
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/saaslabsco/justcall-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "info.mosaique/mcp",
      name: "info.mosaique/mcp",
      description:
        "Search and list latest international news (sources, comments, knowledge graph).",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.mosaique.info",
          headers: [
            {
              description: "API key for authentication",
              isRequired: true,
              isSecret: true,
              name: "X-API-Key",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.balldontlie/mcp",
      name: "io.balldontlie/mcp",
      description:
        "Provides access to live sports data and analytics from BALLDONTLIE: The Sports API",
      version: "1.1.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.balldontlie.io/mcp",
          headers: [
            {
              description: "API key for authentication",
              isRequired: true,
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/balldontlie-api/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.catchmetrics.mcp/rum-analytics",
      name: "io.catchmetrics.mcp/rum-analytics",
      description:
        "RUM platform for web performance analytics, Core Web Vitals, and third-party script monitoring.",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.catchmetrics.io",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.coupler/remote-mcp-server",
      name: "io.coupler/remote-mcp-server",
      description: "Coupler.io remote MCP server",
      version: "0.0.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.coupler.io/mcp",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.cycloid.mcp/server",
      name: "io.cycloid.mcp/server",
      description:
        "An MCP server that let you interact with Cycloid.io Internal Development Portal and Platform",
      version: "1.0.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.cycloid.io/mcp",
          headers: [
            {
              description: "API key for authentication",
              isRequired: true,
              isSecret: true,
              name: "X-CY-API-KEY",
            },
            {
              description:
                "The organization canonical name (tenant) you want to interact with",
              isRequired: true,
              name: "X-CY-ORG",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/cycloidio/cycloid-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.foqal/Foqal",
      name: "io.foqal/Foqal",
      description:
        "Foqal turns Slack/Teams into efficient support platforms with AI-powered ticketing.",
      websiteUrl:
        "https://www.foqal.io?utm_source=mcp-registry&utm_medium=registry",
      version: "2.0.1",
      remotes: [
        {
          type: "sse",
          url: "https://support.foqal.io/api/mcp/[YOUR_GENERATED_TOKEN]",
        },
      ],
      repository: {
        url: "https://github.com/foqal/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.8beeeaaat/touchdesigner-mcp-server",
      name: "io.github.8beeeaaat/touchdesigner-mcp-server",
      description:
        "MCP server for TouchDesigner - Control and operate TouchDesigner projects through AI agents",
      version: "1.0.0",
      packages: [
        {
          registryType: "npm",
          identifier: "touchdesigner-mcp-server",
          version: "1.0.0",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/8beeeaaat/touchdesigner-mcp.git",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.Antonytm/mcp-all",
      name: "io.github.Antonytm/mcp-all",
      description: "A Model Context Protocol server to run other MCP servers",
      version: "0.1.20",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@antonytm/mcp-all",
          version: "0.1.20",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              name: "TRANSPORT",
            },
          ],
        },
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@antonytm/mcp-all",
          version: "0.1.20",
          transport: {
            type: "streamable-http",
            url: "http://localhost:3001/mcp",
          },
          environmentVariables: [
            {
              name: "TRANSPORT",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Antonytm/mcp-all",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.Antonytm/mcp-sitecore-server",
      name: "io.github.Antonytm/mcp-sitecore-server",
      description: "A Model Context Protocol server for Sitecore",
      version: "1.3.2",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@antonytm/mcp-sitecore-server",
          version: "1.3.2",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              name: "",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Antonytm/mcp-sitecore-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.AungMyoKyaw/betterprompt-mcp",
      name: "io.github.AungMyoKyaw/betterprompt-mcp",
      description:
        "MCP server for AI-enhanced prompt engineering and request conversion.",
      version: "0.2.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "betterprompt-mcp",
          version: "0.2.1",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/AungMyoKyaw/betterprompt-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.BenAHammond/code-auditor-mcp",
      name: "io.github.BenAHammond/code-auditor-mcp",
      description:
        "Code Quality Auditor: Analyze code for SOLID principles, DRY violations, and more",
      version: "1.1.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "code-auditor-mcp",
          version: "1.20.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/BenAHammond/code-auditor-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.ChengJiale150/jupyter-mcp-server",
      name: "io.github.ChengJiale150/jupyter-mcp-server",
      description:
        "A powerful MCP server for AI-driven Jupyter Notebook management and execution",
      version: "1.1.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "better-jupyter-mcp-server",
          version: "1.1.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/ChengJiale150/jupyter-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.ChiR24/unreal-engine-mcp",
      name: "io.github.ChiR24/unreal-engine-mcp",
      description:
        "MCP server for Unreal Engine 5 with 13 tools for game development automation.",
      version: "0.4.6",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "unreal-engine-mcp-server",
          version: "0.4.6",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Unreal Engine host address (default: 127.0.0.1)",
              value: "127.0.0.1",
              name: "UE_HOST",
            },
            {
              description: "Remote Control HTTP port (default: 30010)",
              value: "30010",
              name: "UE_RC_HTTP_PORT",
            },
            {
              description: "Remote Control WebSocket port (default: 30020)",
              value: "30020",
              name: "UE_RC_WS_PORT",
            },
            {
              description:
                "Logging level: debug, info, warn, error (default: info)",
              value: "info",
              name: "LOG_LEVEL",
            },
            {
              description: "Absolute path to your Unreal .uproject file",
              value: "C:/Users/YourName/Documents/Unreal Projects/YourProject",
              name: "UE_PROJECT_PATH",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/ChiR24/Unreal_mcp.git",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.ChromeDevTools/chrome-devtools-mcp",
      name: "io.github.ChromeDevTools/chrome-devtools-mcp",
      description: "MCP server for Chrome DevTools",
      version: "0.8.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "chrome-devtools-mcp",
          version: "0.8.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/ChromeDevTools/chrome-devtools-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.CodeAlive-AI/codealive-mcp",
      name: "io.github.CodeAlive-AI/codealive-mcp",
      description:
        "Semantic code search and analysis from CodeAlive for AI assistants and agents.",
      version: "0.3.0",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://ghcr.io",
          identifier: "codealive-ai/codealive-mcp",
          version: "0.3.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/CodeAlive-AI/codealive-mcp.git",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.CodeCraftersLLC/local-voice-mcp",
      name: "io.github.CodeCraftersLLC/local-voice-mcp",
      description:
        "Give your MCP clients the ability to speak by running local voice models using Chatterbox TTS",
      version: "0.1.5",
      packages: [
        {
          registryType: "npm",
          identifier: "@codecraftersllc/local-voice-mcp",
          version: "0.1.5",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.CodeLogicIncEngineering/codelogic-mcp-server",
      name: "io.github.CodeLogicIncEngineering/codelogic-mcp-server",
      description:
        "An MCP Server to utilize Codelogic's rich software dependency data in your AI programming assistant.",
      version: "1.0.11",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "codelogic-mcp-server",
          version: "1.0.11",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "url to the CodeLogic server e.g. https://myco.app.codelogic.com",
              format: "string",
              name: "CODELOGIC_SERVER_HOST",
            },
            {
              description: "CodeLogic server username",
              format: "string",
              name: "CODELOGIC_USERNAME",
            },
            {
              description: "CodeLogic server password",
              format: "string",
              name: "CODELOGIC_PASSWORD",
            },
            {
              description: "the workspace name that your code is scanned into",
              format: "string",
              name: "CODELOGIC_WORKSPACE_NAME",
            },
            {
              description:
                "When enabled, additional debug files such as timing_log.txt and impact_data*.json will be generated. Defaults to false",
              format: "string",
              name: "CODELOGIC_DEBUG_MODE",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/CodeLogicIncEngineering/codelogic-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.CursorTouch/Windows-MCP",
      name: "io.github.CursorTouch/Windows-MCP",
      description: "An MCP Server for computer-use in Windows OS",
      version: "1.0.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "windows_mcp",
          version: "0.3.0",
          runtimeHint: "uvx",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/CursorTouch/Windows-MCP",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.DeanWard/HAL",
      name: "io.github.DeanWard/HAL",
      description:
        "HAL (HTTP API Layer) - An MCP server that provides HTTP API capabilities to Large Language Models",
      version: "1.0.14",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "hal-mcp",
          version: "1.0.14",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/DeanWard/HAL",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.Decodo/mcp-web-scraper",
      name: "io.github.Decodo/mcp-web-scraper",
      description:
        "Enable your AI agents to scrape and parse web content dynamically, including geo-restricted sites",
      version: "1.0.3",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@decodo/mcp-server",
          version: "1.0.3",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Decodo Web Advanced API username",
              isRequired: true,
              format: "string",
              name: "SCRAPER_API_USERNAME",
            },
            {
              description: "Decodo Web Advanced API password",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "SCRAPER_API_PASSWORD",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Decodo/mcp-web-scraper",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.Flightradar24/fr24api-mcp",
      name: "io.github.Flightradar24/fr24api-mcp",
      description:
        "MCP server providing access to the Flightradar24 API for real-time and historical flight data",
      version: "1.0.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@flightradar24/fr24api-mcp",
          version: "1.0.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your API key for Flightradar24 API",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "FR24_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Flightradar24/fr24api-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.GLips/Figma-Context-MCP",
      name: "io.github.GLips/Figma-Context-MCP",
      description:
        "Give your coding agent access to your Figma data. Implement designs in any framework in one-shot.",
      version: "0.6.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "figma-developer-mcp",
          version: "0.6.0",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              value: "--stdio",
              type: "positional",
            },
          ],
          environmentVariables: [
            {
              description:
                "Your Figma Personal Access Token, learn more here: https://www.figma.com/developers/api#access-tokens",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "FIGMA_API_KEY",
            },
            {
              description: "Start the server in stdio mode, keep as CLI",
              default: "cli",
              name: "NODE_ENV",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/GLips/Figma-Context-MCP",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.GabrielaHdzMicrosoft/mcp-server",
      name: "io.github.GabrielaHdzMicrosoft/mcp-server",
      description:
        "An MCP server that provides visual memory and context storage with knowledge graph capabilities",
      version: "1.0.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "visual-memory-context-server",
          version: "1.0.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Path to the memory.json file for knowledge graph storage",
              format: "string",
              name: "MEMORY_FILE_PATH",
            },
            {
              description:
                "Comma-separated list of directories the server can access, or JSON array format",
              format: "string",
              name: "ALLOWED_DIRECTORIES",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/testing9384/mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.GitHub30/note-mcp-server",
      name: "io.github.GitHub30/note-mcp-server",
      description: "MCP server for note.com: create, edit and retrieve posts.",
      version: "0.1.0",
      repository: {
        url: "https://github.com/GitHub30/note-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.GitHub30/qiita-mcp-server",
      name: "io.github.GitHub30/qiita-mcp-server",
      description:
        "Publish articles to Qiita via MCP tools. Minimal, fast, and focused on Qiita authoring.",
      version: "0.1.0",
      repository: {
        url: "https://github.com/GitHub30/qiita-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.GitHub30/zenn-mcp-server",
      name: "io.github.GitHub30/zenn-mcp-server",
      description: "MCP server that posts to Zenn.",
      version: "0.1.0",
      repository: {
        url: "https://github.com/GitHub30/zenn-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.GoneTone/mcp-server-taiwan-weather",
      name: "io.github.GoneTone/mcp-server-taiwan-weather",
      description:
        "用於取得臺灣中央氣象署 API 資料的 Model Context Protocol (MCP) Server",
      version: "0.1.4",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@gonetone/mcp-server-taiwan-weather",
          version: "0.1.4",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                '您的中央氣象署 API 授權碼。 請前往 https://opendata.cwa.gov.tw/user/authkey，登入後點擊 "取得授權碼" 取得。',
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "CWA_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/GoneTone/mcp-server-taiwan-weather",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.GoogleCloudPlatform/gemini-cloud-assist-mcp",
      name: "io.github.GoogleCloudPlatform/gemini-cloud-assist-mcp",
      description:
        "MCP Server for understanding, managing & troubleshooting your GCP environment.",
      version: "0.1.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@google-cloud/gemini-cloud-assist-mcp",
          version: "0.1.1",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/GoogleCloudPlatform/gemini-cloud-assist-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.IPv6/mcp-transcribe",
      name: "io.github.IPv6/mcp-transcribe",
      description:
        "MCP-Transcribe server allows LLMs to interact with the text content of audio/video files",
      version: "1.0.4",
      packages: [
        {
          registryType: "mcpb",
          identifier:
            "https://github.com/transcribe-app/mcp-transcribe/releases/download/v1.0.4/transcribe-com-v1.0.4.mcpb",
          version: "1.0.4",
          fileSha256:
            "720278617e2a55372919f4ca33bb6298e1e58433f4148fe88b86463fad07bdab",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your MCP-integration URL",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "MCP_INTEGRATION_URL",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/transcribe-app/mcp-transcribe",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.Inflectra/mcp-server-spira",
      name: "io.github.Inflectra/mcp-server-spira",
      description:
        "A Model Context Protocol (MCP) server enabling AI assistants to interact with Spira by Inflectra.",
      version: "1.1.1",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "mcp-server-spira",
          version: "1.1.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "The base URL for your instance of Spira (typically https://mycompany.spiraservice.net or https://demo-xx.spiraservice.net/mycompany)",
              isRequired: true,
              format: "string",
              name: "INFLECTRA_SPIRA_BASE_URL",
            },
            {
              description: "The login name you use to access Spira",
              isRequired: true,
              format: "string",
              name: "INFLECTRA_SPIRA_USERNAME",
            },
            {
              description:
                "The API Key (RSS Token) you use to access the Spira REST API",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "INFLECTRA_SPIRA_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Inflectra/mcp-server-spira",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.IvanMurzak/Unity-MCP",
      name: "io.github.IvanMurzak/Unity-MCP",
      description:
        "Make 3D games in Unity Engine with AI. MCP Server + Plugin for Unity Editor and Unity games.",
      version: "0.17.1",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "ivanmurzakdev/unity-mcp-server",
          version: "0.17.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Client -> Server <- Plugin connection port (default: 8080)",
              format: "number",
              name: "UNITY_MCP_PORT",
            },
            {
              description:
                "Plugin -> Server connection timeout (ms) (default: 10000)",
              format: "number",
              name: "UNITY_MCP_PLUGIN_TIMEOUT",
            },
            {
              description:
                "Client -> Server transport type: stdio or http (default: http)",
              format: "string",
              default: "stdio",
              name: "UNITY_MCP_CLIENT_TRANSPORT",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/IvanMurzak/Unity-MCP",
        source: "github",
        subfolder: "Unity-MCP-Server",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.JustasMonkev/mcp-accessibility-scanner",
      name: "io.github.JustasMonkev/mcp-accessibility-scanner",
      description:
        "MCP server for automated web accessibility scanning with Playwright and Axe-core.",
      version: "1.1.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-accessibility-scanner",
          version: "1.1.1",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/JustasMonkev/mcp-accessibility-scanner",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.KylinMountain/web-fetch-mcp",
      name: "io.github.KylinMountain/web-fetch-mcp",
      description:
        "MCP server for web content fetching, summarizing, comparing, and extracting information",
      version: "0.1.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "web-fetch-mcp",
          version: "0.1.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your Gemini API key for the service",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "GEMINI_API_KEY",
            },
            {
              description: "Your proxy for the gemini api service",
              format: "string",
              name: "HTTP_PROXY",
            },
            {
              description: "Your proxy for the gemini api service",
              format: "string",
              name: "HTTPS_PROXY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/KylinMountain/web-fetch-mcp.git",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.LinuxSuRen/atest-mcp-server",
      name: "io.github.LinuxSuRen/atest-mcp-server",
      description:
        "Auto-download & launch https://github.com/LinuxSuRen/atest-mcp-server",
      version: "1.0.2",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "atest-mcp-server-launcher",
          version: "1.0.2",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/LinuxSuRen/atest-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.Lungshot/ninjaone",
      name: "io.github.Lungshot/ninjaone",
      description:
        "MCP server for NinjaONE RMM with device management, monitoring, and automation",
      version: "1.2.9",
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.Lyellr88/marm-mcp-server",
      name: "io.github.Lyellr88/marm-mcp-server",
      description:
        "Universal MCP Server with advanced AI memory capabilities and semantic search.",
      version: "2.2.5",
      packages: [
        {
          registryType: "pypi",
          identifier: "marm-mcp-server",
          version: "2.2.5",
          transport: {
            type: "stdio",
          },
        },
        {
          registryType: "oci",
          identifier: "lyellr88/marm-mcp-server",
          version: "2.2.5",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/Lyellr88/MARM-Systems",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.MR901/mcp-plots",
      name: "io.github.MR901/mcp-plots",
      description: "MCP server for data visualization with Mermaid charts.",
      version: "0.0.3",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "mcp-plots",
          version: "0.0.2",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/MR901/mcp-plots",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.MR901/plots-mcp",
      name: "io.github.MR901/plots-mcp",
      description: "MCP server for data visualization with Mermaid charts.",
      version: "0.0.1",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "mcp-plots",
          version: "0.0.1",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/MR901/plots-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.MasonChow/source-map-parser-mcp",
      name: "io.github.MasonChow/source-map-parser-mcp",
      description:
        "Parse JavaScript error stack traces back to original source code using source maps",
      version: "1.3.2",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "source-map-parser-mcp",
          version: "1.3.2",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Context lines around error locations in source code",
              format: "string",
              name: "SOURCE_MAP_PARSER_CONTEXT_OFFSET_LINE",
            },
            {
              description: "Maximum memory cache size in MB for source maps",
              format: "string",
              name: "SOURCE_MAP_PARSER_RESOURCE_CACHE_MAX_SIZE",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/MasonChow/source-map-parser-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.MauroDruwel/smartschool-mcp",
      name: "io.github.MauroDruwel/smartschool-mcp",
      description:
        "Access Smartschool courses, grades, assignments, and messages through the Model Context Protocol",
      version: "0.1.4",
      packages: [
        {
          registryType: "pypi",
          identifier: "smartschool-mcp",
          version: "0.1.4",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.NeerajG03/vector-memory",
      name: "io.github.NeerajG03/vector-memory",
      description:
        "Semantic document memory using Redis vector store. Save and recall files with natural language.",
      version: "0.3.1",
      packages: [
        {
          registryType: "pypi",
          identifier: "mcp-server-vector-memory",
          version: "0.3.1",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.Nekzus/npm-sentinel-mcp",
      name: "io.github.Nekzus/npm-sentinel-mcp",
      description:
        "NPM Sentinel MCP - AI-powered NPM package analysis for security, dependencies, and performance.",
      version: "1.11.8",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@nekzus/mcp-server",
          version: "1.11.8",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/Nekzus/npm-sentinel-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.NitishGourishetty/contextual-mcp-server",
      name: "io.github.NitishGourishetty/contextual-mcp-server",
      description:
        "RAG-enabled MCP server using Contextual AI. Supports single-agent and multi-agent modes.",
      version: "0.1.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "contextual-mcp-server",
          version: "0.1.0",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your Contextual AI API key",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "API_KEY",
            },
            {
              description:
                "Your Contextual AI agent ID (required only for single-agent mode; omit for multi-agent mode)",
              format: "string",
              name: "AGENT_ID",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/NitishGourishetty/contextual-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.OpenCageData/opencage-geocoding-mcp",
      name: "io.github.OpenCageData/opencage-geocoding-mcp",
      description: "MCP server for OpenCage geocoding API",
      version: "1.0.3",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@opencage/mcp-opencage-server",
          version: "1.0.3",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your API key for the service",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "YOUR_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/OpenCageData/opencage-geocoding-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.OtherVibes/mcp-as-a-judge",
      name: "io.github.OtherVibes/mcp-as-a-judge",
      description:
        "MCP as a Judge: a behavioral MCP that strengthens AI coding assistants via explicit LLM evaluations",
      version: "0.3.20",
      packages: [
        {
          registryType: "pypi",
          identifier: "mcp-as-a-judge",
          version: "0.3.20",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/OtherVibes/mcp-as-a-judge",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.PV-Bhat/vibe-check-mcp-server",
      name: "io.github.PV-Bhat/vibe-check-mcp-server",
      description:
        "Metacognitive AI agent oversight: adaptive CPI interrupts for alignment, reflection and safety",
      version: "1.0.0",
      packages: [
        {
          registryType: "npm",
          identifier: "@pv-bhat/vibe-check-mcp",
          version: "2.5.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your API key for the service",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "YOUR_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/PV-Bhat/vibe-check-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.PagerDuty/pagerduty-mcp",
      name: "io.github.PagerDuty/pagerduty-mcp",
      description:
        "PagerDuty's official MCP server which provides tools to interact with your PagerDuty account.",
      version: "0.2.1",
      packages: [
        {
          registryType: "pypi",
          identifier: "pagerduty-mcp",
          version: "0.2.1",
          runtimeHint: "uvx",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              value: "--enable-write-tools",
              type: "positional",
            },
          ],
          environmentVariables: [
            {
              description:
                "PagerDuty User API Token - obtain from User Settings > API Access in your PagerDuty account",
              name: "PAGERDUTY_USER_API_KEY",
            },
            {
              description:
                "PagerDuty API host URL (default: https://api.pagerduty.com, EU: https://api.eu.pagerduty.com)",
              name: "PAGERDUTY_API_HOST",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/PagerDuty/pagerduty-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.Raistlin82/btp-sap-odata-to-mcp-server-optimized",
      name: "io.github.Raistlin82/btp-sap-odata-to-mcp-server-optimized",
      description:
        "Enterprise SAP OData to MCP Server with AI capabilities and Cloud Foundry integration",
      version: "1.0.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "btp-sap-odata-to-mcp-server",
          version: "1.0.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "URL of the SAP Identity Authentication Service tenant",
              isRequired: true,
              format: "string",
              name: "SAP_IAS_URL",
            },
            {
              description: "Client ID for the OAuth application in IAS",
              isRequired: true,
              format: "string",
              name: "SAP_IAS_CLIENT_ID",
            },
            {
              description: "Client Secret for the OAuth application in IAS",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "SAP_IAS_CLIENT_SECRET",
            },
            {
              description:
                "Name of the BTP destination used for service discovery",
              isRequired: true,
              format: "string",
              name: "SAP_DESTINATION_NAME",
            },
            {
              description:
                "OData discovery mode: pattern, business, whitelist, or all",
              format: "string",
              name: "ODATA_DISCOVERY_MODE",
            },
            {
              description: "Comma-separated patterns to include (pattern mode)",
              format: "string",
              name: "ODATA_INCLUDE_PATTERNS",
            },
            {
              description: "Comma-separated patterns to exclude (pattern mode)",
              format: "string",
              name: "ODATA_EXCLUDE_PATTERNS",
            },
            {
              description: "The port on which the Express server will listen",
              format: "string",
              name: "PORT",
            },
            {
              description: "The application's operating environment",
              format: "string",
              name: "NODE_ENV",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Raistlin82/btp-sap-odata-to-mcp-server-optimized",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.Saidiibrahim/search-papers",
      name: "io.github.Saidiibrahim/search-papers",
      description: "An MCP server to search papers from arXiv",
      version: "0.1.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "search-papers",
          version: "0.1.1",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/Saidiibrahim/search-papers",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.SamYuan1990/i18n-agent-action",
      name: "io.github.SamYuan1990/i18n-agent-action",
      description: "An i18n github action for language translate",
      version: "mcp",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://ghcr.io",
          identifier: "SamYuan1990/i18n-agent-action",
          version: "mcp",
          runtimeHint: "docker",
          transport: {
            type: "sse",
            url: "https://example.com:8080/sse",
          },
          runtimeArguments: [
            {
              description: "Port mapping from host to container",
              value: "8080:8080",
              type: "named",
              name: "-p",
            },
            {
              description: "API key for the i18n service",
              value: "api_key={api_key}",
              variables: {
                api_key: {
                  description: "Your API key for the translation service",
                  isRequired: true,
                  format: "string",
                  isSecret: true,
                },
              },
              type: "named",
              name: "-e",
            },
            {
              description: "Volume mount for model files",
              value: "{models_path}:/app/models",
              variables: {
                models_path: {
                  description: "Path to your models directory on the host",
                  isRequired: true,
                  format: "filepath",
                  default: "/path/to/your/models",
                },
              },
              type: "named",
              name: "-v",
            },
            {
              description: "Encoder model file path",
              value: "encoder={encoder_file}",
              variables: {
                encoder_file: {
                  description: "Encoder model file name",
                  isRequired: true,
                  format: "string",
                  default: "/app/models/your-encoder.onnx",
                },
              },
              type: "named",
              name: "-e",
            },
            {
              description: "Decoder model file path",
              value: "decoder={decoder_file}",
              variables: {
                decoder_file: {
                  description: "Decoder model file name",
                  isRequired: true,
                  format: "string",
                  default: "/app/models/your-decoder.onnx",
                },
              },
              type: "named",
              name: "-e",
            },
            {
              description: "Tokens model file path",
              value: "tokens={tokens_file}",
              variables: {
                tokens_file: {
                  description: "Tokens model file name",
                  isRequired: true,
                  format: "string",
                  default: "/app/models/your-tokens.onnx",
                },
              },
              type: "named",
              name: "-e",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.Selenium39/mcp-server-tempmail",
      name: "io.github.Selenium39/mcp-server-tempmail",
      description:
        "MCP server for temporary email management using ChatTempMail API",
      version: "1.0.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-server-tempmail",
          version: "1.0.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "API key for ChatTempMail service",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "TEMPMAIL_API_KEY",
            },
            {
              description:
                "Base URL for ChatTempMail API (optional, defaults to https://chat-tempmail.com)",
              format: "string",
              name: "TEMPMAIL_BASE_URL",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Selenium39/mcp-server-tempmail",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.Skills03/scrimba-teaching",
      name: "io.github.Skills03/scrimba-teaching",
      description:
        "Interactive programming teacher using Scrimba's methodology for 10x retention",
      version: "2.0.0",
      packages: [
        {
          registryType: "pypi",
          identifier: "scrimba-teaching-mcp",
          version: "2.0.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.SnowLeopard-AI/bigquery-mcp",
      name: "io.github.SnowLeopard-AI/bigquery-mcp",
      description:
        "A SnowLeopardAI-managed MCP server that provides access to Google BigQuery data.",
      version: "0.1.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "sl-bigquery-mcp",
          version: "0.1.8",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/SnowLeopard-AI/bigquery-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.Snowflake-Labs/mcp",
      name: "io.github.Snowflake-Labs/mcp",
      description: "MCP Server for Snowflake from Snowflake Labs",
      version: "1.3.3",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "snowflake-labs-mcp",
          version: "1.3.3",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              description: "Path to service specification file",
              isRequired: true,
              type: "named",
              name: "--service-config-file",
            },
            {
              description: "Account identifier (e.g. xy12345.us-east-1)",
              type: "named",
              name: "--account",
            },
            {
              description: "Snowflake host URL",
              type: "named",
              name: "--host",
            },
            {
              description: "Username for authentication",
              type: "named",
              name: "--user",
            },
            {
              description: "Password or programmatic access token",
              type: "named",
              name: "--password",
            },
            {
              description: "Role to use for connection",
              type: "named",
              name: "--role",
            },
            {
              description: "Warehouse to use for queries",
              type: "named",
              name: "--warehouse",
            },
            {
              description: "Whether passcode is embedded in password",
              type: "named",
              name: "--passcode-in-password",
            },
            {
              description: "MFA passcode for authentication",
              type: "named",
              name: "--passcode",
            },
            {
              description: "Private key for key pair authentication",
              type: "named",
              name: "--private-key",
            },
            {
              description: "Path to private key file",
              type: "named",
              name: "--private-key-file",
            },
            {
              description: "Password for encrypted private key",
              type: "named",
              name: "--private-key-file-pwd",
            },
            {
              description: "Authentication type",
              default: "snowflake",
              type: "named",
              name: "--authenticator",
            },
            {
              description:
                "Name of connection from connections.toml (or config.toml) file",
              type: "named",
              name: "--connection-name",
            },
            {
              description: "Transport for the MCP server",
              default: "stdio",
              choices: ["stdio", "http", "sse", "streamable-http"],
              type: "named",
              name: "--transport",
            },
            {
              description: "Custom endpoint path for HTTP transports",
              default: "/mcp",
              type: "named",
              name: "--endpoint",
            },
          ],
          environmentVariables: [
            {
              description: "Account identifier (e.g. xy12345.us-east-1)",
              format: "string",
              name: "SNOWFLAKE_ACCOUNT",
            },
            {
              description: "Snowflake host URL",
              format: "string",
              name: "SNOWFLAKE_HOST",
            },
            {
              description: "Username for authentication",
              format: "string",
              name: "SNOWFLAKE_USER",
            },
            {
              description: "Password or programmatic access token",
              format: "string",
              name: "SNOWFLAKE_PASSWORD",
            },
            {
              description: "Role to use for connection",
              format: "string",
              name: "SNOWFLAKE_ROLE",
            },
            {
              description: "Warehouse to use for queries",
              format: "string",
              name: "SNOWFLAKE_WAREHOUSE",
            },
            {
              description: "MFA passcode for authentication",
              format: "string",
              name: "SNOWFLAKE_PASSCODE",
            },
            {
              description: "Private key for key pair authentication",
              format: "string",
              name: "SNOWFLAKE_PRIVATE_KEY",
            },
            {
              description: "Path to private key file",
              format: "string",
              name: "SNOWFLAKE_PRIVATE_KEY_FILE",
            },
            {
              description: "Password for encrypted private key",
              format: "string",
              name: "SNOWFLAKE_PRIVATE_KEY_FILE_PWD",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/Snowflake-Labs/mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.SonarSource/sonarqube-mcp-server",
      name: "io.github.SonarSource/sonarqube-mcp-server",
      description:
        "An MCP server that enables integration with SonarQube Server or Cloud for code quality and security.",
      version: "0.0.8",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "mcp/sonarqube",
          version:
            "sha256:d9dc2f44f4f624bdc5fb5817abc74f6244dd40b2d03036380cd6253eff374ae5",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your SonarQube Server USER token",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "SONARQUBE_TOKEN",
            },
            {
              description:
                "Your SonarQube Cloud organization key (if using SonarQube Cloud)",
              format: "string",
              isSecret: true,
              name: "SONARQUBE_ORG",
            },
            {
              description:
                "Your SonarQube Server URL (if using SonarQube Server)",
              format: "string",
              isSecret: true,
              name: "SONARQUBE_URL",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/SonarSource/sonarqube-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.Synclub-tech/synclub-dxt",
      name: "io.github.Synclub-tech/synclub-dxt",
      description:
        "SynClub MCP Server for AI-powered comic creation with script generation and image tools",
      version: "0.6.0",
      repository: {
        url: "https://github.com/Synclub-tech/Synclub-dxt",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.TonySimonovsky/claude-code-conversation-search-mcp",
      name: "io.github.TonySimonovsky/claude-code-conversation-search-mcp",
      description:
        "Search Claude Code conversation history with natural language queries across all projects",
      version: "1.1.3",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "claude-code-conversation-search-mcp",
          version: "1.1.3",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/TonySimonovsky/claude-code-conversation-search-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.VictoriaMetrics-Community/mcp-victorialogs",
      name: "io.github.VictoriaMetrics-Community/mcp-victorialogs",
      description:
        "MCP Server for VictoriaLogs. Provides integration with VictoriaLogs API and documentation",
      version: "1.3.0",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://ghcr.io",
          identifier: "victoriametrics-community/mcp-victorialogs",
          version: "v1.3.0",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "URL to VictoriaMetrics instance (it should be root URL of vmlingle or vlselect), for example http://localhost:9428 or https://play-vmlogs.victoriametrics.com",
              isRequired: true,
              format: "string",
              name: "VL_INSTANCE_ENTRYPOINT",
            },
            {
              description:
                "Type of VictoriaMetrics instance (single / cluster)",
              isRequired: true,
              format: "string",
              name: "VL_INSTANCE_TYPE",
            },
            {
              description: "Authentication token for VictoriaMetrics API",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "VL_INSTANCE_BEARER_TOKEN",
            },
            {
              description: "Comma-separated list of tools to disable",
              format: "string",
              name: "MCP_DISABLED_TOOLS",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/VictoriaMetrics-Community/mcp-victorialogs",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.VictoriaMetrics-Community/mcp-victoriametrics",
      name: "io.github.VictoriaMetrics-Community/mcp-victoriametrics",
      description:
        "MCP Server for VictoriaMetrics. Provides integration with VictoriaMetrics API and documentation",
      version: "1.13.1",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://ghcr.io",
          identifier: "victoriametrics-community/mcp-victoriametrics",
          version: "v1.13.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "URL to VictoriaMetrics instance (it should be root URL of vmsingle or vmselect), for example http://localhost:8428 or https://play.victoriametrics.com",
              isRequired: true,
              format: "string",
              name: "VM_INSTANCE_ENTRYPOINT",
            },
            {
              description:
                "Type of VictoriaMetrics instance (single / cluster)",
              isRequired: true,
              format: "string",
              name: "VM_INSTANCE_TYPE",
            },
            {
              description: "Authentication token for VictoriaMetrics API",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "VM_INSTANCE_BEARER_TOKEN",
            },
            {
              description:
                "Optional: API key from VictoriaMetrics Cloud Console (if you have deployment in VictoriaMetrics Cloud)",
              format: "string",
              isSecret: true,
              name: "VMC_API_KEY",
            },
            {
              description: "Comma-separated list of tools to disable",
              format: "string",
              name: "MCP_DISABLED_TOOLS",
            },
            {
              description:
                "Disable all resources (documentation tool will continue to work)",
              format: "boolean",
              name: "MCP_DISABLE_RESOURCES",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/VictoriaMetrics-Community/mcp-victoriametrics",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.YinTokey/mcp_hackernews",
      name: "io.github.YinTokey/mcp_hackernews",
      description:
        "MCP server exposing a simple Hacker News search tool (top stories).",
      version: "1.1.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "mcp-hackernews",
          version: "1.1.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/YinTokey/mcp_hackernews",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.abelljs/abell",
      name: "io.github.abelljs/abell",
      description: "AI tools related to Abell. Currently includes MCP of Abell",
      version: "0.0.9",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "abell-ai",
          version: "0.0.9",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/abelljs/abell",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.abhijitjavelin/javelin-guardrails-mcp-server",
      name: "io.github.abhijitjavelin/javelin-guardrails-mcp-server",
      description: "An MCP server that provides Javelin Standalone Guardrails",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://abhijitjavelin.github.io/javelin-guardrails-mcp-server/mcp",
          headers: [
            {
              description: "Javelin API key for authentication",
              isRequired: true,
              isSecret: true,
              name: "x-javelin-apikey",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.abhishekbhakat/airflow-mcp-server",
      name: "io.github.abhishekbhakat/airflow-mcp-server",
      description: "An MCP server for Apache Airflow ",
      version: "0.9.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "airflow-mcp-server",
          version: "0.9.0",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              description: "Use only read-only tools for safe operations",
              type: "named",
              name: "--safe",
            },
            {
              description: "Use static tools instead of hierarchical discovery",
              type: "named",
              name: "--static-tools",
            },
          ],
          environmentVariables: [
            {
              description:
                "The base URL for the Airflow API (e.g., http://localhost:8080)",
              isRequired: true,
              format: "string",
              name: "AIRFLOW_BASE_URL",
            },
            {
              description:
                "The JWT authentication token for Airflow API access",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "AUTH_TOKEN",
            },
          ],
        },
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "airflow-mcp-server",
          version: "0.8.2",
          transport: {
            type: "streamable-http",
            url: "http://localhost:3000",
          },
          packageArguments: [
            {
              description: "Use HTTP (Streamable HTTP) transport",
              type: "named",
              name: "--http",
            },
            {
              description: "Port to run HTTP server on",
              value: "3000",
              type: "named",
              name: "--port",
            },
            {
              description: "Host to bind HTTP server to",
              value: "localhost",
              type: "named",
              name: "--host",
            },
            {
              description: "Use only read-only tools for safe operations",
              type: "named",
              name: "--safe",
            },
            {
              description: "Use static tools instead of hierarchical discovery",
              type: "named",
              name: "--static-tools",
            },
          ],
          environmentVariables: [
            {
              description:
                "The base URL for the Airflow API (e.g., http://localhost:8080)",
              isRequired: true,
              format: "string",
              name: "AIRFLOW_BASE_URL",
            },
            {
              description:
                "The JWT authentication token for Airflow API access",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "AUTH_TOKEN",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/abhishekbhakat/airflow-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.agentailor/slimcontext-mcp-server",
      name: "io.github.agentailor/slimcontext-mcp-server",
      description:
        "MCP Server for SlimContext - AI chat history compression tools",
      version: "0.1.2",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "slimcontext-mcp-server",
          version: "0.1.2",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/agentailor/slimcontext-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.aikts/yandex-tracker-mcp",
      name: "io.github.aikts/yandex-tracker-mcp",
      description: "MCP server for Yandex Tracker API.",
      version: "0.4.6",
      packages: [
        {
          registryType: "pypi",
          identifier: "yandex-tracker-mcp",
          version: "0.4.6",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.alex-feel/mcp-context-server",
      name: "io.github.alex-feel/mcp-context-server",
      description:
        "An MCP server that provides persistent multimodal context storage for LLM agents.",
      version: "0.4.1",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "mcp-context-server",
          version: "0.4.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Log level",
              format: "string",
              name: "LOG_LEVEL",
            },
            {
              description: "Maximum individual image size in megabytes",
              format: "number",
              name: "MAX_IMAGE_SIZE_MB",
            },
            {
              description: "Maximum total request size in megabytes",
              format: "number",
              name: "MAX_TOTAL_SIZE_MB",
            },
            {
              description: "Custom database file location path",
              format: "string",
              name: "DB_PATH",
            },
            {
              description:
                "Maximum number of concurrent read connections in the pool",
              format: "number",
              name: "POOL_MAX_READERS",
            },
            {
              description:
                "Maximum number of concurrent write connections in the pool",
              format: "number",
              name: "POOL_MAX_WRITERS",
            },
            {
              description: "Connection timeout in seconds",
              format: "number",
              name: "POOL_CONNECTION_TIMEOUT_S",
            },
            {
              description: "Idle connection timeout in seconds",
              format: "number",
              name: "POOL_IDLE_TIMEOUT_S",
            },
            {
              description: "Connection health check interval in seconds",
              format: "number",
              name: "POOL_HEALTH_CHECK_INTERVAL_S",
            },
            {
              description:
                "Maximum number of retry attempts for failed operations",
              format: "number",
              name: "RETRY_MAX_RETRIES",
            },
            {
              description: "Base delay in seconds between retry attempts",
              format: "number",
              name: "RETRY_BASE_DELAY_S",
            },
            {
              description: "Maximum delay in seconds between retry attempts",
              format: "number",
              name: "RETRY_MAX_DELAY_S",
            },
            {
              description: "Enable random jitter in retry delays",
              format: "boolean",
              name: "RETRY_JITTER",
            },
            {
              description:
                "Exponential backoff multiplication factor for retries",
              format: "number",
              name: "RETRY_BACKOFF_FACTOR",
            },
            {
              description: "Enable SQLite foreign key constraints",
              format: "boolean",
              name: "SQLITE_FOREIGN_KEYS",
            },
            {
              description: "SQLite journal mode (e.g., WAL, DELETE)",
              format: "string",
              name: "SQLITE_JOURNAL_MODE",
            },
            {
              description: "SQLite synchronous mode (e.g., NORMAL, FULL, OFF)",
              format: "string",
              name: "SQLITE_SYNCHRONOUS",
            },
            {
              description:
                "SQLite temporary storage location (e.g., MEMORY, FILE)",
              format: "string",
              name: "SQLITE_TEMP_STORE",
            },
            {
              description: "SQLite memory-mapped I/O size in bytes",
              format: "number",
              name: "SQLITE_MMAP_SIZE",
            },
            {
              description:
                "SQLite cache size (negative value for KB, positive for pages)",
              format: "number",
              name: "SQLITE_CACHE_SIZE",
            },
            {
              description: "SQLite page size in bytes",
              format: "number",
              name: "SQLITE_PAGE_SIZE",
            },
            {
              description: "SQLite WAL autocheckpoint threshold in pages",
              format: "number",
              name: "SQLITE_WAL_AUTOCHECKPOINT",
            },
            {
              description: "SQLite busy timeout in milliseconds",
              format: "number",
              name: "SQLITE_BUSY_TIMEOUT_MS",
            },
            {
              description:
                "SQLite WAL checkpoint mode (e.g., PASSIVE, FULL, RESTART)",
              format: "string",
              name: "SQLITE_WAL_CHECKPOINT",
            },
            {
              description: "Server shutdown timeout in seconds",
              format: "number",
              name: "SHUTDOWN_TIMEOUT_S",
            },
            {
              description: "Test mode shutdown timeout in seconds",
              format: "number",
              name: "SHUTDOWN_TIMEOUT_TEST_S",
            },
            {
              description: "Queue operation timeout in seconds",
              format: "number",
              name: "QUEUE_TIMEOUT_S",
            },
            {
              description: "Test mode queue timeout in seconds",
              format: "number",
              name: "QUEUE_TIMEOUT_TEST_S",
            },
            {
              description: "Circuit breaker failure threshold before opening",
              format: "number",
              name: "CIRCUIT_BREAKER_FAILURE_THRESHOLD",
            },
            {
              description: "Circuit breaker recovery timeout in seconds",
              format: "number",
              name: "CIRCUIT_BREAKER_RECOVERY_TIMEOUT_S",
            },
            {
              description:
                "Maximum calls allowed in circuit breaker half-open state",
              format: "number",
              name: "CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS",
            },
            {
              description: "Enable semantic search functionality",
              format: "boolean",
              name: "ENABLE_SEMANTIC_SEARCH",
            },
            {
              description: "Ollama API host URL for embedding generation",
              format: "string",
              name: "OLLAMA_HOST",
            },
            {
              description: "Embedding model name for semantic search",
              format: "string",
              name: "EMBEDDING_MODEL",
            },
            {
              description: "Embedding vector dimensions",
              format: "number",
              name: "EMBEDDING_DIM",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/alex-feel/mcp-context-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.alondmnt/joplin-mcp",
      name: "io.github.alondmnt/joplin-mcp",
      description:
        "FastMCP server exposing Joplin notes, notebooks, tags, and imports.",
      version: "0.4.1",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "joplin-mcp",
          version: "0.4.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Web Clipper authentication token from a running Joplin instance",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "JOPLIN_TOKEN",
            },
            {
              description:
                "Optional override for the Joplin Web Clipper base URL (default http://localhost:41184)",
              format: "string",
              name: "JOPLIN_URL",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/alondmnt/joplin-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.andrasfe/vulnicheck",
      name: "io.github.andrasfe/vulnicheck",
      description:
        "HTTP MCP Server for comprehensive Python vulnerability scanning and security analysis.",
      version: "0.1.0",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "andrasfe/vulnicheck",
          version: "main",
          transport: {
            type: "streamable-http",
            url: "http://localhost:3000/mcp",
          },
          environmentVariables: [
            {
              description:
                "API key for NIST National Vulnerability Database (increases rate limit from 5 to 50 requests per 30 seconds)",
              format: "string",
              isSecret: true,
              name: "NVD_API_KEY",
            },
            {
              description:
                "GitHub token for Advisory Database access (increases rate limit to 5000 requests per hour)",
              format: "string",
              isSecret: true,
              name: "GITHUB_TOKEN",
            },
            {
              description:
                "OpenAI API key for LLM-based risk assessment in MCP passthrough operations",
              format: "string",
              isSecret: true,
              name: "OPENAI_API_KEY",
            },
            {
              description:
                "Anthropic API key for LLM-based risk assessment (alternative to OpenAI)",
              format: "string",
              isSecret: true,
              name: "ANTHROPIC_API_KEY",
            },
            {
              description: "Port for MCP HTTP server (default: 3000)",
              format: "number",
              name: "MCP_PORT",
            },
            {
              description:
                "Cache time-to-live in seconds for vulnerability data (default: 900)",
              format: "number",
              name: "CACHE_TTL",
            },
            {
              description:
                "Enable HTTP-only mode with MCP client delegation (true/false, default: auto-detect)",
              format: "string",
              name: "VULNICHECK_HTTP_ONLY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/andrasfe/vulnicheck",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.antuelle78/weather-mcp",
      name: "io.github.antuelle78/weather-mcp",
      description: "A simple MCP server for getting weather information.",
      version: "1.0.0",
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.antvis/mcp-server-chart",
      name: "io.github.antvis/mcp-server-chart",
      description:
        "A Model Context Protocol server for generating charts using AntV.",
      version: "1.0.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@antv/mcp-server-chart",
          version: "0.9.0-beta.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Custom chart generation service URL for private deployment",
              format: "string",
              default: "https://antv-studio.alipay.com/api/gpt-vis",
              name: "VIS_REQUEST_SERVER",
            },
            {
              description: "Service identifier for chart generation records",
              format: "string",
              isSecret: true,
              name: "SERVICE_ID",
            },
            {
              description: "Comma-separated list of tool names to disable",
              format: "string",
              name: "DISABLED_TOOLS",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/antvis/mcp-server-chart",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.anyproto/anytype-mcp",
      name: "io.github.anyproto/anytype-mcp",
      description:
        "Official MCP server for Anytype API - your encrypted, local and collaborative wiki.",
      version: "1.0.7",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@anyproto/anytype-mcp",
          version: "1.0.7",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                'JSON string of headers for Anytype API. Example: {"Authorization":"Bearer <YOUR_API_KEY>", "Anytype-Version":"2025-05-20"}',
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "OPENAPI_MCP_HEADERS",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/anyproto/anytype-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.appwrite/mcp-for-api",
      name: "io.github.appwrite/mcp-for-api",
      description: "MCP (Model Context Protocol) server for Appwrite",
      version: "0.2.8",
      packages: [
        {
          registryType: "pypi",
          identifier: "mcp-server-appwrite",
          version: "0.2.8",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/appwrite/mcp-for-api",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.arielbk/anki-mcp",
      name: "io.github.arielbk/anki-mcp",
      description:
        "MCP server for integrating with Anki flashcards through conversational AI",
      version: "0.3.2",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@arielbk/anki-mcp",
          version: "0.3.2",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/arielbk/anki-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.augee99/mcp-weather",
      name: "io.github.augee99/mcp-weather",
      description:
        "An MCP server that provides [describe what your server does]",
      version: "1.0.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "mcp-weather-augee99",
          version: "0.1.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/augee99/mcp-weather",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.augmnt/augments-mcp-server",
      name: "io.github.augmnt/augments-mcp-server",
      description:
        "Augments MCP Server - A comprehensive framework documentation provider for Claude Code",
      version: "1.0.2",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "augments-mcp-server",
          version: "1.0.2",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/augmnt/augments-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.b1ff/atlassian-dc-mcp-bitbucket",
      name: "io.github.b1ff/atlassian-dc-mcp-bitbucket",
      description:
        "MCP server for Atlassian Bitbucket Data Center - interact with repositories and code",
      version: "0.9.9",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@atlassian-dc-mcp/bitbucket",
          version: "0.9.9",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Bitbucket host domain (e.g. your-instance.atlassian.net)",
              format: "string",
              name: "BITBUCKET_HOST",
            },
            {
              description:
                "Bitbucket API base path (alternative to BITBUCKET_HOST)",
              format: "string",
              name: "BITBUCKET_API_BASE_PATH",
            },
            {
              description: "Bitbucket Personal Access Token or API token",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "BITBUCKET_API_TOKEN",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/b1ff/atlassian-dc-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.b1ff/atlassian-dc-mcp-confluence",
      name: "io.github.b1ff/atlassian-dc-mcp-confluence",
      description:
        "MCP server for Atlassian Confluence Data Center - access and manage content",
      version: "0.9.9",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@atlassian-dc-mcp/confluence",
          version: "0.9.9",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Confluence host domain (e.g. your-instance.atlassian.net)",
              format: "string",
              name: "CONFLUENCE_HOST",
            },
            {
              description:
                "Confluence API base path (alternative to CONFLUENCE_HOST)",
              format: "string",
              name: "CONFLUENCE_API_BASE_PATH",
            },
            {
              description: "Confluence Personal Access Token or API token",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "CONFLUENCE_API_TOKEN",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/b1ff/atlassian-dc-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.b1ff/atlassian-dc-mcp-jira",
      name: "io.github.b1ff/atlassian-dc-mcp-jira",
      description:
        "MCP server for Atlassian Jira Data Center - search, view, and create issues",
      version: "0.9.9",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@atlassian-dc-mcp/jira",
          version: "0.9.9",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Jira host domain (e.g. your-instance.atlassian.net)",
              format: "string",
              name: "JIRA_HOST",
            },
            {
              description: "Jira API base path (alternative to JIRA_HOST)",
              format: "string",
              name: "JIRA_API_BASE_PATH",
            },
            {
              description: "Jira Personal Access Token or API token",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "JIRA_API_TOKEN",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/b1ff/atlassian-dc-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.bajoski34/mcp-flutterwave",
      name: "io.github.bajoski34/mcp-flutterwave",
      description: "MCP Server to interact with Flutterwave APIs.",
      version: "1.2.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-flutterwave",
          version: "1.2.0",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your SECRET API key for the service",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "FLW_SECRET_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/bajoski34/mcp-flutterwave",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.brave/brave-search-mcp-server",
      name: "io.github.brave/brave-search-mcp-server",
      description:
        "Brave Search MCP Server: web results, images, videos, rich results, AI summaries, and more.",
      version: "2.0.54",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@brave/brave-search-mcp-server",
          version: "2.0.54",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your API key for the service",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "BRAVE_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/brave/brave-search-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.browserbase/mcp-server-browserbase",
      name: "io.github.browserbase/mcp-server-browserbase",
      description:
        "MCP server for AI web browser automation using Browserbase and Stagehand",
      version: "2.1.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@browserbasehq/mcp-server-browserbase",
          version: "2.1.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your Browserbase API key",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "BROWSERBASE_API_KEY",
            },
            {
              description: "Your Browserbase Project ID",
              isRequired: true,
              format: "string",
              name: "BROWSERBASE_PROJECT_ID",
            },
            {
              description: "Your Gemini API key (default model)",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "GEMINI_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/browserbase/mcp-server-browserbase",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.buildkite/buildkite-mcp-server",
      name: "io.github.buildkite/buildkite-mcp-server",
      description:
        "MCP server exposing Buildkite API data (pipelines, builds, jobs, tests) to AI tooling and editors.",
      version: "0.7.0",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://ghcr.io",
          identifier: "buildkite/buildkite-mcp-server",
          version: "0.7.0",
          runtimeHint: "docker",
          transport: {
            type: "stdio",
          },
          runtimeArguments: [
            {
              description: "The runtime command to execute",
              value: "run",
              type: "positional",
            },
            {
              description: "Run container in interactive mode",
              type: "named",
              name: "-i",
            },
            {
              description: "Automatically remove the container when it exits",
              type: "named",
              name: "--rm",
            },
            {
              description: "Set an environment variable in the runtime",
              type: "named",
              name: "-e",
            },
            {
              description: "Environment variable name",
              value: "BUILDKITE_API_TOKEN",
              type: "positional",
            },
            {
              description: "The container image to run",
              value: "ghcr.io/buildkite/buildkite-mcp-server:0.7.0",
              type: "positional",
            },
          ],
          environmentVariables: [
            {
              description:
                "Buildkite API token for authentication. Get one from https://buildkite.com/user/api-access-tokens",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "BUILDKITE_API_TOKEN",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/buildkite/buildkite-mcp-server",
        source: "github",
        id: "962909011",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.burningion/video-editing-mcp",
      name: "io.github.burningion/video-editing-mcp",
      description:
        "MCP Server for Video Jungle - Analyze, Search, Generate, and Edit Videos",
      version: "1.0.1",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "video-editor-mcp",
          version: "1.0.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Video Jungle API Key (found at https://www.video-jungle.com/user/settings)",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "VJ_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/burningion/video-editing-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.bytedance/mcp-server-browser",
      name: "io.github.bytedance/mcp-server-browser",
      description: "MCP server for browser use access",
      version: "1.0.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@agent-infra/mcp-server-browser",
          version: "latest",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              description:
                "browser or chrome channel to use, possible values: chrome, edge, firefox.",
              format: "string",
              type: "named",
              name: "browser",
            },
            {
              description: "Chrome DevTools Protocol endpoint URL",
              format: "string",
              type: "named",
              name: "cdp-endpoint",
            },
            {
              description: "WebSocket endpoint to connect to, for example",
              format: "string",
              type: "named",
              name: "ws-endpoint",
            },
            {
              description: "Path to the browser executable",
              format: "string",
              type: "named",
              name: "executable-path",
            },
            {
              description: "Path to the output directory",
              format: "string",
              type: "named",
              name: "output-dir",
            },
            {
              description:
                "Comma-separated list of patterns to bypass the proxy",
              format: "string",
              type: "named",
              name: "proxy-bypass",
            },
            {
              description: "Proxy server address",
              format: "string",
              type: "named",
              name: "proxy-server",
            },
            {
              description:
                "Run server that uses screenshots (Aria snapshots are used by default)",
              format: "boolean",
              type: "named",
              name: "vision",
            },
          ],
          environmentVariables: [
            {
              description: "DISPLAY environment variable for browser rendering",
              format: "string",
              name: "DISPLAY",
            },
          ],
        },
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@agent-infra/mcp-server-browser",
          version: "latest",
          runtimeHint: "npx",
          transport: {
            type: "sse",
            url: "http://127.0.0.1:{port}/sse",
          },
          packageArguments: [
            {
              description: "Server port number",
              isRequired: true,
              format: "number",
              default: "8089",
              type: "named",
              name: "port",
            },
            {
              description:
                "browser or chrome channel to use, possible values: chrome, edge, firefox.",
              format: "string",
              type: "named",
              name: "browser",
            },
            {
              description: "Chrome DevTools Protocol endpoint URL",
              format: "string",
              type: "named",
              name: "cdp-endpoint",
            },
            {
              description: "WebSocket endpoint to connect to, for example",
              format: "string",
              type: "named",
              name: "ws-endpoint",
            },
            {
              description: "Path to the browser executable",
              format: "string",
              type: "named",
              name: "executable-path",
            },
            {
              description: "Path to the output directory",
              format: "string",
              type: "named",
              name: "output-dir",
            },
            {
              description:
                "Comma-separated list of patterns to bypass the proxy",
              format: "string",
              type: "named",
              name: "proxy-bypass",
            },
            {
              description: "Proxy server address",
              format: "string",
              type: "named",
              name: "proxy-server",
            },
            {
              description:
                "Run server that uses screenshots (Aria snapshots are used by default)",
              format: "boolean",
              type: "named",
              name: "vision",
            },
          ],
          environmentVariables: [
            {
              description: "DISPLAY environment variable for browser rendering",
              format: "string",
              name: "DISPLAY",
            },
          ],
        },
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@agent-infra/mcp-server-browser",
          version: "latest",
          runtimeHint: "npx",
          transport: {
            type: "streamable-http",
            url: "http://127.0.0.1:{port}/mcp",
          },
          packageArguments: [
            {
              description: "Server port number",
              isRequired: true,
              format: "number",
              default: "8089",
              type: "named",
              name: "port",
            },
            {
              description:
                "browser or chrome channel to use, possible values: chrome, edge, firefox.",
              format: "string",
              type: "named",
              name: "browser",
            },
            {
              description: "Chrome DevTools Protocol endpoint URL",
              format: "string",
              type: "named",
              name: "cdp-endpoint",
            },
            {
              description: "WebSocket endpoint to connect to, for example",
              format: "string",
              type: "named",
              name: "ws-endpoint",
            },
            {
              description: "Path to the browser executable",
              format: "string",
              type: "named",
              name: "executable-path",
            },
            {
              description: "Path to the output directory",
              format: "string",
              type: "named",
              name: "output-dir",
            },
            {
              description:
                "Comma-separated list of patterns to bypass the proxy",
              format: "string",
              type: "named",
              name: "proxy-bypass",
            },
            {
              description: "Proxy server address",
              format: "string",
              type: "named",
              name: "proxy-server",
            },
            {
              description:
                "Run server that uses screenshots (Aria snapshots are used by default)",
              format: "boolean",
              type: "named",
              name: "vision",
            },
          ],
          environmentVariables: [
            {
              description: "DISPLAY environment variable for browser rendering",
              format: "string",
              name: "DISPLAY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/bytedance/UI-TARS-desktop",
        source: "github",
        subfolder: "packages/agent-infra/mcp-servers/browser",
      },
      transports: {
        stdio: true,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.bytedance/mcp-server-commands",
      name: "io.github.bytedance/mcp-server-commands",
      description: "An MCP server to run arbitrary commands",
      version: "1.0.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@agent-infra/mcp-server-commands",
          version: "latest",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              description: "current working directory",
              format: "string",
              type: "named",
              name: "cwd",
            },
          ],
        },
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@agent-infra/mcp-server-commands",
          version: "latest",
          runtimeHint: "npx",
          transport: {
            type: "sse",
            url: "http://127.0.0.1:{port}/sse",
          },
          packageArguments: [
            {
              description: "current working directory",
              format: "string",
              type: "named",
              name: "cwd",
            },
            {
              description: "Server port number",
              isRequired: true,
              format: "number",
              default: "8089",
              type: "named",
              name: "port",
            },
          ],
        },
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@agent-infra/mcp-server-commands",
          version: "latest",
          runtimeHint: "npx",
          transport: {
            type: "streamable-http",
            url: "http://127.0.0.1:{port}/mcp",
          },
          runtimeArguments: [
            {
              description: "current working directory",
              format: "string",
              type: "named",
              name: "cwd",
            },
          ],
          packageArguments: [
            {
              description: "Server port number",
              isRequired: true,
              format: "number",
              default: "8089",
              type: "named",
              name: "port",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/bytedance/UI-TARS-desktop",
        source: "github",
        subfolder: "packages/agent-infra/mcp-servers/commands",
      },
      transports: {
        stdio: true,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.bytedance/mcp-server-filesystem",
      name: "io.github.bytedance/mcp-server-filesystem",
      description: "MCP server for filesystem access",
      version: "1.0.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@agent-infra/mcp-server-filesystem",
          version: "latest",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              description:
                "Comma-separated list of allowed directories for file operations",
              isRequired: true,
              format: "string",
              type: "named",
              name: "allowed-directories",
            },
          ],
        },
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@agent-infra/mcp-server-filesystem",
          version: "latest",
          runtimeHint: "npx",
          transport: {
            type: "sse",
            url: "http://127.0.0.1:{port}/sse",
          },
          packageArguments: [
            {
              description:
                "Comma-separated list of allowed directories for file operations",
              isRequired: true,
              format: "string",
              type: "named",
              name: "allowed-directories",
            },
            {
              description: "Server port number",
              isRequired: true,
              format: "number",
              default: "8089",
              type: "named",
              name: "port",
            },
          ],
        },
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@agent-infra/mcp-server-filesystem",
          version: "latest",
          runtimeHint: "npx",
          transport: {
            type: "streamable-http",
            url: "http://127.0.0.1:{port}/mcp",
          },
          packageArguments: [
            {
              description:
                "Comma-separated list of allowed directories for file operations",
              isRequired: true,
              format: "string",
              type: "named",
              name: "allowed-directories",
            },
            {
              description: "Server port number",
              isRequired: true,
              format: "number",
              default: "8089",
              type: "named",
              name: "port",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/bytedance/UI-TARS-desktop",
        source: "github",
        subfolder: "packages/agent-infra/mcp-servers/filesystem",
      },
      transports: {
        stdio: true,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.bytedance/mcp-server-search",
      name: "io.github.bytedance/mcp-server-search",
      description: "MCP server for web search operations",
      version: "1.0.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@agent-infra/mcp-server-search",
          version: "latest",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              description:
                "Search engine to use for browser search (default: google)",
              format: "string",
              default: "google",
              type: "named",
              name: "engine",
            },
            {
              description: "API key for the search provider",
              format: "string",
              type: "named",
              name: "api-key",
            },
            {
              description: "Base URL for the search provider",
              format: "string",
              type: "named",
              name: "base-url",
            },
          ],
        },
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@agent-infra/mcp-server-search",
          version: "latest",
          runtimeHint: "npx",
          transport: {
            type: "sse",
            url: "http://127.0.0.1:{port}/sse",
          },
          packageArguments: [
            {
              description:
                "Search engine to use for browser search (default: google)",
              format: "string",
              default: "google",
              type: "named",
              name: "engine",
            },
            {
              description: "API key for the search provider",
              format: "string",
              type: "named",
              name: "api-key",
            },
            {
              description: "Base URL for the search provider",
              format: "string",
              type: "named",
              name: "base-url",
            },
            {
              description: "Server port number",
              isRequired: true,
              format: "number",
              default: "8089",
              type: "named",
              name: "port",
            },
          ],
        },
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@agent-infra/mcp-server-search",
          version: "latest",
          runtimeHint: "npx",
          transport: {
            type: "streamable-http",
            url: "http://127.0.0.1:{port}/mcp",
          },
          packageArguments: [
            {
              description:
                "Search engine to use for browser search (default: google)",
              format: "string",
              default: "google",
              type: "named",
              name: "engine",
            },
            {
              description: "API key for the search provider",
              format: "string",
              type: "named",
              name: "api-key",
            },
            {
              description: "Base URL for the search provider",
              format: "string",
              type: "named",
              name: "base-url",
            },
            {
              description: "Server port number",
              isRequired: true,
              format: "number",
              default: "8089",
              type: "named",
              name: "port",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/bytedance/UI-TARS-desktop",
        source: "github",
        subfolder: "packages/agent-infra/mcp-servers/search",
      },
      transports: {
        stdio: true,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.cameroncooke/XcodeBuildMCP",
      name: "io.github.cameroncooke/XcodeBuildMCP",
      description:
        "XcodeBuildMCP provides tools for Xcode project management, simulator management, and app utilities.",
      version: "1.12.8",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "xcodebuildmcp",
          version: "1.12.8",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/cameroncooke/XcodeBuildMCP",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.carlisia/mcp-factcheck",
      name: "io.github.carlisia/mcp-factcheck",
      description:
        "An MCP server that validates content against MCP specification using semantic search and AI",
      version: "1.0.0",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://ghcr.io",
          identifier: "carlisia/mcp-factcheck",
          version: "v1.0.0",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "OpenAI API key for embedding generation and content validation",
              isRequired: true,
              name: "OPENAI_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/carlisia/mcp-factcheck",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.chris-schra/mcp-funnel",
      name: "io.github.chris-schra/mcp-funnel",
      description:
        "MCP proxy that aggregates multiple servers with tool filtering and customization",
      version: "0.0.7",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-funnel",
          version: "0.0.6",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
          runtimeArguments: [
            {
              value: "-y",
              type: "positional",
            },
          ],
          packageArguments: [
            {
              description: "Optional path to .mcp-funnel.json config file",
              format: "filepath",
              type: "positional",
              valueHint: "config_path",
            },
          ],
          environmentVariables: [
            {
              description: "Alternative way to specify config file path",
              format: "filepath",
              name: "MCP_FUNNEL_CONFIG",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/chris-schra/mcp-funnel",
        source: "github",
        id: "1055597409",
        subfolder: "packages/mcp",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.clappia-dev/clappia-mcp",
      name: "io.github.clappia-dev/clappia-mcp",
      description:
        "An MCP server that provides Clappia workspace, forms, workflows, submissions, and analytics",
      version: "1.0.1",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "okaru413/clappia-mcp",
          version: "1.0.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Clappia API key for authentication",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "CLAPPIA_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/clappia-dev/clappia-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.cloudquery/mcp",
      name: "io.github.cloudquery/mcp",
      description:
        "CloudQuery MCP server for asset inventory data. Supports CLI, PostgreSQL, and Platform modes.",
      version: "1.6.9",
      packages: [
        {
          registryType: "mcpb",
          identifier:
            "https://github.com/cloudquery/mcp-releases/releases/download/v1.6.9/cq-platform-mcp_1.6.9_darwin_arm64.mcpb",
          version: "1.6.9",
          fileSha256:
            "174f039a7ae18ec2fb03243a72209ad2b5388f3ef47b3e843e1f5b418457d60a",
          runtimeHint: "darwin-arm64",
          transport: {
            type: "stdio",
          },
        },
        {
          registryType: "mcpb",
          identifier:
            "https://github.com/cloudquery/mcp-releases/releases/download/v1.6.9/cq-platform-mcp_1.6.9_darwin_amd64.mcpb",
          version: "1.6.9",
          fileSha256:
            "7c13732f1f836520880575f2635e305b2031d0bd7889d1b61bb0443154009d7f",
          runtimeHint: "darwin-amd64",
          transport: {
            type: "stdio",
          },
        },
        {
          registryType: "mcpb",
          identifier:
            "https://github.com/cloudquery/mcp-releases/releases/download/v1.6.9/cq-platform-mcp_1.6.9_linux_arm64.mcpb",
          version: "1.6.9",
          fileSha256:
            "eac79b5dd29bf11c47823ab2c77d64adbdc1170001398c36f172b49b61567123",
          runtimeHint: "linux-arm64",
          transport: {
            type: "stdio",
          },
        },
        {
          registryType: "mcpb",
          identifier:
            "https://github.com/cloudquery/mcp-releases/releases/download/v1.6.9/cq-platform-mcp_1.6.9_linux_amd64.mcpb",
          version: "1.6.9",
          fileSha256:
            "2cee76607b1b3e26eb0e8f083611909cc9a40a61ddf6cdafe43d5076d448f60a",
          runtimeHint: "linux-amd64",
          transport: {
            type: "stdio",
          },
        },
        {
          registryType: "mcpb",
          identifier:
            "https://github.com/cloudquery/mcp-releases/releases/download/v1.6.9/cq-platform-mcp_1.6.9_windows_amd64.mcpb",
          version: "1.6.9",
          fileSha256:
            "19470e7e2a37abdee17194c71ff24f38c88fa8a6136f13db4b8dc4f11346c320",
          runtimeHint: "windows-amd64",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.cmpxchg16/mcp-ethical-hacking",
      name: "io.github.cmpxchg16/mcp-ethical-hacking",
      description: "An MCP server that provides LinkedIn & Reddit data",
      version: "1.4.0",
      packages: [
        {
          registryType: "mcpb",
          identifier:
            "https://github.com/cmpxchg16/mcp-ethical-hacking/releases/download/v1.4.0/server.mcpb",
          version: "1.4.0",
          fileSha256:
            "5e4f25e7f21b62974861f055cff90c1aef80d3b8bd1f32e05db744d1cbd67605",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/cmpxchg16/mcp-ethical-hacking",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.compl-i-agent/csf",
      name: "io.github.compl-i-agent/csf",
      description:
        "NIST CSF 2.0 - Professional cybersecurity framework with 35 tools and 12 prompts",
      websiteUrl: "https://compl-i-agent.github.io/csf",
      version: "2.4.6",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@compligent-mcp/csf",
          version: "2.4.6",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/compligent/mcp-platform",
        source: "github",
        subfolder: "platform/servers/clients/csf-cli",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.containers/kubernetes-mcp-server",
      name: "io.github.containers/kubernetes-mcp-server",
      description:
        "An MCP server that provides [describe what your server does]",
      version: "1.0.0",
      repository: {
        url: "https://github.com/containers/kubernetes-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.copyleftdev/fabric-atelier",
      name: "io.github.copyleftdev/fabric-atelier",
      description:
        "AI-powered content processing with 226 Fabric patterns for writing, analysis, and code generation.",
      version: "0.1.2",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "copyleftdev/fabric-atelier",
          version: "0.1.2",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/copyleftdev/fabric-atelier.git",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.cr7258/elasticsearch-mcp-server",
      name: "io.github.cr7258/elasticsearch-mcp-server",
      description: "MCP server for interacting with Elasticsearch",
      version: "2.0.15",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "elasticsearch-mcp-server",
          version: "2.0.15",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Comma-separated list of Elasticsearch hosts (e.g., https://localhost:9200)",
              format: "string",
              default: "https://localhost:9200",
              name: "ELASTICSEARCH_HOSTS",
            },
            {
              description:
                "API key for Elasticsearch or Elastic Cloud authentication (recommended)",
              format: "string",
              isSecret: true,
              name: "ELASTICSEARCH_API_KEY",
            },
            {
              description:
                "Username for basic authentication (alternative to API key)",
              format: "string",
              name: "ELASTICSEARCH_USERNAME",
            },
            {
              description:
                "Password for basic authentication (used with ELASTICSEARCH_USERNAME)",
              format: "string",
              isSecret: true,
              name: "ELASTICSEARCH_PASSWORD",
            },
            {
              description: "Whether to verify SSL certificates (true/false)",
              format: "boolean",
              default: "false",
              name: "ELASTICSEARCH_VERIFY_CERTS",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/cr7258/elasticsearch-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.croit/mcp-croit-ceph",
      name: "io.github.croit/mcp-croit-ceph",
      description:
        "MCP server for Croit Ceph cluster management with dynamic OpenAPI tool generation",
      version: "0.2.16",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "croit/mcp-croit-ceph",
          version: "0.2.16",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Croit cluster URL (e.g., http://your-cluster.croit.io:8080)",
              name: "CROIT_HOST",
            },
            {
              description: "API authentication token for Croit cluster",
              name: "CROIT_API_TOKEN",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/croit/mcp-croit-ceph",
        source: "github",
        id: "1058156155",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.cyanheads/clinicaltrialsgov-mcp-server",
      name: "io.github.cyanheads/clinicaltrialsgov-mcp-server",
      description:
        "Provides rich tools to search, retrieve, and analyze data from ClinicalTrials.gov API v2.",
      version: "1.4.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "clinicaltrialsgov-mcp-server",
          version: "1.4.0",
          runtimeHint: "bun",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              value: "run",
              type: "positional",
            },
            {
              value: "start:stdio",
              type: "positional",
            },
          ],
          environmentVariables: [
            {
              description:
                "Sets the minimum log level for output (e.g., 'debug', 'info', 'warn', 'error').",
              format: "string",
              default: "info",
              name: "MCP_LOG_LEVEL",
            },
            {
              description:
                "Storage provider type: 'in-memory', 'filesystem', 'supabase', 'cloudflare-r2', or 'cloudflare-kv'.",
              format: "string",
              default: "in-memory",
              name: "STORAGE_PROVIDER_TYPE",
            },
          ],
        },
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "clinicaltrialsgov-mcp-server",
          version: "1.4.0",
          runtimeHint: "bun",
          transport: {
            type: "streamable-http",
            url: "http://localhost:3000/mcp",
          },
          packageArguments: [
            {
              value: "run",
              type: "positional",
            },
            {
              value: "start:http",
              type: "positional",
            },
          ],
          environmentVariables: [
            {
              description: "The hostname for the HTTP server.",
              format: "string",
              default: "127.0.0.1",
              name: "MCP_HTTP_HOST",
            },
            {
              description: "The port to run the HTTP server on.",
              format: "string",
              default: "3017",
              name: "MCP_HTTP_PORT",
            },
            {
              description: "The endpoint path for the MCP server.",
              format: "string",
              default: "/mcp",
              name: "MCP_HTTP_ENDPOINT_PATH",
            },
            {
              description:
                "Authentication mode to use: 'none', 'jwt', or 'oauth'.",
              format: "string",
              default: "none",
              name: "MCP_AUTH_MODE",
            },
            {
              description:
                "Sets the minimum log level for output (e.g., 'debug', 'info', 'warn', 'error').",
              format: "string",
              default: "info",
              name: "MCP_LOG_LEVEL",
            },
            {
              description:
                "Storage provider type: 'in-memory', 'filesystem', 'supabase', 'cloudflare-r2', or 'cloudflare-kv'.",
              format: "string",
              default: "in-memory",
              name: "STORAGE_PROVIDER_TYPE",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/cyanheads/clinicaltrialsgov-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.cyanheads/git-mcp-server",
      name: "io.github.cyanheads/git-mcp-server",
      description:
        "Comprehensive Git MCP server enabling native git tools including clone, commit, worktree, & more.",
      version: "2.4.6",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@cyanheads/git-mcp-server",
          version: "2.4.6",
          runtimeHint: "bun",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              value: "run",
              type: "positional",
            },
            {
              value: "start:stdio",
              type: "positional",
            },
          ],
          environmentVariables: [
            {
              description:
                "Sets the minimum log level for output (e.g., 'debug', 'info', 'warn').",
              format: "string",
              default: "info",
              name: "MCP_LOG_LEVEL",
            },
            {
              description:
                "Optional absolute path to restrict all git operations to a specific directory tree. Provides security sandboxing for multi-tenant or shared environments.",
              format: "string",
              name: "GIT_BASE_DIR",
            },
          ],
        },
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@cyanheads/git-mcp-server",
          version: "2.4.6",
          runtimeHint: "bun",
          transport: {
            type: "streamable-http",
            url: "http://localhost:3015/mcp",
          },
          packageArguments: [
            {
              value: "run",
              type: "positional",
            },
            {
              value: "start:http",
              type: "positional",
            },
          ],
          environmentVariables: [
            {
              description: "The hostname for the HTTP server.",
              format: "string",
              default: "127.0.0.1",
              name: "MCP_HTTP_HOST",
            },
            {
              description: "The port to run the HTTP server on.",
              format: "string",
              default: "3015",
              name: "MCP_HTTP_PORT",
            },
            {
              description: "The endpoint path for the MCP server.",
              format: "string",
              default: "/mcp",
              name: "MCP_HTTP_ENDPOINT_PATH",
            },
            {
              description:
                "Authentication mode to use: 'none', 'jwt', or 'oauth'.",
              format: "string",
              default: "none",
              name: "MCP_AUTH_MODE",
            },
            {
              description:
                "Sets the minimum log level for output (e.g., 'debug', 'info', 'warn').",
              format: "string",
              default: "info",
              name: "MCP_LOG_LEVEL",
            },
            {
              description:
                "Optional absolute path to restrict all git operations to a specific directory tree. Provides security sandboxing for multi-tenant or shared environments.",
              format: "string",
              name: "GIT_BASE_DIR",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/cyanheads/git-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.cyanheads/mcp-ts-template",
      name: "io.github.cyanheads/mcp-ts-template",
      description:
        "A production-grade TypeScript template for scalable MCP servers with built-in observability.",
      version: "2.3.6",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-ts-template",
          version: "2.3.6",
          runtimeHint: "bun",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              value: "run",
              type: "positional",
            },
            {
              value: "start:stdio",
              type: "positional",
            },
          ],
          environmentVariables: [
            {
              description:
                "Sets the minimum log level for output (e.g., 'debug', 'info', 'warn').",
              format: "string",
              default: "info",
              name: "MCP_LOG_LEVEL",
            },
          ],
        },
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-ts-template",
          version: "2.3.6",
          runtimeHint: "bun",
          transport: {
            type: "streamable-http",
            url: "http://localhost:3010/mcp",
          },
          packageArguments: [
            {
              value: "run",
              type: "positional",
            },
            {
              value: "start:http",
              type: "positional",
            },
          ],
          environmentVariables: [
            {
              description: "The hostname for the HTTP server.",
              format: "string",
              default: "127.0.0.1",
              name: "MCP_HTTP_HOST",
            },
            {
              description: "The port to run the HTTP server on.",
              format: "string",
              default: "3010",
              name: "MCP_HTTP_PORT",
            },
            {
              description: "The endpoint path for the MCP server.",
              format: "string",
              default: "/mcp",
              name: "MCP_HTTP_ENDPOINT_PATH",
            },
            {
              description:
                "Authentication mode to use: 'none', 'jwt', or 'oauth'.",
              format: "string",
              default: "none",
              name: "MCP_AUTH_MODE",
            },
            {
              description:
                "Sets the minimum log level for output (e.g., 'debug', 'info', 'warn').",
              format: "string",
              default: "info",
              name: "MCP_LOG_LEVEL",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/cyanheads/mcp-ts-template",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.cyanheads/protein-mcp-server",
      name: "io.github.cyanheads/protein-mcp-server",
      description:
        "MCP Server for 3D protein structural data retrieval & analysis from RCSB PDB, PDBe, and UniProt.",
      version: "1.0.3",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "protein-mcp-server",
          version: "1.0.3",
          runtimeHint: "bun",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              value: "run",
              type: "positional",
            },
            {
              value: "start:stdio",
              type: "positional",
            },
          ],
          environmentVariables: [
            {
              description:
                "Sets the minimum log level for output (e.g., 'debug', 'info', 'warn').",
              format: "string",
              default: "info",
              name: "MCP_LOG_LEVEL",
            },
          ],
        },
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "protein-mcp-server",
          version: "1.0.3",
          runtimeHint: "bun",
          transport: {
            type: "streamable-http",
            url: "http://localhost:3010/mcp",
          },
          packageArguments: [
            {
              value: "run",
              type: "positional",
            },
            {
              value: "start:http",
              type: "positional",
            },
          ],
          environmentVariables: [
            {
              description: "The hostname for the HTTP server.",
              format: "string",
              default: "127.0.0.1",
              name: "MCP_HTTP_HOST",
            },
            {
              description: "The port to run the HTTP server on.",
              format: "string",
              default: "3010",
              name: "MCP_HTTP_PORT",
            },
            {
              description: "The endpoint path for the MCP server.",
              format: "string",
              default: "/mcp",
              name: "MCP_HTTP_ENDPOINT_PATH",
            },
            {
              description:
                "Authentication mode to use: 'none', 'jwt', or 'oauth'.",
              format: "string",
              default: "none",
              name: "MCP_AUTH_MODE",
            },
            {
              description:
                "Sets the minimum log level for output (e.g., 'debug', 'info', 'warn').",
              format: "string",
              default: "info",
              name: "MCP_LOG_LEVEL",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/cyanheads/protein-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.cyanheads/pubmed-mcp-server",
      name: "io.github.cyanheads/pubmed-mcp-server",
      description:
        "Comprehensive PubMed MCP Server to search, retrieve, and analyze biomedical literature from NCBI.",
      version: "1.4.5",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@cyanheads/pubmed-mcp-server",
          version: "1.4.5",
          runtimeHint: "bun",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              value: "run",
              type: "positional",
            },
            {
              value: "start:stdio",
              type: "positional",
            },
          ],
          environmentVariables: [
            {
              description:
                "Sets the minimum log level for output (e.g., 'debug', 'info', 'warn').",
              format: "string",
              default: "info",
              name: "MCP_LOG_LEVEL",
            },
            {
              description: "Your NCBI API key for higher rate limits.",
              format: "string",
              name: "NCBI_API_KEY",
            },
          ],
        },
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@cyanheads/pubmed-mcp-server",
          version: "1.4.5",
          runtimeHint: "bun",
          transport: {
            type: "streamable-http",
            url: "http://localhost:3017/mcp",
          },
          packageArguments: [
            {
              value: "run",
              type: "positional",
            },
            {
              value: "start:http",
              type: "positional",
            },
          ],
          environmentVariables: [
            {
              description: "The host for the HTTP server.",
              format: "string",
              default: "localhost",
              name: "MCP_HTTP_HOST",
            },
            {
              description: "The port for the HTTP server.",
              format: "string",
              default: "3017",
              name: "MCP_HTTP_PORT",
            },
            {
              description: "The endpoint path for MCP requests.",
              format: "string",
              default: "/mcp",
              name: "MCP_HTTP_ENDPOINT_PATH",
            },
            {
              description: "Authentication mode: 'none', 'jwt', or 'oauth'.",
              format: "string",
              default: "none",
              name: "MCP_AUTH_MODE",
            },
            {
              description:
                "Sets the minimum log level (e.g., 'debug', 'info', 'warn').",
              format: "string",
              default: "info",
              name: "MCP_LOG_LEVEL",
            },
            {
              description: "Your NCBI API key for higher rate limits.",
              format: "string",
              name: "NCBI_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/cyanheads/pubmed-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.cyanheads/survey-mcp-server",
      name: "io.github.cyanheads/survey-mcp-server",
      description:
        "MCP server for conducting dynamic, conversational surveys with structured data collection.",
      version: "1.0.4",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@cyanheads/survey-mcp-server",
          version: "1.0.4",
          runtimeHint: "bun",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              value: "run",
              type: "positional",
            },
            {
              value: "start:stdio",
              type: "positional",
            },
          ],
          environmentVariables: [
            {
              description:
                "Sets the minimum log level for output (e.g., 'debug', 'info', 'warn').",
              format: "string",
              default: "info",
              name: "MCP_LOG_LEVEL",
            },
            {
              description:
                "Path to the directory containing survey definition files.",
              format: "string",
              default: "./surveys",
              name: "SURVEY_DEFINITIONS_PATH",
            },
            {
              description:
                "Path to the directory where survey responses are stored.",
              format: "string",
              default: "./storage/responses",
              name: "SURVEY_RESPONSES_PATH",
            },
          ],
        },
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@cyanheads/survey-mcp-server",
          version: "1.0.4",
          runtimeHint: "bun",
          transport: {
            type: "streamable-http",
            url: "http://localhost:3010/mcp",
          },
          packageArguments: [
            {
              value: "run",
              type: "positional",
            },
            {
              value: "start:http",
              type: "positional",
            },
          ],
          environmentVariables: [
            {
              description: "The hostname for the HTTP server.",
              format: "string",
              default: "127.0.0.1",
              name: "MCP_HTTP_HOST",
            },
            {
              description: "The port to run the HTTP server on.",
              format: "string",
              default: "3010",
              name: "MCP_HTTP_PORT",
            },
            {
              description: "The endpoint path for the MCP server.",
              format: "string",
              default: "/mcp",
              name: "MCP_HTTP_ENDPOINT_PATH",
            },
            {
              description:
                "Authentication mode to use: 'none', 'jwt', or 'oauth'.",
              format: "string",
              default: "none",
              name: "MCP_AUTH_MODE",
            },
            {
              description:
                "Sets the minimum log level for output (e.g., 'debug', 'info', 'warn').",
              format: "string",
              default: "info",
              name: "MCP_LOG_LEVEL",
            },
            {
              description:
                "Path to the directory containing survey definition files.",
              format: "string",
              default: "./surveys",
              name: "SURVEY_DEFINITIONS_PATH",
            },
            {
              description:
                "Path to the directory where survey responses are stored.",
              format: "string",
              default: "./storage/responses",
              name: "SURVEY_RESPONSES_PATH",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/cyanheads/survey-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.dba-i/mssql-dba",
      name: "io.github.dba-i/mssql-dba",
      description:
        "An MCP server that provides [describe what your server does]",
      version: "1.0.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mssql-dba",
          version: "1.0.0",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your API key for the service",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "YOUR_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/dba-i/mssql-dba",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.delorenj/mcp-server-trello",
      name: "io.github.delorenj/mcp-server-trello",
      description:
        "MCP server for Trello boards with rate limiting, type safety, and comprehensive API integration.",
      websiteUrl: "https://delorenj.github.io/mcp-server-trello",
      version: "1.5.6",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@delorenj/mcp-server-trello",
          version: "1.5.6",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your Trello API key",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "TRELLO_API_KEY",
            },
            {
              description: "Your Trello token",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "TRELLO_TOKEN",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/delorenj/mcp-server-trello",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.dockersamples/mcp-docker-release-information",
      name: "io.github.dockersamples/mcp-docker-release-information",
      description:
        "MCP server providing Docker Desktop release notes and security information.",
      version: "0.3.0",
      packages: [
        {
          registryType: "oci",
          identifier: "dockersamples/mcp-docker-release-information",
          version: "0.3.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/dockersamples/mcp-docker-release-information",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.domdomegg/airtable-mcp-server",
      name: "io.github.domdomegg/airtable-mcp-server",
      description:
        "Read and write access to Airtable database schemas, tables, and records.",
      version: "1.7.3",
      packages: [
        {
          registryType: "npm",
          identifier: "airtable-mcp-server",
          version: "1.7.3",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Airtable personal access token (e.g., pat123.abc123). Create at https://airtable.com/create/tokens/new with scopes: schema.bases:read, data.records:read, and optionally schema.bases:write and data.records:write.",
              isRequired: true,
              isSecret: true,
              name: "AIRTABLE_API_KEY",
            },
          ],
        },
        {
          registryType: "oci",
          identifier: "domdomegg/airtable-mcp-server",
          version: "1.7.3",
          runtimeHint: "docker",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Airtable personal access token (e.g., pat123.abc123). Create at https://airtable.com/create/tokens/new with scopes: schema.bases:read, data.records:read, and optionally schema.bases:write and data.records:write.",
              isRequired: true,
              isSecret: true,
              name: "AIRTABLE_API_KEY",
            },
          ],
        },
        {
          registryType: "mcpb",
          identifier:
            "https://github.com/domdomegg/airtable-mcp-server/releases/download/v1.7.3/airtable-mcp-server.mcpb",
          version: "1.7.3",
          fileSha256:
            "0f28a9129cfebd262dfb77854c872355d21401bb3e056575b3027081f5d570ca",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/domdomegg/airtable-mcp-server.git",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.domdomegg/time-mcp-nuget",
      name: "io.github.domdomegg/time-mcp-nuget",
      description: "Get the current UTC time in RFC 3339 format.",
      version: "1.0.8",
      packages: [
        {
          registryType: "nuget",
          identifier: "TimeMcpServer",
          version: "1.0.8",
          runtimeHint: "dnx",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/domdomegg/time-mcp-nuget.git",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.domdomegg/time-mcp-pypi",
      name: "io.github.domdomegg/time-mcp-pypi",
      description: "Get the current UTC time in RFC 3339 format.",
      version: "1.0.6",
      packages: [
        {
          registryType: "pypi",
          identifier: "time-mcp-pypi",
          version: "1.0.6",
          runtimeHint: "python",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/domdomegg/time-mcp-pypi.git",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.dubuqingfeng/gitlab-mcp-server",
      name: "io.github.dubuqingfeng/gitlab-mcp-server",
      description: "GitLab MCP (Model Context Protocol) server for AI agents",
      version: "1.0.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@dubuqingfeng/gitlab-mcp-server",
          version: "2.0.12",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your API key for the gitlab",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "GITLAB_TOKEN",
            },
            {
              description: "Gitlab URL",
              format: "string",
              name: "GITLAB_URL",
            },
            {
              description: "Lark 机器人 Webhook URL",
              format: "string",
              isSecret: true,
              name: "LARK_WEBHOOK_URL",
            },
            {
              description: "可选：签名密钥（如果机器人启用了签名验证）",
              format: "string",
              isSecret: true,
              name: "LARK_SECRET_KEY",
            },
            {
              description: "可选：是否启用通知，默认为 true",
              format: "boolean",
              name: "LARK_ENABLE_NOTIFICATION",
            },
            {
              description:
                "可选：通知模式 - gitlab_only(仅GitLab)、lark_only(仅Lark)、both(两者都发)，默认为 gitlab_only",
              format: "string",
              name: "GITLAB_NOTE_MODE",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/dubuqingfeng/gitlab-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.dynatrace-oss/Dynatrace-mcp",
      name: "io.github.dynatrace-oss/Dynatrace-mcp",
      description:
        "Model Context Protocol server for Dynatrace - access logs, events, metrics from Dynatrace via MCP.",
      version: "0.9.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@dynatrace-oss/dynatrace-mcp-server",
          version: "0.9.1",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "The URL of your Dynatrace environment (e.g. 'https://abc12345.apps.dynatrace.com')",
              isRequired: true,
              format: "string",
              name: "DT_ENVIRONMENT",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/dynatrace-oss/Dynatrace-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.edrich13/mcp-jira-server",
      name: "io.github.edrich13/mcp-jira-server",
      description:
        "MCP server for self-hosted Jira instance with Personal Access Token authentication",
      version: "1.0.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-jira-server",
          version: "1.0.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Base URL of your Jira instance (e.g., https://jira.domain.com)",
              isRequired: true,
              format: "string",
              name: "JIRA_BASE_URL",
            },
            {
              description: "Your Jira Personal Access Token",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "JIRA_PAT",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.eghuzefa/engineer-your-data",
      name: "io.github.eghuzefa/engineer-your-data",
      description:
        "MCP server for data engineering: validation, transformation, visualization, and APIs.",
      version: "0.1.3",
      packages: [
        {
          registryType: "pypi",
          identifier: "engineer-your-data",
          version: "0.1.3",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.esrisaudiarabia/arcgis-mcp-server",
      name: "io.github.esrisaudiarabia/arcgis-mcp-server",
      description:
        "Intelligent ArcGIS content search. Works with Online/Enterprise. Requires user credentials.",
      version: "1.0.4",
      packages: [
        {
          registryType: "pypi",
          identifier: "arcgis-mcp-server",
          version: "1.0.4",
          runtimeHint: "python",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Your ArcGIS Portal URL (e.g., https://portal.company.com/portal)",
              isRequired: true,
              format: "string",
              name: "ARCGIS_URL",
            },
            {
              description: "Your ArcGIS Portal Username",
              isRequired: true,
              format: "string",
              name: "ARCGIS_USERNAME",
            },
            {
              description: "Your ArcGIS Portal Password",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "ARCGIS_PASSWORD",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/esrisaudiarabia/esrisaudiarabia-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.estruyf/vscode-demo-time",
      name: "io.github.estruyf/vscode-demo-time",
      description:
        "Enables AI assistants to interact with Demo Time and helps build presentations and demos.",
      version: "0.0.55",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@demotime/mcp",
          version: "0.0.55",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/estruyf/vscode-demo-time",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.fengcl/mcp-sse-demo-02",
      name: "io.github.fengcl/mcp-sse-demo-02",
      description:
        "Spring Boot MCP 服务器（示例占位描述），通过 GHCR 以 OCI 镜像发布至 MCP Registry。",
      version: "0.0.0",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://ghcr.io",
          identifier: "fengcl/mcp-sse-demo-02",
          version: "0.1.5",
          transport: {
            type: "sse",
            url: "http://2d816j6296.uicp.fun/mcp/sse",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.flarco/sling-cli",
      name: "io.github.flarco/sling-cli",
      description:
        "Sling CLI MCP server for data pipeline and replication management",
      version: "1.4.24",
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.fliptheweb/yazio-mcp",
      name: "io.github.fliptheweb/yazio-mcp",
      description:
        "MCP server for accessing Yazio user & nutrition data (unofficial)",
      version: "0.0.5",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "yazio-mcp",
          version: "0.0.5",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Yazio Username",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "YAZIO_USERNAME",
            },
            {
              description: "Yazio Password",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "YAZIO_PASSWORD",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/fliptheweb/yazio-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.florentine-ai/mcp",
      name: "io.github.florentine-ai/mcp",
      description:
        "MCP server for Florentine.ai - Natural language to MongoDB aggregations",
      version: "0.2.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@florentine-ai/mcp",
          version: "0.2.1",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
          runtimeArguments: [
            {
              isRequired: true,
              value: "@florentine-ai/mcp@latest",
              type: "named",
              name: "-y",
            },
          ],
          packageArguments: [
            {
              description:
                "The mode to run the MCP server in ('static' or 'dynamic')",
              isRequired: true,
              value: "static",
              type: "named",
              name: "--mode",
            },
            {
              description: "Set to true to enable debug logging",
              format: "boolean",
              type: "named",
              name: "--debug",
            },
            {
              description:
                "The path to the log file, must be provided if debug is true",
              format: "filepath",
              type: "named",
              name: "--logpath",
            },
          ],
          environmentVariables: [
            {
              description:
                "Your Florentine.ai API key, get it from https://florentine.ai/dashboard",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "FLORENTINE_TOKEN",
            },
            {
              description:
                "The LLM service to use, one of 'openai', 'anthropic', 'google' or 'deepseek' (must only be provided if you did not set it in your Florentine.ai account)",
              format: "string",
              name: "LLM_SERVICE",
            },
            {
              description:
                "Your API key for the LLM service (must only be provided if you did not set it in your Florentine.ai account)",
              format: "string",
              isSecret: true,
              name: "LLM_KEY",
            },
            {
              description:
                "Session ID for maintaining server-side context across requests",
              format: "string",
              name: "SESSION_ID",
            },
            {
              description:
                "Stringified JSON array of return types for the response",
              format: "string",
              name: "RETURN_TYPES",
            },
            {
              description:
                "Stringified JSON array of values for required inputs keys",
              format: "string",
              name: "REQUIRED_INPUTS",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/florentine-ai/mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.formulahendry/code-runner",
      name: "io.github.formulahendry/code-runner",
      description:
        "Code Runner MCP Server which can run code in various programming languages.",
      version: "0.1.9",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-server-code-runner",
          version: "0.1.8",
          transport: {
            type: "stdio",
          },
        },
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "formulahendry/mcp-server-code-runner",
          version: "0.1.8",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/formulahendry/mcp-server-code-runner",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.formulahendry/mcp-server-mcp-registry",
      name: "io.github.formulahendry/mcp-server-mcp-registry",
      description:
        "MCP Server for MCP Registry to discover and search for available MCP servers in the registry",
      version: "0.1.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-server-mcp-registry",
          version: "0.1.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/formulahendry/mcp-server-mcp-registry",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.formulahendry/spec-driven-development",
      name: "io.github.formulahendry/spec-driven-development",
      description:
        "MCP Server that facilitates spec-driven development workflows, not just Vibe Coding.",
      version: "0.1.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-server-spec-driven-development",
          version: "0.1.1",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/formulahendry/mcp-server-spec-driven-development",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.francisco-perez-sorrosal/cv",
      name: "io.github.francisco-perez-sorrosal/cv",
      description:
        "An MCP server that provides access to Francisco Perez-Sorrosal's CV",
      version: "0.0.3",
      packages: [
        {
          registryType: "mcpb",
          identifier:
            "https://github.com/francisco-perez-sorrosal/cv/releases/download/v0.0.3/fps-cv-mcp-0.0.3.mcpb",
          version: "0.0.3",
          fileSha256:
            "d9835e29ee1a95759219f23bb988f71cb9d419b631754fc0ad8ab43b5ff0042e",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/francisco-perez-sorrosal/cv.git",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.gauravfs-14/lit-mcp",
      name: "io.github.gauravfs-14/lit-mcp",
      description:
        "MCP server for academic literature databases (arXiv, DBLP) to accelerate research using LLMs.",
      version: "1.0.0",
      packages: [
        {
          registryType: "pypi",
          identifier: "lit-mcp",
          version: "1.0.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.ggozad/haiku-rag",
      name: "io.github.ggozad/haiku-rag",
      description: "Agentic Retrieval Augmented Generation (RAG) with LanceDB",
      version: "0.11.4",
      repository: {
        url: "https://github.com/ggozad/haiku.rag",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.github/github-mcp-server",
      name: "io.github.github/github-mcp-server",
      description:
        "Connect AI assistants to GitHub - manage repos, issues, PRs, and workflows through natural language.",
      version: "0.18.0",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://ghcr.io",
          identifier: "github/github-mcp-server",
          version: "0.18.0",
          transport: {
            type: "stdio",
          },
          runtimeArguments: [
            {
              description: "The runtime command to execute",
              value: "run",
              type: "positional",
            },
            {
              description: "Run container in interactive mode",
              type: "named",
              name: "-i",
            },
            {
              description: "Automatically remove the container when it exits",
              type: "named",
              name: "--rm",
            },
            {
              description: "Set an environment variable in the runtime",
              type: "named",
              name: "-e",
            },
            {
              description: "Environment variable name",
              value: "GITHUB_PERSONAL_ACCESS_TOKEN",
              type: "positional",
              valueHint: "env_var_name",
            },
            {
              description: "The container image to run",
              value: "ghcr.io/github/github-mcp-server",
              type: "positional",
              valueHint: "image_name",
            },
          ],
          environmentVariables: [
            {
              description:
                "Your GitHub personal access token with appropriate scopes.",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "GITHUB_PERSONAL_ACCESS_TOKEN",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/github/github-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.gjeltep/app-store-connect-mcp",
      name: "io.github.gjeltep/app-store-connect-mcp",
      description: "Interact with Apple's App Store Connect API",
      version: "0.1.1",
      packages: [
        {
          registryType: "pypi",
          identifier: "app-store-connect-mcp",
          version: "0.1.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "App Store Connect API Key ID",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "APP_STORE_KEY_ID",
            },
            {
              description: "App Store Connect Issuer ID",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "APP_STORE_ISSUER_ID",
            },
            {
              description:
                "Path to the .p8 private key file for App Store Connect authentication",
              isRequired: true,
              format: "string",
              name: "APP_STORE_PRIVATE_KEY_PATH",
            },
            {
              description: "Default App ID for operations (optional)",
              format: "string",
              name: "APP_STORE_APP_ID",
            },
            {
              description:
                "Key type: 'team' or 'individual' (defaults to 'team')",
              format: "string",
              name: "APP_STORE_KEY_TYPE",
            },
            {
              description: "Comma-separated list of OAuth scopes (optional)",
              format: "string",
              name: "APP_STORE_SCOPE",
            },
            {
              description: "Subject for individual keys (optional)",
              format: "string",
              name: "APP_STORE_SUBJECT",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/gjeltep/app-store-connect-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.gradion-ai/ipybox",
      name: "io.github.gradion-ai/ipybox",
      description:
        "An MCP server for sandboxed Python code execution with IPython and Docker, and file transfer.",
      version: "0.6.6",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "ipybox",
          version: "0.6.6",
          runtimeHint: "uvx",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              description: "Required MCP server subcommand",
              isRequired: true,
              value: "mcp",
              type: "positional",
            },
            {
              description: "Directory allowed for host filesystem operations",
              type: "named",
              name: "--allowed-dir",
              isRepeated: true,
              valueHint: "directory_path",
            },
            {
              description:
                "Domain, IP address, or CIDR range allowed for outbound network access",
              type: "named",
              name: "--allowed-domain",
              isRepeated: true,
              valueHint: "domain_or_ip",
            },
            {
              description: "Docker image tag to use",
              type: "named",
              name: "--container-tag",
              valueHint: "docker_image_tag",
            },
            {
              description:
                "Environment variable for container (KEY=VALUE format)",
              type: "named",
              name: "--container-env-var",
              isRepeated: true,
              valueHint: "env_var",
            },
            {
              description:
                "Path to file containing container environment variables",
              type: "named",
              name: "--container-env-file",
              valueHint: "file_path",
            },
            {
              description:
                "Bind mount for container (host_path:container_path format)",
              type: "named",
              name: "--container-bind",
              isRepeated: true,
              valueHint: "bind_mount",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/gradion-ai/ipybox",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.grupo-avispa/dsr_mcp_server",
      name: "io.github.grupo-avispa/dsr_mcp_server",
      description:
        "An MCP server that provides tools for interacting with Deep State Representation (DSR) graphs.",
      websiteUrl: "https://grupo-avispa.github.io/dsr_mcp_server/",
      version: "1.0.1",
      repository: {
        url: "https://github.com/grupo-avispa/dsr_mcp_server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.guanqun-yang/mcp-server-r-counter",
      name: "io.github.guanqun-yang/mcp-server-r-counter",
      description: "A MCP Server Counting Number of r's for a Given Query",
      version: "0.0.3",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "mcp-server-r-counter",
          version: "0.0.3",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/guanqun-yang/mcp-server-r-counter",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.habedi/omni-lpr",
      name: "io.github.habedi/omni-lpr",
      description: "An MCP server for automatic license plate recognition",
      version: "0.3.2",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "omni-lpr",
          version: "0.3.2",
          transport: {
            type: "streamable-http",
            url: "http://127.0.0.1:8000/mcp/",
          },
        },
      ],
      repository: {
        url: "https://github.com/habedi/omni-lpr",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.hellocoop/admin-mcp",
      name: "io.github.hellocoop/admin-mcp",
      description: "Model Context Protocol (MCP) for Hellō Admin API.",
      version: "1.5.7",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@hellocoop/admin-mcp",
          version: "1.5.7",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/hellocoop/admin-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.henilcalagiya/google-sheets-mcp",
      name: "io.github.henilcalagiya/google-sheets-mcp",
      description:
        "Powerful tools for automating Google Sheets using Model Context Protocol (MCP)",
      version: "0.1.6",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "google-sheets-mcp",
          version: "0.1.6",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/henilcalagiya/google-sheets-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.henilcalagiya/mcp-apple-notes",
      name: "io.github.henilcalagiya/mcp-apple-notes",
      description:
        "MCP server for Apple Notes integration using AppleScript with full CRUD operations",
      version: "0.1.2",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "mcp-apple-notes",
          version: "0.1.2",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/henilcalagiya/mcp-apple-notes",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.himorishige/hatago-mcp-hub",
      name: "io.github.himorishige/hatago-mcp-hub",
      description:
        "Unified MCP Hub for managing multiple Model Context Protocol servers",
      version: "0.0.16",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@himorishige/hatago-mcp-hub",
          version: "0.0.16",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/himorishige/hatago-mcp-hub",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.humanjesse/textarttools-mcp",
      name: "io.github.humanjesse/textarttools-mcp",
      description:
        "Unicode text styling and ASCII art generation with 23 styles and 322+ figlet fonts",
      version: "1.0.0",
      remotes: [
        {
          type: "sse",
          url: "https://humanjesse.github.io/textarttools-mcp/sse",
        },
      ],
      repository: {
        url: "https://github.com/humanjesse/textarttools-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.hummingbot/mcp",
      name: "io.github.hummingbot/mcp",
      description:
        "MCP server exposing Hummingbot API for automated multi-exchange trading",
      version: "0.1.0",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "hummingbot/hummingbot-mcp",
          version: "0.1.0",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Base URL of the Hummingbot API (e.g., http://host.docker.internal:8820 or http://localhost:8000)",
              isRequired: true,
              format: "string",
              name: "HUMMINGBOT_API_URL",
            },
            {
              description: "Hummingbot API username",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "HUMMINGBOT_USERNAME",
            },
            {
              description: "Hummingbot API password",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "HUMMINGBOT_PASSWORD",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/hummingbot/mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.huoshuiai42/huoshui-fetch",
      name: "io.github.huoshuiai42/huoshui-fetch",
      description:
        "An MCP server that provides tools for fetching, converting, and extracting data from web pages.",
      version: "1.0.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "huoshui-fetch",
          version: "1.0.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/huoshuiai42/huoshui-fetch",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.huoshuiai42/huoshui-file-converter",
      name: "io.github.huoshuiai42/huoshui-file-converter",
      description: "An MCP server that provides document format conversion",
      version: "1.0.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "huoshui-file-converter",
          version: "1.0.0",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your workding directory",
              format: "string",
              name: "HUOSHUI_WORKING_DIR",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/huoshuiai42/huoshui-file-converter",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.huoshuiai42/huoshui-file-search",
      name: "io.github.huoshuiai42/huoshui-file-search",
      description:
        "An MCP server that provides fast Spotlight file search capabilities for macOS",
      version: "1.0.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "huoshui-file-search",
          version: "1.0.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/huoshuiai42/huoshui-file-search",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.huoshuiai42/huoshui-pdf-converter",
      name: "io.github.huoshuiai42/huoshui-pdf-converter",
      description: "An MCP server that provides PDF file conversion",
      version: "1.0.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "huoshui-pdf-converter",
          version: "1.0.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/huoshuiai42/huoshui-pdf-converter",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.huoshuiai42/huoshui-pdf-translator",
      name: "io.github.huoshuiai42/huoshui-pdf-translator",
      description: "An MCP server that provides PDF translation service",
      version: "1.0.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "huoshui-pdf-translator",
          version: "1.0.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/huoshuiai42/huoshui-pdf-translator",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.iggredible/vim-mcp",
      name: "io.github.iggredible/vim-mcp",
      description:
        "Connect Claude Code to Vim/Neovim - query state, execute commands, search help, record macros",
      version: "0.1.2",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "vim-mcp",
          version: "0.1.2",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/iggredible/vim-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.imbenrabi/financial-modeling-prep-mcp-server",
      name: "io.github.imbenrabi/financial-modeling-prep-mcp-server",
      description:
        "MCP server for Financial Modeling Prep API with 250+ financial data tools",
      version: "2.5.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "financial-modeling-prep-mcp-server",
          version: "2.5.1",
          runtimeHint: "npx",
          transport: {
            type: "streamable-http",
            url: "https://financial-modeling-prep-mcp-server-production.up.railway.app/mcp",
          },
          packageArguments: [
            {
              description: "Financial Modeling Prep API access token",
              format: "string",
              type: "named",
              name: "--fmp-token",
            },
            {
              description: "Port number for HTTP server mode",
              format: "number",
              type: "named",
              name: "--port",
            },
            {
              description: "Enable dynamic tool discovery mode",
              format: "boolean",
              type: "named",
              name: "--dynamic-tool-discovery",
            },
            {
              description: "Comma-separated list of tool sets to load",
              format: "string",
              type: "named",
              name: "--fmp-tool-sets",
            },
          ],
          environmentVariables: [
            {
              description: "Financial Modeling Prep API access token",
              format: "string",
              isSecret: true,
              name: "FMP_ACCESS_TOKEN",
            },
            {
              description: "Port number for HTTP server mode",
              format: "number",
              name: "PORT",
            },
            {
              description: "Enable dynamic tool discovery mode",
              format: "boolean",
              name: "DYNAMIC_TOOL_DISCOVERY",
            },
            {
              description: "Comma-separated list of tool sets to load",
              format: "string",
              name: "FMP_TOOL_SETS",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/imbenrabi/Financial-Modeling-Prep-MCP-Server",
        source: "github",
        id: "988409529",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.indragiek/uniprof",
      name: "io.github.indragiek/uniprof",
      description: "Universal CPU profiler designed for humans and AI agents",
      version: "0.3.4",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "uniprof",
          version: "0.3.4",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              value: "mcp",
              type: "positional",
            },
            {
              value: "run",
              type: "positional",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/indragiek/uniprof",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.isamu/mulmocast-vision",
      name: "io.github.isamu/mulmocast-vision",
      description: "Easy and stylish presentation slide generator.",
      version: "1.0.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mulmocast-vision",
          version: "1.0.1",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/receptron/mulmocast-vision",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.iworkist/btcmcp",
      name: "io.github.iworkist/btcmcp",
      description:
        "An MCP server that provides Bitcoin price data from Binance API",
      version: "0.1.2",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "btcmcp",
          version: "0.1.2",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/iworkist/btcmcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.jamesmontemagno/monkeymcp",
      name: "io.github.jamesmontemagno/monkeymcp",
      description:
        "MCP server providing monkey data, journeys, and location services for various monkey species.",
      version: "2.0.3",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "jamesmontemagno/monkeymcp",
          version: "2.0.3",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/jamesmontemagno/monkeymcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.jcucci/dotnet-sherlock-mcp",
      name: "io.github.jcucci/dotnet-sherlock-mcp",
      description:
        ".NET assembly introspection MCP server with advanced reflection and type analysis capabilities",
      version: "2.3.0",
      packages: [
        {
          registryType: "nuget",
          identifier: "Sherlock.MCP.Server",
          version: "2.3.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/jcucci/dotnet-sherlock-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.jgador/websharp",
      name: "io.github.jgador/websharp",
      description: "Search the web and extract article text for LLMs.",
      version: "v0.99.0-rc2",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "jessegador/websharp-mcp",
          version: "v0.99.0-rc2",
          transport: {
            type: "streamable-http",
            url: "http://localhost:8081/",
          },
        },
      ],
      repository: {
        url: "https://github.com/jgador/websharp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.jjlabsio/korea-stock-mcp",
      name: "io.github.jjlabsio/korea-stock-mcp",
      description: "MCP server for korea stock",
      version: "1.1.4",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "korea-stock-mcp",
          version: "1.1.4",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "DART API key for the service",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "DART_API_KEY",
            },
            {
              description: "KRX API key for the service",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "KRX_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/jjlabsio/korea-stock-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.jkakar/cookwith-mcp",
      name: "io.github.jkakar/cookwith-mcp",
      description:
        "AI-powered recipe generation and transformation tools by Cookwith",
      version: "1.0.2",
      repository: {
        url: "https://github.com/blaideinc/cookwith-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.jkakar/recipe-mcp",
      name: "io.github.jkakar/recipe-mcp",
      description: "Generate and remix recipes using cookwith.co",
      version: "1.0.4",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@cookwith/recipe-mcp",
          version: "1.0.4",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/blaideinc/recipe-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.jkawamoto/mcp-bear",
      name: "io.github.jkawamoto/mcp-bear",
      description:
        "A MCP server for interacting with Bear note-taking software.",
      version: "0.4.0",
      packages: [
        {
          registryType: "mcpb",
          identifier:
            "https://github.com/jkawamoto/mcp-bear/releases/download/v0.4.0/mcp-bear.mcpb",
          version: "0.4.0",
          fileSha256:
            "f91b513cc189736035e090dd8217a866d4492a53ed094cc277b248890278554e",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Bear API token",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "BEAR_API_TOKEN",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/jkawamoto/mcp-bear",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.jkawamoto/mcp-florence2",
      name: "io.github.jkawamoto/mcp-florence2",
      description: "An MCP server for processing images using Florence-2",
      version: "0.3.3",
      packages: [
        {
          registryType: "mcpb",
          identifier:
            "https://github.com/jkawamoto/mcp-florence2/releases/download/v0.3.3/mcp-florence2.mcpb",
          version: "0.3.3",
          fileSha256:
            "4e176c58148fde7ef8a548b5ba2ca5d6b4a2f496fb3ab3b84c7329e1c732147b",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/jkawamoto/mcp-florence2",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.jkawamoto/mcp-youtube-transcript",
      name: "io.github.jkawamoto/mcp-youtube-transcript",
      description: "An MCP server retrieving transcripts of YouTube videos",
      version: "0.5.4",
      packages: [
        {
          registryType: "mcpb",
          identifier:
            "https://github.com/jkawamoto/mcp-youtube-transcript/releases/download/v0.5.4/mcp-youtube-transcript.mcpb",
          version: "0.5.4",
          fileSha256:
            "195c643878037fa81fd2e18e622c1ae320eafe9c0445625c80460dee4855e906",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/jkawamoto/mcp-youtube-transcript",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.joelverhagen/Knapcode.SampleMcpServer",
      name: "io.github.joelverhagen/Knapcode.SampleMcpServer",
      description:
        "A sample MCP server using the MCP C# SDK. Generates random numbers and random weather.",
      version: "0.7.0-beta",
      packages: [
        {
          registryType: "nuget",
          registryBaseUrl: "https://api.nuget.org",
          identifier: "Knapcode.SampleMcpServer",
          version: "0.7.0-beta",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              value: "mcp",
              type: "positional",
              valueHint: "mcp",
            },
            {
              value: "start",
              type: "positional",
              valueHint: "start",
            },
          ],
          environmentVariables: [
            {
              value: "{weather_choices}",
              variables: {
                weather_choices: {
                  description:
                    "Comma separated list of weather descriptions to randomly select.",
                  isRequired: true,
                },
              },
              name: "WEATHER_CHOICES",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/joelverhagen/Knapcode.SampleMcpServer.git",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.joshmsimpson/exiftool",
      name: "io.github.joshmsimpson/exiftool",
      description:
        "Read, write, and remove metadata from 150+ file formats using ExifTool",
      version: "0.1.6",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "exiftool-mcp",
          version: "0.1.6",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/joshmsimpson/exiftool_mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.jztan/redmine-mcp-server",
      name: "io.github.jztan/redmine-mcp-server",
      description:
        "Production-ready MCP server for Redmine with security, pagination, and enterprise features",
      version: "0.4.5",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "redmine-mcp-server",
          version: "0.4.5",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "URL of your Redmine server (e.g., https://your-redmine-server.com)",
              isRequired: true,
              format: "string",
              name: "REDMINE_URL",
            },
            {
              description:
                "Redmine username for authentication (alternative to API key)",
              format: "string",
              name: "REDMINE_USERNAME",
            },
            {
              description:
                "Redmine password for authentication (alternative to API key)",
              format: "string",
              isSecret: true,
              name: "REDMINE_PASSWORD",
            },
            {
              description:
                "Redmine API key for authentication (alternative to username/password)",
              format: "string",
              isSecret: true,
              name: "REDMINE_API_KEY",
            },
            {
              description: "Host address for the MCP server (default: 0.0.0.0)",
              format: "string",
              default: "0.0.0.0",
              name: "SERVER_HOST",
            },
            {
              description: "Port for the MCP server (default: 8000)",
              format: "integer",
              default: "8000",
              name: "SERVER_PORT",
            },
            {
              description:
                "Public hostname for file download URLs (default: localhost)",
              format: "string",
              default: "localhost",
              name: "PUBLIC_HOST",
            },
            {
              description: "Public port for file download URLs (default: 8000)",
              format: "integer",
              default: "8000",
              name: "PUBLIC_PORT",
            },
            {
              description:
                "Directory for storing downloaded attachments (default: ./attachments)",
              format: "string",
              default: "./attachments",
              name: "ATTACHMENTS_DIR",
            },
            {
              description:
                "Enable automatic cleanup of expired files (default: true)",
              format: "boolean",
              default: "true",
              name: "AUTO_CLEANUP_ENABLED",
            },
            {
              description:
                "Interval between cleanup runs in minutes (default: 10)",
              format: "integer",
              default: "10",
              name: "CLEANUP_INTERVAL_MINUTES",
            },
            {
              description:
                "Default expiry time for attachments in minutes (default: 60)",
              format: "integer",
              default: "60",
              name: "ATTACHMENT_EXPIRES_MINUTES",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/jztan/redmine-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.karanb192/reddit-buddy-mcp",
      name: "io.github.karanb192/reddit-buddy-mcp",
      description:
        "Reddit MCP server - browse posts, search content, analyze users.",
      version: "1.0.6-test.7",
      packages: [
        {
          registryType: "npm",
          identifier: "@karanb192/reddit-buddy-mcp",
          version: "1.0.6-test.7",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.karanb192/reddit-mcp-buddy",
      name: "io.github.karanb192/reddit-mcp-buddy",
      description:
        "Reddit browser for AI assistants. Browse posts, search content, analyze users. No API keys needed.",
      version: "1.1.10",
      packages: [
        {
          registryType: "npm",
          identifier: "reddit-mcp-buddy",
          version: "1.1.10",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/karanb192/reddit-mcp-buddy",
        source: "github",
        id: "1056452116",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.kayembahamid/cybersim-pro",
      name: "io.github.kayembahamid/cybersim-pro",
      description:
        "Cybersecurity training, simulation, and incident response MCP server",
      websiteUrl: "https://kayembahamid.github.io",
      version: "1.0.1",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "hamcodes/cybersim-pro-mcp",
          version: "v1.0.1",
          runtimeHint: "docker",
          transport: {
            type: "stdio",
          },
          runtimeArguments: [
            {
              value: "run",
              type: "positional",
            },
            {
              type: "named",
              name: "--rm",
            },
            {
              type: "named",
              name: "-i",
            },
            {
              value: "hamcodes/cybersim-pro-mcp:v1.0.1",
              type: "positional",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/kayembahamid/cybersim-pro",
        source: "github",
        subfolder: "cybersim-pro-mcp",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.kemalersin/fonparam-mcp",
      name: "io.github.kemalersin/fonparam-mcp",
      description: "MCP server for FonParam API - Turkish mutual funds data",
      version: "1.0.4",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "fonparam-mcp",
          version: "1.0.4",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/kemalersin/fonparam-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.kesslerio/attio-mcp-server",
      name: "io.github.kesslerio/attio-mcp-server",
      description:
        "AI-powered Attio CRM access. Manage contacts, companies, deals, tasks, notes and workflows.",
      websiteUrl: "https://kesslerio.github.io/attio-mcp-server",
      _meta: {
        "io.modelcontextprotocol.registry/publisher-provided": {
          build_info: {
            timestamp: "2025-10-10T18:30:00Z",
          },
          tool: "github-actions",
          version: "1.0.0",
        },
      },
      version: "1.1.8",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "attio-mcp",
          version: "1.1.8",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Your Attio API key (required for all tools except health-check)",
              isRequired: true,
              isSecret: true,
              name: "ATTIO_API_KEY",
            },
            {
              description:
                "Optional Attio workspace ID for workspace-specific operations",
              name: "ATTIO_WORKSPACE_ID",
            },
            {
              description:
                "Tool mode: 'full' (all tools) or 'search' (search tools only). Default: 'full'",
              name: "ATTIO_MCP_TOOL_MODE",
            },
            {
              description:
                "Logging level: 'DEBUG', 'INFO', 'WARN', 'ERROR'. Default: 'INFO'",
              name: "MCP_LOG_LEVEL",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/kesslerio/attio-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.kevincogan/demo-mcp-server",
      name: "io.github.kevincogan/demo-mcp-server",
      description: "Demo server entry for local testing",
      version: "1.0.4",
      remotes: [
        {
          type: "streamable-http",
          url: "https://kevincogan.github.io/mcp",
        },
      ],
      repository: {
        url: "https://github.com/kevincogan/demo-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.kevint-cerebras/cerebras-code-mcp",
      name: "io.github.kevint-cerebras/cerebras-code-mcp",
      description:
        "Model Context Protocol (MCP) server for Cerebras to make coding faster in AI-first IDEs",
      version: "1.3.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "cerebras-code-mcp",
          version: "1.3.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your Cerebras API key from cloud.cerebras.ai",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "CEREBRAS_API_KEY",
            },
            {
              description:
                "Optional OpenRouter API key for fallback when Cerebras rate limits are hit",
              format: "string",
              isSecret: true,
              name: "OPENROUTER_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/kevint-cerebras/cerebras-code-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.khaoss85/orchestro",
      name: "io.github.khaoss85/orchestro",
      description:
        "Your AI Development Conductor - 60 MCP tools for intelligent task orchestration",
      version: "2.1.0",
      packages: [
        {
          registryType: "npm",
          identifier: "@khaoss85/orchestro",
          version: "2.1.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.king-of-the-grackles/reddit-research-mcp",
      name: "io.github.king-of-the-grackles/reddit-research-mcp",
      description:
        "Turn Reddit's chaos into structured insights with full citations - MCP server for Reddit research",
      version: "0.1.1",
      packages: [
        {
          registryType: "pypi",
          identifier: "reddit-research-mcp",
          version: "0.1.1",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/king-of-the-grackles/reddit-research-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.kirbah/mcp-youtube",
      name: "io.github.kirbah/mcp-youtube",
      description:
        "YouTube MCP server for token-optimized, structured data using the YouTube Data API v3.",
      version: "0.2.6",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@kirbah/mcp-youtube",
          version: "0.2.6",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "YouTube Data API v3 key",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "YOUTUBE_API_KEY",
            },
            {
              description: "MongoDB connection string for caching",
              format: "string",
              isSecret: true,
              name: "MDB_MCP_CONNECTION_STRING",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/kirbah/mcp-youtube",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.kkjdaniel/bgg-mcp",
      name: "io.github.kkjdaniel/bgg-mcp",
      description:
        "BoardGameGeek MCP server providing access to BGG API data through standardized tools",
      version: "1.4.0",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "kdaniel/bgg-mcp",
          version: "1.4.0",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Your BoardGameGeek username for references such as ME or MY in prompts",
              format: "string",
              name: "BGG_USERNAME",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/kkjdaniel/bgg-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.kmalakoff/mcp-pdf",
      name: "io.github.kmalakoff/mcp-pdf",
      description: "MCP server for PDF generation using PDFKit",
      version: "1.0.3",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@mcp-z/mcp-pdf",
          version: "1.0.3",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/mcp-z/mcp-pdf",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.koki-develop/esa-mcp-server",
      name: "io.github.koki-develop/esa-mcp-server",
      description: "A Model Context Protocol (MCP) server for esa.io",
      version: "0.3.2",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@koki-develop/esa-mcp-server",
          version: "0.3.2",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your esa team",
              isRequired: true,
              format: "string",
              name: "ESA_TEAM",
            },
            {
              description: "Your esa personal access token",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "ESA_ACCESS_TOKEN",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/koki-develop/esa-mcp-server.git",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.lapfelix/xcodemcp",
      name: "io.github.lapfelix/xcodemcp",
      description:
        "Control Xcode directly via JXA for build, test, debug operations with XCLogParser integration",
      version: "2.1.4",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "xcodemcp",
          version: "2.1.4",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/lapfelix/XcodeMCP",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.leshchenko1979/fast-mcp-telegram",
      name: "io.github.leshchenko1979/fast-mcp-telegram",
      description: "Telegram MCP server with search and messaging capabilities",
      version: "0.5.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "fast-mcp-telegram",
          version: "0.5.0",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Telegram API ID (from https://my.telegram.org/apps)",
              isRequired: true,
              name: "API_ID",
            },
            {
              description:
                "Telegram API Hash (from https://my.telegram.org/apps)",
              isRequired: true,
              isSecret: true,
              name: "API_HASH",
            },
            {
              description:
                "Server mode: stdio (local), http-no-auth (dev), http-auth (prod)",
              default: "stdio",
              choices: ["stdio", "http-no-auth", "http-auth"],
              name: "SERVER_MODE",
            },
            {
              description:
                "Custom session directory (defaults to ~/.config/fast-mcp-telegram/)",
              name: "SESSION_DIR",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/leshchenko1979/fast-mcp-telegram",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.linxule/lotus-wisdom",
      name: "io.github.linxule/lotus-wisdom",
      description:
        "An MCP server for problem-solving using the Lotus Sutra's wisdom framework.",
      version: "0.1.2",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "lotus-wisdom-mcp",
          version: "0.1.2",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/linxule/lotus-wisdom-mcp",
        source: "github",
        id: "963596268",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.localstack/localstack-mcp-server",
      name: "io.github.localstack/localstack-mcp-server",
      description:
        "A LocalStack MCP Server providing essential tools for local cloud development & testing",
      version: "0.1.5",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@localstack/localstack-mcp-server",
          version: "0.1.5",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "LocalStack Auth Token (optional for Pro features)",
              format: "string",
              isSecret: true,
              name: "LOCALSTACK_AUTH_TOKEN",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/localstack/localstack-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.macuse-app/macuse",
      name: "io.github.macuse-app/macuse",
      description:
        "Bridges AI assistants with native macOS functionality through the Model Context Protocol (MCP).",
      version: "1.0.1",
      packages: [
        {
          registryType: "mcpb",
          identifier:
            "https://github.com/macuse-app/macuse/releases/download/v1.0.1/macuse-1.0.1.mcpb",
          version: "1.0.1",
          fileSha256:
            "9e3444c567c66a57d15657dca437dbdb9560d16f00e6d4ac3d95ea795b9b482e",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/macuse-app/macuse",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.mapbox/mcp-server",
      name: "io.github.mapbox/mcp-server",
      description:
        "Geospatial intelligence with Mapbox APIs like geocoding, POI search, directions, isochrones, etc.",
      version: "0.5.5",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@mapbox/mcp-server",
          version: "0.5.5",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your Mapbox access token",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "MAPBOX_ACCESS_TOKEN",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/mapbox/mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.marianfoo/mcp-sap-docs",
      name: "io.github.marianfoo/mcp-sap-docs",
      description:
        "Fast MCP server for unified SAP docs search (SAPUI5, CAP, OpenUI5, wdi5) with BM25 full-text search",
      version: "0.3.9",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-sap-docs",
          version: "0.3.9",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/marianfoo/mcp-sap-docs",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.marlenezw/publish-mcp-server",
      name: "io.github.marlenezw/publish-mcp-server",
      description:
        "An MCP server that helps developers publish their MCP servers to the registry",
      version: "0.1.3",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "publish-mcp-server",
          version: "0.1.3",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/marlenezw/publish-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.martymarkenson/postgres-connector",
      name: "io.github.martymarkenson/postgres-connector",
      description: "MCP server for querying PostgreSQL databases",
      version: "1.0.2",
      packages: [
        {
          registryType: "npm",
          identifier: "postgres-connector",
          version: "1.0.2",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.mcp-z/mcp-pdf",
      name: "io.github.mcp-z/mcp-pdf",
      description:
        "MCP server for creative PDF generation with full emoji, Unicode, and offline support",
      version: "1.2.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@mcp-z/mcp-pdf",
          version: "1.2.0",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/mcp-z/mcp-pdf.git",
        source: "github",
        id: "1069486310",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.mfukushim/map-traveler-mcp",
      name: "io.github.mfukushim/map-traveler-mcp",
      description: "Virtual traveler library for MCP",
      version: "0.1.4",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@mfukushim/map-traveler-mcp",
          version: "0.1.4",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "[Map] Google Map API key",
              format: "string",
              isSecret: true,
              name: "MT_GOOGLE_MAP_KEY",
            },
            {
              description: "[Image.gemini] Gemini Image Api key",
              format: "string",
              isSecret: true,
              name: "MT_GEMINI_IMAGE_KEY",
            },
            {
              description:
                "[Image.gemini] Number of retries when generating Gemini images Default: 0",
              format: "string",
              name: "MT_MAX_RETRY_GEMINI",
            },
            {
              description:
                "[Image.gemini] Character reference image uri (file:// or https://) when generating Gemini image. Multiple settings can be made by separating them with the '|'. When multiple settings are made, they will be selected randomly.",
              format: "string",
              name: "MT_AVATAR_IMAGE_URI",
            },
            {
              description:
                "[Map.etc] Optional: Map API custom endpoint. Example: direction=https://xxxx,places=https://yyyy ",
              format: "string",
              name: "MT_MAP_API_URL",
            },
            {
              description:
                "[Map] Optional:Scale of travel time on real roads duration. default 4",
              format: "string",
              name: "MT_TIME_SCALE",
            },
            {
              description:
                "[db.local] db save path: e.g. %USERPROFILE%/Desktop/traveler.sqlite ,$HOME/traveler.sqlite ",
              format: "string",
              name: "MT_SQLITE_PATH",
            },
            {
              description: "[db.api] Turso sqlite API URL",
              format: "string",
              name: "MT_TURSO_URL",
            },
            {
              description: "[db.api] Turso sqlite API access token",
              format: "string",
              isSecret: true,
              name: "MT_TURSO_TOKEN",
            },
            {
              description:
                "[rembg.local] absolute path of the installed rembg cli",
              format: "string",
              name: "MT_REMBG_PATH",
            },
            {
              description: "[rembg.api] withoutbg.com rembg API URL",
              format: "string",
              name: "MT_REMBG_URL",
            },
            {
              description: "[rembg.api] withoutbg.com rembg API key",
              format: "string",
              isSecret: true,
              name: "MT_REMBG_WO_KEY",
            },
            {
              description: "[Image.pixAi] pixAi API key",
              format: "string",
              isSecret: true,
              name: "MT_PIXAI_KEY",
            },
            {
              description: "[Image.sd] Stability.ai image generation API key",
              format: "string",
              isSecret: true,
              name: "MT_SD_KEY",
            },
            {
              description:
                "[Image.pixAi] Optional: pixAi ModelId, if not set use default model 1648918127446573124 ",
              format: "string",
              name: "MT_PIXAI_MODEL_ID",
            },
            {
              description:
                "[Image.local.ComfyUi] Option: Generate image using ComfyUI API at specified URL. Example: http://192.168.1.100:8188",
              format: "string",
              name: "MT_COMFY_URL",
            },
            {
              description:
                "[Image.local.ComfyUi] Optional: Path to API workflow file when using text to image with ComfyUI. If not specified: assets/comfy/t2i_sample.json",
              format: "string",
              name: "MT_COMFY_WORKFLOW_T2I",
            },
            {
              description:
                "[Image.local.ComfyUi] Optional: Path of API workflow file when image to image in ComfyUI. If not specified: assets/comfy/i2i_sample.json",
              format: "string",
              name: "MT_COMFY_WORKFLOW_I2I",
            },
            {
              description:
                "[Image.local.ComfyUi] Optional: Variable values to send to the workflow via comfyUI API",
              format: "string",
              name: "MT_COMFY_PARAMS",
            },
            {
              description:
                "[Image] Optional: Fixed avatar generation prompt. You will no longer be able to change your avatar during conversations.",
              format: "string",
              name: "MT_FIXED_MODEL_PROMPT",
            },
            {
              description:
                "[Image] Optional: Acceptable avatar image area ratio. default 0.042",
              format: "string",
              name: "MT_BODY_AREA_RATIO",
            },
            {
              description:
                "[Image] Optional: Acceptable avatar image aspect ratios. default 1.5~2.3",
              format: "string",
              name: "MT_BODY_HW_RATIO",
            },
            {
              description:
                "[Image] Optional: Avatar composite window horizontal ratio. default 0.5",
              format: "string",
              name: "MT_BODY_WINDOW_RATIO_W",
            },
            {
              description:
                "[Image] Optional: Avatar composite window aspect ratio. default 0.75",
              format: "string",
              name: "MT_BODY_WINDOW_RATIO_H",
            },
            {
              description: "[Sns.Bs] Bluesky sns registration address",
              format: "string",
              name: "MT_BS_ID",
            },
            {
              description: "[Sns.Bs] bluesky sns password",
              format: "string",
              isSecret: true,
              name: "MT_BS_PASS",
            },
            {
              description:
                "[Sns.Bs] bluesky sns handle name: e.g. xxxxxxxx.bsky.social ",
              format: "string",
              name: "MT_BS_HANDLE",
            },
            {
              description:
                "[etc] Optional: Directly filter the tools to be used. All are available if not specified. e.g. tips,set_traveler_location",
              format: "string",
              name: "MT_FILTER_TOOLS",
            },
            {
              description:
                "[etc] Option: Specify whether the movement mode is 'realtime' or 'skip'. default realtime",
              format: "string",
              name: "MT_MOVE_MODE",
            },
            {
              description:
                "[Image] Option: Output image width (pixels) Default is 512",
              format: "string",
              name: "MT_IMAGE_WIDTH",
            },
            {
              description:
                "[Image] Options: 'true' = do not output image, not specified = output image if possible, default is not specified",
              format: "string",
              name: "MT_NO_IMAGE",
            },
            {
              description:
                "[Image] Option: 'true' = Output StreetView image as is without avatar superimposition. Not specified = Superimpose avatar image. Default is not specified.",
              format: "string",
              name: "MT_NO_AVATAR",
            },
            {
              description:
                "[Sns] Optional: Specify the feed tag when posting to SNS (#required, 15 characters or more) Default is #geo_less_traveler",
              format: "string",
              name: "MT_FEED_TAG",
            },
            {
              description:
                "[Streamable-http] Maximum number of sessions when using Streamable-http",
              format: "string",
              name: "MT_MAX_SESSIONS",
            },
            {
              description:
                "[Streamable-http] Session TTL when using Streamable-http",
              format: "string",
              name: "MT_SESSION_TTL_MS",
            },
            {
              description:
                "[Streamable-http] Service TTL when using Streamable-http",
              format: "string",
              name: "MT_SERVICE_TTL_MS",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/mfukushim/map-traveler-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.mickymultani/crypto-bytes",
      name: "io.github.mickymultani/crypto-bytes",
      description: "Crypto Bytes MCP Server",
      version: "0.1.1",
      packages: [
        {
          registryType: "pypi",
          identifier: "crypto_bytes_mcp_server",
          version: "0.1.1",
          runtimeHint: "python",
          transport: {
            type: "stdio",
          },
          runtimeArguments: [
            {
              value: "-m",
              type: "positional",
            },
            {
              value: "crypto_bytes_mcp_server",
              type: "positional",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.mobile-next/mobile-mcp",
      name: "io.github.mobile-next/mobile-mcp",
      description:
        "MCP server for iOS and Android Mobile Development, Automation and Testing",
      version: "0.0.31",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@mobilenext/mobile-mcp",
          version: "0.0.31",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              name: "",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/mobile-next/mobile-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.moonolgerd/game-mcp",
      name: "io.github.moonolgerd/game-mcp",
      description:
        "Discovers and manages installed games on Windows from Steam, Epic, GOG, Xbox, and other platforms.",
      version: "1.0.0",
      packages: [
        {
          registryType: "nuget",
          registryBaseUrl: "https://api.nuget.org",
          identifier: "GameMcpServer",
          version: "1.0.0",
          runtimeHint: "dnx",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/moonolgerd/game-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.morinokami/astro-mcp",
      name: "io.github.morinokami/astro-mcp",
      description: "MCP server to support Astro project development",
      version: "0.4.2",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "astro-mcp",
          version: "0.4.2",
          transport: {
            type: "sse",
            url: "http://localhost:4321/__mcp/sse",
          },
        },
      ],
      repository: {
        url: "https://github.com/morinokami/astro-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.motherduckdb/mcp-server-motherduck",
      name: "io.github.motherduckdb/mcp-server-motherduck",
      description:
        "Fast analytics and data processing with DuckDB and MotherDuck",
      version: "0.7.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "mcp-server-motherduck",
          version: "0.7.0",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              description: "Transport type for MCP server",
              default: "stdio",
              choices: ["stdio", "sse", "stream"],
              type: "named",
              name: "--transport",
            },
            {
              description:
                "Port to listen on for sse and stream transport mode",
              format: "number",
              default: "8000",
              type: "named",
              name: "--port",
            },
            {
              description:
                "Path to local DuckDB database file or MotherDuck database",
              default: "md:",
              type: "named",
              name: "--db-path",
            },
            {
              description:
                "Access token to use for MotherDuck database connections",
              isSecret: true,
              type: "named",
              name: "--motherduck-token",
            },
            {
              description:
                "Flag for connecting to DuckDB or MotherDuck in read-only mode",
              type: "named",
              name: "--read-only",
            },
            {
              description: "Home directory for DuckDB",
              type: "named",
              name: "--home-dir",
            },
            {
              description:
                "Flag for connecting to MotherDuck in SaaS mode (disables filesystem and write permissions for local DuckDB)",
              type: "named",
              name: "--saas-mode",
            },
            {
              description:
                "Enable JSON responses for HTTP stream (only supported for stream transport)",
              type: "named",
              name: "--json-response",
            },
          ],
          environmentVariables: [
            {
              description:
                "Access token to use for MotherDuck database connections",
              isSecret: true,
              name: "motherduck_token",
            },
            {
              description:
                "Home directory for DuckDB (used as default if --home-dir not specified)",
              name: "HOME",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/motherduckdb/mcp-server-motherduck",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.msenol/gorev",
      name: "io.github.msenol/gorev",
      description:
        "Task management system for AI assistants with MCP protocol, templates, and bilingual support (TR/EN)",
      version: "0.16.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@mehmetsenol/gorev-mcp-server",
          version: "0.16.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Language preference (en for English, tr for Turkish)",
              name: "GOREV_LANG",
            },
            {
              description:
                "Directory for storing Gorev database and data files",
              name: "GOREV_DATA_DIR",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/msenol/Gorev",
        source: "github",
        id: "msenol/Gorev",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.nailuoGG/anki-mcp-server",
      name: "io.github.nailuoGG/anki-mcp-server",
      description:
        "MCP server enabling LLMs to interact with Anki flashcard software through AnkiConnect",
      version: "0.1.8",
      packages: [
        {
          registryType: "npm",
          identifier: "anki-mcp-server",
          version: "0.1.8",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.nerfels/mind-map",
      name: "io.github.nerfels/mind-map",
      description:
        "Experimental code intelligence platform for Claude Code with AST parsing and context analysis",
      version: "1.12.13",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mind-map-mcp",
          version: "1.12.13",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Project root directory for MCP to analyze (optional - uses current working directory if not specified)",
              format: "string",
              name: "MCP_PROJECT_ROOT",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/nerfels/mind-map",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.nesquikm/rubber-duck",
      name: "io.github.nesquikm/rubber-duck",
      description:
        "An MCP server that bridges to multiple OpenAI-compatible LLMs - your AI rubber duck debugging panel",
      version: "1.1.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-rubber-duck",
          version: "1.1.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "OpenAI API key (starts with sk-)",
              format: "string",
              isSecret: true,
              name: "OPENAI_API_KEY",
            },
            {
              description: "Google Gemini API key",
              format: "string",
              isSecret: true,
              name: "GEMINI_API_KEY",
            },
            {
              description: "Groq API key (starts with gsk_)",
              format: "string",
              isSecret: true,
              name: "GROQ_API_KEY",
            },
            {
              description: "Default LLM provider to use",
              format: "string",
              name: "DEFAULT_PROVIDER",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/nesquikm/mcp-rubber-duck",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.netdata/mcp-server",
      name: "io.github.netdata/mcp-server",
      description:
        "AI-powered infrastructure monitoring with real-time metrics, logs, alerts, and ML anomaly detection.",
      version: "2.7.1",
      repository: {
        url: "https://github.com/netdata/netdata",
        source: "github",
        subfolder: "docs/netdata-ai/mcp",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.neverinfamous/memory-journal-mcp",
      name: "io.github.neverinfamous/memory-journal-mcp",
      description:
        "Developer project journal with Git context, semantic search, and 7 specialized tools.",
      version: "1.0.0",
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.neverinfamous/sqlite-mcp-server",
      name: "io.github.neverinfamous/sqlite-mcp-server",
      description:
        "SQLite MCP server with 73 tools for JSONB, full-text search, geospatial, and analytics.",
      version: "2.6.0",
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.nickzren/opentargets",
      name: "io.github.nickzren/opentargets",
      description:
        "Open Targets MCP server for targets, diseases, drugs, variants, and evidence",
      websiteUrl: "https://nickzren.github.io/opentargets-mcp/",
      version: "0.2.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "opentargets-mcp",
          version: "0.2.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/nickzren/opentargets-mcp",
        source: "github",
        id: "984363568",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.noahgift/depyler-mcp",
      name: "io.github.noahgift/depyler-mcp",
      description:
        "MCP server for Depyler: Python-to-Rust transpiler with analysis and verification tools",
      version: "3.4.0",
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.noahgift/pmcp",
      name: "io.github.noahgift/pmcp",
      description:
        "High-quality Rust SDK for Model Context Protocol (MCP) with full TypeScript SDK compatibility",
      version: "1.6.1",
      repository: {
        url: "https://github.com/noahgift/rust-mcp-sdk",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.noahgift/ruchy-mcp",
      name: "io.github.noahgift/ruchy-mcp",
      description:
        "MCP server for Ruchy: code analysis, scoring, linting, formatting, and transpilation tools",
      version: "3.67.0",
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.nowledge-co/server.json",
      name: "io.github.nowledge-co/server.json",
      description:
        "A server that provides MCPB package functionality for Nowledge Mem",
      version: "1.0.0",
      packages: [
        {
          registryType: "pypi",
          identifier: "nowledge-mem",
          version: "1.1.0",
          transport: {
            type: "stdio",
          },
        },
        {
          registryType: "mcpb",
          identifier:
            "https://github.com/nowledge-co/claude-dxt/releases/download/v1.0.0/claude-dxt.mcpb",
          version: "1.0.0",
          fileSha256:
            "68d0c882efa7925cd1400a5a6c8e20e2a3b59e7abf8ae6bd45863d0be41aeb9a",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/nowledge-co/claude-dxt",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.nrwl/nx-console",
      name: "io.github.nrwl/nx-console",
      description: "A Model Context Protocol server implementation for Nx",
      version: "0.6.12",
      packages: [
        {
          registryType: "npm",
          identifier: "nx-mcp",
          version: "0.6.12",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/nrwl/nx-console",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.oguzc/playwright-wizard-mcp",
      name: "io.github.oguzc/playwright-wizard-mcp",
      description:
        "MCP server providing Playwright test generation wizard with intelligent prompts and best practices",
      version: "0.1.6",
      packages: [
        {
          registryType: "npm",
          identifier: "playwright-wizard-mcp",
          version: "0.1.6",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.ooples/mcp-console-automation",
      name: "io.github.ooples/mcp-console-automation",
      description:
        "MCP server for AI-driven console application automation and monitoring",
      version: "1.0.2",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-console-automation",
          version: "1.0.2",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Logging level for console output (error, warn, info, debug, trace)",
              format: "string",
              name: "LOG_LEVEL",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/ooples/mcp-console-automation",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.opencontext-team/mcp-server",
      name: "io.github.opencontext-team/mcp-server",
      description:
        "An MCP server that provides visual memory and context storage with knowledge graph capabilities",
      version: "1.0.2",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "visual-memory-context-server",
          version: "1.0.2",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Path to the memory.json file for knowledge graph storage",
              format: "string",
              name: "MEMORY_FILE_PATH",
            },
            {
              description:
                "Comma-separated list of directories the server can access, or JSON array format",
              format: "string",
              name: "ALLOWED_DIRECTORIES",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/testing9384/mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.overstarry/qweather-mcp",
      name: "io.github.overstarry/qweather-mcp",
      description: "a qweather mcp server",
      version: "1.0.12",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "qweather-mcp",
          version: "1.0.12",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your qweather api host",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "QWEATHER_API_BASE",
            },
            {
              description: "Your qweather api key",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "QWEATHER_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/overstarry/qweather-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.p1va/symbols",
      name: "io.github.p1va/symbols",
      description:
        "MCP server to read, inspect and troubleshoot codebase symbols",
      version: "1.0.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@p1va/symbols",
          version: "0.0.10",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/p1va/symbols",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.pab1it0/prometheus-mcp-server",
      name: "io.github.pab1it0/prometheus-mcp-server",
      description:
        "MCP server providing Prometheus metrics access and PromQL query execution for AI assistants",
      websiteUrl: "https://pab1it0.github.io/prometheus-mcp-server",
      version: "1.3.1",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://ghcr.io",
          identifier: "pab1it0/prometheus-mcp-server",
          version: "1.3.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Prometheus server URL (e.g., http://localhost:9090)",
              isRequired: true,
              format: "string",
              name: "PROMETHEUS_URL",
            },
            {
              description: "Username for Prometheus basic authentication",
              format: "string",
              name: "PROMETHEUS_USERNAME",
            },
            {
              description: "Password for Prometheus basic authentication",
              format: "string",
              isSecret: true,
              name: "PROMETHEUS_PASSWORD",
            },
            {
              description: "Bearer token for Prometheus authentication",
              format: "string",
              isSecret: true,
              name: "PROMETHEUS_TOKEN",
            },
            {
              description: "Organization ID for multi-tenant Prometheus setups",
              format: "string",
              name: "ORG_ID",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/pab1it0/prometheus-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.paiml/pforge",
      name: "io.github.paiml/pforge",
      description:
        "Zero-boilerplate MCP server framework with declarative YAML configuration",
      version: "0.1.2",
      repository: {
        url: "https://github.com/paiml/pforge",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.paiml/pmat-agent",
      name: "io.github.paiml/pmat-agent",
      description:
        "Zero-config AI context generation and code quality toolkit with Claude Code Agent Mode support",
      version: "2.121.0",
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.paiml/pmcp",
      name: "io.github.paiml/pmcp",
      description:
        "High-quality Rust SDK for Model Context Protocol (MCP) with full TypeScript SDK compatibility",
      version: "1.6.1",
      repository: {
        url: "https://github.com/paiml/rust-mcp-sdk",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.paiml/rash",
      name: "io.github.paiml/rash",
      description:
        "Transpile Rust code to POSIX-compliant shell scripts with formal correctness guarantees",
      version: "0.1.0",
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.pedro-rivas/android-puppeteer-mcp",
      name: "io.github.pedro-rivas/android-puppeteer-mcp",
      description:
        "MCP server for Android automation with UI interaction, screenshots, and device control",
      version: "1.0.1",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "android-puppeteer-mcp",
          version: "1.0.1",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/pedro-rivas/android-puppeteer-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.pkolawa/krs-poland-mcp-server",
      name: "io.github.pkolawa/krs-poland-mcp-server",
      description:
        "Polish National registry of businesses and other legal entities",
      version: "1.0.17",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "krs-poland-mcp-server",
          version: "1.0.17",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/pkolawa/krs-poland-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.pkolawa/mcp-krs-poland",
      name: "io.github.pkolawa/mcp-krs-poland",
      description:
        "Polish National government's registry of all businesses, foundations, and other legal entities.",
      version: "1.0.11",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "krs-poland-mcp-server",
          version: "1.0.11",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/pkolawa/mcp-krs-poland",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.portel-dev/ncp",
      name: "io.github.portel-dev/ncp",
      description:
        "N-to-1 MCP Orchestration. Unified gateway for multiple MCP servers with intelligent tool discovery.",
      version: "1.5.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@portel/ncp",
          version: "1.5.1",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Enable debug logging for troubleshooting",
              default: "false",
              name: "NCP_DEBUG",
            },
            {
              description:
                "Operating mode: 'mcp' for AI assistant integration or 'cli' for command-line",
              default: "mcp",
              name: "NCP_MODE",
            },
            {
              description: "Disable colored output in logs and CLI",
              default: "false",
              name: "NO_COLOR",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/portel-dev/ncp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.pree-dew/mcp-bookmark",
      name: "io.github.pree-dew/mcp-bookmark",
      description: "MCP Server for adding bookmarks in openai RAG",
      version: "0.1.5",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "mcp-bookmark-server",
          version: "0.1.2",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "open ai api key",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "OPENAI_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/pree-dew/mcp-bookmark",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.priyankark/lighthouse-mcp",
      name: "io.github.priyankark/lighthouse-mcp",
      description: "MCP server for Google Lighthouse performance metrics",
      version: "0.1.9",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "lighthouse-mcp",
          version: "0.1.9",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/priyankark/lighthouse-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.promplate/hmr",
      name: "io.github.promplate/hmr",
      description:
        "Hot Module Reload (HMR) for Python with reactive programming and MCP tools",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://promplate.github.io/pyth-on-line/hmr/mcp",
        },
      ],
      repository: {
        url: "https://github.com/promplate/pyth-on-line",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.pshivapr/selenium-mcp",
      name: "io.github.pshivapr/selenium-mcp",
      description: "Selenium Tools for MCP",
      version: "0.4.3",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "selenium-webdriver-mcp",
          version: "0.4.3",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your API key for the service",
              format: "string",
              isSecret: true,
              name: "YOUR_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/pshivapr/selenium-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.ptyagiegnyte/egnyte-mcp-server",
      name: "io.github.ptyagiegnyte/egnyte-mcp-server",
      description:
        "Official Egnyte MCP Server for AI integration with document search, analysis, and collaboration.",
      version: "1.0.0",
      repository: {
        url: "https://github.com/egnyte/mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.ptyagiegnyte/egnyte-remote",
      name: "io.github.ptyagiegnyte/egnyte-remote",
      description:
        "Secure integration between AI tools and Egnyte content with search, analysis, and workflow tools.",
      version: "1.0.1",
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.pubnub/mcp-server",
      name: "io.github.pubnub/mcp-server",
      description:
        "PubNub MCP for Real-time messaging. API Access and SDK documentation.",
      version: "1.0.106",
      repository: {
        url: "https://github.com/pubnub/pubnub-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.pzep1/mcp-meet",
      name: "io.github.pzep1/mcp-meet",
      description:
        "One-click Google Meet scheduling and Apple Calendar mirroring with smart availability detection",
      version: "0.3.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-meet",
          version: "0.3.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Google OAuth Client ID",
              isRequired: true,
              format: "string",
              name: "GOOGLE_CLIENT_ID",
            },
            {
              description: "Google OAuth Client Secret",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "GOOGLE_CLIENT_SECRET",
            },
            {
              description: "Google OAuth Redirect URI",
              format: "string",
              default: "http://localhost:5173/oauth2/callback",
              name: "GOOGLE_REDIRECT_URI",
            },
            {
              description:
                "Comma-separated list of calendar IDs to check for availability",
              format: "string",
              default: "primary",
              name: "CALENDAR_IDS",
            },
            {
              description: "Name of the Apple Calendar to create events in",
              format: "string",
              default: "Meetings",
              name: "APPLE_CALENDAR_NAME",
            },
            {
              description: "Timezone for calendar operations",
              format: "string",
              default: "Europe/London",
              name: "TZ",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/znz-systems/mcp-meet",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.r-huijts/strava-mcp",
      name: "io.github.r-huijts/strava-mcp",
      description: "MCP server for accessing Strava API",
      version: "1.0.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "strava-mcp-server",
          version: "1.0.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your Strava API client ID",
              isRequired: true,
              format: "string",
              name: "STRAVA_CLIENT_ID",
            },
            {
              description: "Your Strava API client secret",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "STRAVA_CLIENT_SECRET",
            },
            {
              description: "Your Strava API access token",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "STRAVA_ACCESS_TOKEN",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/r-huijts/strava-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.railwayapp/mcp-server",
      name: "io.github.railwayapp/mcp-server",
      description: "Official Railway MCP server",
      version: "0.1.5",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@railway/mcp-server",
          version: "0.1.5",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/railwayapp/railway-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.rbonestell/ap-mcp-server",
      name: "io.github.rbonestell/ap-mcp-server",
      description:
        "Model Context Protocol (MCP) server for the Associated Press Media API",
      version: "1.2.6",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "ap-mcp-server",
          version: "1.2.6",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your API key for the service",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "YOUR_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/rbonestell/ap-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.ref-tools/ref-tools-mcp",
      name: "io.github.ref-tools/ref-tools-mcp",
      description:
        "Token efficient search for coding agents over public and private documentation.",
      version: "3.0.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "ref-tools-mcp",
          version: "3.0.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your API key for Ref",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "REF_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/ref-tools/ref-tools-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.rfdez/pvpc-mcp-server",
      name: "io.github.rfdez/pvpc-mcp-server",
      description:
        "Retrieve daily PVPC electricity tariffs for 2.0 TD consumers, published by Red Eléctrica.",
      version: "3.2.3",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@rfdez/pvpc-mcp-server",
          version: "3.2.3",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              description: "Use stdio transport type for MCP server",
              value: "stdio",
              type: "named",
              name: "--transport",
            },
            {
              description: "ESIOS API key for authentication",
              isRequired: true,
              isSecret: true,
              type: "named",
              name: "--api-key",
            },
          ],
        },
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@rfdez/pvpc-mcp-server",
          version: "3.2.3",
          runtimeHint: "npx",
          transport: {
            type: "streamable-http",
            url: "http://127.0.0.1:8080/mcp",
            headers: [
              {
                description: "ESIOS API key for authentication",
                isRequired: true,
                isSecret: true,
                name: "X-API-Key",
              },
            ],
          },
          packageArguments: [
            {
              description: "Use HTTP transport type for MCP server",
              value: "http",
              type: "named",
              name: "--transport",
            },
            {
              description: "Port for HTTP transport",
              default: "8080",
              type: "named",
              name: "--port",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/rfdez/pvpc-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.robotmcp/ros-mcp-server",
      name: "io.github.robotmcp/ros-mcp-server",
      description:
        "Connect AI models like Claude & ChatGPT with ROS robots using MCP",
      version: "2.1.6",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "ros-mcp",
          version: "2.1.6",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/robotmcp/ros-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.rogiervdbrnk/mcp-real-estate-server",
      name: "io.github.rogiervdbrnk/mcp-real-estate-server",
      description:
        "MCP server for Dutch real estate data. API_KEY_ID optional for testing.",
      version: "1.1.1",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://ghcr.io",
          identifier: "rogiervdbrnk/mcp-server",
          version: "1.1.1",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/rogiervdbrnk/mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.ruvnet/claude-flow",
      name: "io.github.ruvnet/claude-flow",
      description:
        "AI orchestration with hive-mind swarms, neural networks, and 87 MCP tools for enterprise dev.",
      version: "2.0.0-alpha.107",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "claude-flow",
          version: "2.0.0-alpha.107",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Anthropic API key for Claude AI models",
              format: "string",
              isSecret: true,
              name: "ANTHROPIC_API_KEY",
            },
            {
              description: "Operation mode: development, production, or test",
              format: "string",
              name: "CLAUDE_FLOW_MODE",
            },
            {
              description: "Path for persistent memory storage",
              format: "string",
              name: "CLAUDE_FLOW_MEMORY_PATH",
            },
            {
              description: "Maximum number of concurrent agents",
              format: "string",
              name: "CLAUDE_FLOW_MAX_AGENTS",
            },
            {
              description: "MCP server port",
              format: "string",
              name: "CLAUDE_FLOW_PORT",
            },
            {
              description:
                "GitHub personal access token for repository operations",
              format: "string",
              isSecret: true,
              name: "GITHUB_TOKEN",
            },
            {
              description: "Flow Nexus cloud platform API key",
              format: "string",
              isSecret: true,
              name: "FLOW_NEXUS_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/ruvnet/claude-flow",
        source: "github",
        id: "854513237",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.ruvnet/flow-nexus",
      name: "io.github.ruvnet/flow-nexus",
      description:
        "Cloud-powered AI platform with multi-agent swarms, sandboxes, and workflow automation",
      version: "0.1.121",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "flow-nexus",
          version: "0.1.121",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "API key for Flow Nexus authentication",
              format: "string",
              isSecret: true,
              name: "FLOW_NEXUS_API_KEY",
            },
            {
              description: "Base URL for Flow Nexus API",
              format: "string",
              name: "FLOW_NEXUS_BASE_URL",
            },
            {
              description: "E2B API key for sandbox creation",
              format: "string",
              isSecret: true,
              name: "E2B_API_KEY",
            },
            {
              description: "Anthropic API key for Claude integration",
              format: "string",
              isSecret: true,
              name: "ANTHROPIC_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/ruvnet/flow-nexus",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.ruvnet/ruv-swarm",
      name: "io.github.ruvnet/ruv-swarm",
      description:
        "Neural network swarm orchestration with WebAssembly acceleration and MCP integration",
      version: "1.0.19",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "ruv-swarm",
          version: "1.0.19",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Log level for ruv-swarm operations",
              format: "string",
              default: "info",
              choices: ["debug", "info", "warn", "error"],
              name: "RUV_SWARM_LOG_LEVEL",
            },
            {
              description: "Database path for persistence storage",
              format: "string",
              name: "RUV_SWARM_DB_PATH",
            },
            {
              description: "Enable WebAssembly SIMD optimizations",
              format: "boolean",
              default: "true",
              choices: ["true", "false"],
              name: "RUV_SWARM_ENABLE_SIMD",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/ruvnet/ruv-FANN",
        source: "github",
        subfolder: "ruv-swarm",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.ryaker/appstore-connect-mcp",
      name: "io.github.ryaker/appstore-connect-mcp",
      description:
        "MCP server for Apple Store Connect API integration with OAuth authentication support",
      version: "1.0.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@ryaker/appstore-connect-mcp",
          version: "1.0.0",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Apple App Store Connect API Key ID",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "APPLE_KEY_ID",
            },
            {
              description: "Apple App Store Connect Issuer ID",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "APPLE_ISSUER_ID",
            },
            {
              description:
                "Apple App Store Connect Private Key (base64 encoded or raw)",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "APPLE_PRIVATE_KEY",
            },
            {
              description: "Optional: Specific Bundle ID to filter apps",
              format: "string",
              name: "APPLE_BUNDLE_ID",
            },
            {
              description: "Optional: Specific App Store ID",
              format: "string",
              name: "APPLE_APP_STORE_ID",
            },
            {
              description: "Enable OAuth authentication (true/false)",
              format: "string",
              name: "OAUTH_ENABLED",
            },
            {
              description:
                "OAuth issuer URL (e.g., https://your-tenant.auth0.com)",
              format: "string",
              name: "OAUTH_ISSUER",
            },
            {
              description: "OAuth audience URL",
              format: "string",
              name: "OAUTH_AUDIENCE",
            },
            {
              description: "OAuth JWKS URI for token validation",
              format: "string",
              name: "OAUTH_JWKS_URI",
            },
            {
              description: "Server URL for OAuth deployment",
              format: "string",
              name: "SERVER_URL",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/ryaker/appstore-connect-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.ryanbaumann/platform-ai",
      name: "io.github.ryanbaumann/platform-ai",
      description: "Google Maps Platform Code Assist MCP",
      version: "0.2.0",
      packages: [
        {
          registryType: "npm",
          identifier: "@googlemaps/code-assist-mcp",
          version: "0.2.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/googlemaps/platform-ai",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.saucelabs-sample-test-frameworks/sauce-api-mcp",
      name: "io.github.saucelabs-sample-test-frameworks/sauce-api-mcp",
      description:
        "An open-source MCP server that provides LLM access to the Sauce Labs API",
      version: "1.0.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "sauce-api-mcp",
          version: "1.0.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              value: "<sauce-user-name>",
              name: "SAUCE_USERNAME",
            },
            {
              value: "<sauce-access-key>",
              name: "SAUCE_ACCESS_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/saucelabs/sauce-api-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.savhascelik/meta-api-mcp-server",
      name: "io.github.savhascelik/meta-api-mcp-server",
      description:
        "You can connect any API to LLMs. This enables AI to interact directly with APIs",
      version: "1.0.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "meta-api-mcp-server",
          version: "1.0.4",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "If the api you are connecting to requires api_key, you can use this variable and you can also define different variables",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "YOUR_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/savhascelik/meta-api-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.schemacrawler/schemacrawler-ai",
      name: "io.github.schemacrawler/schemacrawler-ai",
      description:
        "Enables natural language schema queries — explore tables, keys, procedures, and get SQL help fast",
      websiteUrl: "https://schemacrawler.github.io",
      version: "v16.29.1-1",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "schemacrawler/schemacrawler-ai",
          version: "v16.29.1-1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Database user name. Can be optional depending on the database connection type.",
              format: "string",
              isSecret: true,
              name: "SCHCRWLR_DATABASE_USER",
            },
            {
              description:
                "Database user password. Can be optional depending on the database connection type.",
              format: "string",
              isSecret: true,
              name: "SCHCRWLR_DATABASE_PASSWORD",
            },
            {
              description:
                "JDBC URL for database connection. If this is provided, the server, host, port and database are not used.",
              format: "string",
              name: "SCHCRWLR_JDBC_URL",
            },
            {
              description:
                "SchemaCrawler database plugin, for example, 'sqlserver' or 'sqlite'. Used only if the JDBC URL is not provided.",
              format: "string",
              name: "SCHCRWLR_SERVER",
            },
            {
              description:
                "Database host. Defaults to localhost. Used only if the JDBC URL is not provided.",
              format: "string",
              name: "SCHCRWLR_HOST",
            },
            {
              description:
                "Database port. Defaults to the default port for the server type. Used only if the JDBC URL is not provided.",
              format: "string",
              name: "SCHCRWLR_PORT",
            },
            {
              description:
                "Database to connect to (optional). Used only if the JDBC URL is not provided.",
              format: "string",
              name: "SCHCRWLR_DATABASE",
            },
            {
              description:
                "How much database metadata to retrieve. Values are 'minimum', 'standard', 'detailed' or 'maximum'.",
              format: "string",
              name: "SCHCRWLR_INFO_LEVEL",
            },
            {
              description:
                "Logging verbosity level. Values are 'SEVERE', 'WARNING', 'INFO', 'CONFIG', or 'FINE'.",
              format: "string",
              name: "SCHCRWLR_LOG_LEVEL",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/schemacrawler/SchemaCrawler-AI",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.sellisd/mcp-units",
      name: "io.github.sellisd/mcp-units",
      description:
        "An MCP server that provides some common units conversions for cooking",
      version: "0.3.3",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "mcp-units",
          version: "0.3.3",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/sellisd/mcp-units",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.shalevshalit/image-recognition-mcp",
      name: "io.github.shalevshalit/image-recognition-mcp",
      description:
        "MCP server for AI-powered image recognition and description using OpenAI vision models.",
      version: "1.0.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "image-recognition-mcp",
          version: "1.0.0",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Your OpenAI API key for image recognition and description services",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "OPENAI_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/mcp-s-ai/image-recognition-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.shalevshalit/image-recongnition-mcp",
      name: "io.github.shalevshalit/image-recongnition-mcp",
      description:
        "MCP server for AI-powered image recognition and description using OpenAI vision models.",
      version: "1.0.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "image-recongnition-mcp",
          version: "1.0.4",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Your OpenAI API key for image recognition and description services",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "OPENAI_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/mcp-s-ai/image-recongnition-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.shinpr/mcp-image",
      name: "io.github.shinpr/mcp-image",
      description:
        "AI image generation MCP server using Nano Banana with intelligent prompt enhancement",
      version: "0.2.3",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-image",
          version: "0.2.3",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Google Gemini API key for image generation (get from https://aistudio.google.com/apikey)",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "GEMINI_API_KEY",
            },
            {
              description:
                "Absolute path to directory where generated images will be saved (defaults to ./output)",
              format: "string",
              name: "IMAGE_OUTPUT_DIR",
            },
            {
              description:
                "Set to 'true' to disable automatic prompt optimization and use direct prompts",
              format: "boolean",
              name: "SKIP_PROMPT_ENHANCEMENT",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/shinpr/mcp-image",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.spences10/mcp-omnisearch",
      name: "io.github.spences10/mcp-omnisearch",
      description: "MCP server for integrating Omnisearch with LLMs",
      version: "0.0.15",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-omnisearch",
          version: "0.0.15",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/spences10/mcp-omnisearch",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.spences10/mcp-sqlite-tools",
      name: "io.github.spences10/mcp-sqlite-tools",
      description: "MCP server for local SQLite database operations",
      version: "0.0.11",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-sqlite-tools",
          version: "0.0.11",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/spences10/mcp-sqlite-tools",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.spences10/mcp-turso-cloud",
      name: "io.github.spences10/mcp-turso-cloud",
      description: "MCP server for integrating Turso with LLMs",
      version: "0.0.9",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-turso-cloud",
          version: "0.0.9",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Turso Platform API token for authentication",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "TURSO_API_TOKEN",
            },
            {
              description: "Turso organization name",
              isRequired: true,
              format: "string",
              name: "TURSO_ORGANIZATION",
            },
            {
              description: "Default database name (optional)",
              format: "string",
              name: "TURSO_DEFAULT_DATABASE",
            },
            {
              description: "Token expiration time (default: 7d)",
              format: "string",
              name: "TOKEN_EXPIRATION",
            },
            {
              description:
                "Default token permission level (default: full-access)",
              format: "string",
              name: "TOKEN_PERMISSION",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/spences10/mcp-turso-cloud",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.srikrishna235/scrimba-teaching-mcp",
      name: "io.github.srikrishna235/scrimba-teaching-mcp",
      description:
        "Unified MCP for Scrimba's interactive programming education with visual learning",
      version: "3.0.4",
      packages: [
        {
          registryType: "pypi",
          identifier: "scrimba-teaching-mcp",
          version: "3.0.4",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.stefanoamorelli/fred-mcp-server",
      name: "io.github.stefanoamorelli/fred-mcp-server",
      description:
        "Federal Reserve Economic Data (FRED) MCP Server - Access all 800,000+ economic time series",
      version: "1.0.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "fred-mcp-server",
          version: "1.0.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your FRED API key to access the API",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "FRED_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/stefanoamorelli/fred-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.stefanoamorelli/sec-edgar-mcp",
      name: "io.github.stefanoamorelli/sec-edgar-mcp",
      description:
        "SEC EDGAR MCP server that provides access to the US public filings through the US SEC EDGAR API",
      version: "1.0.5",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "sec-edgar-mcp",
          version: "1.0.5",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "The user agent to access the SEC EDGAR API",
              isRequired: true,
              format: "string",
              name: "SEC_EDGAR_USER_AGENT",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/stefanoamorelli/sec-edgar-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.surendranb/google-analytics-mcp",
      name: "io.github.surendranb/google-analytics-mcp",
      description:
        "An MCP server that provides [describe what your server does]",
      version: "1.0.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "google-analytics-mcp",
          version: "1.2.0",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your API key for the service",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "YOUR_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/surendranb/google-analytics-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.svnscha/mcp-windbg",
      name: "io.github.svnscha/mcp-windbg",
      description:
        "A Model Context Protocol server for Windows crash dump analysis using WinDbg/CDB",
      version: "0.10.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "mcp-windbg",
          version: "0.10.0",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Custom path to cdb.exe (optional)",
              format: "string",
              name: "CDB_PATH",
            },
            {
              description:
                "Symbol path for Windows debugging (optional, defaults to Microsoft symbol server)",
              format: "string",
              name: "_NT_SYMBOL_PATH",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/svnscha/mcp-windbg",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.taurgis/sfcc-dev-mcp",
      name: "io.github.taurgis/sfcc-dev-mcp",
      description:
        "MCP server for Salesforce B2C Commerce Cloud development assistance",
      version: "1.0.14",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "sfcc-dev-mcp",
          version: "1.0.14",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/taurgis/sfcc-dev-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.tcehjaava/tmdb-mcp-server",
      name: "io.github.tcehjaava/tmdb-mcp-server",
      description: "MCP server for The Movie Database (TMDB) API",
      version: "0.1.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "tmdb-mcp-server",
          version: "0.1.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "TMDB API access token (get free at https://www.themoviedb.org/settings/api)",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "TMDB_ACCESS_TOKEN",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/tcehjaava/tmdb-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.team-telnyx/telnyx",
      name: "io.github.team-telnyx/telnyx",
      description: "Official TypeScript library for the Telnyx API",
      version: "3.3.3",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "telnyx",
          version: "3.3.3",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your Telnyx API key for authentication",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "TELNYX_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/team-telnyx/telnyx-node",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.tedfytw1209/mcp-server-EVEfleet",
      name: "io.github.tedfytw1209/mcp-server-EVEfleet",
      description:
        "An MCP server that provides tools for EVE Online players to manage their fleets",
      version: "1.0.2",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "mcp-server-evefleet",
          version: "0.1.4",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your API key for the service",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "YOUR_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/tedfytw1209/mcp-server-EVEfleet",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.therealtimex/browser-use",
      name: "io.github.therealtimex/browser-use",
      description:
        "AI browser automation - navigate, click, type, extract content, and run autonomous web tasks",
      version: "0.7.10",
      packages: [
        {
          registryType: "pypi",
          identifier: "realtimex-browser-use",
          version: "0.7.10",
          runtimeHint: "uvx",
          transport: {
            type: "stdio",
          },
          runtimeArguments: [
            {
              value: "realtimex-browser-use[cli]@0.7.10",
              type: "positional",
            },
          ],
          packageArguments: [
            {
              value: "--mcp",
              type: "positional",
            },
          ],
          environmentVariables: [
            {
              description: "OpenAI API key for LLM operations",
              isRequired: true,
              isSecret: true,
              name: "OPENAI_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/therealtimex/browser-use",
        source: "github",
        subfolder: "browser_use/mcp",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.therealtimex/charts-mcp",
      name: "io.github.therealtimex/charts-mcp",
      description:
        "MCP server for generating charts using AntV. Supports various chart types through MCP tools.",
      version: "2.0.6",
      packages: [
        {
          registryType: "npm",
          identifier: "@realtimex/charts-mcp",
          version: "2.0.6",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.therealtimex/un-datacommons-mcp",
      name: "io.github.therealtimex/un-datacommons-mcp",
      description:
        "MCP server to query Data Commons indicators and observations (base or custom).",
      version: "1.0.1",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "un-datacommons-mcp",
          version: "1.0.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Data Commons API key from apikeys.datacommons.org",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "DC_API_KEY",
            },
            {
              description:
                "Type of Data Commons to use: base|custom (default: base)",
              format: "string",
              name: "DC_TYPE",
            },
            {
              description: "Custom DC base URL when DC_TYPE=custom",
              format: "string",
              name: "CUSTOM_DC_URL",
            },
            {
              description: "Comma-separated root topic DCIDs for custom DCs",
              format: "string",
              name: "DC_ROOT_TOPIC_DCIDS",
            },
            {
              description:
                "Search scope for custom DCs: base_only|custom_only|base_and_custom",
              format: "string",
              name: "DC_SEARCH_SCOPE",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/therealtimex/un-datacommons-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.timheuer/sampledotnetmcpserver",
      name: "io.github.timheuer/sampledotnetmcpserver",
      description: "Sample .NET MCP Server",
      version: "0.1.57-beta",
      packages: [
        {
          registryType: "nuget",
          registryBaseUrl: "https://api.nuget.org",
          identifier: "TimHeuer.SampleDotnetMcpServer",
          version: "0.1.57-beta",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/timheuer/sampledotnetmcpserver",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.tjhop/prometheus-mcp-server",
      name: "io.github.tjhop/prometheus-mcp-server",
      description:
        "An API-complete MCP server to manage Prometheus-compatible backends via comprehensive tools.",
      version: "0.8.0",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://ghcr.io",
          identifier: "tjhop/prometheus-mcp-server",
          version: "0.8.0",
          transport: {
            type: "stdio",
          },
          runtimeArguments: [
            {
              description: "The runtime command to execute",
              value: "run",
              type: "positional",
            },
            {
              description: "Run container in interactive mode",
              type: "named",
              name: "-i",
            },
            {
              description: "Automatically remove the container when it exits",
              type: "named",
              name: "--rm",
            },
            {
              description: "The container image to run",
              value: "ghcr.io/tjhop/prometheus-mcp-server",
              type: "positional",
              valueHint: "image_name",
            },
          ],
          packageArguments: [
            {
              description: "URL of the Prometheus instance to connect to",
              isRequired: true,
              default: "http://127.0.0.1:9090",
              type: "named",
              name: "--prometheus.url",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/tjhop/prometheus-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.toby/mirror-mcp",
      name: "io.github.toby/mirror-mcp",
      description: "Mirror MCP: Introspection for LLMs",
      version: "0.0.8",
      packages: [
        {
          registryType: "npm",
          identifier: "mirror-mcp",
          version: "0.0.8",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
          runtimeArguments: [
            {
              description: "Runtime argument 1",
              format: "string",
              value: "mirror-mcp@latest",
              default: "mirror-mcp@latest",
              type: "positional",
              valueHint: "mirror-mcp@latest",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/toby/mirror-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.tschoonj/repology-mcp-server",
      name: "io.github.tschoonj/repology-mcp-server",
      description:
        "MCP server that provides access to Repology package repository data",
      version: "0.1.1",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "repology-mcp-server",
          version: "0.1.1",
          transport: {
            type: "stdio",
          },
        },
        {
          registryType: "oci",
          registryBaseUrl: "https://ghcr.io",
          identifier: "tschoonj/repology-mcp-server",
          version: "0.1.1",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/tschoonj/repology-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.tuananh/hyper-mcp",
      name: "io.github.tuananh/hyper-mcp",
      description:
        "📦️ A fast, secure MCP server that extends its capabilities through WebAssembly plugins",
      version: "1.0.0",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "tuananh/hyper-mcp",
          version: "v0.1.6",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/tuananh/hyper-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.tuannvm/mcp-trino",
      name: "io.github.tuannvm/mcp-trino",
      description: "MCP server for Trino distributed SQL query engine access",
      version: "2.2.1",
      packages: [
        {
          registryType: "mcpb",
          identifier:
            "https://github.com/tuannvm/mcp-trino/releases/download/v2.2.1/mcp-trino_2.2.1_darwin_arm64.tar.gz",
          version: "2.2.1",
          fileSha256:
            "1a18882ab43243e17420f3562118a4c3e7fff12bc6b145066ae64b90b2dc0159",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Trino server hostname",
              isRequired: true,
              format: "string",
              name: "TRINO_HOST",
            },
            {
              description: "Trino server port",
              format: "string",
              name: "TRINO_PORT",
            },
            {
              description: "Trino username",
              isRequired: true,
              format: "string",
              name: "TRINO_USER",
            },
            {
              description: "Trino password",
              format: "string",
              isSecret: true,
              name: "TRINO_PASSWORD",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/tuannvm/mcp-trino",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.ubaumann/mkdocs-mcp",
      name: "io.github.ubaumann/mkdocs-mcp",
      description: "An MCP server that provides serves MkDocs as resources.",
      version: "0.1.2",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "mkdocs-mcp",
          version: "0.1.2",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Path to the MkDocs project",
              isRequired: true,
              format: "string",
              name: "MKDOCS_PROJECT_PATH",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/ubaumann/mkdocs-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.variflight/variflight-mcp",
      name: "io.github.variflight/variflight-mcp",
      description:
        "VariFlight's official MCP server provides tools to query flight, weather, comfort, and fare data.",
      version: "1.0.2",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@variflight-ai/variflight-mcp",
          version: "1.0.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your API key for the service",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "VARIFLIGHT_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/variflight/variflight-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.vemonet/openroute-mcp",
      name: "io.github.vemonet/openroute-mcp",
      description:
        "Plan routes using OpenRouteService API, for activities such as hiking or mountain biking",
      version: "0.0.3",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "openroute-mcp",
          version: "0.0.3",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your API key for https://api.openrouteservice.org",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "OPENROUTESERVICE_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/vemonet/openroute-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.vfarcic/dot-ai",
      name: "io.github.vfarcic/dot-ai",
      description:
        "AI-powered development platform for Kubernetes deployments and intelligent automation",
      version: "0.111.0",
      packages: [
        {
          registryType: "npm",
          identifier: "@vfarcic/dot-ai",
          version: "0.111.0",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/vfarcic/dot-ai",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.vishalsachdev/canvas-mcp",
      name: "io.github.vishalsachdev/canvas-mcp",
      description:
        "Canvas LMS integration for students and educators with FERPA-compliant analytics and workflows",
      websiteUrl: "https://vishalsachdev.github.io/canvas-mcp",
      version: "1.0.2",
      packages: [
        {
          registryType: "pypi",
          identifier: "canvas-mcp",
          version: "1.0.2",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/vishalsachdev/canvas-mcp",
        source: "github",
        id: "940427833",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.wonderwhy-er/desktop-commander",
      name: "io.github.wonderwhy-er/desktop-commander",
      description:
        "MCP server for terminal commands, file operations, and process management",
      version: "0.2.17",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@wonderwhy-er/desktop-commander",
          version: "0.2.17",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/wonderwhy-er/DesktopCommanderMCP",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.xkelxmc/uranium-mcp",
      name: "io.github.xkelxmc/uranium-mcp",
      description:
        "MCP for Uranium NFT tools to mint, list, and manage digital assets on the permaweb.",
      version: "1.0.9",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "uranium-tools-mcp",
          version: "1.0.9",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "You can generate an API key from your Uranium account settings: https://portal.uranium.pro/dashboard/profile/api-keys",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "URANIUM_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/xkelxmc/uranium-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.xorrkaz/cml-mcp",
      name: "io.github.xorrkaz/cml-mcp",
      description:
        "An MCP server that provides access to common Cisco Modeling Labs (CML) operations.",
      version: "0.11.1",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "cml-mcp",
          version: "0.11.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "URL for the CML Server",
              isRequired: true,
              format: "string",
              name: "CML_URL",
            },
            {
              description: "Username for CML authentication",
              isRequired: true,
              format: "string",
              name: "CML_USERNAME",
            },
            {
              description: "Password for CML authentication",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "CML_PASSWORD",
            },
            {
              description:
                "Username for authentication to devices running in CML",
              format: "string",
              name: "PYATS_USERNAME",
            },
            {
              description:
                "Password for authentication to devices running in CML",
              format: "string",
              isSecret: true,
              name: "PYATS_PASSWORD",
            },
            {
              description:
                "Enable password for authentication to devices running in CML",
              format: "string",
              isSecret: true,
              name: "PYATS_AUTH_PASS",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/xorrkaz/cml-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.ycjcl868/mcp-server-fear-greed",
      name: "io.github.ycjcl868/mcp-server-fear-greed",
      description: "An MCP server for mcp-server-fear-greed",
      version: "1.0.2",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-server-fear-greed",
          version: "latest",
          transport: {
            type: "stdio",
          },
        },
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-server-fear-greed",
          version: "latest",
          runtimeHint: "npx",
          transport: {
            type: "sse",
            url: "http://127.0.0.1:{port}/sse",
          },
          packageArguments: [
            {
              description: "Server port number",
              isRequired: true,
              format: "number",
              default: "8089",
              type: "named",
              name: "port",
            },
          ],
        },
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "mcp-server-fear-greed",
          version: "latest",
          runtimeHint: "npx",
          transport: {
            type: "streamable-http",
            url: "http://127.0.0.1:{port}/mcp",
          },
          packageArguments: [
            {
              description: "Server port number",
              isRequired: true,
              format: "number",
              default: "8089",
              type: "named",
              name: "port",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/ycjcl868/mcp-server-fear-greed",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "io.github.yifancong/rsdoctor",
      name: "io.github.yifancong/rsdoctor",
      description:
        "An MCP server that provides build analysis and optimization recommendations for Rspack projects.",
      version: "0.1.0",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@rsdoctor/mcp-server",
          version: "0.1.2-beta.0",
          runtimeHint: "node",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/web-infra-dev/rsdoctor",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.yokingma/time-mcp",
      name: "io.github.yokingma/time-mcp",
      description: "Time MCP Server, giving LLMs time awareness capabilities.",
      version: "1.0.5",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "time-mcp",
          version: "1.0.5",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/yokingma/time-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.yuna0x0/anilist-mcp",
      name: "io.github.yuna0x0/anilist-mcp",
      description: "AniList MCP server for accessing AniList API data",
      version: "1.3.7",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "anilist-mcp",
          version: "1.3.7",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "AniList API token for authenticated requests",
              format: "string",
              isSecret: true,
              name: "ANILIST_TOKEN",
            },
          ],
        },
        {
          registryType: "oci",
          registryBaseUrl: "https://ghcr.io",
          identifier: "yuna0x0/anilist-mcp",
          version: "1.3.7",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "AniList API token for authenticated requests",
              format: "string",
              isSecret: true,
              name: "ANILIST_TOKEN",
            },
          ],
        },
        {
          registryType: "mcpb",
          identifier:
            "https://github.com/yuna0x0/anilist-mcp/releases/download/v1.3.7/anilist-mcp-1.3.7.mcpb",
          version: "1.3.7",
          fileSha256:
            "29088017de549959db323020223aa564606285935bc5dbc7b2e2657ef4aba66a",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "AniList API token for authenticated requests",
              format: "string",
              isSecret: true,
              name: "ANILIST_TOKEN",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/yuna0x0/anilist-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.yuna0x0/hackmd-mcp",
      name: "io.github.yuna0x0/hackmd-mcp",
      description:
        "A Model Context Protocol server for integrating HackMD's note-taking platform with AI assistants.",
      version: "1.5.3",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "hackmd-mcp",
          version: "1.5.3",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your HackMD API token for API authentication",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "HACKMD_API_TOKEN",
            },
            {
              description:
                "Optional HackMD API URL, defaults to https://api.hackmd.io/v1",
              format: "string",
              default: "https://api.hackmd.io/v1",
              name: "HACKMD_API_URL",
            },
          ],
        },
        {
          registryType: "oci",
          registryBaseUrl: "https://ghcr.io",
          identifier: "yuna0x0/hackmd-mcp",
          version: "1.5.3",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your HackMD API token for API authentication",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "HACKMD_API_TOKEN",
            },
            {
              description:
                "Optional HackMD API URL, defaults to https://api.hackmd.io/v1",
              format: "string",
              default: "https://api.hackmd.io/v1",
              name: "HACKMD_API_URL",
            },
          ],
        },
        {
          registryType: "mcpb",
          identifier:
            "https://github.com/yuna0x0/hackmd-mcp/releases/download/v1.5.3/hackmd-mcp-1.5.3.mcpb",
          version: "1.5.3",
          fileSha256:
            "9b216bf4c286ccc1b70f411f0b23777efbae0ab7239b8c99170cfac3b706721a",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your HackMD API token for API authentication",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "HACKMD_API_TOKEN",
            },
            {
              description:
                "Optional HackMD API URL, defaults to https://api.hackmd.io/v1",
              format: "string",
              default: "https://api.hackmd.io/v1",
              name: "HACKMD_API_URL",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/yuna0x0/hackmd-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.zeiq-co/thoth-mcp",
      name: "io.github.zeiq-co/thoth-mcp",
      description:
        "MCP server for Thoth with multi-platform AI content generation",
      version: "1.0.2",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "@usethoth/mcp-server",
          version: "1.0.2",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "https://github.com/perminder-klair/thoth-mcp",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.zenml-io/mcp-zenml",
      name: "io.github.zenml-io/mcp-zenml",
      description:
        "MCP server for ZenML - browse stacks, pipelines, runs, artifacts & trigger pipeline runs via API",
      version: "1.0.4",
      packages: [
        {
          registryType: "oci",
          registryBaseUrl: "https://docker.io",
          identifier: "zenmldocker/mcp-zenml",
          version: "1.0.4",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Base URL of your ZenML server (e.g., https://<workspace-id>-zenml.cloudinfra.zenml.io).",
              isRequired: true,
              format: "string",
              name: "ZENML_STORE_URL",
            },
            {
              description:
                "API key used to authenticate with your ZenML server (ideally a service account key).",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "ZENML_STORE_API_KEY",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/zenml-io/mcp-zenml",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.zhongweili/nanobanana-mcp-server",
      name: "io.github.zhongweili/nanobanana-mcp-server",
      description:
        "An MCP server that provides image generation and editing capabilities",
      version: "1.0.0",
      packages: [
        {
          registryType: "pypi",
          registryBaseUrl: "https://pypi.org",
          identifier: "nanobanana-mcp-server",
          version: "1.0.0",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description: "Your Gemini API key",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "GEMINI_API_KEY",
            },
            {
              description: "The image output directory",
              format: "string",
              name: "IMAGE_OUTPUT_DIR",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/zhongweili/nanobanana-mcp-server",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.zwldarren/akshare-one-mcp",
      name: "io.github.zwldarren/akshare-one-mcp",
      description:
        "MCP server that provides access to Chinese stock market data using akshare-one",
      version: "0.3.6",
      packages: [
        {
          registryType: "pypi",
          identifier: "akshare-one-mcp",
          version: "0.3.6",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.github.zzstoatzz/tangled-mcp",
      name: "io.github.zzstoatzz/tangled-mcp",
      description:
        "MCP server for Tangled git platform. Manage repositories, branches, and issues on tangled.org.",
      version: "0.0.10",
      packages: [
        {
          registryType: "pypi",
          identifier: "tangled-mcp",
          version: "0.0.10",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.globalping/mcp",
      name: "io.globalping/mcp",
      description:
        "Interact with a global network measurement platform.Run network commands from any point in the world",
      version: "1.0.0",
      remotes: [
        {
          type: "sse",
          url: "https://mcp.globalping.io/sse",
        },
        {
          type: "streamable-http",
          url: "https://mcp.globalping.io/mcp",
        },
      ],
      repository: {
        url: "https://github.com/jsdelivr/globalping-mcp-server",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "io.ignission/mcp",
      name: "io.ignission/mcp",
      description: "TikTok video data analytics and content strategy tools",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.ignission.io/mcp",
        },
      ],
      repository: {
        url: "https://github.com/ignission-io/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.minnas/mcp",
      name: "io.minnas/mcp",
      description:
        "Share prompts and context with your team and discover community collections.",
      version: "1.1.0",
      remotes: [
        {
          type: "sse",
          url: "https://api.minnas.io/mcp",
        },
      ],
      repository: {
        url: "https://github.com/sensoris/minnas-service",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "io.opsera/opsera",
      name: "io.opsera/opsera",
      description:
        "Opsera AI Agent MCP server providing authenticated DevOps automation over SSE",
      websiteUrl: "https://docs.opsera.io",
      _meta: {
        "io.modelcontextprotocol.registry/publisher-provided": {
          categories: ["devops", "automation"],
          keywords: ["opsera", "pipelines", "analytics", "ai"],
          maintainers: [
            {
              name: "OpseraEngineering",
              url: "https://www.opsera.io",
            },
          ],
        },
      },
      version: "0.5.0",
      remotes: [
        {
          type: "sse",
          url: "https://agent.opsera.io/mcp",
          headers: [
            {
              description: "Bearer token for authenticated access",
              isRequired: true,
              isSecret: true,
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/OpseraEngineering/opsera-ai",
        source: "github",
        subfolder: "agent-authentication-gateway",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "io.prisma/mcp",
      name: "io.prisma/mcp",
      description: "MCP server for managing Prisma Postgres.",
      version: "1.0.0",
      remotes: [
        {
          type: "sse",
          url: "https://mcp.prisma.io/sse",
          headers: [
            {
              description: "Bearer token for Prisma platform authentication",
              name: "Authorization",
            },
          ],
        },
        {
          type: "streamable-http",
          url: "https://mcp.prisma.io/mcp",
          headers: [
            {
              description: "Bearer token for Prisma platform authentication",
              name: "Authorization",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/prisma/mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "io.scorecard/mcp",
      name: "io.scorecard/mcp",
      description:
        "MCP server providing access to the Scorecard API to evaluate and optimize LLM systems.",
      version: "2.1.1",
      packages: [
        {
          registryType: "npm",
          registryBaseUrl: "https://registry.npmjs.org",
          identifier: "scorecard-ai-mcp",
          version: "2.1.1",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              description:
                "Scorecard API key for authentication. Get your API key from https://app.scorecard.io/settings",
              isRequired: true,
              format: "string",
              isSecret: true,
              name: "SCORECARD_API_KEY",
            },
          ],
        },
      ],
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.scorecard.io/mcp",
        },
      ],
      repository: {
        url: "https://github.com/scorecard-ai/scorecard-node",
        source: "github",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.slingdata/sling-cli",
      name: "io.slingdata/sling-cli",
      description:
        "Sling CLI MCP server for querying any database, running data pipelines and managing replications",
      version: "1.4.25",
      packages: [
        {
          registryType: "pypi",
          identifier: "sling",
          version: "1.4.23.post1",
          transport: {
            type: "stdio",
          },
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.snapcall/mcp",
      name: "io.snapcall/mcp",
      description: "MCP Server that generate video call url",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.snapcall.io",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "io.snyk/mcp",
      name: "io.snyk/mcp",
      description:
        "Easily find and fix security issues in your applications leveraging Snyk platform capabilities.",
      version: "1.1299.1",
      packages: [
        {
          registryType: "npm",
          identifier: "snyk",
          version: "1.1299.1",
          transport: {
            type: "stdio",
          },
          packageArguments: [
            {
              value: "mcp",
              type: "positional",
            },
            {
              value: "stdio",
              type: "named",
              name: "-t",
            },
          ],
        },
      ],
      repository: {
        url: "https://github.com/snyk/snyk-ls",
        source: "github",
        subfolder: "mcp_extension",
      },
      transports: {
        stdio: true,
        sse: false,
        streamableHTTP: false,
      },
    },
    {
      id: "io.wordlift/mcp-server",
      name: "io.wordlift/mcp-server",
      description:
        "WordLift MCP Server: AI-powered content optimization and semantic analysis",
      version: "1.0.4",
      remotes: [
        {
          type: "sse",
          url: "https://mcp.wordlift.io/sse",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "md.install/try",
      name: "md.install/try",
      description:
        "Create guides as MCP servers to instruct coding agents to use your software (library, API, etc).",
      version: "0.1.1",
      remotes: [
        {
          type: "streamable-http",
          url: "https://install.md/mcp/try",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "net.gepuro.mcp-company-lens-v1/company-lens-mcp-registry",
      name: "net.gepuro.mcp-company-lens-v1/company-lens-mcp-registry",
      description: "Search Japanese company database",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp-company-lens-v1.gepuro.net/mcp",
        },
      ],
      repository: {
        url: "https://github.com/gepuro/company-lens-mcp-registry",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "net.nymbo/tools",
      name: "net.nymbo/tools",
      description:
        "Remote MCP server: fetch, search, Python, TTS, memory, image, video.",
      version: "1.0.0",
      remotes: [
        {
          type: "sse",
          url: "https://mcp.nymbo.net/gradio_api/mcp/sse",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: false,
      },
    },
    {
      id: "net.singular/mcp-server",
      name: "net.singular/mcp-server",
      description:
        "Marketing intelligence MCP server providing campaign performance data and analytics tools.",
      version: "1.0.0",
      remotes: [
        {
          type: "sse",
          url: "https://mcp.singular.net/mcp-server/mcp",
        },
        {
          type: "streamable-http",
          url: "https://mcp.singular.net/mcp-server/mcp",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "net.todoist/mcp",
      name: "net.todoist/mcp",
      description:
        "Official Todoist MCP server for AI assistants to manage tasks, projects, and workflows.",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://ai.todoist.net/mcp",
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "so.jinko/jinko-mcp",
      name: "so.jinko/jinko-mcp",
      description:
        "Jinko is a travel MCP server that provides hotel search and booking capabilities.",
      version: "0.0.27",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp-remote.jinko.so/mcp",
        },
      ],
      repository: {
        url: "https://github.com/jinkoso/jinko-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "technology.draup/api-server",
      name: "technology.draup/api-server",
      description:
        "Global labour & market data for skills, workforce, planning, stakeholders, jobs, news & profiles",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.draup.technology/mcp/",
          headers: [
            {
              description:
                "Get the API key from Draup Support (support@draup.com)",
              isRequired: true,
              isSecret: true,
              name: "X-API-Key",
            },
          ],
        },
      ],
      repository: {
        url: "",
        source: "",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "trade.neglect/mcp-server",
      name: "trade.neglect/mcp-server",
      description:
        "Full Solana DeFi coverage: launchpads, tokens, trades, and wallets, decoded at scale.",
      version: "1.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://api.neglect.trade/mcp",
        },
      ],
      repository: {
        url: "https://github.com/609NFT/solana-mcp",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
    {
      id: "travel.kismet/mcp-server",
      name: "travel.kismet/mcp-server",
      description:
        "Semantic hotel search with real-time availability and price comparison for Kismet Travel",
      version: "0.0.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://mcp.kismet.travel/mcp",
        },
        {
          type: "sse",
          url: "https://mcp.kismet.travel/sse",
        },
      ],
      repository: {
        url: "https://github.com/kismet-tech/kismet-travel-mcp-v2",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: true,
        streamableHTTP: true,
      },
    },
    {
      id: "xyz.dreamtap/mcp",
      name: "xyz.dreamtap/mcp",
      description:
        "Dreamtap provides sources of inspiration to your AI to make it more creative.",
      version: "0.1.0",
      remotes: [
        {
          type: "streamable-http",
          url: "https://dreamtap.xyz/mcp",
        },
      ],
      repository: {
        url: "https://github.com/salexashenko/dreamtap",
        source: "github",
      },
      transports: {
        stdio: false,
        sse: false,
        streamableHTTP: true,
      },
    },
  ],
  clients: [
    {
      id: "5ire",
      name: "5ire",
      description:
        "5ire is an open source cross-platform desktop AI assistant that supports tools through MCP servers.",
      url: "https://github.com/nanbingxyz/5ire",
      tags: ["desktop", "open-source"],
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
    {
      id: "agentai",
      name: "AgentAI",
      description:
        "AgentAI is a Rust library designed to simplify the creation of AI agents. The library includes seamless integration with MCP Servers.",
      icon: "code",
      url: "https://github.com/AdamStrojek/rust-agentai",
      tags: ["framework", "ai-reasoning", "open-source"],
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
    {
      id: "agenticflow",
      name: "AgenticFlow",
      description:
        "AgenticFlow is a no-code AI platform that helps you build agents that handle sales, marketing, and creative tasks around the clock. Connect 2,500+ APIs and 10,000+ tools securely via MCP.",
      icon: "workflow",
      url: "https://agenticflow.ai/mcp",
      tags: ["workflow", "no-code", "agentic"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: true,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "aiql-tuui",
      name: "AIQL TUUI",
      description:
        "AIQL TUUI is a native, cross-platform desktop AI chat application with MCP support. It supports multiple AI providers (e.g., Anthropic, Cloudflare, Deepseek, OpenAI, Qwen), local AI models (via vLLM, Ray, etc.), and aggregated API platforms (such as Deepinfra, Openrouter, and more).",
      url: "https://github.com/AI-QL/tuui",
      tags: ["desktop", "chat", "open-source"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: true,
        sampling: true,
        roots: false,
        elicitation: true,
      },
    },
    {
      id: "amazon-q-cli",
      name: "Amazon Q CLI",
      description:
        "Amazon Q CLI is an open-source, agentic coding assistant for terminals.",
      icon: "terminal",
      url: "https://github.com/aws/amazon-q-developer-cli",
      tags: ["cli", "agentic", "coding", "open-source"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: false,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "amazon-q-ide",
      name: "Amazon Q IDE",
      description:
        "Amazon Q IDE is an open-source, agentic coding assistant for IDEs.",
      icon: "code",
      url: "https://aws.amazon.com/q/developer",
      tags: ["ide-integration", "agentic", "coding", "open-source"],
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
    {
      id: "amp",
      name: "Amp",
      description:
        "Amp is an agentic coding tool built by Sourcegraph. It runs in VS Code (and compatible forks like Cursor, Windsurf, and VSCodium), JetBrains IDEs, Neovim, and as a command-line tool. It’s also multiplayer — you can share threads and collaborate with your team.",
      icon: "binary",
      url: "https://ampcode.com",
      tags: ["coding", "agentic", "ide-integration"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: true,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "apify-mcp-tester",
      name: "Apify MCP Tester",
      description:
        "Apify MCP Tester is an open-source client that connects to any MCP server using Server-Sent Events (SSE). It is a standalone Apify Actor designed for testing MCP servers over SSE, with support for Authorization headers.",
      icon: "test-tube",
      url: "https://github.com/apify/tester-mcp-client",
      tags: ["testing", "open-source"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: false,
        prompts: false,
        tools: true,
        discovery: true,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "augment-code",
      name: "Augment Code",
      description:
        "Augment Code is an AI-powered coding platform for VS Code and JetBrains with autonomous agents, chat, and completions. Both local and remote agents are backed by full codebase awareness and native support for MCP, enabling enhanced context through external sources and tools.",
      icon: "binary",
      url: "https://augmentcode.com",
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
    {
      id: "beeai-framework",
      name: "BeeAI Framework",
      description:
        "BeeAI Framework is an open-source framework for building, deploying, and serving powerful agentic workflows at scale. The framework includes the MCP Tool, a native feature that simplifies the integration of MCP servers into agentic workflows.",
      icon: "cog",
      url: "https://i-am-bee.github.io/beeai-framework",
      tags: ["framework", "agentic", "open-source", "workflow"],
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
    {
      id: "boltai",
      name: "BoltAI",
      description:
        "BoltAI is a native, all-in-one AI chat client with MCP support. BoltAI supports multiple AI providers (OpenAI, Anthropic, Google AI...), including local AI models (via Ollama, LM Studio or LMX)",
      icon: "chat",
      url: "https://boltai.com",
      tags: ["chat", "desktop"],
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
    {
      id: "call-chirp",
      name: "Call Chirp",
      description:
        "Call Chirp uses AI to capture every critical detail from your business conversations, automatically syncing insights to your CRM and project tools so you never miss another deal-closing moment.",
      icon: "phone",
      url: "https://www.call-chirp.com",
      tags: ["voice-ai", "automation"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: false,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "chatbox",
      name: "Chatbox",
      description:
        "Chatbox is a better UI and desktop app for ChatGPT, Claude, and other LLMs, available on Windows, Mac, Linux, and the web. It's open-source and has garnered 37K stars⭐ on GitHub.",
      icon: "chat",
      url: "https://chatboxai.app",
      tags: ["chat", "desktop", "open-source"],
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
    {
      id: "chatframe",
      name: "ChatFrame",
      description:
        "A cross-platform desktop chatbot that unifies access to multiple AI language models, supports custom tool integration via MCP servers, and enables RAG conversations with your local files—all in a single, polished app for macOS and Windows.",
      icon: "chat",
      url: "https://chatframe.co",
      tags: ["chat", "desktop"],
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
    {
      id: "chatgpt",
      name: "ChatGPT",
      description:
        "ChatGPT is OpenAI's AI assistant that provides MCP support for remote servers to conduct deep research.",
      icon: "chat",
      url: "https://chatgpt.com",
      tags: ["chat", "ai-reasoning"],
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
    {
      id: "chatwise",
      name: "ChatWise",
      description:
        "ChatWise is a desktop-optimized, high-performance chat application that lets you bring your own API keys. It supports a wide range of LLMs and integrates with MCP to enable tool workflows.",
      icon: "chat",
      url: "https://chatwise.app",
      tags: ["chat", "desktop"],
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
    {
      id: "claude-ai",
      name: "Claude.ai",
      description:
        "Claude.ai is Anthropic's web-based AI assistant that provides MCP support for remote servers.",
      icon: "chat",
      url: "https://claude.ai",
      tags: ["chat", "web", "ai-reasoning"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "claude-code",
      name: "Claude Code",
      description:
        "Claude Code is an interactive agentic coding tool from Anthropic that helps you code faster through natural language commands. It supports MCP integration for resources, prompts, tools, and roots, and also functions as an MCP server to integrate with other clients.",
      icon: "code",
      url: "https://claude.com/product/claude-code",
      tags: ["coding", "agentic", "ai-reasoning"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: true,
        elicitation: false,
      },
    },
    {
      id: "claude-desktop-app",
      name: "Claude Desktop App",
      description:
        "The Claude desktop application provides comprehensive support for MCP, enabling deep integration with local tools and data sources.",
      icon: "desktop-computer",
      url: "https://claude.ai/download",
      tags: ["desktop", "ai-reasoning"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "chorus",
      name: "Chorus",
      description:
        "Chorus is a native Mac app for chatting with AIs. Chat with multiple models at once, run tools and MCPs, create projects, quick chat, bring your own key, all in a blazing fast, keyboard shortcut friendly app.",
      icon: "microphone",
      url: "https://chorus.sh",
      tags: ["desktop", "chat"],
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
    {
      id: "cline",
      name: "Cline",
      description:
        "Cline is an autonomous coding agent in VS Code that edits files, runs commands, uses a browser, and more–with your permission at each step.",
      icon: "code-branch",
      url: "https://github.com/cline/cline",
      tags: ["coding", "agentic", "ide-integration", "open-source"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: false,
        tools: true,
        discovery: true,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "codegpt",
      name: "CodeGPT",
      description:
        "CodeGPT is a popular VS Code and Jetbrains extension that brings AI-powered coding assistance to your editor. It supports integration with MCP servers for tools, allowing users to leverage external AI capabilities directly within their development workflow.",
      icon: "code",
      url: "https://codegpt.co",
      tags: ["coding", "ide-integration"],
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
    {
      id: "continue",
      name: "Continue",
      description:
        "Continue is an open-source AI code assistant, with built-in support for all MCP features.",
      icon: "code",
      url: "https://github.com/continuedev/continue",
      tags: ["coding", "open-source", "ide-integration"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "copilot-mcp",
      name: "Copilot-MCP",
      description: "Copilot-MCP enables AI coding assistance via MCP.",
      icon: "code-merge",
      url: "https://github.com/VikashLoomba/copilot-mcp",
      tags: ["coding", "ai-reasoning"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: false,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "cursor",
      name: "Cursor",
      description: "Cursor is an AI code editor.",
      icon: "binary",
      url: "https://cursor.com",
      tags: ["coding", "ide-integration"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: true,
        roots: true,
        elicitation: true,
      },
    },
    {
      id: "daydreams-agents",
      name: "Daydreams Agents",
      description:
        "Daydreams is a generative agent framework for executing anything onchain",
      icon: "robot",
      url: "https://github.com/daydreamsai/daydreams",
      tags: ["framework", "agentic"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "eca",
      name: "ECA - Editor Code Assistant",
      description:
        "ECA is a Free and open-source editor-agnostic tool that aims to easily link LLMs and Editors, giving the best UX possible for AI pair programming using a well-defined protocol",
      icon: "binary",
      url: "https://eca.dev",
      tags: ["coding", "ide-integration", "open-source"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: true,
        elicitation: false,
      },
    },
    {
      id: "emacs-mcp",
      name: "Emacs MCP",
      description:
        "Emacs MCP is an Emacs client designed to interface with MCP servers, enabling seamless connections and interactions. It provides MCP tool invocation support for AI plugins like gptel and llm, adhering to Emacs' standard tool invocation format. This integration enhances the functionality of AI tools within the Emacs ecosystem.",
      icon: "code",
      url: "https://github.com/lizqwerscott/mcp.el",
      tags: ["ide-integration", "open-source"],
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
    {
      id: "fast-agent",
      name: "fast-agent",
      description:
        "fast-agent is a Python Agent framework, with simple declarative support for creating Agents and Workflows, with full multi-modal support for Anthropic and OpenAI models.",
      icon: "zap",
      url: "https://github.com/evalstate/fast-agent",
      tags: ["framework", "agentic", "python", "open-source"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: true,
        sampling: true,
        roots: true,
        elicitation: true,
      },
    },
    {
      id: "flowdown",
      name: "FlowDown",
      description:
        "FlowDown is a blazing fast and smooth client app for using AI/LLM, with a strong emphasis on privacy and user experience. It supports MCP servers to extend its capabilities with external tools, allowing users to build powerful, customized workflows.",
      icon: "download",
      url: "https://github.com/Lakr233/FlowDown",
      tags: ["desktop", "privacy", "workflow"],
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
    {
      id: "flujo",
      name: "FLUJO",
      description:
        "Think n8n + ChatGPT. FLUJO is an desktop application that integrates with MCP to provide a workflow-builder interface for AI interactions. Built with Next.js and React, it supports both online and offline (ollama) models, it manages API Keys and environment variables centrally and can install MCP Servers from GitHub.",
      icon: "flowchart",
      url: "https://github.com/mario-andreschak/flujo",
      tags: ["desktop", "workflow"],
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
    {
      id: "genkit",
      name: "Genkit",
      description:
        "Genkit is a cross-language SDK for building and integrating GenAI features into applications. The genkitx-mcp plugin enables consuming MCP servers as a client or creating MCP servers from Genkit tools and prompts.",
      icon: "puzzle-piece",
      url: "https://github.com/firebase/genkit",
      tags: ["framework", "ai-reasoning"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "glama",
      name: "Glama",
      description:
        "Glama is a comprehensive AI workspace and integration platform that offers a unified interface to leading LLM providers, including OpenAI, Anthropic, and others. It supports the Model Context Protocol (MCP) ecosystem, enabling developers and enterprises to easily discover, build, and manage MCP servers.",
      icon: "workspace",
      url: "https://glama.ai/chat",
      tags: ["web", "ai-reasoning"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "gemini-cli",
      name: "Gemini CLI",
      description:
        "Gemini CLI is an open-source, agentic coding assistant for terminals.", // Placeholder, original description not provided.
      icon: "terminal",
      url: "https://goo.gle/gemini-cli",
      tags: ["cli", "agentic", "coding"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: false,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "genaiscript",
      name: "GenAIScript",
      description:
        "Programmatically assemble prompts for LLMs using GenAIScript (in JavaScript). Orchestrate LLMs, tools, and data in JavaScript.",
      icon: "code-square",
      url: "https://microsoft.github.io/genaiscript/reference/scripts/mcp-tools/",
      tags: ["developer-tools", "javascript"],
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
    {
      id: "github-copilot-coding-agent",
      name: "GitHub Copilot coding agent",
      description:
        "Delegate tasks to GitHub Copilot coding agent and let it work in the background while you stay focused on the highest-impact and most interesting work",
      icon: "github",
      url: "https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/about-copilot-coding-agent",
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
    {
      id: "goose",
      name: "Goose",
      description:
        "Goose is an open source AI agent that supercharges your software development by automating coding tasks.",
      icon: "feather",
      url: "https://block.github.io/goose/docs/goose-architecture/#interoperability-with-extensions",
      tags: ["coding", "agentic", "open-source"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "gptme",
      name: "gptme",
      description:
        "gptme is a open-source terminal-based personal AI assistant/agent, designed to assist with programming tasks and general knowledge work.",
      icon: "terminal",
      url: "https://github.com/gptme/gptme",
      tags: ["cli", "agentic", "open-source"],
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
    {
      id: "hyperagent",
      name: "HyperAgent",
      description:
        "HyperAgent is Playwright supercharged with AI. With HyperAgent, you no longer need brittle scripts, just powerful natural language commands. Using MCP servers, you can extend the capability of HyperAgent, without having to write any code.",
      icon: "browser",
      url: "https://github.com/hyperbrowserai/HyperAgent",
      tags: ["automation", "ai-reasoning"],
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
    {
      id: "jenova",
      name: "Jenova",
      description:
        "Jenova is the best MCP client for non-technical users, especially on mobile.",
      icon: "mobile",
      url: "https://jenova.ai",
      tags: ["mobile", "ai-reasoning"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: false,
        prompts: false,
        tools: true,
        discovery: true,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "jetbrains-ai-assistant",
      name: "JetBrains AI Assistant",
      description:
        "JetBrains AI Assistant plugin provides AI-powered features for software development available in all JetBrains IDEs.",
      icon: "brain",
      url: "https://plugins.jetbrains.com/plugin/22282-jetbrains-ai-assistant",
      tags: ["ide-integration", "ai-reasoning"],
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
    {
      id: "jetbrains-junie",
      name: "JetBrains Junie",
      description:
        "Junie is JetBrains’ AI coding agent for JetBrains IDEs and Android Studio.",
      icon: "robot",
      url: "https://www.jetbrains.com/junie",
      tags: ["ide-integration", "coding", "agentic"],
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
    {
      id: "kilo-code",
      name: "Kilo Code",
      description:
        "Kilo Code is an autonomous coding AI dev team in VS Code that edits files, runs commands, uses a browser, and more.",
      icon: "code-branch",
      url: "https://github.com/Kilo-Org/kilocode",
      tags: ["coding", "agentic", "ide-integration", "open-source"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: false,
        tools: true,
        discovery: true,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "klavis-ai-slack-discord-web",
      name: "Klavis AI Slack/Discord/Web",
      description:
        "Klavis AI is an Open-Source Infra to Use, Build & Scale MCPs with ease.",
      icon: "message-circle",
      url: "https://www.klavis.ai/",
      tags: ["chat", "open-source"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: false,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "langflow",
      name: "Langflow",
      description:
        "Langflow is an open-source visual builder that lets developers rapidly prototype and build AI applications, it integrates with the Model Context Protocol (MCP) as both an MCP server and an MCP client.",
      icon: "flowchart",
      url: "https://github.com/langflow-ai/langflow",
      tags: ["workflow", "open-source", "developer-tools"],
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
    {
      id: "librechat",
      name: "LibreChat",
      description:
        "LibreChat is an open-source, customizable AI chat UI that supports multiple AI providers, now including MCP integration.",
      icon: "chat",
      url: "https://github.com/danny-avila/LibreChat",
      tags: ["chat", "open-source", "ui"],
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
    {
      id: "lm-studio",
      name: "LM Studio",
      description:
        "LM Studio is a cross-platform desktop app for discovering, downloading, and running open-source LLMs locally. You can now connect local models to tools via Model Context Protocol (MCP).",
      icon: "download",
      url: "https://lmstudio.ai",
      tags: ["desktop", "developer-tools"],
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
    {
      id: "lutra",
      name: "Lutra",
      description:
        "Lutra is an AI agent that transforms conversations into actionable, automated workflows.",
      icon: "bot",
      url: "https://lutra.ai",
      tags: ["agentic", "automation", "workflow"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "mcp-agent",
      name: "mcp-agent",
      description:
        "mcp-agent is a simple, composable framework to build agents using Model Context Protocol.",
      icon: "shield-check",
      url: "https://github.com/lastmile-ai/mcp-agent",
      tags: ["framework", "agentic", "open-source"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: true,
        roots: true,
        elicitation: true,
      },
    },
    {
      id: "mcp-client-chatbot",
      name: "mcp-client-chatbot",
      description:
        "mcp-client-chatbot is a local-first chatbot built with Vercel's Next.js, AI SDK, and Shadcn UI.",
      icon: "chat",
      url: "https://github.com/cgoinglove/mcp-client-chatbot",
      tags: ["chat", "open-source", "ui"],
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
    {
      id: "mcpjam",
      name: "MCPJam",
      description:
        "MCPJam is an open source testing and debugging tool for MCP servers - Postman for MCP servers.",
      icon: "bug",
      url: "https://github.com/MCPJam/inspector",
      tags: ["testing", "developer-tools", "open-source"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: true,
      },
    },
    {
      id: "mcp-use",
      name: "mcp-use",
      description:
        "mcp-use is an open source python library to very easily connect any LLM to any MCP server both locally and remotely.",
      icon: "plug",
      url: "https://github.com/pietrozullo/mcp-use",
      tags: ["framework", "python", "open-source"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: true,
        sampling: true,
        roots: false,
        elicitation: true,
      },
    },
    {
      id: "modelcontextchat-com",
      name: "modelcontextchat.com",
      description:
        "modelcontextchat.com is a web-based MCP client designed for working with remote MCP servers, featuring comprehensive authentication support and integration with OpenRouter.",
      icon: "globe",
      url: "https://modelcontextchat.com",
      tags: ["web", "chat"],
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
    {
      id: "mcphub",
      name: "MCPHub",
      description:
        "MCPHub is a powerful Neovim plugin that integrates MCP (Model Context Protocol) servers into your workflow.",
      icon: "package",
      url: "https://github.com/ravitemer/mcphub.nvim",
      tags: ["ide-integration", "open-source"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "mcpomni-connect",
      name: "MCPOmni-Connect",
      description:
        "MCPOmni-Connect is a versatile command-line interface (CLI) client designed to connect to various Model Context Protocol (MCP) servers using both stdio and SSE transport.",
      icon: "terminal",
      url: "https://github.com/Abiorh001/mcp_omni_connect",
      tags: ["cli", "automation", "open-source"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: true,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "memex",
      name: "Memex",
      description:
        "Memex is the first MCP client and MCP server builder - all-in-one desktop app. Unlike traditional MCP clients that only consume existing servers, Memex can create custom MCP servers from natural language prompts, immediately integrate them into its toolkit, and use them to solve problems—all within a single conversation.",
      icon: "database",
      url: "https://memex.tech/",
      tags: ["desktop", "agentic", "developer-tools"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "microsoft-copilot-studio",
      name: "Microsoft Copilot Studio",
      description:
        "Microsoft Copilot Studio is a robust SaaS platform designed for building custom AI-driven applications and intelligent agents, empowering developers to create, deploy, and manage sophisticated AI solutions.",
      icon: "microsoft",
      url: "https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-extend-action-mcp",
      tags: ["saas", "agentic", "workflow"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: false,
        tools: true,
        discovery: true,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "mindpal",
      name: "MindPal",
      description:
        "MindPal is a no-code platform for building and running AI agents and multi-agent workflows for business processes.",
      icon: "brain",
      url: "https://mindpal.io",
      tags: ["no-code", "agentic", "workflow"],
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
    {
      id: "mistral-ai-le-chat",
      name: "Mistral AI: Le Chat",
      description:
        "Mistral AI: Le Chat is Mistral AI assistant with MCP support for remote servers and enterprise workflows.",
      icon: "message-circle",
      url: "https://chat.mistral.ai",
      tags: ["chat", "ai-reasoning"],
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
    {
      id: "moopoint",
      name: "MooPoint",
      description:
        "MooPoint is a web-based AI chat platform built for developers and advanced users, letting you interact with multiple large language models (LLMs) through a single, unified interface. Connect your own API keys (OpenAI, Anthropic, and more) and securely manage custom MCP server integrations.",
      icon: "globe",
      url: "https://moopoint.io",
      tags: ["web", "chat", "developer-tools"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: false,
        prompts: false,
        tools: true,
        discovery: false,
        sampling: true,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "msty-studio",
      name: "Msty Studio",
      description:
        "Msty Studio is a privacy-first AI productivity platform that seamlessly integrates local and online language models (LLMs) into customizable workflows. Designed for both technical and non-technical users, Msty Studio offers a suite of tools to enhance AI interactions, automate tasks, and maintain full control over data and model behavior.",
      icon: "palette",
      url: "https://msty.ai",
      tags: ["workflow", "privacy", "automation"],
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
    {
      id: "needle",
      name: "Needle",
      description:
        "Needle is a RAG worflow platform that also works as an MCP client, letting you connect and use MCP servers in seconds.",
      icon: "pin",
      url: "https://needle.app",
      tags: ["workflow"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: true,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "nvidia-agent-intelligence-toolkit",
      name: "NVIDIA Agent Intelligence toolkit",
      description:
        "NVIDIA Agent Intelligence (AIQ) toolkit is a flexible, lightweight, and unifying library that allows you to easily connect existing enterprise agents to data sources and tools across any framework.",
      icon: "chip",
      url: "https://github.com/NVIDIA/AIQToolkit",
      tags: ["framework", "agentic", "developer-tools"],
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
    {
      id: "opensumi",
      name: "OpenSumi",
      description:
        "OpenSumi is a framework helps you quickly build AI Native IDE products.",
      icon: "binary",
      url: "https://github.com/opensumi/core",
      tags: ["framework", "ide-integration", "open-source"],
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
    {
      id: "oterm",
      name: "oterm",
      description:
        "oterm is a terminal client for Ollama allowing users to create chats/agents.",
      icon: "terminal",
      url: "https://github.com/ggozad/oterm",
      tags: ["cli", "chat", "agentic"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: false,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: true,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "postman",
      name: "Postman",
      description:
        "Postman is the most popular API client and now supports MCP server testing and debugging.",
      icon: "api",
      url: "https://postman.com/downloads",
      tags: ["api", "developer-tools", "testing"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "recursechat",
      name: "RecurseChat",
      description:
        "RecurseChat is a powerful, fast, local-first chat client with MCP support. RecurseChat supports multiple AI providers including LLaMA.cpp, Ollama, and OpenAI, Anthropic.",
      icon: "chat",
      url: "https://recurse.chat",
      tags: ["chat", "desktop"],
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
    {
      id: "roo-code",
      name: "Roo Code",
      description: "Roo Code enables AI coding assistance via MCP.",
      icon: "code",
      url: "https://roocode.com",
      tags: ["coding", "ai-reasoning"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: false,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "shortwave",
      name: "Shortwave",
      description:
        "Shortwave is an AI-powered email client that supports MCP tools to enhance email productivity and workflow automation.",
      icon: "mail",
      url: "https://www.shortwave.com",
      tags: ["automation", "workflow"],
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
    {
      id: "simtheory",
      name: "Simtheory",
      description:
        "Simtheory is an agentic AI workspace that unifies multiple AI models, tools, and capabilities under a single subscription. It provides comprehensive MCP support through its MCP Store, allowing users to extend their workspace with productivity tools and integrations.",
      icon: "infinity",
      url: "https://simtheory.ai",
      tags: ["agentic", "ai-reasoning", "workflow"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: true,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "slack-mcp-client",
      name: "Slack MCP Client",
      description:
        "Slack MCP Client acts as a bridge between Slack and Model Context Protocol (MCP) servers. Using Slack as the interface, it enables large language models (LLMs) to connect and interact with various MCP servers through standardized MCP tools.",
      icon: "slack",
      url: "https://github.com/tuannvm/slack-mcp-client",
      tags: ["chat", "open-source"],
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
    {
      id: "smithery-playground",
      name: "Smithery Playground",
      description:
        "Smithery Playground is a developer-first MCP client for exploring, testing and debugging MCP servers against LLMs. It provides detailed traces of MCP RPCs to help troubleshoot implementation issues.",
      icon: "flask-conical",
      url: "https://smithery.ai/playground",
      tags: ["developer-tools", "testing"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "spinai",
      name: "SpinAI",
      description:
        "SpinAI is an open-source TypeScript framework for building observable AI agents. The framework provides native MCP compatibility, allowing agents to seamlessly integrate with MCP servers and tools.",
      icon: "sparkles",
      url: "https://spinai.dev",
      tags: ["framework", "agentic", "open-source"],
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
    {
      id: "superinterface",
      name: "Superinterface",
      description:
        "Superinterface is AI infrastructure and a developer platform to build in-app AI assistants with support for MCP, interactive components, client-side function calling and more.",
      icon: "plug",
      url: "https://superinterface.ai",
      tags: ["developer-tools", "ai-reasoning"],
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
    {
      id: "superjoin",
      name: "Superjoin",
      description:
        "Superjoin brings the power of MCP directly into Google Sheets extension. With Superjoin, users can access and invoke MCP tools and agents without leaving their spreadsheets, enabling powerful AI workflows and automation right where their data lives.",
      icon: "spreadsheet",
      url: "https://superjoin.ai",
      tags: ["automation", "workflow", "google-sheets"],
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
    {
      id: "swarms",
      name: "Swarms",
      description:
        "Swarms is a production-grade multi-agent orchestration framework that supports MCP integration for dynamic tool discovery and execution.",
      icon: "package-2",
      url: "https://github.com/kyegomez/swarms",
      tags: ["framework", "agentic", "open-source"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: false,
        prompts: false,
        tools: true,
        discovery: true,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "systemprompt",
      name: "systemprompt",
      description:
        "systemprompt is a voice-controlled mobile app that manages your MCP servers. Securely leverage MCP agents from your pocket. Available on iOS and Android.",
      icon: "mobile",
      url: "https://systemprompt.io",
      tags: ["mobile", "voice-ai", "automation"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: true,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "tambo",
      name: "Tambo",
      description:
        "Tambo is a platform for building custom chat experiences in React, with integrated custom user interface components.",
      icon: "react",
      url: "https://tambo.co",
      tags: ["web", "chat", "ui", "react"],
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
    {
      id: "tencent-cloudbase-ai-devkit",
      name: "Tencent CloudBase AI DevKit",
      description:
        "Tencent CloudBase AI DevKit is a tool for building AI agents in minutes, featuring zero-code tools, secure data integration, and extensible plugins via MCP.",
      icon: "cloud",
      url: "https://docs.cloudbase.net/ai/agent/mcp",
      tags: ["developer-tools", "ai-reasoning"],
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
    {
      id: "theiaai-theiaide",
      name: "TheiaAI/TheiaIDE",
      description:
        "Theia AI is a framework for building AI-enhanced tools and IDEs. The AI-powered Theia IDE is an open and flexible development environment built on Theia AI.",
      icon: "binary",
      url: "https://eclipsesource.com/blogs/2024/12/19/theia-ide-and-theia-ai-support-mcp/",
      tags: ["framework", "ide-integration", "open-source"],
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
    {
      id: "tome",
      name: "Tome",
      description:
        "Tome is an open source cross-platform desktop app designed for working with local LLMs and MCP servers. It is designed to be beginner friendly and abstract away the nitty gritty of configuration for people getting started with MCP.",
      icon: "book",
      url: "https://github.com/runebookai/tome",
      tags: ["desktop", "open-source"],
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
    {
      id: "typingmind-app",
      name: "TypingMind App",
      description:
        "TypingMind is an advanced frontend for LLMs with MCP support. TypingMind supports all popular LLM providers like OpenAI, Gemini, Claude, and users can use with their own API keys.",
      icon: "keyboard",
      url: "https://www.typingmind.com",
      tags: ["web", "desktop", "chat"],
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
    {
      id: "vs-code-github-copilot",
      name: "VS Code GitHub Copilot",
      description:
        "VS Code integrates MCP with GitHub Copilot through agent mode, allowing direct interaction with MCP-provided tools within your agentic coding workflow. Configure servers in Claude Desktop, workspace or user settings, with guided MCP installation and secure handling of keys in input variables to avoid leaking hard-coded keys.",
      icon: "vscode",
      url: "https://code.visualstudio.com/",
      tags: ["coding", "ide-integration", "agentic"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: true,
        tools: true,
        discovery: true,
        sampling: true,
        roots: true,
        elicitation: true,
      },
    },
    {
      id: "warp",
      name: "Warp",
      description:
        "Warp is the intelligent terminal with AI and your dev team's knowledge built-in. With natural language capabilities integrated directly into an agentic command line, Warp enables developers to code, automate, and collaborate more efficiently -- all within a terminal that features a modern UX.",
      icon: "terminal",
      url: "https://www.warp.dev/",
      tags: ["cli", "agentic", "coding"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: true,
        prompts: false,
        tools: true,
        discovery: true,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "whatsmcp",
      name: "WhatsMCP",
      description:
        "WhatsMCP is an MCP client for WhatsApp. WhatsMCP lets you interact with your AI stack from the comfort of a WhatsApp chat.",
      icon: "whatsapp",
      url: "https://wassist.app/mcp/",
      tags: ["chat", "mobile"],
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
    {
      id: "windsurf-editor",
      name: "Windsurf Editor",
      description:
        "Windsurf Editor is an agentic IDE that combines AI assistance with developer workflows. It features an innovative AI Flow system that enables both collaborative and independent AI interactions while maintaining developer control.",
      icon: "wind",
      url: "https://codeium.com/windsurf",
      tags: ["ide-integration", "agentic", "coding"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: false,
        prompts: false,
        tools: true,
        discovery: true,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
    {
      id: "witsy",
      name: "Witsy",
      description:
        "Witsy is an AI desktop assistant, supporting Anthropic models and MCP servers as LLM tools.",
      icon: "star",
      url: "https://github.com/nbonamy/witsy",
      tags: ["desktop", "ai-reasoning"],
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
    {
      id: "zed",
      name: "Zed",
      description:
        "Zed is a high-performance code editor with built-in MCP support, focusing on prompt templates and tool integration.",
      icon: "binary",
      url: "https://zed.dev/docs/assistant/model-context-protocol",
      tags: ["ide-integration", "coding"],
      favorite: false,
      hots: 0,
      commentsCount: 0,
      hotted: false,
      capabilities: {
        resources: false,
        prompts: true,
        tools: true,
        discovery: false,
        sampling: false,
        roots: false,
        elicitation: false,
      },
    },
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
  agents: [
    {
      id: "agent-1",
      name: "React Agent",
      description:
        "Reasoning and Acting agent that alternates between thinking and taking actions. Implements the ReAct pattern.",
      icon: "atom",
      tags: ["ai-reasoning", "official", "advanced"],
      favorite: false,
      hots: 310,
      commentsCount: 0,
    },
    {
      id: "agent-2",
      name: "Data Visualization Generator",
      description:
        "An agent that automatically generates charts and graphs from structured data.",
      icon: "pie-chart",
      tags: ["data", "ui", "beta"],
      favorite: false,
      hots: 15,
      commentsCount: 0,
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
      name: "You2",
      avatar: "https://i.pravatar.cc/40?u=user-1",
    },
    {
      id: "assistant",
      name: "Assistant2",
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
      id: "openrouter/x-ai/grok-code-fast-1",
      name: "Grok-1 Fast",
      provider: "openrouter",
    },
    {
      id: "openrouter/anthropic/claude-3.5-haiku",
      name: "Claude 3.5 Haiku",
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
