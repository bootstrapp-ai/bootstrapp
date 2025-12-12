import $APP from "/$app.js";

if ($APP.settings.runtime === "worker") {
  const bootstrap = async () => {
    console.log("bootstrap() called");
    const APP = await $APP.bootstrap({
      backend: true,
    });
    return APP;
  };

  let commsPort;
  const events = [];
  const MessageHandler = {
    handleMessage: async ({ data }) => {
      if (data.eventId && events.includes(data.eventId)) return;
      if (data.eventId) events.push(data.eventId);
      const respond =
        data.eventId &&
        ((responsePayload) => {
          if (commsPort)
            commsPort.postMessage({
              eventId: data.eventId,
              payload: responsePayload,
              connection: data.connection,
            });
        });
      if ($APP?.Backend) {
        console.log(`Routing message to backend: ${data.type}`, data);
        $APP.Backend.handleMessage({
          data,
          respond,
        });
      } else {
        $APP.events.on("APP:DATABASE:STARTED", async () => {
          console.log(
            `Routing message to backend after APP:DATABASE:STARTED: ${data.type}`,
          );
          $APP.Backend.handleMessage({
            data,
            respond,
          });
        });
      }
    },
  };

  self.addEventListener("message", async (event) => {
    if (event.data.type === "APP:BACKEND:START") {
      commsPort = event.ports[0];
      console.info("Communication port initialized");
      commsPort.onmessage = MessageHandler.handleMessage;
      (async () => {
        await bootstrap();
        commsPort.postMessage({ type: "APP:BACKEND:READY" });
        $APP.Backend.client = commsPort;
      })();
    }
  });
}
