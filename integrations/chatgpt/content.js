import Model from "/node_modules/@bootstrapp/model/index.js";
import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";
import Controller from "/node_modules/@bootstrapp/controller/index.js";
export default {
  tag: "chatgpt-content",

  properties: {
    response: T.string(),
    input: T.string(),
  },

  async tryBackend() {
    const res = await Model.events.getAll();
  },

  async askChatGPT() {
    if (!chatgpt) return;
    const isLoaded = await chatgpt.isLoaded();
    if (isLoaded) {
      const response = await chatgpt.askAndGetReply(this.input);
      chatgpt.alert(response);
      this.response = response;
    }
  },

  async askChatGPTRemote() {
    const response = await Controller.chatgpt("ASK_CHATGPT", {
      query: this.input,
    });
    this.response = response;
  },

  async createApp() {
    $APP.AI.agents.add("codegenAgent", {
      name: "Code Generation Agent",
      modules: ["codegen", "chatgpt"],
    });
    const testAgent = $APP.AI.agents.start("codegenAgent");
    const response = await testAgent.codegen.createApp(
      {
        description:
          "create a simple snake game in a single html file, you can use Lit-html importing using some cdn. no other dependencies",
        language: "javascript",
      },
      { provider: "chatgpt" },
    );
    this.response = response;
  },

  render() {
    return html`
			<div class="flex flex-col gap-4 max-w-3xl mx-auto p-4">
				<uix-input .bind=${this.prop("input")} class="w-full"></uix-input>

				<div class="flex flex-wrap gap-3">
					<uix-button label="Try Backend" @click=${this.tryBackend}></uix-button>
					<uix-button label="Ask ChatGPT" @click=${this.askChatGPT}></uix-button>
					<uix-button label="Ask ChatGPT REMOTE" @click=${this.askChatGPTRemote.bind(this)}></uix-button>
					<uix-button label="Create App" @click=${this.createApp.bind(this)}></uix-button>
				</div>

				${
          this.response
            ? html`
							<div padding="lg" class="whitespace-pre-wrap bg-gray-50 rounded p-4 border border-gray-200">
								${this.response}
							</div>
					  `
            : ""
        }
			</div>
		`;
  },
};
