import {
	CreateMessageRequestSchema,
	ElicitRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
export default {
	name: "requests",
	initialize(host) {
		const pendingElicitation = new Map();
		const pendingSampling = new Map();
		const listeners = new Set();
		const historyApi = host.plugin("history");
		host.addStore("requestHandlers", new Set());

		if (!historyApi)
			throw new Error("Request plugin requires the History plugin.");
		const notifyListeners = () => listeners.forEach((l) => l());
		this.api.onRequestChange = (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		};
		const handleElicitation = async (request, serverAlias) => {
			const historyEntry = historyApi.addToHistory({
				toolName: "elicitation/request",
				params: request.params.message,
				status: "pending",
				server: serverAlias,
				schema: request.params.requestedSchema,
			});
			const promise = new Promise((resolve) =>
				pendingElicitation.set(historyEntry.id, {
					request,
					resolve,
					server: serverAlias,
				}),
			);
			notifyListeners();
			try {
				const userResponse = await promise;
				if (userResponse.action === "decline") {
					historyApi.updateHistory(historyEntry.id, {
						status: "error",
						error: "User declined request.",
					});
					return {
						action: "decline",
						content: { error: "User declined the request." },
					};
				}
				historyApi.updateHistory(historyEntry.id, {
					status: "success",
					result: userResponse.content,
				});
				return { action: "accept", content: userResponse.content };
			} catch (error) {
				historyApi.updateHistory(historyEntry.id, {
					status: "error",
					error: error.message,
				});
				return {
					action: "decline",
					content: { error: "An error occurred during elicitation." },
				};
			} finally {
				pendingElicitation.delete(historyEntry.id);
				notifyListeners();
			}
		};

		const handleSampling = async (request, serverAlias) => {
			const historyEntry = historyApi.addToHistory({
				toolName: "sampling/request",
				params: request.params,
				status: "pending",
				server: serverAlias,
			});
			const promise = new Promise((resolve) =>
				pendingSampling.set(historyEntry.id, {
					request,
					resolve,
					server: serverAlias,
				}),
			);
			notifyListeners();
			try {
				const userDecision = await promise;
				if (userDecision.approved) {
					historyApi.updateHistory(historyEntry.id, {
						status: "success",
						result: { approved: true },
					});
					return {
						model: "test-model",
						role: "assistant",
						content: { type: "text", text: "This is a test response" },
					};
				}
				historyApi.updateHistory(historyEntry.id, {
					status: "error",
					error: "User rejected request.",
				});
				throw new Error("User rejected the sampling request.");
			} catch (error) {
				historyApi.updateHistory(historyEntry.id, {
					status: "error",
					error: error.message,
				});
				throw error;
			} finally {
				pendingSampling.delete(historyEntry.id);
				notifyListeners();
			}
		};

		host.requestHandlers.add([ElicitRequestSchema, handleElicitation]);
		host.requestHandlers.add([CreateMessageRequestSchema, handleSampling]);

		this.api.listElicitationRequests = () => {
			return historyApi.withHistory("elicitations:list", {}, async () => ({
				elicitationRequests: Array.from(pendingElicitation.entries()).map(
					([id, p]) => ({
						id,
						server: p.server,
						requestText: p.request.params.message,
						schema: p.request.params.requestedSchema,
					}),
				),
			}));
		};

		this.api.listSamplingRequests = () => {
			return historyApi.withHistory("sampling:list", {}, async () => ({
				samplingRequests: Array.from(pendingSampling.entries()).map(
					([id, p]) => ({ id, server: p.server, request: p.request.params }),
				),
			}));
		};

		this.api.respondToElicitation = ({
			id,
			response,
			server,
			action = "submit",
		}) => {
			return historyApi.withHistory(
				"elicitations:respond",
				{ id, response, server, action },
				async () => {
					const pendingReq = pendingElicitation.get(id);
					if (!pendingReq || pendingReq.server !== server)
						throw new Error(
							`Request not found or server mismatch for id: ${id}`,
						);
					pendingReq.resolve(
						action === "submit"
							? { action: "accept", content: response }
							: { action: "decline" },
					);
					return { success: true };
				},
			);
		};

		this.api.approveSamplingRequest = ({ id, server }) => {
			return historyApi.withHistory(
				"sampling:approve",
				{ id, server },
				async () => {
					const pendingReq = pendingSampling.get(id);
					if (!pendingReq || pendingReq.server !== server)
						throw new Error(
							`Sampling request not found or server mismatch for id: ${id}`,
						);
					pendingReq.resolve({ approved: true });
					return { success: true };
				},
			);
		};

		this.api.rejectSamplingRequest = ({ id, server }) => {
			return historyApi.withHistory(
				"sampling:reject",
				{ id, server },
				async () => {
					const pendingReq = pendingSampling.get(id);
					if (!pendingReq || pendingReq.server !== server)
						throw new Error(
							`Sampling request not found or server mismatch for id: ${id}`,
						);
					pendingReq.resolve({ approved: false });
					return { success: true };
				},
			);
		};
	},

	api: {},
};
