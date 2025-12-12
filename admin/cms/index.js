import $APP from "/node_modules/@bootstrapp/base/app.js";

$APP.addModule({
	name: "cms",
	path: "apps/cms/views",
	settings: {
		appbar: {
			label: "Data",
			icon: "database",
		},
	},
});
