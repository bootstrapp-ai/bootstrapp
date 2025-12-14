/**
 * ZIP Download Target
 * Downloads bundled files as a ZIP archive
 */
import { registerTarget } from "./index.js";
import { zipSync, strToU8 } from "/npm/fflate";

registerTarget("zip", {
  label: "Download ZIP",
  icon: "file-zip",
  credentials: [], // No credentials needed - downloads to browser
  async deploy(files, options) {
    const zipData = {};

    for (const file of files) {
      const { path, content } = file;

      if (content instanceof Blob) {
        // Convert Blob to Uint8Array
        const arrayBuffer = await content.arrayBuffer();
        zipData[path] = new Uint8Array(arrayBuffer);
      } else if (typeof content === "string") {
        // Convert string to Uint8Array
        zipData[path] = strToU8(content);
      } else if (content instanceof Uint8Array) {
        zipData[path] = content;
      } else {
        // Try to stringify anything else
        zipData[path] = strToU8(String(content));
      }
    }

    // Create ZIP
    const zipped = zipSync(zipData, { level: 9 });
    const blob = new Blob([zipped], { type: "application/zip" });
    const url = URL.createObjectURL(blob);

    // Trigger download
    const filename = `${options.name || "build"}-${options.version || Date.now()}.zip`;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    return {
      success: true,
      type: "download",
      filename,
    };
  },
});
