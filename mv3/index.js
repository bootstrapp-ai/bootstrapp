$APP.addModule({
	name: "mv3",
	backend: true,
	frontend: true,
	settings: { connections: [], connectionName: "sw" },
});

$APP.addModule({
	name: "mv3Events",
});

$APP.addModule({
	name: "mv3Requests",
});

$APP.addModule({
	name: "mv3Connections",
	base: new Set(),
});

$APP.addModule({
	name: "mv3Servers",
});

$APP.addModule({
	name: "mv3ContentScripts",
	base: new Set(),
});

$APP.addModule({
	name: "mv3Content",
	base: new Set(),
});
