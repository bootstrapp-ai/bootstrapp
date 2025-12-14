/**
 * GitHub Pages Deployment Target
 */
import { registerTarget } from "./index.js";
import Github from "/$app/github/index.js";

registerTarget("github", {
  label: "GitHub Pages",
  icon: "brand-github",
  credentials: [
    { key: "owner", label: "Owner", type: "text", required: true },
    { key: "repo", label: "Repository", type: "text", required: true },
    { key: "branch", label: "Branch", type: "text", default: "main" },
    { key: "token", label: "Token", type: "password", required: true },
  ],
  async deploy(files, options) {
    const { owner, repo, branch, token } = options;
    await Github.deploy({ owner, repo, branch, token, files });
    return {
      success: true,
      type: "remote",
      url: `https://${owner}.github.io/${repo}/`,
    };
  },
});
