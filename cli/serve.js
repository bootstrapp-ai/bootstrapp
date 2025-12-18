import { exec, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import mime from "mime";
import WebSocket, { WebSocketServer } from "ws";

// --- Build Versioning Helpers ---

const MAX_BUILDS_TO_KEEP = 5;

const generateBuildId = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

const getBuilds = async (deployedDir) => {
  const buildsDir = path.join(deployedDir, "builds");
  try {
    const entries = await fs.readdir(buildsDir, { withFileTypes: true });
    const builds = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()
      .reverse(); // newest first
    return builds;
  } catch {
    return [];
  }
};

const cleanupOldBuilds = async (deployedDir, keepCount = MAX_BUILDS_TO_KEEP) => {
  const builds = await getBuilds(deployedDir);
  const toDelete = builds.slice(keepCount);
  for (const buildId of toDelete) {
    const buildPath = path.join(deployedDir, "builds", buildId);
    try {
      await fs.rm(buildPath, { recursive: true, force: true });
      console.log(`🗑️  Cleaned up old build: ${buildId}`);
    } catch (err) {
      console.error(`Failed to cleanup build ${buildId}:`, err);
    }
  }
};

const updateCurrentSymlink = async (deployedDir, buildId) => {
  const currentPath = path.join(deployedDir, "current");
  const targetPath = path.join("builds", buildId);

  // Remove existing symlink/directory
  try {
    await fs.rm(currentPath, { recursive: true, force: true });
  } catch {
    // Ignore if doesn't exist
  }

  // Create symlink (relative path)
  await fs.symlink(targetPath, currentPath, "dir");
};

// Track deployed server instance
let deployedServer = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL(".", import.meta.url).pathname;
console.log({ __filename, __dirname });

const toFetchRequest = async (req, protocol) => {
  const host = req.headers.host;
  const url = new URL(req.url, `${protocol}://${host}`);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else if (value) {
      headers.set(key, value);
    }
  }

  const body = ["GET", "HEAD"].includes(req.method.toUpperCase())
    ? null
    : await new Promise((resolve) => {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks)));
      });

  return new Request(url.toString(), {
    method: req.method,
    headers,
    body,
    // @ts-ignore
    duplex: "half",
  });
};

const fromFetchResponse = async (response, res) => {
  res.writeHead(
    response.status,
    Object.fromEntries(response.headers.entries()),
  );
  const bodyBuffer = Buffer.from(await response.arrayBuffer());
  res.end(bodyBuffer);
};

// --- Deployed Files Serving ---

const serveDeployedFile = async (deployedDir, filePath, res) => {
  let fullPath = path.join(deployedDir, filePath);

  try {
    // Handle directory -> index.html
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      fullPath = path.join(fullPath, "index.html");
    }
  } catch {
    // File doesn't exist, will handle below
  }

  // Try to serve file
  try {
    const content = await fs.readFile(fullPath);
    const mimeType = mime.getType(fullPath) || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mimeType });
    res.end(content);
    return;
  } catch {
    // File not found, try SPA fallback
  }

  // SPA fallback
  const indexPath = path.join(deployedDir, "index.html");
  try {
    const content = await fs.readFile(indexPath);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
};

// Generate local Caddyfile for development
const generateLocalCaddyfile = (projectDir, port) => {
  const currentDir = path.join(projectDir, ".deployed", "current");
  // Use admin port based on server port to avoid conflicts with system Caddy (2019)
  const adminPort = port + 100; // e.g., 2315 -> 2415
  return `{
    admin localhost:${adminPort}
}

:${port} {
    root * ${currentDir}
    encode gzip zstd

    # SPA fallback
    try_files {path} {path}/ /index.html

    file_server

    # Log to stdout for visibility
    log {
        output stdout
        format console
    }
}
`;
};

// Start Caddy server for deployed builds
const startCaddyServer = async (projectDir, port, adapter) => {
  const deployedDir = path.join(projectDir, ".deployed");
  const caddyfilePath = path.join(deployedDir, "Caddyfile");

  // Generate and write local Caddyfile
  const caddyfileContent = generateLocalCaddyfile(projectDir, port);
  await fs.writeFile(caddyfilePath, caddyfileContent);

  adapter.log(`📦 Starting Caddy server on port ${port}...`);

  // Check if caddy is installed
  try {
    const { spawn: spawnSync } = await import("node:child_process");
    const caddyProcess = spawn("caddy", ["run", "--config", caddyfilePath], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    // Stream Caddy logs to console
    caddyProcess.stdout.on("data", (data) => {
      adapter.log(`[Caddy] ${data.toString().trim()}`);
    });

    caddyProcess.stderr.on("data", (data) => {
      const msg = data.toString().trim();
      // Caddy logs info to stderr, not just errors
      if (msg) adapter.log(`[Caddy] ${msg}`);
    });

    caddyProcess.on("error", (err) => {
      if (err.code === "ENOENT") {
        adapter.error("Caddy not found. Please install Caddy to serve deployed builds locally.");
        adapter.error("Install: https://caddyserver.com/docs/install");
        // Fall back to Node.js server
        adapter.warn("Falling back to Node.js HTTP server...");
        return startNodeServer(projectDir, port, adapter);
      }
      adapter.error("Caddy error:", err);
    });

    caddyProcess.on("close", (code) => {
      if (code !== 0 && code !== null) {
        adapter.warn(`Caddy exited with code ${code}`);
      }
    });

    // Cleanup on process exit
    const cleanup = (signal) => {
      if (caddyProcess && !caddyProcess.killed) {
        caddyProcess.kill("SIGTERM");
      }
      // Exit after cleanup for signals (not for 'exit' event)
      if (signal === "SIGINT" || signal === "SIGTERM") {
        setTimeout(() => process.exit(0), 100);
      }
    };
    process.on("SIGINT", () => cleanup("SIGINT"));
    process.on("SIGTERM", () => cleanup("SIGTERM"));
    process.on("exit", () => cleanup("exit"));

    adapter.log(`📦 Deployed build available at http://localhost:${port}/`);
    return caddyProcess;
  } catch (err) {
    adapter.error("Failed to start Caddy:", err);
    adapter.warn("Falling back to Node.js HTTP server...");
    return startNodeServer(projectDir, port, adapter);
  }
};

// Fallback Node.js HTTP server (if Caddy not installed)
const startNodeServer = (projectDir, port, adapter) => {
  const currentDir = path.join(projectDir, ".deployed", "current");

  const server = http.createServer(async (req, res) => {
    const { pathname } = new URL(req.url, `http://localhost:${port}`);
    await serveDeployedFile(currentDir, pathname, res);
  });

  server.listen(port, () => {
    adapter.log(`📦 Deployed build available at http://localhost:${port}/ (Node.js fallback)`);
  });

  return server;
};

const clearDirectory = async (dirPath) => {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch {
    // Directory might not exist
  }
  await fs.mkdir(dirPath, { recursive: true });
};

const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

// --- Plugin Loader ---

const loadServerModules = async (adapter, projectDir) => {
  const serverModules = [];
  const packageJsonPath = adapter.join(projectDir, "package.json");
  const packageExists = await adapter.exists(packageJsonPath);

  if (!packageExists) return serverModules;

  try {
    const packageJsonContent = await adapter.readFile(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);

    if (
      packageJson.serverModules &&
      typeof packageJson.serverModules === "object"
    ) {
      adapter.log("🔌 Loading server plugins...");
      const plugins = Object.entries(packageJson.serverModules);

      for (const [name, pluginPath] of plugins) {
        const fullPath = adapter.join(projectDir, pluginPath);
        const pluginExists = await adapter.exists(fullPath);

        if (pluginExists) {
          try {
            const moduleUrl = `${pathToFileURL(fullPath).href}?t=${Date.now()}`;
            const pluginModule = await import(moduleUrl);

            if (
              pluginModule.default &&
              typeof pluginModule.default.fetch === "function"
            ) {
              serverModules.push(pluginModule.default);
              adapter.log(`    - Loaded plugin: ${name}`);
            }
          } catch (e) {
            adapter.error(
              `Error loading plugin '${name}' from ${fullPath}:`,
              e,
            );
          }
        }
      }
    }
  } catch (e) {
    adapter.error(
      "Error reading or parsing package.json for server plugins:",
      e,
    );
  }

  return serverModules;
};

// --- Request Handler Factory (MODIFIED) ---

// **MODIFIED**: Now accepts host and port
const createRequestHandler = (
  adapter,
  projectDir,
  getServerModules,
  host,
  port,
) => {
  const serveFile = async (filePath, res, urlHasExtension) => {
    // This function is now back to just serving the file
    const serveFileContent = (file) => {
      adapter.readFile(file).then(
        (data) => {
          const contentType = mime.getType(file) || "application/octet-stream";
          res.writeHead(200, { "Content-Type": contentType });
          res.end(data);
        },
        (err) => {
          adapter.error(`Error reading file: ${file}`, err);
          serveIndexFallback();
        },
      );
    };

    const serveIndexFallback = async () => {
      const indexPath = adapter.join(projectDir, "index.html");
      if (await adapter.exists(indexPath)) {
        serveFileContent(indexPath);
      } else {
        res.writeHead(404);
        res.end("404 Not Found");
      }
    };

    adapter.stat(filePath).then(
      (stats) => {
        if (stats.isDirectory()) {
          const indexPath = adapter.join(filePath, "index.html");
          adapter.exists(indexPath).then((exists) => {
            if (exists) {
              serveFileContent(indexPath);
            } else {
              serveIndexFallback();
            }
          });
        } else if (stats.isFile()) {
          serveFileContent(filePath);
        }
      },
      (err) => {
        // Not a file or directory
        if (urlHasExtension) {
          res.writeHead(404);
          res.end("404 Not Found");
        } else {
          serveIndexFallback();
        }
      },
    );
  };

  return async (req, res) => {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const pathname = urlObj.pathname;

    if (req.url === "/.well-known/appspecific/com.chrome.devtools.json") {
      adapter.log(
        "Serving DevTools workspace config file (workspace format)...",
      );

      const absolutePath = adapter.resolve(projectDir);

      const jsonResponse = {
        workspace: {
          root: absolutePath,
          uuid: randomUUID(),
        },
      };

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(jsonResponse));
      return;
    }

    // POST /deploy - receive and store files (versioned)
    if (req.method === "POST" && pathname === "/deploy") {
      try {
        // Parse body
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const body = JSON.parse(Buffer.concat(chunks).toString());
        const { files } = body;

        // Create versioned build directory
        const deployedDir = adapter.join(projectDir, ".deployed");
        const buildId = generateBuildId();
        const buildDir = adapter.join(deployedDir, "builds", buildId);
        await ensureDir(buildDir);

        // Write files to versioned build directory
        for (const file of files) {
          const filePath = adapter.join(buildDir, file.path);
          await ensureDir(adapter.dirname(filePath));

          const content =
            file.encoding === "base64"
              ? Buffer.from(file.content, "base64")
              : file.content;
          await fs.writeFile(filePath, content);
        }

        // Update current symlink
        await updateCurrentSymlink(deployedDir, buildId);

        // Cleanup old builds
        await cleanupOldBuilds(deployedDir);

        adapter.log(`📦 Deployed ${files.length} files to .deployed/builds/${buildId}/`);

        // Start separate port server if not running (use 23XX port - same last 2 digits, different prefix)
        const deployedPort = port + 1000;
        if (!deployedServer) {
          deployedServer = await startCaddyServer(projectDir, deployedPort, adapter);
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            buildId,
            urls: {
              prefixed: `http://${host}:${port}/_deployed/`,
              standalone: `http://${host}:${deployedPort}/`,
            },
          }),
        );
        return;
      } catch (err) {
        adapter.error("Deploy error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
        return;
      }
    }

    // GET /vps/builds - list available builds
    if (req.method === "GET" && pathname === "/vps/builds") {
      try {
        const deployedDir = adapter.join(projectDir, ".deployed");
        const builds = await getBuilds(deployedDir);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, builds }));
        return;
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
        return;
      }
    }

    // GET /builds/:buildId/files - get all files from a build
    const buildFilesMatch = pathname.match(/^\/builds\/([^/]+)\/files$/);
    if (req.method === "GET" && buildFilesMatch) {
      try {
        const buildId = buildFilesMatch[1];
        const deployedDir = adapter.join(projectDir, ".deployed");
        const buildDir = adapter.join(deployedDir, "builds", buildId);

        // Check if build exists
        try {
          await fs.access(buildDir);
        } catch {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: `Build ${buildId} not found` }));
          return;
        }

        // Recursively read all files
        const files = [];
        const readDir = async (dir, basePath = "") => {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
              await readDir(fullPath, relativePath);
            } else {
              const content = await fs.readFile(fullPath);
              const mimeType = mime.getType(fullPath) || "application/octet-stream";
              // Base64 encode binary files, utf8 for text
              const isText = mimeType.startsWith("text/") ||
                            mimeType === "application/javascript" ||
                            mimeType === "application/json";
              files.push({
                path: relativePath,
                content: isText ? content.toString("utf8") : content.toString("base64"),
                encoding: isText ? "utf8" : "base64",
                mimeType,
              });
            }
          }
        };

        await readDir(buildDir);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, files }));
        return;
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
        return;
      }
    }

    // POST /vps/deploy - deploy to VPS via rsync
    if (req.method === "POST" && pathname === "/vps/deploy") {
      try {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const body = JSON.parse(Buffer.concat(chunks).toString());
        const { host, user, sshKeyPath, domain, remotePath, buildId, runSetup, rebuildDocker } = body;

        if (!host || !user || !domain || !remotePath || !buildId) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Missing required parameters" }));
          return;
        }

        const deployedDir = adapter.join(projectDir, ".deployed");
        const buildDir = adapter.join(deployedDir, "builds", buildId);

        // Check if build exists
        try {
          await fs.access(buildDir);
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: `Build ${buildId} not found` }));
          return;
        }

        // Expand ~ in SSH key path
        const expandPath = (p) => {
          if (p && p.startsWith("~/")) {
            return path.join(os.homedir(), p.slice(2));
          }
          return p || path.join(os.homedir(), ".ssh", "id_rsa");
        };

        const keyPath = expandPath(sshKeyPath);
        const sshTarget = `${user}@${host}`;
        const siteDir = `${remotePath}/${domain}`;
        const remoteBuildDir = `${siteDir}/builds/${buildId}`;
        const sshOpts = ["-i", keyPath, "-o", "StrictHostKeyChecking=no", "-o", "BatchMode=yes"];

        // Helper to run commands
        const runCommand = (command, args, options = {}) => {
          return new Promise((resolve, reject) => {
            adapter.log(`Running: ${command} ${args.join(" ")}`);
            const proc = spawn(command, args, { stdio: ["pipe", "pipe", "pipe"] });
            let stdout = "";
            let stderr = "";
            proc.stdout.on("data", (data) => {
              const text = data.toString();
              stdout += text;
              // Stream output in real-time
              text.split("\n").filter(Boolean).forEach((line) => adapter.log(`  ${line}`));
            });
            proc.stderr.on("data", (data) => {
              const text = data.toString();
              stderr += text;
              // Stream stderr too (apt uses stderr for progress)
              text.split("\n").filter(Boolean).forEach((line) => adapter.log(`  ${line}`));
            });
            proc.on("close", (code) => {
              if (code === 0) {
                resolve({ stdout, stderr });
              } else {
                reject(new Error(`Command failed (${code}): ${stderr || stdout}`));
              }
            });
            proc.on("error", reject);
            // Write to stdin if input provided
            if (options.input) {
              proc.stdin.write(options.input);
              proc.stdin.end();
            }
          });
        };

        // Helper to run SSH command
        const sshCommand = async (cmd) => {
          return runCommand("ssh", [...sshOpts, sshTarget, cmd]);
        };

        // Step 1: Run setup script if requested (installs Docker)
        if (runSetup) {
          adapter.log("Installing Docker on VPS...");
          const setupScript = `#!/bin/bash
set -e
export DEBIAN_FRONTEND=noninteractive

echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
fi

echo "Docker installation complete!"`;
          await runCommand("ssh", [...sshOpts, sshTarget, "bash -s"], { input: setupScript });
        }

        // Step 2: Create remote directory structure
        adapter.log(`Creating remote directory structure...`);
        await sshCommand(`mkdir -p ${siteDir}/current ${siteDir}/logs`);

        // Step 3: Rsync files directly to current (no symlinks - Docker doesn't handle them well)
        adapter.log(`Syncing files to ${sshTarget}:${siteDir}/current/...`);
        await runCommand("rsync", [
          "-avz",
          "--delete",
          "-e", `ssh ${sshOpts.join(" ")}`,
          `${buildDir}/`,
          `${sshTarget}:${siteDir}/current/`,
        ]);

        // Step 5: Check if container is running
        const containerName = `caddy-${domain.replace(/\./g, "-")}`;
        const isRunning = await sshCommand(`docker ps -q -f name=${containerName} 2>/dev/null || echo ""`).then(r => r.stdout.trim());

        // Step 6: Upload Docker files and start/rebuild if needed
        if (!isRunning || rebuildDocker) {
          adapter.log("Generating Docker configuration...");

          const dockerCompose = `version: "3.8"
services:
  caddy:
    image: caddy:latest
    container_name: ${containerName}
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./current:/srv:ro
      - caddy_data:/data
      - ./logs:/var/log/caddy
volumes:
  caddy_data:
`;

          const caddyfile = `${domain} {
    root * /srv
    encode gzip zstd
    try_files {path} {path}/ /index.html
    file_server

    log {
        output file /var/log/caddy/access.log
        format json
    }
}
`;

          // Upload docker-compose.yml
          await sshCommand(`cat > ${siteDir}/docker-compose.yml << 'COMPOSE_EOF'
${dockerCompose}
COMPOSE_EOF`);

          // Upload Caddyfile
          await sshCommand(`cat > ${siteDir}/Caddyfile << 'CADDYFILE_EOF'
${caddyfile}
CADDYFILE_EOF`);

          // Start or rebuild container
          if (!isRunning) {
            adapter.log("Starting Caddy container (first time)...");
            await sshCommand(`cd ${siteDir} && docker compose up -d`);
          } else {
            adapter.log("Rebuilding Caddy container...");
            await sshCommand(`cd ${siteDir} && docker compose down && docker compose up -d`);
          }
        } else {
          // Files rsynced directly to current/ - Docker bind mount sees them immediately
          adapter.log("Content updated (files synced directly, no restart needed).");
        }

        adapter.log(`✅ Deployed to https://${domain}/`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: true,
          url: `https://${domain}/`,
          buildId,
        }));
        return;
      } catch (err) {
        adapter.error("VPS deploy error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
        return;
      }
    }

    // GET /_deployed/* - serve from .deployed/current/
    if (pathname.startsWith("/_deployed")) {
      const currentDir = adapter.join(projectDir, ".deployed", "current");
      const deployedPath = pathname.replace("/_deployed", "") || "/index.html";
      await serveDeployedFile(currentDir, deployedPath, res);
      return;
    }

    const serverModules = getServerModules();

    if (serverModules.length > 0) {
      try {
        const fetchRequest = await toFetchRequest(req, "http");
        for (const plugin of serverModules) {
          const fetchResponse = await plugin.fetch(
            fetchRequest.clone(),
            process.env,
          );
          const isApiRouteNotFound =
            fetchResponse.status === 404 &&
            (await fetchResponse.clone().text()) === "API Route Not Found";

          if (!isApiRouteNotFound) {
            await fromFetchResponse(fetchResponse, res);
            return;
          }
        }
      } catch (e) {
        adapter.error("Error handling request with server plugins:", e);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Server Logic Error");
        return;
      }
    }

    // Serve static files
    const safeSuffix = adapter.normalize(req.url).replace(/^\.(\.[/\\])+/, "");
    const urlWithoutQuery = req.url.split("?")[0];
    const urlHasExtension = adapter.extname(urlWithoutQuery) !== "";

    // Handle /$app.js shortcut -> /node_modules/@bootstrapp/base/app.js
    if (safeSuffix === "/$app.js" || safeSuffix.startsWith("/$app.js?")) {
      const filePath = adapter.join(projectDir, "node_modules/@bootstrapp/base/app.js");
      if (await adapter.exists(filePath)) {
        serveFile(filePath, res, true);
        return;
      }
    }

    // Handle /$app/ shortcut -> /node_modules/@bootstrapp/
    if (safeSuffix.startsWith("/$app/")) {
      const packagePath = safeSuffix.slice(6); // Remove "/$app/"
      const filePath = adapter.join(projectDir, "node_modules/@bootstrapp/", packagePath.split("?")[0]);
      if (await adapter.exists(filePath)) {
        serveFile(filePath, res, urlHasExtension);
        return;
      } else {
        res.writeHead(404);
        res.end("404 Not Found: /$app/" + packagePath);
        return;
      }
    }

    const requestPath = safeSuffix === "/" ? "index.html" : safeSuffix;
    const requestPathWithoutQuery = requestPath.split("?")[0];
    const filePath = adapter.join(projectDir, requestPathWithoutQuery);

    if (await adapter.exists(filePath)) {
      // This will call our modified serveFile
      serveFile(filePath, res, urlHasExtension);
    } else {
      // File not found
      if (urlHasExtension) {
        res.writeHead(404);
        res.end("404 Not Found");
      } else {
        // SPA routing - serve appropriate index.html based on path
        // Admin routes (/admin/*) get admin/index.html, others get index.html
        const isAdminRoute = pathname.startsWith("/admin");
        const indexPath = isAdminRoute
          ? adapter.join(projectDir, "admin", "index.html")
          : adapter.join(projectDir, "index.html");

        if (await adapter.exists(indexPath)) {
          serveFile(indexPath, res, false);
        } else if (isAdminRoute) {
          // Fallback to main index.html if admin/index.html doesn't exist
          const mainIndexPath = adapter.join(projectDir, "index.html");
          if (await adapter.exists(mainIndexPath)) {
            serveFile(mainIndexPath, res, false);
          } else {
            res.writeHead(404);
            res.end("404 Not Found");
          }
        } else {
          res.writeHead(404);
          res.end("404 Not Found");
        }
      }
    }
  };
};

// --- Main Serve Function (MODIFIED) ---

export const serve = async (adapter, args = []) => {
  const hostArgIndex = args.indexOf("--host");
  const host = hostArgIndex !== -1 ? args[hostArgIndex + 1] : "localhost";

  const portArgIndex = args.indexOf("--port");
  const SERVER_PORT =
    portArgIndex !== -1
      ? Number.parseInt(args[portArgIndex + 1])
      : Number.parseInt(adapter.getEnv("SERVER_PORT")) || 1315;
  const shouldWatch = args.includes("--watch");
  const shouldOpen = args.includes("--open"); // <-- ADD THIS LINE

  const currentDir = adapter.getCwd();

  let projectDir = currentDir;
  if (args.length > 0 && !args[0].startsWith("--")) {
    const sourcePath = adapter.resolve(args[0]);
    const exists = await adapter.exists(sourcePath);
    if (exists) {
      const stats = await adapter.stat(sourcePath);
      if (stats.isDirectory()) {
        projectDir = sourcePath;
      }
    }
  }

  const startServer = async (attempt = 0) => {
    const MAX_ATTEMPTS = 10;
    const port = SERVER_PORT + attempt;
    const wsPort = port + 1;
    let wss;

    // Load .env file
    const envPath = adapter.join(projectDir, ".env");
    if (await adapter.exists(envPath)) {
      const envConfig = await adapter.readFile(envPath, "utf-8");
      envConfig.split("\n").forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith("#")) {
          const separatorIndex = trimmedLine.indexOf("=");
          if (separatorIndex !== -1) {
            const key = trimmedLine.substring(0, separatorIndex).trim();
            let value = trimmedLine.substring(separatorIndex + 1).trim();
            if (
              (value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))
            ) {
              value = value.substring(1, value.length - 1);
            }
            if (key && !adapter.getEnv(key)) {
              adapter.setEnv(key, value);
            }
          }
        }
      });
    }

    // Load server plugins
    let serverModules = await loadServerModules(adapter, projectDir);

    // **MODIFIED**: Pass host and port to the handler
    const requestHandler = createRequestHandler(
      adapter,
      projectDir,
      () => serverModules,
      host, // <-- Pass host
      port, // <-- Pass port
    );

    const server = await adapter.createServer(requestHandler);

    const handleServerError = (err) => {
      if (err.code === "EADDRINUSE" && attempt < MAX_ATTEMPTS - 1) {
        adapter.warn(
          `Port ${port} or ${wsPort} is in use, trying next port...`,
        );
        server.close(() => {
          if (wss) wss.close(() => startServer(attempt + 1));
          else startServer(attempt + 1);
        });
      } else {
        adapter.error(
          `Failed to start server after ${MAX_ATTEMPTS} attempts.`,
          err,
        );
      }
    };

    server.on("error", handleServerError);

    server.listen(port, host, async () => {
      wss = new WebSocketServer({ port: wsPort });
      wss.on("connection", () =>
        adapter.log("Dev client connected for hot-reload."),
      );
      wss.on("error", handleServerError);

      // Start deployed server on load if .deployed/current folder exists
      const currentDir = adapter.join(projectDir, ".deployed", "current");
      if (await adapter.exists(currentDir)) {
        const deployedPort = port + 1000;
        if (!deployedServer) {
          deployedServer = await startCaddyServer(projectDir, deployedPort, adapter);
        }
      }

      if (shouldWatch) {
        adapter.log("Setting up file watcher...");
        await adapter.watch(
          [projectDir],
          {
            ignored: [
              "**/node_modules/**",
              "**/.deployed/**",
              ".deployed/**",
              "**/pb_data/**",
              "**/pb_migrations/**",
              "**/.git/**",
            ],
            persistent: true,
          },
          async (filePath) => {
            // Skip .deployed directory changes (fallback if ignore pattern fails)
            if (filePath.includes("/.deployed/") || filePath.includes("\\.deployed\\")) {
              return;
            }

            adapter.log(
              `File changed: ${adapter.basename(filePath)}. Reloading clients...`,
            );

            if (filePath.startsWith(adapter.join(projectDir, "server"))) {
              adapter.log("Server plugin changed, reloading plugins...");
              serverModules = await loadServerModules(adapter, projectDir);
            }

            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send("APP:REFRESH");
              }
            });
          },
        );
      }

      adapter.log(`Server running at http://${host}:${port}`);
      adapter.log(`Serving files from: ${projectDir}`);
      if (shouldWatch) {
        adapter.log("Watching for changes...");
      }

      // --- NEW CODE: Launch browser if --open is used ---
      if (shouldOpen) {
        const url = `http://${host}:${port}`;
        let command;
        // The flags for auto-opening devtools
        const flags = `--auto-open-devtools-for-tabs --undocked --force-dark-mode`;

        switch (process.platform) {
          case "darwin": // macOS
            // 'open' is used to launch apps, --args passes flags to the app
            command = `open -a "Google Chrome" "${url}" --args ${flags}`;
            break;
          case "win32": // Windows
            // 'start' is the shell command, URL first
            command = `start chrome "${url}" ${flags}`;
            break;
          case "linux": // Linux
            // Try common chrome executables.
            command = `chromium "${url}" ${flags} || google-chrome "${url}" ${flags} || google-chrome-stable "${url}" ${flags}`;
            break;
          default:
            adapter.warn(
              `Platform "${process.platform}" not recognized, cannot auto-open browser.`,
            );
        }

        if (command) {
          adapter.log(`Attempting to open browser: ${command}`);
          exec(command, (err) => {
            if (err) {
              adapter.error(
                "Failed to open browser. Please open it manually.",
                err,
              );
              adapter.warn(
                `You may need to install Google Chrome or add it to your PATH.`,
              );
            } else {
              adapter.log("Browser opened.");
            }
          });
        }
      }
      // --- END NEW CODE ---
    });
  };

  await startServer();
};
