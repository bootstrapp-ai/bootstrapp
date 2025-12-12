$APP.addModule({
	name: "whatsapp",
	path: "integrations/whatsapp",
	backend: true,
	frontend: true,
	modules: ["mv3"],
	settings: {
		appbar: {
			label: "WhatsApp",
			icon: "phone",
		},
	},
});
