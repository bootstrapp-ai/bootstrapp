import $APP from "/app";
import config from "/app/config.js";

try {
  if (!("serviceWorker" in navigator))
    throw new Error("Platform not supported");
  await navigator.serviceWorker.register("/backend.js", {
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
  try {
    const currentPort = window.location.port;
    const debugPort = config.devServer.getWsPort(currentPort);
    const wsUrl = `${window.location.protocol === "https:" ? "wss" : "ws"}://${
      window.location.hostname
    }:${debugPort}`;
    const ws = new WebSocket(wsUrl);

    ws.addEventListener("message", (event) => {
      if (event.data === "APP:REFRESH") {
        console.log("Received refresh request from dev server");
        window.location.reload();
      }
    });
  } catch (e) {
    console.warn("WebSocket connection to dev server failed:", e);
  }
}
