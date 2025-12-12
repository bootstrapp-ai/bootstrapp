const MY_NUMBER = "5521972393850@c.us";

// Helper functions
const isCommand = (body = "") => body.startsWith("/");
const parseCommand = (body) => {
	const parts = body.slice(1).match(/[^\s"]+|"([^"]*)"/gi);
	return parts.map((part) => part.replace(/^"(.*)"$/, "$1"));
};

// Helper to send response back to window
const sendResponse = (response) => {
	window.postMessage(response, "*");
};

// Main message handler
const handleNewMessage = (msg) => {
	const groupId = msg.author ? msg.from.toString() : null;
	const from = msg.author || msg.from;
	const processed = {
		id: msg.id.id,
		body: msg.body,
		groupId,
		from: from.user,
		name: msg.notifyName,
		timestamp: msg.t,
		isMe: msg.id.fromMe,
		isGroup: !!msg.id.participant,
		isCommand: isCommand(msg.body),
		params: [],
	};

	if (processed.isCommand) {
		[processed.command, ...processed.params] = parseCommand(processed.body);
	}

	if (processed) {
		window.postMessage({
			type: "WHATSAPP_NEW_MESSAGE",
			payload: processed,
		});
	}
};

const whatsappEventHandlers = {
	WHATSAPP_SEND_MESSAGE: async ({ payload }) => {
		const { chatId, message } = payload;
		try {
			await WPP.chat.sendTextMessage(chatId, message);
		} catch (error) {
			console.error("Error sending message:", error);
		}
	},

	WHATSAPP_JOIN_GROUP: async ({ payload }) => {
		const { groupLink } = payload;
		await WPP.group.join(groupLink);
		const inviteCode = groupLink.split("/").at(-1);
		const groupInfo = await WPP.group.getGroupInfoFromInviteCode(inviteCode);
		console.log("Join attempt result:", { groupInfo });
	},
};

// Handle participant changes and get group data
const handleParticipantChanged = async (event) => {
	console.log({ event });
	if (event.action === "join" && event.participants.includes(MY_NUMBER)) {
		const participants = await WPP.group.getParticipants(event.groupId);
		const payload = {
			groupId: event.groupId,
			participants: participants,
		};
		sendResponse({
			type: "WHATSAPP_GROUP_JOINED",
			payload,
		});
	}
};

const processedEvents = new Set();
const isValidEvent = (event) => {
	if (event.source !== window) return false;
	const { eventId, mv3 } = event.data;
	if (!eventId || !mv3) return false;
	if (processedEvents.has(eventId))
		return !!console.log(`Event ${eventId} already processed, skipping`);
	processedEvents.add(eventId);
	return true;
};

const processEvent = async (event) => {
	const { eventId, type, payload } = event.data;
	try {
		const handler = whatsappEventHandlers[type];
		if (!handler)
			return console.warn(`No handler found for event type: ${type}`);
		console.log("Processing event:", { eventId, type, payload });
		const response = await handler({ type, payload });
		if (processedEvents.size > 1000) {
			const oldestEvents = Array.from(processedEvents).slice(0, 500);
			oldestEvents.forEach((id) => processedEvents.delete(id));
		}
		if (response) sendResponse(response);
	} catch (error) {
		console.error(`Error processing event ${eventId}:`, error);
	}
};

// Main event listener
window.addEventListener("message", async (event) => {
	if (!isValidEvent(event)) return;
	await processEvent(event);
});

// Set up the message listener
try {
	WPP.webpack.injectLoader();
	(() => {
		WPP.webpack.onReady(() => {
			setTimeout(async () => {}, 5000);
		});
	})();

	WPP.on("chat.new_message", handleNewMessage);
	WPP.on("group.participant_changed", handleParticipantChanged);
} catch (error) {
	console.error("Error setting up WhatsApp message listener:", error);
	window.location.reload();
}
