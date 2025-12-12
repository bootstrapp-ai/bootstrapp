import config from "/$app/base/config.js";
import createEventHandler from "/$app/events/index.js";
import { initSWBackend } from "/$app/sw/backend.js";
import $APP from "/$app.js";

$APP.addModule({ name: "events", base: createEventHandler({}) });
initSWBackend($APP, config);
import "/$app/base/backend/workers/database.js";
