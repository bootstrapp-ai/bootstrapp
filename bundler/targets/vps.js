/**
 * VPS Deployment Target
 * Deploys bundled files from .deployed/ to a remote server via rsync + Caddy
 */
import { registerTarget } from "./index.js";

registerTarget("vps", {
  label: "VPS (Remote Server)",
  icon: "server-bolt",
  requiresBuilds: true, // Only available when builds exist
  credentials: [
    { key: "host", label: "Server Host/IP", type: "text", required: true },
    { key: "user", label: "SSH User", type: "text", required: true, default: "root" },
    { key: "sshKeyPath", label: "SSH Key Path", type: "text", required: false, default: "~/.ssh/id_rsa" },
    { key: "domain", label: "Domain", type: "text", required: true },
    { key: "remotePath", label: "Remote Path", type: "text", required: false, default: "/var/www" },
  ],
  async getBuilds() {
    try {
      const response = await fetch("/vps/builds");
      const result = await response.json();
      return result.builds || [];
    } catch {
      return [];
    }
  },
  async deploy(files, options) {
    const { host, user, sshKeyPath, domain, remotePath, buildId, runSetup } = options;

    if (!host || !user || !domain) {
      throw new Error("VPS deployment requires host, user, and domain.");
    }

    if (!buildId) {
      throw new Error("Please select a build to deploy.");
    }

    console.log(`Deploying build ${buildId} to ${user}@${host}:${remotePath}/${domain}...`);

    const response = await fetch("/vps/deploy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host,
        user,
        sshKeyPath: sshKeyPath || "~/.ssh/id_rsa",
        domain,
        remotePath: remotePath || "/var/www",
        buildId,
        runSetup: runSetup || false,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error("VPS deployment error:", result.error || result);
      throw new Error(`Failed to deploy to VPS. ${result.error || ""}`);
    }

    console.log("VPS deployment successful!");
    return {
      success: true,
      type: "remote",
      url: result.url,
      buildId: result.buildId,
    };
  },
});
