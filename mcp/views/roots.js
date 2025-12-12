import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";
import AI from "/node_modules/@bootstrapp/ai/index.js";
export default {
  properties: {
    roots: T.array([]),
    isLoading: T.boolean(true),
    newRootPath: T.string(""),
    errorMessage: T.string(""),
  },
  connected() {
    this.loadRoots();
  },
  async loadRoots() {
    this.isLoading = true;
    this.errorMessage = "";
    try {
      const servers = AI.listClients();
      if (servers && servers.length > 0) {
        const { roots } = await AI.listRoots();
        this.roots = roots || [];
      }
    } catch (error) {
      console.error("Error loading roots:", error);
      this.errorMessage = "Failed to load roots.";
      this.roots = [];
    } finally {
      this.isLoading = false;
    }
  },
  handleInput(event) {
    this.newRootPath = event.target.value;
  },
  async addRoot() {
    if (!this.newRootPath.trim()) return;
    this.errorMessage = "";
    try {
      const servers = AI.listClients();
      if (servers && servers.length > 0) {
        await AI.addRoot({ path: this.newRootPath });
        this.newRootPath = ""; // Clear input on success
        await this.loadRoots(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding root:", error);
      this.errorMessage = `Failed to add root: ${error.message}`;
    }
  },
  render() {
    return html`
                <div class="flex flex-col h-full bg-white border border-gray-200 rounded-lg p-6">
                    <h3 class="font-semibold text-lg mb-4">Manage Roots</h3>
                    <div class="mb-4 flex items-center gap-2">
                        <uix-input
                            class="flex-grow font-mono text-sm"
                            placeholder="Enter new root path..."
                            .value=${this.newRootPath}
                            @input=${this.handleInput.bind(this)}
                        ></uix-input>
                        <uix-button
                            label="Add Root"
                            class="is-primary"
                            @click=${this.addRoot.bind(this)}
                        ></uix-button>
                    </div>

                    ${this.errorMessage ? html`<p class="text-xs text-red-600 mb-4">${this.errorMessage}</p>` : ""}

                    <div class="flex-grow border rounded-lg overflow-y-auto bg-gray-50">
                        ${
                          this.isLoading
                            ? html`<p class="text-center text-gray-500 p-8">Loading roots...</p>`
                            : this.roots.length > 0
                              ? html`
                                <ul class="divide-y divide-gray-200">
                                    ${this.roots.map(
                                      (root) => html`
                                            <li class="p-3 font-mono text-xs text-gray-700">${root.path}</li>
                                        `,
                                    )}
                                </ul>`
                              : html`<p class="text-center text-gray-400 p-8">No roots have been added yet.</p>`
                        }
                    </div>
                </div>
            `;
  },
};
