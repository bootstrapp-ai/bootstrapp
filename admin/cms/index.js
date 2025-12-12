import $APP from "/$app.js";

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
