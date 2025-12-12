const processedUrls = new Map();
const DEBOUNCE_TIME = 5000;
function shouldProcessRequest(url, request) {
	if (!$APP.mv3Events[request] || !url.startsWith("https")) return false;
	const currentTime = Date.now();
	const lastProcessedTime = processedUrls.get(url);
	if (lastProcessedTime && currentTime - lastProcessedTime <= DEBOUNCE_TIME)
		return false;

	processedUrls.set(url, currentTime);
	for (const [processedUrl, time] of processedUrls.entries())
		if (currentTime - time > DEBOUNCE_TIME) processedUrls.delete(processedUrl);
	return true;
}

async function processRequest(url, request) {
	try {
		const response = await fetch(url);
		const content = await response.text();
		const handler = $APP.mv3Events[request];
		const data = await handler({ url, request, content });
		return data;
	} catch (error) {
		console.error(`Error fetching and processing ${url}:`, error);
	}
}

self.chrome.webRequest.onCompleted.addListener(
	(details = {}) => {
		const { url } = details;
		const urlRequest = $APP.fs.getRequestPath(url);
		const request = Object.entries($APP.mv3Requests || {}).find(([key]) =>
			urlRequest.includes(key),
		)?.[1];
		if (shouldProcessRequest(url, request)) processRequest(url, request);
	},
	{ urls: ["<all_urls>"] },
);

self.chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	const { type, payload } = message;
	const events = $APP.mv3Events || {};
	const handler = events[type];
	if (handler) {
		try {
			handler(payload, sender);
			console.log(type, "Executed successfully");
		} catch (error) {
			console.error(`Error handling event ${type}:`, error);
		}
	} else {
		console.warn(`No handler registered for event type: ${type}`);
	}
});

const init = async () => {
	try {
		if ($APP.mv3ContentScripts) {
			await chrome.scripting.unregisterContentScripts();
			await chrome.scripting.registerContentScripts(
				$APP.mv3ContentScripts.map(({ id, matches, js, runAt, world }) => ({
					id,
					matches,
					js,
					runAt: runAt || "document_idle",
					world: world || "ISOLATED",
				})),
			);
		}
		console.log("Content scripts registered successfully");
	} catch (error) {
		console.error("Error registering content scripts:", error);
	}
};

const CONTENT_SCRIPTS = [
	{
		id: "customelements_index",
		matches: ["<all_urls>"],
		js: ["modules/mv3/custom-elements.min.js"],
		runAt: "document_start",
	},
	{
		id: "contentscripts_index",
		matches: ["<all_urls>"],
		js: ["modules/mv3/content-script-start.js"],
		runAt: "document_start",
		world: "MAIN",
	},
	{
		id: "contentscripts_start_index",
		matches: ["<all_urls>"],
		js: ["modules/mv3/content-script.js"],
		runAt: "document_idle",
	},
];

$APP.events.on("APP:INIT", init);
$APP.mv3ContentScripts.add(...CONTENT_SCRIPTS);
const connections = {};
const postMessage = (data, conn) => connections[conn]?.postMessage(data);

chrome.runtime.onConnect.addListener((port) => {
	connections[port.name] = port;
	console.log("Connected:", port.name);
	port.onMessage.addListener((message) => {
		console.log({ message }, "RECEIVED MESSAGE");
		$APP.Backend.handleMessage({ data: message, source: port });
	});
});

const mv3 = { postMessage, connections };
export default mv3;
