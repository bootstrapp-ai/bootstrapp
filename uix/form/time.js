const datetime = { formatTime: () => {} };

import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
export default {
  tag: "uix-time",
  properties: { timestamp: T.number() },
  render() {
    return html`${datetime.formatTime(this.timestamp)}`;
  },
};
