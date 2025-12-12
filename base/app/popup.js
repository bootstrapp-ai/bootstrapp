import { html } from "/npm/lit-html";
export default {
  tag: "app-popup",
  connected() {
    chrome.runtime.onMessage.addListener(
      ((message) => {
        const handler = $APP.mv3Events[message.type];
        if (handler) handler(message, this);
      }).bind(this),
    );
  },

  render() {
    const { mv3Popup = [] } = $APP;
    return html`
      <div class="min-w-[300px] p-4 flex flex-col gap-4">
        ${mv3Popup}
      </div>`;
  },
};
