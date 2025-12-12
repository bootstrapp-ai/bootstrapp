export default {
	name: "history",
	initialize(host) {
		let history = [];
		const listeners = new Set();
		const notifyListeners = (action, entry) => {
			for (const listener of listeners) {
				try {
					listener({ action, entry, history: [...history] });
				} catch (error) {
					console.error("Error in history listener:", error);
				}
			}
		};
		this.api.onHistoryChange = (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		};

		this.api.addToHistory = (entry) => {
			const historyEntry = {
				id: Date.now() + Math.random(),
				timestamp: new Date().toISOString(),
				...entry,
			};
			history = [historyEntry, ...history];
			notifyListeners("add", historyEntry);
			return historyEntry;
		};

		this.api.updateHistory = (id, updates) => {
			let updatedEntry = null;
			history = history.map((h) => {
				if (h.id === id) {
					updatedEntry = {
						...h,
						...updates,
						updatedAt: new Date().toISOString(),
					};
					return updatedEntry;
				}
				return h;
			});
			if (updatedEntry) {
				notifyListeners("update", updatedEntry);
			}
			return updatedEntry;
		};

		this.api.getHistory = () => [...history];

		this.api.clearHistory = () => {
			history = [];
			notifyListeners("clear", null);
		};

		this.api.withHistory = async (operationName, args, operation) => {
			const historyEntry = this.api.addToHistory({
				toolName: operationName,
				args,
				status: "pending",
			});
			try {
				const result = await operation();
				this.api.updateHistory(historyEntry.id, {
					status: "success",
					result,
				});
				if (typeof result === "object" && result !== null && !result.history) {
					result.history = historyEntry;
				}
				return result;
			} catch (error) {
				console.error(`Failed to execute ${operationName}:`, error);
				this.api.updateHistory(historyEntry.id, {
					status: "error",
					error: error.message,
				});
				return { error, history: historyEntry };
			}
		};
	},

	api: {},
};
