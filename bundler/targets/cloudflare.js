/**
 * Cloudflare Workers Deployment Target
 * Note: This target requires a worker script, not static files
 */
import { registerTarget } from "./index.js";

registerTarget("cloudflare", {
  label: "Cloudflare Workers",
  icon: "cloud",
  workerOnly: true, // Special flag - this target uses worker script, not static files
  credentials: [
    { key: "accountId", label: "Account ID", type: "text", required: true },
    { key: "projectName", label: "Project Name", type: "text", required: true },
    { key: "apiToken", label: "API Token", type: "password", required: true },
  ],
  async deploy(scriptContent, options) {
    const { accountId, projectName, apiToken } = options;

    if (!accountId || !apiToken || !projectName || !scriptContent) {
      throw new Error(
        "Cloudflare deployment requires accountId, apiToken, projectName, and scriptContent.",
      );
    }

    console.log(`Deploying worker to project: ${projectName} via server proxy...`);

    const response = await fetch("/cloudflare/deploy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId,
        apiToken,
        projectName,
        scriptContent,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error("Cloudflare API Error:", result.errors || result);
      throw new Error(`Failed to deploy worker. Status: ${response.status}`);
    }

    console.log("Worker deployed successfully!");
    return {
      success: true,
      type: "remote",
      url: `https://${projectName}.pages.dev/`,
      result,
    };
  },
});
