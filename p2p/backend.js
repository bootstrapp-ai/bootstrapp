import Model from "/node_modules/@bootstrapp/model/index.js";
import $APP from "/node_modules/@bootstrapp/base/app.js";

$APP.events.set({
	"P2P:LOAD_DATA_OP": async ({ payload }) => {
		const { model, method, row, id } = payload;
		if (method === "add")
			Model[model].add(row, { skipP2PSync: true, keepIndex: true });
		if (method === "edit")
			Model[model].edit(row, { skipP2PSync: true, keepIndex: true });
		if (method === "remove") Model[model].remove(id, { skipP2PSync: true });
	},
	"P2P:JOIN_APP": async ({ payload, respond }) => {
		const { app, db } = payload;
		const { id, models, version, timestamp } = app;
		if (!id) {
			return respond({ error: "An 'appId' is required to join an app." });
		}

		await $APP.SysModel.editMany($APP.settings.sysmodels.APP, {
			active: false,
		});

		let appToJoin = await $APP.SysModel.get($APP.settings.sysmodels.APP, {
			id,
		});

		if (!appToJoin)
			appToJoin = await $APP.Backend.createAppEntry({
				id,
				models,
				version,
				timestamp,
			});
		else {
			await $APP.SysModel.edit($APP.settings.sysmodels.APP, {
				id,
				active: true,
			});
			appToJoin = await $APP.SysModel.get($APP.settings.sysmodels.APP, {
				id: id,
			});
		}
		const env = await setupAppEnvironment({
			...appToJoin,
			migrationTimestamp: Date.now(),
		});
		if (db) $APP.SYSTEM.import({ app: env.app, dump: db });
		respond(env.app);
	},

	"P2P:REGISTER_PEER_CONNECTION": async ({ payload, respond }) => {
		const { appId, userId, peerId } = payload;
		const app = await $APP.SysModel.get($APP.settings.sysmodels.APP, {
			id: appId,
		});
		if (!app) {
			return respond({ success: false, error: "App not found" });
		}

		const newConnection = { userId, peerId, timestamp: Date.now() };
		const updatedConnections = [...(app.connections || []), newConnection];

		await $APP.SysModel.edit($APP.settings.sysmodels.APP, {
			id: appId,
			connections: updatedConnections,
		});

		respond({ success: true });
	},

	"P2P:UNREGISTER_PEER_CONNECTION": async ({ payload, respond }) => {
		const { appId, peerId } = payload;
		if (!appId || !peerId) {
			return respond({
				success: false,
				error: "Both 'appId' and 'peerId' are required.",
			});
		}

		const app = await $APP.SysModel.get($APP.settings.sysmodels.APP, {
			id: appId,
		});

		if (!app) return respond({ success: false, error: "App not found" });

		if (!app.connections || app.connections.length === 0)
			return respond({ success: true });

		const updatedConnections = app.connections.filter(
			(conn) => conn.peerId !== peerId,
		);

		if (updatedConnections.length < app.connections.length) {
			await $APP.SysModel.edit($APP.settings.sysmodels.APP, {
				id: appId,
				connections: updatedConnections,
			});
		}

		respond({ success: true });
	},
});

$APP.events.set({
	onAddRecord({ model, row, system, opts }) {
		if (opts.skipP2PSync) return;
		if (system) return;
		$APP.Backend.broadcast({
			type: "P2P:SEND_DATA_OP",
			payload: { method: "add", model, row },
		});
	},
	onEditRecord({ model, row, system, opts }) {
		if (opts.skipP2PSync) return;
		if (system) return;
		$APP.Backend.broadcast({
			type: "P2P:SEND_DATA_OP",
			payload: { method: "edit", model, row },
		});
	},
	onRemoveRecord({ model, id, system, opts }) {
		if (opts.skipP2PSync) return;
		if (system) return;
		$APP.Backend.broadcast({
			type: "P2P:SEND_DATA_OP",
			payload: { method: "remove", model, id },
		});
	},
});
