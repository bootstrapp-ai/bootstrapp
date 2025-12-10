import $APP from "/app";
export default {
	tag: "app-dev-only",

	connected() {
		if ($APP.settings.dev) {
			const template = this.querySelector("template");
			if (template) {
				this.append(template.content.cloneNode(true));
			}
		}
	},
};
