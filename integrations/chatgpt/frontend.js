if ($APP.settings.currentUrl.startsWith("https://chatgpt.com")) {
  (async () => {
    await chatgpt.isLoaded();
  })();
}

import { html } from "lit-html";

$APP.mv3Content.add(html`<chatgpt-content></chatgpt-content>`);
$APP.mv3Connections.add("chatgpt");
$APP.events.on(ASK_CHATGPT, async ({ payload }) => {
  const response = await chatgpt.askAndGetReply(payload.query);
  return response;
});
