(async () => {
	await import("/app.js");
	try {
		const res = await fetch(chrome.runtime.getURL("project.json"));
		const project = await res.json();
		await $APP.bootstrap(project, {
			mv3Injected: true,
			mv3Main: false,
			mv3: true,
		});
	} catch (error) {
		console.log("ERROR", { error });
	}
})();
