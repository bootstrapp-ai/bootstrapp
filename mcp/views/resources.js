import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import AI from "/$app/ai/index.js";
export default {
  tag: "mcp-resources",
  properties: {
    resourceType: T.string(),
    viewMode: T.string({ defaultValue: "side-by-side" }),
    resources: T.array([]),
    resourceTemplates: T.array([]),
    isLoading: T.boolean(true),
    selectedResource: T.object(null),
    selectedTemplate: T.object(null),
    resourceArgs: T.object({}),
    isExecuting: T.boolean(false),
    resourceResponse: T.any(null),
  },
  connected() {
    this.loadData();
  },
  async loadData() {
    this.isLoading = true;
    try {
      const servers = AI.listClients();
      if (servers && servers.length > 0) {
        const [{ resources }, { resourceTemplates }] = await Promise.all([
          AI.listResources({ servers }),
          AI.listResourceTemplates({ servers }),
        ]);
        this.resources = resources || [];
        this.resourceTemplates = resourceTemplates || [];
      }
    } catch (error) {
      console.error("Error loading resources:", error);
      this.resources = [];
      this.resourceTemplates = [];
    } finally {
      this.isLoading = false;
    }
  },
  async handleReadResource() {
    const resource = this.selectedResource || this.selectedTemplate;
    const isTemplate = !!this.selectedTemplate;
    const uriTemplate = isTemplate ? resource.uriTemplate : resource.uri;

    const uri = Object.entries(this.resourceArgs).reduce(
      (acc, [key, value]) => acc.replace(`{${key}}`, value),
      uriTemplate,
    );

    this.isExecuting = true;
    this.resourceResponse = null;
    try {
      const response = await AI.readResource({ uri });
      this.resourceResponse = response;
      console.log({ response });
    } catch (e) {
      console.error(`Failed to read resource ${uri}:`, e);
      this.resourceResponse = {
        error: e.message || "An unknown error occurred.",
      };
    } finally {
      this.isExecuting = false;
    }
  },
  selectResource(res) {
    this.selectedResource = res;
    this.selectedTemplate = null;
    this.resourceArgs = {};
    this.resourceResponse = null;
  },
  selectTemplate(template) {
    this.selectedTemplate = template;
    this.selectedResource = null;
    this.resourceArgs = {};
    this.resourceResponse = null;
  },
  deselectReaderView() {
    this.selectedResource = null;
    this.selectedTemplate = null;
    this.resourceResponse = null;
  },
  handleResourceArgInput(paramName, event) {
    this.resourceArgs = {
      ...this.resourceArgs,
      [paramName]: event.target.value,
    };
  },
  _extractUriParams(uri) {
    const regex = /\{(.+?)\}/g;
    return [...uri.matchAll(regex)].map((match) => match[1]);
  },

  _renderReaderContent() {
    const resource = this.selectedResource || this.selectedTemplate;
    if (!resource) return "";

    const isTemplate = !!this.selectedTemplate;
    const uri = isTemplate ? resource.uriTemplate : resource.uri;
    const uriParams = isTemplate ? this._extractUriParams(uri) : [];

    return html`
                <div>
                    <h4 class="font-bold text-sm mb-1 dark font-mono">${uri}</h4>
                    <p class="text-xs text-gray-600 mb-4">${resource.description || "No description provided."}</p>
                    
                    ${
                      !isTemplate
                        ? null
                        : html`<div class="space-y-3">
                        ${
                          uriParams.length > 0
                            ? uriParams.map(
                                (paramName) => html`
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 mb-1">${paramName}</label>
                                            <uix-input
                                                .value=${this.resourceArgs[paramName] || ""}
                                                @input=${(e) => this.handleResourceArgInput(paramName, e)}
                                                placeholder="Enter value for ${paramName}"
                                                class="font-mono text-xs"
                                            ></uix-input>
                                        </div>
                                    `,
                              )
                            : html`<p class="text-xs text-gray-500">This resource takes no parameters.</p>`
                        }
                    </div>`
                    }
                    <div class="mt-4 border-t pt-4">
                        <uix-button
                            label=${this.isExecuting ? "Reading..." : "Read Resource"}
                            class="is-primary w-full"
                            @click=${this.handleReadResource.bind(this)}
                            ?disabled=${this.isExecuting}
                        ></uix-button>
                    </div>
                </div>
            `;
  },

  _renderResponseView() {
    if (!this.resourceResponse) return "";
    return html`
                <div class="mt-6 border-t pt-4 dark">
									<h4 class="font-semibold text-sm mb-3">Response</h4>
                    ${
                      this.resourceResponse.error
                        ? html`<div class="bg-red-50 text-red-700 rounded p-3 text-sm font-mono">${this.resourceResponse.error}</div>`
                        : html`<pre class="text-xs whitespace-pre-wrap bg-gray-800 text-gray-200 p-2 rounded-lg font-mono overflow-auto">${this.resourceResponse?.contents?.[0]?.text}</pre>`
                    }
                </div>
            `;
  },

  _renderList() {
    return html`
                <ul class="text-xs font-mono space-y-1">
                    ${
                      this.resourceType === "resources" || !this.resourceType
                        ? this.resources.map(
                            (
                              res,
                            ) => html`<li><button @click=${() => this.selectResource(res)} class="w-full text-left p-2 rounded text-sm hover:bg-gray-100 ${this.selectedResource?.uri === res.uri ? "bg-blue-50 font-semibold text-blue-700" : ""}">
                        <p class="font-mono text-sm flex items-center"><uix-icon name="file-text" class="w-4 h-4 mr-2 text-gray-500"></uix-icon>${res.uri}</p>
                    </button></li>`,
                          )
                        : null
                    }
                    ${
                      this.resourceType === "templates" || !this.resourceType
                        ? this.resourceTemplates.map(
                            (
                              template,
                            ) => html`<li><button @click=${() => this.selectTemplate(template)} class="w-full text-left p-2 rounded text-sm hover:bg-gray-100 ${this.selectedTemplate?.uriTemplate === template.uriTemplate ? "bg-blue-50 font-semibold text-blue-700" : ""}">
                        <p class="font-mono text-sm flex items-center"><uix-icon name="file-code-2" class="w-4 h-4 mr-2 text-blue-600"></uix-icon>${template.uriTemplate}</p>
                    </button></li>`,
                          )
                        : null
                    }
                </ul>
             `;
  },
  _generateTitle() {
    const titles = {
      resources: "Resources",
      templates: "Templates",
    };
    const title = titles[this.resourceType] || "Resources & Templates";
    return html`<h3 class="font-semibold text-sm p-2 text-gray-800">${title}</h3>`;
  },
  _renderFlowView() {
    if (this.isLoading) {
      return html`<div class="flex items-center justify-center h-full"><p class="text-xs text-gray-500">Loading...</p></div>`;
    }
    if (this.selectedResource || this.selectedTemplate) {
      return html`
                    <div class="p-6 overflow-y-auto w-full">
                        <button @click=${() => this.deselectReaderView()} class="flex items-center text-sm text-blue-600 hover:underline mb-4">
                            <uix-icon name="arrow-left" class="w-4 h-4 mr-2"></uix-icon>
                            Back to list
                        </button>
                        ${this.resourceResponse ? this._renderResponseView() : this._renderReaderContent()}                        
                    </div>
                `;
    }
    return html`
                <div class="flex-1 overflow-y-auto p-2">
									${this._generateTitle()}
                  ${this._renderList()}
                </div>
            `;
  },

  _renderSideBySideView() {
    if (this.isLoading) {
      return html`<div class="flex items-center justify-center h-full"><p class="text-xs text-gray-500">Loading...</p></div>`;
    }
    return html`
                <div class="w-1/3 flex flex-col border-r border-gray-200 p-2 overflow-y-auto">
									${this._generateTitle()}
                    ${this._renderList()}
                </div>
                <div class="w-2/3 p-6 overflow-y-auto">
                    ${
                      this.selectedResource || this.selectedTemplate
                        ? html`
                            ${this._renderReaderContent()}
                            ${this._renderResponseView()}
                        `
                        : html`<div class="text-center text-gray-500 h-full flex items-center justify-center">Select an item to view details.</div>`
                    }
                </div>
            `;
  },

  render() {
    return html`
                <uix-card class="h-full bg-surface-light overflow-y-auto">
									<div class="dark">${this.viewMode === "flow" ? this._renderFlowView() : this._renderSideBySideView()}</div>
								</uix-card>
            `;
  },
};
