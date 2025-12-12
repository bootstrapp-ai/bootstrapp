import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";
import $APP from "/node_modules/@bootstrapp/base/app.js";
import AI from "/node_modules/@bootstrapp/ai/index.js";
export default {
  tag: "mcp-dev",
  class: "w-full bg-inverse flex font-sans text-sm",
  properties: {
    // Core Editor Properties
    content: T.string(""),
    language: T.string({ sync: "local", defaultValue: "javascript" }),
    filePath: T.string({ sync: "local" }),
    isDirty: T.boolean(false),
    isSaving: T.boolean(false),
    lastSaved: T.object(null),
    compilerErrors: T.array({ defaultValue: [], sync: "local" }),
    // Server Management Properties
    availableServers: T.array([]),
    selectedServer: T.string({ sync: "local", defaultValue: "default" }),
    isServerConnected: T.boolean({ sync: "local", defaultValue: false }),
    transportType: T.string({ sync: "local", defaultValue: "JavaScript" }),
    command: T.string({ sync: "local" }),
    args: T.string({ sync: "local" }),

    // UI State
    history: T.array([]),
    selectedHistoryItem: T.object(null),
    validationTimeout: T.object(null),
    worker: T.object(null),
    transpilePromises: T.object({ defaultValue: {} }),
  },

  async connected() {
    this.initializeWorker();
    await this.initializeAI();
    // Load initial server content based on saved selection or default
    const server =
      this.availableServers.find((s) => s.id === this.selectedServer) ||
      this.availableServers[0];
    if (server) {
      // If the selectedServer wasn't found, update it to the default
      if (server.id !== this.selectedServer) {
        this.selectedServer = server.id;
      }
      await this.loadServerContent(server.path);
    } else {
      console.warn("No available servers found to load.");
    }
  },

  disconnected() {
    if (this.validationTimeout) clearTimeout(this.validationTimeout);
    if (this.worker) this.worker.terminate();
  },

  // Fetches available servers from the AI service
  async initializeAI() {
    try {
      if (!AI.isInitialized) {
        await AI.init({
          /* Your AI config here */
        });
      }
      this.isServerConnected = AI.listClients().some(
        (c) => c.alias === "dev_server",
      );
      this.availableServers = AI.listServers();
    } catch (error) {
      console.error("Error initializing AI service:", error);
      this.isServerConnected = false;
      this.availableServers = [];
    }
  },

  async onServerChange(newServerKey) {
    if (this.isDirty) {
      console.warn(
        "Switching server templates with unsaved changes. The changes will be lost.",
      );
    }
    this.selectedServer = newServerKey;
    const server = this.availableServers.find((s) => s.id === newServerKey);
    if (server) {
      await this.loadServerContent(server.path);
      if (this.isServerConnected) {
        await this.disconnectFromServer();
      }
    } else {
      console.error(`Server with key ${newServerKey} not found.`);
    }
  },

  async loadServerContent(path) {
    this.filePath = path;
    this.command = path.replace(/\.ts$/, ".js");
    try {
      const response = await fetch(path);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const fileContent = await response.text();
      this.content = fileContent;
      this.isDirty = false;
      this.validateCode();
    } catch (error) {
      this.isDirty = true;
      this.content = `// Failed to load file: ${path}\n// You can start editing here to create it.`;
      console.log(
        `File ${path} couldn't be loaded, starting with placeholder content.`,
        error,
      );
      this.validateCode();
    }
  },

  initializeWorker() {
    this.worker = new Worker("/node_modules/@bootstrapp/mcp/worker.js", {
      type: "module",
    });
    this.worker.onmessage = (e) => {
      const { type, payload } = e.data;
      switch (type) {
        case "validationComplete":
          this.compilerErrors = payload.errors;
          break;
        case "transpileComplete": {
          const promise = this.transpilePromises[payload.requestId];
          if (promise) {
            promise.resolve(payload.transpiledCode);
            delete this.transpilePromises[payload.requestId];
          }
          break;
        }
      }
    };
    this.worker.onerror = (event) => console.error("Error in worker:", event);
    this.worker.postMessage({ type: "init" });
  },

  validateCode() {
    if (!this.worker) {
      this.compilerErrors = [];
      return;
    }
    this.worker.postMessage({
      type: "validate",
      payload: { code: this.content, filePath: this.filePath },
    });
  },

  getTranspiledContent() {
    if (this.language !== "typescript") {
      return Promise.resolve(this.content);
    }
    return new Promise((resolve, reject) => {
      const requestId = `req_${Date.now()}_${Math.random()}`;
      this.transpilePromises[requestId] = { resolve, reject };
      this.worker.postMessage({
        type: "transpile",
        payload: { code: this.content, requestId },
      });
      setTimeout(() => {
        if (this.transpilePromises[requestId]) {
          reject(new Error("Transpilation timed out."));
          delete this.transpilePromises[requestId];
        }
      }, 10000);
    });
  },

  async applyCodeChanges() {
    if (!$APP.fs || !$APP.fs.writeFile) {
      console.warn("File system not available");
      return;
    }
    this.isSaving = true;
    try {
      await this.validateCode();
      if (this.compilerErrors.length > 0) {
        console.warn(
          "Applying changes with errors. The resulting code may not run correctly.",
        );
      }
      await $APP.fs.writeFile(this.filePath, this.content);
      if (this.language === "typescript") {
        const executableCode = await this.getTranspiledContent();
        const executablePath = this.filePath.replace(/\.ts$/, ".js");
        await $APP.fs.writeFile(executablePath, executableCode);
        this.command = executablePath;
      } else {
        this.command = this.filePath;
      }

      this.lastSaved = new Date();
      this.isDirty = false;
    } catch (error) {
      console.error("Failed to apply code changes:", error);
    } finally {
      this.isSaving = false;
    }
  },

  onEditorUpdate(newContent) {
    this.content = newContent;
    this.isDirty = true;
    if (this.validationTimeout) clearTimeout(this.validationTimeout);
    this.validationTimeout = setTimeout(() => this.validateCode(), 500);
  },

  async connectToServer() {
    await this.applyCodeChanges();
    if (!this.command) {
      console.error("Connection command/URL cannot be empty.");
      return;
    }
    try {
      const transportConfig = {
        type: this.transportType,
        command: this.command,
        args: this.args ? this.args.split(" ").filter(Boolean) : [],
      };
      await AI.connect(transportConfig, { alias: "dev_server" });
      this.isServerConnected = true;
    } catch (e) {
      console.error("Failed to connect:", e);
      this.isServerConnected = false;
    }
  },

  async disconnectFromServer() {
    try {
      await AI.disconnect("dev_server");
      this.isServerConnected = false;
    } catch (e) {
      console.error("Failed to disconnect:", e);
    }
  },

  async reconnectToServer() {
    if (this.isServerConnected) {
      await this.disconnectFromServer();
      setTimeout(() => {
        this.connectToServer();
      }, 200);
    }
  },

  async handleConnectionToggle() {
    if (this.isServerConnected) {
      await this.disconnectFromServer();
    } else {
      await this.connectToServer();
    }
  },

  async handleReload() {
    if (this.isDirty) {
      await this.applyCodeChanges();
    }
    if (this.isServerConnected) {
      await this.reconnectToServer();
    }
  },

  renderErrorPanel() {
    return html`<div class="flex flex-col h-full bg-inverse">
                <div class="p-2 border-b border-surface-lighter flex items-center">
                    <uix-icon name="triangle-alert" class="w-4 h-4 mr-2 text-red-400"></uix-icon>
                    <h3 class="text-md font-semibold">Problems (${this.compilerErrors.length})</h3>
                </div>
                <div class="flex-1 overflow-auto font-mono text-xs">
                    ${this.compilerErrors.map(
                      (error) => html`
                            <div class="p-2 border-b border-surface-light hover:bg-surface-light">
                                <span class="text-red-400">Error:</span>
                                <span class="text-muted">(${error.line}:${error.character})</span>
                                <span class="text-white ml-2">${error.message}</span>
                            </div>
                        `,
                    )}
                </div>
            </div>`;
  },

  render() {
    const availableServersForSelect = this.availableServers.map((val) => ({
      value: val.id,
      label: val.name,
    }));

    return html`
                <!-- Left Panel: Editor -->
                <div class="flex-1 h-full flex flex-col min-w-0">
                     <div class="h-15 bg-surface-light border-b border-surface-lighter p-2 flex items-center justify-between">
                         <div class="flex items-center space-x-2">
                             <uix-input
                                 ghost
                                 class="dark w-3xs"
                                 type="select"
                                 .options=${availableServersForSelect}
                                 .value=${this.selectedServer}
                                 @change=${(e) => this.onServerChange(e.target.value)}
                             ></uix-input>
                         </div>
                         <div class="flex items-center space-x-2 gap-2">
                             ${
                               this.isServerConnected && this.isDirty
                                 ? html`<uix-link
                                     @click=${this.handleReload.bind(this)}
                                     class="dark"
                                     size="small"
                                     label="Refresh"
                                     icon="refresh-cw"
                                 ></uix-link>`
                                 : ""
                             }
                             <uix-button
                                 .label=${this.isServerConnected ? "Disconnect" : "Connect"}
                                 class=${this.isServerConnected ? "bg-red-700" : "bg-green-700"}
                                 @click=${this.handleConnectionToggle.bind(this)}
                                 size="small"
                             ></uix-button>
                         </div>
                    </div>
                    <uix-code
                        .content=${this.content}
                        .language=${this.language}
                        .onUpdate=${this.onEditorUpdate.bind(this)}
                        class="flex-1 overflow-y-auto"
                    ></uix-code>
                </div>

                <uix-divider vertical resizable style="--uix-divider-color: #3c3836;"></uix-divider>

                <!-- Right Panel: Dashboard/Tools -->
                <div class="flex-1 h-full flex flex-col min-w-0">
                    ${
                      this.isServerConnected
                        ? html`<mcp-inspector-server></mcp-inspector-server>`
                        : html`
                          <div class="flex-1 flex items-center justify-center bg-inverse">
                              <div class="text-center max-w-md p-4">
                                  <uix-icon name="server-off" class="w-16 h-16 text-muted mx-auto mb-4"></uix-icon>
                                  <h3 class="text-lg font-semibold mb-2">Server Not Connected</h3>
                                  <p class="text-muted mb-6">Edit your server code, then click Connect to run it.</p>
                                  <uix-button
                                      label="Connect"
                                      @click=${this.connectToServer.bind(this)}
                                      size="small"
                                  ></uix-button>
                              </div>
                          </div>
                        `
                    }
                    <mcp-requests></mcp-requests>
                    ${
                      this.compilerErrors.length > 0
                        ? html`
                            <uix-divider resizable></uix-divider>
                            <div class="flex-shrink-0 h-50 overflow-auto">
                                ${this.renderErrorPanel()}
                            </div>
                          `
                        : ""
                    }
                </div>
            `;
  },
};
