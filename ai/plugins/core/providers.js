// --- Google Gemini Provider ---
const adaptMessageToGemini = (msg) => {
  if (msg.content) {
    return {
      role: msg.role === "assistant" ? "model" : "user",
      parts: Array.isArray(msg.content)
        ? msg.content.map((c) => ({ text: c.text }))
        : [{ text: msg.content }],
    };
  }
  if (msg.toolCalls) {
    return {
      role: "model",
      parts: msg.toolCalls.map((tc) => ({
        functionCall: { name: tc.name, args: tc.arguments },
      })),
    };
  }
  if (msg.role === "tool") {
    return {
      role: "function",
      parts: [
        {
          functionResponse: {
            name: msg.toolCallId,
            response: { result: msg.result },
          },
        },
      ],
    };
  }
  return { role: "user", parts: [{ text: "" }] };
};
const adaptMessagesToGemini = (messages = []) =>
  messages.map(adaptMessageToGemini);

const adaptGeminiResponseToCommon = (geminiResponse) => {
  const candidate = geminiResponse.candidates?.[0];
  if (!candidate?.content?.parts?.[0]) {
    return { role: "assistant", content: "" };
  }
  const toolCalls = [];
  let content = "";
  for (const part of candidate.content.parts) {
    if (part.text) content += part.text;
    if (part.functionCall) {
      toolCalls.push({
        id: part.functionCall.name,
        name: part.functionCall.name,
        arguments: part.functionCall.args,
      });
    }
  }
  return {
    role: "assistant",
    content: content || null,
    toolCalls: toolCalls.length > 0 ? toolCalls : null,
  };
};
const adaptMcpToolToGemini = (mcpTool) => ({
  name: mcpTool.name.replace(/\//g, "__"),
  description: mcpTool.description,
  parameters: { type: "OBJECT", properties: mcpTool.inputSchema.properties },
});

async function* streamGeminiAPI({
  model,
  provider,
  messages,
  generationConfig,
  tools,
}) {
  const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${provider.apiKey}&alt=sse`;
  const payload = {
    contents: messages,
    generationConfig,
    ...(tools?.length > 0 && { tools: [{ functionDeclarations: tools }] }),
  };
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => ({ error: { message: "Failed to parse error." } }));
    throw new Error(
      `Gemini Streaming API Error: ${
        errorBody.error?.message || response.statusText
      }`,
    );
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          yield JSON.parse(line.substring(6));
        } catch (e) {
          console.error("Failed to parse stream chunk:", line);
        }
      }
    }
  }
}

async function* processStreamGemini(stream) {
  const finalToolCalls = [];
  for await (const chunk of stream) {
    const candidate = chunk.candidates?.[0];
    if (!candidate?.content?.parts?.[0]) continue;
    let content = "";
    for (const part of candidate.content.parts) {
      if (part.text) {
        content += part.text;
      }
      if (part.functionCall) {
        finalToolCalls.push({
          id: part.functionCall.name,
          name: part.functionCall.name,
          arguments: part.functionCall.args,
        });
      }
    }
    if (content) {
      yield { type: "content", content: content };
    }
  }
  const hasToolCalls = finalToolCalls.length > 0;
  if (hasToolCalls) {
    yield { type: "tool_calls", toolCalls: finalToolCalls };
  }
  const finishReason = hasToolCalls ? "tool_calls" : "stop";
  yield { type: "finish_reason", reason: finishReason };
}

const googleProvider = {
  type: "google",
  adaptMessages: adaptMessagesToGemini,
  adaptTools: (tools) => tools.map(adaptMcpToolToGemini),
  adaptResponse: adaptGeminiResponseToCommon,
  streamAPI: streamGeminiAPI,
  processStream: processStreamGemini,
};

const adaptMessageToOpenAI = (msg) => {
  if (msg.role === "tool") {
    const result = msg.structuredContent?.result || msg.result || msg.content;
    return {
      role: "tool",
      tool_call_id: msg.toolCallId,
      content: typeof result === "string" ? result : JSON.stringify(result),
    };
  }
  if (msg.toolCalls?.length) {
    return {
      role: "assistant",
      content: null,
      tool_calls: msg.toolCalls.map((tc) => ({
        id: tc.id,
        type: "function",
        function: {
          name: tc.name,
          arguments:
            typeof tc.arguments === "string"
              ? tc.arguments
              : JSON.stringify(tc.arguments),
        },
      })),
    };
  }
  if (msg.content) {
    return {
      role: msg.role,
      content: Array.isArray(msg.content)
        ? msg.content.map((c) => c.text || c).join("\n")
        : msg.content,
    };
  }
  return { role: "user", content: "" };
};
const adaptMessagesToOpenAI = (messages = []) =>
  messages.map(adaptMessageToOpenAI);

const adaptOpenAIResponseToCommon = (openAIResponse) => {
  const choice = openAIResponse.choices?.[0];
  if (!choice) return { role: "assistant", content: "" };
  const { message } = choice;
  if (message.tool_calls?.length > 0) {
    return {
      role: "assistant",
      toolCalls: message.tool_calls.map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        arguments:
          typeof tc.function.arguments === "string"
            ? JSON.parse(tc.function.arguments)
            : tc.function.arguments,
      })),
    };
  }
  return { role: "assistant", content: message.content ?? "" };
};
const adaptMcpToolToOpenAI = (mcpTool) => ({
  type: "function",
  function: {
    name: mcpTool.name.replace(/\//g, "__"),
    description: mcpTool.description,
    parameters: mcpTool.inputSchema,
  },
});
async function* streamOpenAIAPI({
  config,
  provider,
  model,
  messages,
  generationConfig,
  tools,
}) {
  const endpoint = provider.baseUrl;
  const payload = {
    model,
    messages,
    ...generationConfig,
    ...(tools?.length > 0 && { tools }),
    stream: true,
  };
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(provider.apiKey && { Authorization: `Bearer ${provider.apiKey}` }),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => ({ error: { message: "Failed to parse error." } }));
    throw new Error(
      `OpenAI-compatible API Error: ${
        errorBody.error?.message || response.statusText
      }`,
    );
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      if (line.startsWith("data: ") && line.substring(6).trim() !== "[DONE]") {
        try {
          yield JSON.parse(line.substring(6));
        } catch (e) {
          console.error("Failed to parse stream chunk:", line);
        }
      }
    }
  }
}

async function* processStreamOpenAI(stream) {
  const toolCallChunks = {};
  let finishReason = null;
  for await (const chunk of stream) {
    const choice = chunk.choices?.[0];
    if (!choice) continue;
    const { delta } = choice;
    if (delta?.content) {
      yield { type: "content", content: delta.content };
    }
    if (delta?.tool_calls) {
      for (const toolCallDelta of delta.tool_calls) {
        const { index } = toolCallDelta;
        if (!toolCallChunks[index]) {
          toolCallChunks[index] = {
            id: "",
            type: "function",
            function: { name: "", arguments: "" },
          };
        }
        const current = toolCallChunks[index];
        if (toolCallDelta.id) current.id = toolCallDelta.id;
        if (toolCallDelta.function?.name)
          current.function.name += toolCallDelta.function.name;
        if (toolCallDelta.function?.arguments)
          current.function.arguments += toolCallDelta.function.arguments;
      }
    }
    if (choice.finish_reason) {
      finishReason = choice.finish_reason;
    }
  }
  if (finishReason === "tool_calls") {
    const finalToolCalls = Object.values(toolCallChunks).map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments || "{}"),
    }));
    yield { type: "tool_calls", toolCalls: finalToolCalls };
  }
  yield { type: "finish_reason", reason: finishReason };
}

const openRouterProvider = {
  type: "openrouter",
  adaptMessages: adaptMessagesToOpenAI,
  adaptTools: (tools) => tools.map(adaptMcpToolToOpenAI),
  adaptResponse: adaptOpenAIResponseToCommon,
  streamAPI: streamOpenAIAPI,
  processStream: processStreamOpenAI,
};

const localAIProvider = {
  type: "local",
  adaptMessages: adaptMessagesToOpenAI,
  adaptTools: (tools) => tools.map(adaptMcpToolToOpenAI),
  adaptResponse: adaptOpenAIResponseToCommon,
  streamAPI: streamOpenAIAPI,
  processStream: processStreamOpenAI,
};

const providerImplementations = {
  google: googleProvider,
  openrouter: openRouterProvider,
  local: localAIProvider,
};

const providers = new Map();
export default {
  name: "providers",
  initialize() {
    this.api.addProvider = (config) => {
      if (!config.type || !providerImplementations[config.type]) {
        throw new Error(`Invalid provider type: ${config.type}`);
      }
      if (providers.has(config.type)) {
        console.warn(
          `Provider of type "${config.type}" is already configured. It will be overwritten.`,
        );
      }
      providers.set(config.type, {
        ...providerImplementations[config.type],
        ...config,
      });
      console.log(`Provider of type "${config.type}" added.`);
    };

    this.api.clearProviders = () => {
      providers.clear();
    };

    this.api.getProvider = (providerId) => {
      const provider = providers.get(providerId);
      if (provider) return provider;
      if (providerImplementations[providerId]) {
        return providerImplementations[providerId];
      }
      throw new Error(`No provider found for "${providerId}"`);
    };

    this.api.listProviders = () => {
      return Array.from(providers.values()).map(
        ({
          adaptMessages,
          adaptTools,
          adaptResponse,
          streamAPI,
          processStream,
          ...rest
        }) => rest,
      );
    };

    this.api.getModels = async () => {
      let allModels = [];
      for (const [type, impl] of Object.entries(providerImplementations)) {
        const providerModels = impl.models.map((m) => ({
          ...m,
          id: `${type}/${m.id.split("/").pop()}`,
        }));
        allModels = allModels.concat(providerModels);
      }
      return allModels;
    };
  },
  api: {},
};
