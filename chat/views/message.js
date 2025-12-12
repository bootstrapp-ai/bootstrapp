import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";

export default {
  properties: {
    message: T.object({}),
    isUser: T.boolean(false),
    isStreaming: T.boolean(false),
    inContext: T.boolean(false),
    onContextToggle: T.function(),
  },
  _formatTimestamp(timestamp) {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  },
  _renderToolCall(toolCall) {
    return html`
                <div class="bg-inverse border-l-4 border-surface-lighter p-3 mt-2 rounded-md">
                    <div class="font-mono text-secondary font-semibold flex items-center gap-2">
                        <uix-icon name="pickaxe" class="w-3.5 h-3.5"></uix-icon>
                        ${toolCall.name}
                    </div>
                    ${
                      toolCall.arguments
                        ? html`<pre class="text-sm text-muted mt-2 whitespace-pre-wrap bg-inverse p-2 rounded">${JSON.stringify(toolCall.arguments, null, 2)}</pre>`
                        : ""
                    }
                    ${
                      toolCall.result
                        ? html`
                                <div class="mt-2">
                                    <div class="font-semibold text-sm text-muted">Result:</div>
                                    <pre class="text-sm bg-inverse p-2 rounded mt-1 whitespace-pre-wrap">${typeof toolCall.result === "string" ? toolCall.result : JSON.stringify(toolCall.result, null, 2)}</pre>
                                </div>
                              `
                        : ""
                    }
                </div>
            `;
  },
  render() {
    const { message, isUser } = this;
    const senderIcon = isUser
      ? html`<div class="w-8 h-8 rounded-full bg-secondary-dark flex-shrink-0 flex items-center justify-center font-bold">Y</div>`
      : html`<div class="w-8 h-8 rounded-full bg-surface-light border border-surface-lighter flex-shrink-0 flex items-center justify-center text-secondary">
                            <uix-icon name="bot" class="w-5 h-5"></uix-icon>
                        </div>`;

    return html`<div class="flex w-full items-start gap-3 my-4 group ${isUser ? "flex-row-reverse" : ""}">
                     <div class="flex-shrink-0 pt-1.5">
                         <button
                            @click=${() => this.onContextToggle(this.message.id)}
                            class="transition-all ${this.inContext ? "text-secondary" : "text-surface-lighter"} hover:text-[default]"
                            title="Include this message in the next turn's context"
                         >
                            <uix-icon name=${this.inContext ? "circle-check" : "circle"} class="w-4 h-4"></uix-icon>
                         </button>
                    </div>

                    ${senderIcon}
                    
                    <div class="max-w-[75%]">
                        <div class="flex items-baseline gap-2 mb-1 ${isUser ? "justify-end" : ""}">
                            <span class="font-bold ${isUser ? "text-default-light" : "text-muted"}">${isUser ? "You" : "Assistant"}</span>
                            ${message.timestamp ? html`<span class="text-sm text-muted">${this._formatTimestamp(message.timestamp)}</span>` : ""}
                        </div>
                        <div class="bg-surface-light border border-surface-lighter rounded-lg p-3 shadow-sm ">
                            ${message.content ? html`<uix-markdown style="--border-color: default" class="prose prose-sm p-2 max-w-none whitespace-pre-wrap" content=${message.content}></uix-markdown>` : ""}
                            ${message.toolCalls?.length > 0 ? message.toolCalls.map((toolCall) => this._renderToolCall(toolCall)) : ""}
                            ${this.isStreaming ? html`<div class="inline-block w-2 h-4 bg-[default] animate-pulse ml-1"></div>` : ""}
                        </div>
                    </div>
                </div>
            `;
  },
};
