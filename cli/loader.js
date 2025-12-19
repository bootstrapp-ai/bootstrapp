/**
 * Custom ESM loader for resolving /$app/ virtual paths in CLI context
 *
 * Usage: node --import ./loader.js your-script.js
 * Or: node --loader ./loader.js your-script.js (deprecated)
 */

import { register } from "node:module";
import { pathToFileURL } from "node:url";

// Register the hooks
register("./loader-hooks.js", pathToFileURL(import.meta.url));
