import config from "/$app/base/config.js";
import $APP from "/$app.js";

try {
  if (!("serviceWorker" in navigator))
    throw new Error("Platform not supported");
  const registration = await navigator.serviceWorker.register("/backend.js", {
    type: "module",
  });
  await Promise.race([
    new Promise((resolve) => {
      if (navigator.serviceWorker.controller) return resolve();
      navigator.serviceWorker.addEventListener("controllerchange", () =>
        resolve(),
      );
    }),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Service Worker timed out.")),
        config.serviceWorker.initTimeout,
      ),
    ),
  ]);
  sessionStorage.removeItem("_sw");
  await $APP.load();

  if ($APP.SW?.setRegistration) $APP.SW.setRegistration(registration);
} catch (error) {
  console.error("Service Worker initialization error:", error);
  const retryCount = Number.parseInt(sessionStorage.getItem("_sw") || "0", 10);
  if (retryCount < config.serviceWorker.maxRetries) {
    sessionStorage.setItem("_sw", String(retryCount + 1));
    console.warn(
      `Retrying Service Worker initialization (attempt ${retryCount + 1}/${config.serviceWorker.maxRetries})`,
    );
    window.location.reload();
  } else {
    sessionStorage.removeItem("_sw");
    console.error(
      `Could not start ServiceWorker after ${config.serviceWorker.maxRetries} attempts`,
    );
  }
}
if ($APP.settings.dev) {
  // Expose type generation method for manual triggering in dev mode
  $APP.generateTypes = async () => {
    console.log("Generating component types...");
    try {
      const { generateTypes } = await import("/$app/types/browser-generator.js");
      return await generateTypes();
    } catch (e) {
      console.error("Failed to generate types:", e);
      return { success: false, error: e.message };
    }
  };

  try {
    const currentPort = window.location.port;
    const debugPort = config.devServer.getWsPort(currentPort);
    const wsUrl = `${window.location.protocol === "https:" ? "wss" : "ws"}://${
      window.location.hostname
    }:${debugPort}`;
    const ws = new WebSocket(wsUrl);

    ws.addEventListener("message", async (event) => {
      const data = event.data;

      // Handle simple string messages
      if (data === "APP:REFRESH") {
        console.log("Received refresh request from dev server");
        window.location.reload();
        return;
      }

      if (data === "TYPES:GENERATE") {
        console.log("Received type generation request from dev server");
        await $APP.generateTypes();
        return;
      }

      // Handle JSON messages
      try {
        const msg = JSON.parse(data);

        if (msg.type === "TESTS:RUN") {
          console.log("Received test run request from dev server");
          const { runTests } = await import("/$app/base/test/browser-runner.js");
          await runTests(msg.options || {});
        }
      } catch (e) {
        // Not JSON, ignore
      }
    });
  } catch (e) {
    console.warn("WebSocket connection to dev server failed:", e);
  }
}
