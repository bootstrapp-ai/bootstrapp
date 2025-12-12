if (
	$APP.settings.IS_MV3 ||
	$APP.settings.mv3Main ||
	$APP.settings.mv3Injected
) {
	const init = () => {
		const { render } = html;
		const drawerContainer = document.createElement("div");
		document.body.appendChild(drawerContainer);
		render(
			html`<uix-drawer z-index="10000" .content=${$APP.mv3Content}></uix-drawer>`,
			drawerContainer,
		);
		const style = document.createElement("style");
		style.textContent = `
  *:not(:defined) {
    border: none !important;
  }
`;
		document.head.appendChild(style);
	};
	const connectMV3 = () => {
		const { matches = {} } = $APP.settings;
		const currentUrl = window.location.href;

		const [connectionName, url] =
			Object.entries(matches).find(([, url]) => currentUrl.startsWith(url)) ||
			[];

		const connection = chrome.runtime.connect({
			name: connectionName || "sw",
		});
		connection.onMessage.addListener((message = {}) => {
			const events = $APP.mv3Events || {};
			const handler = events[message.type];
			if (handler) handler(message);
		});
		connection.postMessage({ type: "INIT" });
		const postMessage = (message) => connection.postMessage(message);

		const mv3 = { postMessage, connection };
		$APP.addModule({ name: "mv3", base: mv3 });
	};
	if ($APP.settings.mv3Injected) {
		connectMV3();
		$APP.mv3.connection.onMessage.addListener((message = {}) =>
			$APP.Backend.handleSWMessage({
				data: message.data ? message.data : message,
				source: $APP.mv3,
			}),
		);
	}
	$APP.events.on("APP:INIT", init);
}
