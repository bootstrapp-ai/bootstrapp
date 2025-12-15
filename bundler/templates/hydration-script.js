export default (settings = {}) => `
        const startApp = async () => {
            if (!("serviceWorker" in navigator)) 
                throw new Error("Platform not supported");            
            const hadController = !!navigator.serviceWorker.controller;
            const registration = await navigator.serviceWorker.register("/sw.js", {
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
            const { default: $APP } = await import("/$app.js");
            await $APP.load(true);
            if ($APP.SW?.setRegistration) {
                $APP.SW.setRegistration(registration);
                const updateConfig = ${JSON.stringify(settings.swUpdate || { onPageLoad: true })};
                $APP.SW.enableAutoUpdates(updateConfig);
            }
        };

        startApp();`;
