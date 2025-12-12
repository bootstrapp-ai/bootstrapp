export default {
	name: "chat",
	initialize(host) {
		const historyApi = host.plugin("history");
		if (!historyApi)
			throw new Error("Chat plugin requires the History plugin.");

		const toolsApi = host.plugin("tools");
		if (!toolsApi)
			throw new Error(
				"Chat plugin requires the Tools plugin for tool execution.",
			);

		const providersApi = host.plugin("providers");
		if (!providersApi)
			throw new Error("Chat plugin requires the Providers plugin.");

		const createStreamChatHandler = async function* (messages, options) {
			const currentMessages = [...messages];
			const {
				enabledTools = [],
				model,
				provider,
				...generationConfig
			} = options;

			if (!provider)
				throw new Error("A 'provider' must be specified in chat options.");
			if (!model)
				throw new Error("A 'model' must be specified in chat options.");
			const adapter = providersApi.getProvider(provider.id);
			if (!adapter)
				throw new Error(`Could not find a provider for model ${model}`);

			const toolAliases = Array.from(host.clients.keys());
			const { tools: mcpTools } = await toolsApi.listTools({
				servers: toolAliases.filter((alias) =>
					enabledTools.some(
						(toolName) => host.toolToAliasMap.get(toolName) === alias,
					),
				),
			});

			const adaptedTools = adapter.adaptTools(
				mcpTools.filter((t) => enabledTools.includes(t.name)),
			);
			const adaptedMessages = adapter.adaptMessages(currentMessages);
			const modelName = model.substring(model.indexOf("/") + 1);
			const stream = adapter.streamAPI({
				config: adapter,
				provider: options.provider,
				model: modelName,
				messages: adaptedMessages,
				generationConfig,
				tools: adaptedTools,
			});
			const processedStream = adapter.processStream(stream);
			let fullContent = "";
			let finalToolCalls = [];
			let finishReason = null;
			for await (const chunk of processedStream) {
				switch (chunk.type) {
					case "content":
						fullContent += chunk.content;
						yield { type: "content", content: fullContent, isComplete: false };
						break;
					case "tool_calls":
						finalToolCalls = chunk.toolCalls;
						break;
					case "finish_reason":
						finishReason = chunk.reason;
						break;
				}
			}

			if (finishReason === "tool_calls" && finalToolCalls.length > 0) {
				yield { type: "tool_calls_start", toolCalls: finalToolCalls };
				currentMessages.push({
					role: "assistant",
					content: null,
					toolCalls: finalToolCalls,
				});

				const toolResponses = [];
				for (const toolCall of finalToolCalls) {
					const originalToolName = toolCall.name.replace(/__/g, "/");
					try {
						const result = await toolsApi.callTool(
							originalToolName,
							toolCall.arguments,
						);
						yield { type: "tool_result", name: originalToolName, result };
						toolResponses.push({
							role: "tool",
							toolCallId: toolCall.id,
							result: result.result,
						});
					} catch (error) {
						yield {
							type: "tool_error",
							name: originalToolName,
							error: error.message,
						};
						toolResponses.push({
							role: "tool",
							toolCallId: toolCall.id,
							result: { error: error.message },
						});
					}
				}
				currentMessages.push(...toolResponses);
				for await (const finalChunk of createStreamChatHandler(
					currentMessages,
					options,
				)) {
					yield finalChunk;
				}
			} else {
				yield {
					type: "content",
					content: fullContent,
					isComplete: true,
					toolCalls: finalToolCalls.length > 0 ? finalToolCalls : undefined,
				};
			}
		};

		const createChatHandler = async (messages, options) => {
			const stream = createStreamChatHandler(messages, options);
			let lastChunk = {};
			for await (const chunk of stream) {
				lastChunk = chunk;
			}
			return {
				content: lastChunk.content,
				toolCalls: lastChunk.toolCalls,
			};
		};

		this.api.chat = (messages, options = {}) => {
			const { stream, ...restOptions } = options;
			const operationName = stream ? "llm:stream_chat" : "llm:chat";
			if (stream) return createStreamChatHandler(messages, restOptions);

			return historyApi.withHistory(operationName, { messages, options }, () =>
				createChatHandler(messages, restOptions),
			);
		};
	},
	api: {},
};
