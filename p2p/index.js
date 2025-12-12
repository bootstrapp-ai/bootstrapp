import $APP from "/$app.js";

const p2p = {};
$APP.events.install(p2p);
$APP.addModule({
	name: "p2p",
});
const events = {
	"P2P:SEND_DATA_OP": ({ payload }) => {
		console.log("P2P DATA OP", { payload });
		$APP.p2p.emit("SEND_DATA_OP", payload);
	},
};
$APP.events.set(events);
export default p2p;
