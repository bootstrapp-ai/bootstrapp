import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";
import AI from "/node_modules/@bootstrapp/ai/index.js";
export default {
  properties: {
    pendingRequests: T.array([]),
    isLoading: T.boolean(true),
    isExpanded: T.boolean(false),
    formValues: T.object({}),
    requestUnsubscribe: T.object(null),
  },

  async connected() {
    this.requestUnsubscribe = AI.onRequestChange(
      this.loadAllPendingRequests.bind(this),
    );
    // Initial load
    await this.loadAllPendingRequests();
  },

  disconnected() {
    if (this.requestUnsubscribe) {
      this.requestUnsubscribe();
    }
  },

  async loadAllPendingRequests() {
    // Store the count before fetching to detect new requests.
    const previousRequestCount = this.pendingRequests.length;

    if (!AI.isInitialized || AI.listClients().length === 0) {
      this.pendingRequests = [];
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    try {
      const [samplings, elicitations] = await Promise.all([
        AI.listSamplingRequests(),
        AI.listElicitationRequests(),
      ]);

      // Tag each request with its type ('elicitation' or 'sampling').
      const elicitationReqs = (elicitations.elicitationRequests || []).map(
        (req) => ({ ...req, type: "elicitation" }),
      );
      const samplingReqs = (samplings.samplingRequests || []).map((req) => ({
        ...req,
        type: "sampling",
      }));

      // Combine into a single list.
      this.pendingRequests = [...elicitationReqs, ...samplingReqs];

      // Automatically expand if new requests have arrived.
      if (this.pendingRequests.length > previousRequestCount) {
        this.isExpanded = true;
      }
    } catch (error) {
      console.error("Error loading pending requests:", error);
      this.pendingRequests = [];
    } finally {
      this.isLoading = false;
    }
  },

  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  },

  // --- Event Handlers ---
  // Sampling handlers
  async handleSamplingResponse(request, action) {
    try {
      if (action === "approve") {
        await AI.approveSamplingRequest({
          id: request.id,
          server: request.server,
        });
      } else {
        await AI.rejectSamplingRequest({
          id: request.id,
          server: request.server,
        });
      }
    } catch (e) {
      console.error(`Failed to ${action} sampling request:`, e);
    }
  },

  // Elicitation handlers
  handleInput(requestId, fieldName, event, schema) {
    const newValues = {
      ...(this.formValues?.[requestId] || {}),
      [fieldName]:
        schema.type === "boolean" ? !!event.target.checked : event.target.value,
    };
    this.formValues = { ...this.formValues, [requestId]: newValues };
  },

  async handleElicitationSubmit(request) {
    const response = this.formValues[request.id] || {};
    try {
      await AI.respondToElicitation({
        id: request.id,
        response,
        server: request.server,
      });
      const newFormValues = { ...this.formValues };
      delete newFormValues[request.id];
      this.formValues = newFormValues;
    } catch (e) {
      console.error("Failed to respond to elicitation:", e);
    }
  },

  async handleElicitationDecline(request) {
    try {
      await AI.respondToElicitation({
        id: request.id,
        response: {},
        server: request.server,
        action: "decline",
      });
      const newFormValues = { ...this.formValues };
      delete newFormValues[request.id];
      this.formValues = newFormValues;
    } catch (e) {
      console.error("Failed to decline elicitation:", e);
    }
  },

  // --- Render Methods (Updated for unified list) ---
  renderFormField(req, fieldName, schema) {
    const value = this.formValues?.[req.id]?.[fieldName] || "";
    return html`
                 <uix-input
                     label=${fieldName}
                     value=${value}
                     type=${schema.enum ? "select" : { boolean: "checkbox", enum: "select" }[schema.type] || "text"}
                     .options=${schema.enum}
                     placeholder=${schema.description}
                     @input=${(e) => this.handleInput(req.id, fieldName, e, schema)}
                     class="font-mono text-sm w-full"
                 ></uix-input>
             `;
  },

  renderSamplingRequest(req) {
    return html`
                 <div class="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
                     <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <h5 class="font-semibold text-sm mb-2 text-gray-700">Request</h5>
                             <pre class="text-xs whitespace-pre-wrap bg-gray-800 text-gray-200 p-3 rounded-lg font-mono overflow-auto max-h-48">${JSON.stringify(req.request, null, 2)}</pre>
                         </div>
                         <div>
                             <h5 class="font-semibold text-sm mb-2 text-gray-700">Response Preview</h5>
                             <pre class="text-xs whitespace-pre-wrap bg-gray-100 text-gray-800 p-3 rounded-lg font-mono overflow-auto max-h-48">${JSON.stringify(req.responseStub, null, 2)}</pre>
                         </div>
                     </div>
                     <div class="flex justify-end gap-3 p-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                         <uix-button @click=${() => this.handleSamplingResponse(req, "reject")} label="Reject" size="small" class="is-danger"></uix-button>
                         <uix-button @click=${() => this.handleSamplingResponse(req, "approve")} label="Approve" size="small" class="is-primary"></uix-button>
                     </div>
                 </div>
             `;
  },

  renderElicitationRequest(req) {
    return html`
                 <div class="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                         <div class="pr-4 border-r border-gray-200">
                             <h5 class="font-semibold text-sm mb-2 text-gray-700">Information Request</h5>
                             <p class="text-sm text-gray-800 mb-4">${req.requestText}</p>
                             <h6 class="font-mono text-xs font-bold text-gray-600 mb-2">Schema</h6>
                             <pre class="text-xs whitespace-pre-wrap bg-gray-800 text-gray-200 p-3 rounded-lg font-mono overflow-auto max-h-32">${JSON.stringify(req.schema, null, 2)}</pre>
                         </div>
                         <div>
                             <h5 class="font-semibold text-sm mb-3 text-gray-700">Response Form</h5>
                             <div class="space-y-3">
                                 ${Object.entries(req.schema.properties).map(
                                   ([fieldName, fieldSchema]) =>
                                     this.renderFormField(
                                       req,
                                       fieldName,
                                       fieldSchema,
                                     ),
                                 )}
                             </div>
                         </div>
                     </div>
                     <div class="flex justify-end gap-3 p-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                         <uix-button @click=${() => (this.formValues[req.id] = {})} label="Reset" size="small"></uix-button>
                         <uix-button @click=${() => this.handleElicitationDecline(req)} label="Decline" size="small" class="is-danger"></uix-button>
                         <uix-button @click=${() => this.handleElicitationSubmit(req)} label="Submit" size="small" class="is-primary"></uix-button>
                     </div>
                 </div>
             `;
  },

  renderCollapsedBanner() {
    return html`
                <div class="bg-amber-50 border-b-2 border-amber-400 px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors" @click=${this.toggleExpanded.bind(this)}>
                    <div class="flex items-center space-x-3">
                        <uix-icon name="bell" class="w-5 h-5 text-amber-600 animate-pulse"></uix-icon>
                        <div>
                            <!-- SIMPLIFIED: Display total count directly. -->
                            <span class="font-semibold text-amber-900">
                                ${this.pendingRequests.length} Pending Request${this.pendingRequests.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>
                    <uix-icon name="chevron-down" class="w-5 h-5 text-amber-600"></uix-icon>
                </div>
            `;
  },

  renderExpandedPanel() {
    return html`
                <div class="flex flex-col bg-white border-b-2 border-amber-400">
                    <!-- Header -->
                    <div class="bg-amber-50 px-4 py-2 flex items-center justify-between border-b border-amber-200">
                        <div class="flex items-center space-x-3">
                            <uix-icon name="bell" class="w-5 h-5 text-amber-600"></uix-icon>
                            <span class="font-semibold text-amber-900">Pending Requests</span>
                        </div>
                        <uix-button @click=${this.toggleExpanded} size="small" ghost>
                            <uix-icon name="chevron-up" class="w-4 h-4"></uix-icon>
                        </uix-button>
                    </div>

                    <!-- Content -->
                    <div class="flex-1 overflow-auto p-4">
                        ${
                          this.pendingRequests.length > 0
                            ? this.pendingRequests.map((req) =>
                                // Conditionally render based on the request 'type'.
                                req.type === "sampling"
                                  ? this.renderSamplingRequest(req)
                                  : this.renderElicitationRequest(req),
                              )
                            : html`<div class="text-center text-gray-500 py-8">No pending requests</div>`
                        }
                    </div>
                </div>
            `;
  },

  render() {
    // SIMPLIFIED: Check the length of the unified pendingRequests array.
    if (this.isLoading || this.pendingRequests.length === 0) {
      return html``;
    }
    return this.isExpanded
      ? this.renderExpandedPanel()
      : this.renderCollapsedBanner();
  },
};
