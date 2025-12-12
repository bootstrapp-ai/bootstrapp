import $APP from "/node_modules/@bootstrapp/base/app.js";

$APP.addModule({
	name: "project",
	path: "apps/project",
	settings: {
		appbar: {
			label: "Management",
			icon: "folder",
		},
	},
});
