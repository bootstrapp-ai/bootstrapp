/**
 * Localhost Deployment Target
 * Deploys to the local CLI dev server for testing production builds
 */
import { registerTarget } from "./index.js";

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

registerTarget("localhost", {
  label: "Deploy Locally",
  icon: "server",
  credentials: [],
  async deploy(files, options) {
    // Convert files to JSON-serializable format
    const payload = await Promise.all(
      files.map(async (file) => ({
        path: file.path,
        content:
          file.content instanceof Blob
            ? await blobToBase64(file.content)
            : file.content,
        encoding: file.content instanceof Blob ? "base64" : "utf8",
      })),
    );

    const response = await fetch("/deploy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files: payload }),
    });

    if (!response.ok) {
      throw new Error("Failed to deploy locally");
    }

    const result = await response.json();
    console.log("Deployed locally:", result.urls);

    return {
      success: true,
      type: "remote",
      url: result.urls.prefixed,
      standaloneUrl: result.urls.standalone,
    };
  },
});
