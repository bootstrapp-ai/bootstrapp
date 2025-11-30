const datetime = { formatTime: () => {} };

import T from "@bootstrapp/types";
import { html } from "lit-html";
export default {
  tag: "uix-time",
  properties: { timestamp: T.number() },
  render() {
    return html`${datetime.formatTime(this.timestamp)}`;
  },
};
