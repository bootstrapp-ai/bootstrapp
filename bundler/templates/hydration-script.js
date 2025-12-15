export default () => `
        const startApp = async () => {
            if (!("serviceWorker" in navigator)) {
                console.warn("Service Worker not supported.");
                throw new Error("Platform not supported");
            }

            const hadController = !!navigator.serviceWorker.controller;

            await navigator.serviceWorker.register("/sw.js", {
                scope: "/",
                type: "module",
            });

            if (!hadController) {
                await new Promise((resolve) => {
                    if (navigator.serviceWorker.controller) return resolve();
                    navigator.serviceWorker.addEventListener("controllerchange", resolve);
                });
                console.log("SW installed, reloading...");
                window.location.reload();
                return;
            }

            console.log("SW is in control!");
            const { default: $APP } = await import("/$app.js");
            await $APP.load(true);
        };

        startApp();`;
