import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import T from "@bootstrapp/types";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
// TODO: add DOMPurify
export default {
  tag: "uix-markdown",
  style: true,
  class: "prose max-w-none",
  properties: { content: T.string() },
  render() {
    return unsafeHTML(marked.parse(this.content || ""));
  },
};
