import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

const detailItem = (label, value) => {
  if (!value) return "";
  return html`
        <div class="flex flex-col sm:flex-row mb-2">
            <span class="w-full sm:w-1/4 font-semibold text-default/50">${label}</span>
            <span class="w-full sm:w-3/4 text-default break-words">${value}</span>
        </div>
    `;
};

const detailSection = (title, content) => {
  if (!content) return "";
  return html`
        <div class="mb-6">
            <h2 class="text-xl font-semibold text-default border-b border-surface pb-2 mb-4">${title}</h2>
            <div class="text-sm">
                ${content}
            </div>
        </div>
    `;
};

export default {
  properties: {
    uri: T.string(),
    content: T.object(),
  },

  _renderRepository(repository) {
    if (!repository || !repository.url) {
      return html`<p class="text-sm text-default/30">No repository information.</p>`;
    }
    return html`
            ${detailItem("URL", html`<a href=${repository.url} target="_blank" class="text-secondary hover:underline">${repository.url}</a>`)}
            ${detailItem("Source", repository.source || "N/A")}
        `;
  },

  _renderTransports(transports) {
    if (!transports || Object.keys(transports).length === 0) {
      return html`<p class="text-sm text-default/30">No transports defined.</p>`;
    }
    const enabledTransports = Object.keys(transports).filter(
      (key) => transports[key],
    );
    if (enabledTransports.length === 0) {
      return html`<p class="text-sm text-default/30">No transports enabled.</p>`;
    }
    return html`
            <ul class="list-disc list-inside">
                ${enabledTransports.map((key) => html`<li class="text-default">${key}</li>`)}
            </ul>
        `;
  },

  _renderPackages(packages) {
    if (!packages || packages.length === 0) {
      return html`<p class="text-sm text-default/30">No packages listed.</p>`;
    }
    return html`
            <div class="flex flex-col gap-4">
            ${packages.map(
              (pkg) => html`
                <div class="p-3 bg-inverse rounded-lg border border-surface">
                    ${detailItem("Identifier", pkg.identifier)}
                    ${detailItem("Version", pkg.version)}
                    ${detailItem("Registry", `${pkg.registryType} at ${pkg.registryBaseUrl}`)}
                    ${detailItem("Transport", pkg.transport?.type || "N/A")}
                </div>
            `,
            )}
            </div>
        `;
  },

  _renderRemotes(remotes) {
    if (!remotes || remotes.length === 0) {
      return html`<p class="text-sm text-default/30">No remotes listed.</p>`;
    }
    return html`
            <div class="flex flex-col gap-4">
            ${remotes.map(
              (remote) => html`
                <div class="p-3 bg-inverse rounded-lg border border-surface">
                    ${detailItem("Type", remote.type)}
                    ${detailItem("URL", html`<a href=${remote.url} target="_blank" class="text-secondary hover:underline">${remote.url}</a>`)}
                </div>
            `,
            )}
            </div>
        `;
  },

  render() {
    if (!this.content) {
      return html`<div class="flex items-center justify-center h-full bg-inverse text-default/30">
                Loading server details...
            </div>`;
    }

    const server = this.content;

    return html`
            <div class="h-full bg-inverse text-default p-6 sm:p-8 overflow-y-auto font-sans">
                <div class="max-w-4xl mx-auto">
                    <h1 class="text-3xl font-bold text-white mb-2">${server.name || "Untitled Server"}</h1>
                    <p class="text-lg text-secondary mb-4">Version: ${server.version || "N/A"}</p>
                    <p class="text-base text-default/70 mb-6">${server.description || "No description provided."}</p>
                    ${detailSection("Repository", this._renderRepository(server.repository))}
                    ${detailSection("Transports", this._renderTransports(server.transports))}
                    ${detailSection("Packages", this._renderPackages(server.packages))}
                    ${detailSection("Remotes", this._renderRemotes(server.remotes))}
                </div>
            </div>
        `;
  },
};
