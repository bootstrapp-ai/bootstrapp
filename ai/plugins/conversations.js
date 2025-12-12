export default {
	name: "conversation",

	initialize(host) {
		const conversations = new Map();
		const conversationListeners = new Set();
		const historyApi = host.plugin("history");

		if (!historyApi)
			throw new Error("Conversation plugin requires the History plugin.");

		const notifyListeners = (action, conversation) => {
			conversationListeners.forEach((listener) => {
				try {
					listener({
						action,
						conversation,
						conversations: Object.fromEntries(conversations),
					});
				} catch (error) {
					console.error("Error in conversation listener:", error);
				}
			});
		};

		this.api.onConversationChange = (listener) => {
			conversationListeners.add(listener);
			return () => conversationListeners.delete(listener);
		};

		this.api.createConversation = (params = {}) => {
			return historyApi.withHistory(
				"conversation:create",
				{ params },
				async () => {
					const id = params.id || `conv_${Date.now()}`;
					if (conversations.has(id))
						throw new Error(`Conversation with id ${id} already exists.`);
					const newConversation = {
						id,
						title: params.title || "New Conversation",
						messages: params.messages || [],
						createdAt: new Date().toISOString(),
						...params,
					};
					conversations.set(id, newConversation);
					notifyListeners("create", newConversation);
					return newConversation;
				},
			);
		};

		this.api.deleteConversation = (id) => {
			return historyApi.withHistory("conversation:delete", { id }, async () => {
				if (!conversations.has(id))
					throw new Error(`Conversation with id ${id} not found.`);
				conversations.delete(id);
				notifyListeners("delete", { id });
				return { success: true, deletedId: id };
			});
		};

		this.api.getConversation = (id) => conversations.get(id);

		this.api.listConversations = () => Array.from(conversations.values());

		this.api.addMessage = ({ conversationId, message }) => {
			return historyApi.withHistory(
				"conversation:addMessage",
				{ conversationId },
				async () => {
					const conversation = conversations.get(conversationId);
					if (!conversation)
						throw new Error(
							`Conversation with id ${conversationId} not found.`,
						);

					conversation.messages.push(message);

					const chatApi = host.plugin("chat");
					const response = await chatApi.chat(conversation.messages);

					conversation.messages.push({
						role: "assistant",
						content: response.content,
					});
					conversations.set(conversationId, conversation);
					notifyListeners("update", conversation);
					return conversation;
				},
			);
		};

		this.api.getConversationContext = (messages, maxLength = 500) => {
			if (messages.length <= 2) return null;
			return historyApi.withHistory(
				"conversation:get_context",
				{ messageCount: messages.length },
				async () => {
					const chatApi = host.plugin("chat");
					const contextMessages = [
						{
							role: "system",
							content: `Provide a brief context summary of this conversation in ${maxLength} characters or less. Focus on key topics, decisions, and current state.`,
						},
						...messages.slice(-10),
						{
							role: "user",
							content:
								"Summarize the key context from our conversation so far.",
						},
					];
					try {
						const response = await chatApi.chat(contextMessages);
						return {
							summary: response.content,
							messageCount: messages.length,
							generatedAt: new Date().toISOString(),
						};
					} catch (error) {
						console.error("Failed to generate context summary:", error);
						return null;
					}
				},
			);
		};

		this.api.summarizeConversation = (messages, maxLength = 150) => {
			return historyApi.withHistory(
				"conversation:summarize",
				{ messageCount: messages.length },
				async () => {
					const chatApi = host.plugin("chat");
					const summaryMessages = [
						{
							role: "system",
							content: `Please provide a brief summary of this conversation in ${maxLength} characters or less.`,
						},
						...messages,
						{ role: "user", content: "Please summarize our conversation." },
					];
					const response = await chatApi.chat(summaryMessages);
					return {
						summary: response.content || "",
						messageCount: messages.length,
						generatedAt: new Date().toISOString(),
					};
				},
			);
		};

		this.api.trimConversation = (messages, maxTokens = 4000) => {
			return historyApi.withHistory(
				"conversation:trim",
				{ messageCount: messages.length, maxTokens },
				async () => {
					let totalTokens = 0;
					const trimmedMessages = [];
					if (messages[0]?.role === "system") {
						trimmedMessages.push(messages[0]);
						totalTokens += Math.ceil(messages[0].content.length / 4);
					}
					for (
						let i = messages.length - 1;
						i >= (messages[0]?.role === "system" ? 1 : 0);
						i--
					) {
						const message = messages[i];
						const messageTokens = Math.ceil((message.content || "").length / 4);
						if (
							totalTokens + messageTokens > maxTokens &&
							trimmedMessages.length > (messages[0]?.role === "system" ? 1 : 0)
						)
							break;
						trimmedMessages.unshift(message);
						totalTokens += messageTokens;
					}
					return {
						messages: trimmedMessages,
						originalCount: messages.length,
						trimmedCount: trimmedMessages.length,
						estimatedTokens: totalTokens,
					};
				},
			);
		};
	},

	api: {},
};
