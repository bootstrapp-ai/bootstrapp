/**
 * TAR.GZ Download Target
 * Downloads bundled files as a gzipped tarball
 */
import { registerTarget } from "./index.js";
import { gzipSync, strToU8 } from "/npm/fflate";

/**
 * Create a TAR archive from files
 * TAR format: 512-byte header blocks + file content (padded to 512 bytes)
 */
const createTar = (files) => {
  const blocks = [];

  for (const { path, data } of files) {
    // Create header (512 bytes)
    const header = new Uint8Array(512);
    const encoder = new TextEncoder();

    // File name (100 bytes)
    const nameBytes = encoder.encode(path.slice(0, 99));
    header.set(nameBytes, 0);

    // File mode (8 bytes) - 0644 in octal
    header.set(encoder.encode("0000644\0"), 100);

    // UID (8 bytes)
    header.set(encoder.encode("0000000\0"), 108);

    // GID (8 bytes)
    header.set(encoder.encode("0000000\0"), 116);

    // File size (12 bytes) - octal with leading zeros
    const sizeOctal = data.length.toString(8).padStart(11, "0") + "\0";
    header.set(encoder.encode(sizeOctal), 124);

    // Modification time (12 bytes) - current time in octal
    const mtime = Math.floor(Date.now() / 1000).toString(8).padStart(11, "0") + "\0";
    header.set(encoder.encode(mtime), 136);

    // Checksum placeholder (8 spaces - will be calculated)
    header.set(encoder.encode("        "), 148);

    // Type flag (1 byte) - '0' for regular file
    header[156] = 48; // ASCII '0'

    // Link name (100 bytes) - empty for regular files
    // Already zeros

    // USTAR magic (6 bytes)
    header.set(encoder.encode("ustar\0"), 257);

    // USTAR version (2 bytes)
    header.set(encoder.encode("00"), 263);

    // Owner name (32 bytes)
    header.set(encoder.encode("root"), 265);

    // Group name (32 bytes)
    header.set(encoder.encode("root"), 297);

    // Calculate checksum (sum of all bytes in header, treating checksum field as spaces)
    let checksum = 0;
    for (let i = 0; i < 512; i++) {
      checksum += header[i];
    }
    const checksumOctal = checksum.toString(8).padStart(6, "0") + "\0 ";
    header.set(encoder.encode(checksumOctal), 148);

    blocks.push(header);

    // Add file content
    blocks.push(data);

    // Pad to 512-byte boundary
    const padding = 512 - (data.length % 512);
    if (padding < 512) {
      blocks.push(new Uint8Array(padding));
    }
  }

  // Add two empty 512-byte blocks to mark end of archive
  blocks.push(new Uint8Array(1024));

  // Concatenate all blocks
  const totalLength = blocks.reduce((sum, b) => sum + b.length, 0);
  const tar = new Uint8Array(totalLength);
  let offset = 0;
  for (const block of blocks) {
    tar.set(block, offset);
    offset += block.length;
  }

  return tar;
};

registerTarget("targz", {
  label: "Download TAR.GZ",
  icon: "file-zip",
  credentials: [],
  async deploy(files, options) {
    // Prepare files for tar
    const tarFiles = [];

    for (const file of files) {
      const { path, content } = file;
      let data;

      if (content instanceof Blob) {
        const arrayBuffer = await content.arrayBuffer();
        data = new Uint8Array(arrayBuffer);
      } else if (typeof content === "string") {
        data = strToU8(content);
      } else if (content instanceof Uint8Array) {
        data = content;
      } else {
        data = strToU8(String(content));
      }

      tarFiles.push({ path, data });
    }

    // Create TAR archive
    const tarData = createTar(tarFiles);

    // Compress with gzip
    const gzipped = gzipSync(tarData, { level: 9 });

    const blob = new Blob([gzipped], { type: "application/gzip" });
    const url = URL.createObjectURL(blob);

    // Trigger download
    const filename = `${options.name || "build"}-${options.version || Date.now()}.tar.gz`;
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
