#!/usr/bin/env node
/**
 * Build script for Bootstrapp Extension
 * Creates a .crx file and .zip for Chrome Web Store
 */

import { execSync } from "child_process";
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash, createSign, generateKeyPairSync } from "crypto";
import archiver from "archiver";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, "dist");
const KEY_FILE = join(__dirname, "key.pem");

// Files to include in the extension
const EXTENSION_FILES = [
  "manifest.json",
  "background.js",
  "content.js",
  "index.js",
  "admin-bridge.js",
  "lib/messaging.js",
  "sidepanel/index.html",
  "sidepanel/panel.js",
  "sidepanel/panel.css",
  "popup/index.html",
  "popup/popup.js",
  "icons/icon16.png",
  "icons/icon48.png",
  "icons/icon128.png",
];

async function main() {
  console.log("Building Bootstrapp Extension...\n");

  // Create dist directory
  if (!existsSync(DIST_DIR)) {
    mkdirSync(DIST_DIR, { recursive: true });
  }

  // Generate key if it doesn't exist
  if (!existsSync(KEY_FILE)) {
    console.log("Generating new private key...");
    const { privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    writeFileSync(KEY_FILE, privateKey);
    console.log(`Private key saved to: ${KEY_FILE}`);
    console.log("⚠️  Keep this key safe! You need it to update the extension.\n");
  }

  // Create ZIP file (for Chrome Web Store upload)
  const zipPath = join(DIST_DIR, "bootstrapp-extension.zip");
  await createZip(zipPath);
  console.log(`✓ ZIP created: ${zipPath}`);

  // Create CRX file (for direct installation)
  const crxPath = join(DIST_DIR, "bootstrapp-extension.crx");
  await createCrx(crxPath);
  console.log(`✓ CRX created: ${crxPath}`);

  // Calculate and display extension ID
  const extensionId = getExtensionId();
  console.log(`\n✓ Extension ID: ${extensionId}`);
  console.log("\nTo install:");
  console.log("1. Open chrome://extensions");
  console.log("2. Enable Developer mode");
  console.log("3. Drag and drop the .crx file");
  console.log("\nOr load unpacked from this directory for development.");
}

async function createZip(outputPath) {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);

    for (const file of EXTENSION_FILES) {
      const filePath = join(__dirname, file);
      if (existsSync(filePath)) {
        archive.file(filePath, { name: file });
      } else {
        console.warn(`Warning: ${file} not found`);
      }
    }

    archive.finalize();
  });
}

async function createCrx(outputPath) {
  // Read private key
  const privateKey = readFileSync(KEY_FILE, "utf8");

  // Create ZIP buffer first
  const zipBuffer = await createZipBuffer();

  // Create signature
  const sign = createSign("SHA256");
  sign.update(zipBuffer);
  const signature = sign.sign(privateKey);

  // Get public key from private key
  const publicKey = execSync(`openssl rsa -in "${KEY_FILE}" -pubout -outform DER 2>/dev/null`);

  // CRX3 format header
  const crxHeader = Buffer.alloc(16);
  crxHeader.write("Cr24", 0); // Magic number
  crxHeader.writeUInt32LE(3, 4); // Version 3
  crxHeader.writeUInt32LE(publicKey.length, 8); // Public key length
  crxHeader.writeUInt32LE(signature.length, 12); // Signature length

  // Write CRX file
  const crxBuffer = Buffer.concat([crxHeader, publicKey, signature, zipBuffer]);
  writeFileSync(outputPath, crxBuffer);
}

function createZipBuffer() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("data", (chunk) => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);

    for (const file of EXTENSION_FILES) {
      const filePath = join(__dirname, file);
      if (existsSync(filePath)) {
        archive.file(filePath, { name: file });
      }
    }

    archive.finalize();
  });
}

function getExtensionId() {
  // Extension ID is derived from public key
  const privateKey = readFileSync(KEY_FILE, "utf8");
  const publicKeyDer = execSync(`openssl rsa -in "${KEY_FILE}" -pubout -outform DER 2>/dev/null`);

  // Hash public key and take first 16 bytes
  const hash = createHash("sha256").update(publicKeyDer).digest();
  const idBytes = hash.slice(0, 16);

  // Convert to extension ID format (a-p alphabet)
  return Array.from(idBytes)
    .map((b) => String.fromCharCode(97 + (b % 16)) + String.fromCharCode(97 + Math.floor(b / 16)))
    .join("")
    .slice(0, 32);
}

main().catch(console.error);
