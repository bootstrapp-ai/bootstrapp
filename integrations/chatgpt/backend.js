if ($APP.settings.IS_MV3) {
	(async () => {
		console.log("run chatgpt");
		$APP.mv3ContentScripts.add({
			id: "chatgpt_library",
			matches: ["https://chatgpt.com/*"],
			js: ["modules/chatgpt/chatgpt.js"],
			runAt: "document_start",
		});
	})();
}
