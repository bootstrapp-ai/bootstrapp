import createEventHandler from "/node_modules/@bootstrapp/events/index.js";
import $APP from "./app.js";
import config from "./config.js";
import { initSWBackend } from "/node_modules/@bootstrapp/sw/backend.js";

$APP.addModule({ name: "events", base: createEventHandler({}) });
initSWBackend($APP, config);
import "./backend/workers/database.js";
