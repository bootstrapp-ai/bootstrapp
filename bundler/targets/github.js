/**
 * GitHub Pages Deployment Target
 * Deploys from existing builds (no re-bundling)
 */
import { registerTarget } from "./index.js";
import Github from "/$app/github/index.js";

registerTarget("github", {
  label: "GitHub Pages",
  icon: "brand-github",
  requiresBuilds: true, // Only available when builds exist
  credentials: [
    { key: "owner", label: "Owner", type: "text", required: true },
    { key: "repo", label: "Repository", type: "text", required: true },
    { key: "branch", label: "Branch", type: "text", default: "main" },
    { key: "token", label: "Token", type: "password", required: true },
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
    const { owner, repo, branch, token, buildId } = options;

    if (!buildId) {
      throw new Error("Please select a build to deploy.");
    }

    console.log(`Fetching files from build ${buildId}...`);

    // Fetch files from existing build
    const response = await fetch(`/builds/${buildId}/files`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch build files");
    }

    console.log(`Deploying ${result.files.length} files to GitHub Pages...`);

    await Github.deploy({ owner, repo, branch, token, files: result.files });

    return {
      success: true,
      type: "remote",
      url: `https://${owner}.github.io/${repo}/`,
      buildId,
    };
  },
});
