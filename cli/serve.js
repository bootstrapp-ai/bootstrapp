import { exec } from "node:child_process"; // <-- IMPORT 'exec'
import { randomUUID } from "node:crypto"; // <-- NEW IMPORT
import { fileURLToPath, pathToFileURL } from "node:url";
import mime from "mime";
import WebSocket, { WebSocketServer } from "ws";

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
        // Try serving index.html for SPA routing
        const indexPath = adapter.join(projectDir, "index.html");
        if (await adapter.exists(indexPath)) {
          serveFile(indexPath, res, false);
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
      if (shouldWatch) {
        adapter.log("Setting up file watcher...");
        await adapter.watch(
          [projectDir],
          {
            //ignored: /(^|[/\\])\\..|node_modules/,
            persistent: true,
          },
          async (filePath) => {
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
