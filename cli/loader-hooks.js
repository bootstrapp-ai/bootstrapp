/**
 * ESM loader hooks for resolving /$app/ virtual paths
 *
 * Simple mapping: /$app/ → node_modules/@bootstrapp/
 */

import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Resolve hook - maps /$app/ to node_modules/@bootstrapp/
 */
export async function resolve(specifier, context, nextResolve) {
  // /$app.js → node_modules/@bootstrapp/base/app.js
  if (specifier === "/$app.js") {
    const resolved = path.join(process.cwd(), "node_modules/@bootstrapp/base/app.js");
    return { shortCircuit: true, url: pathToFileURL(resolved).href };
  }

  // /$app/* → node_modules/@bootstrapp/*
  if (specifier.startsWith("/$app/")) {
    const resolved = path.join(
      process.cwd(),
      "node_modules/@bootstrapp",
      specifier.slice(6) // Remove "/$app/"
    );
    return { shortCircuit: true, url: pathToFileURL(resolved).href };
  }

  return nextResolve(specifier, context);
}
