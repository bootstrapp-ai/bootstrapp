/**
 * Bundle Analysis Command
 * Analyzes builds from .deployed/builds/ directory
 */

// ============================================================
// PART 1: TABLE RENDERING UTILITIES
// ============================================================

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

const box = {
  topLeft: "\u250c",
  topRight: "\u2510",
  bottomLeft: "\u2514",
  bottomRight: "\u2518",
  horizontal: "\u2500",
  vertical: "\u2502",
  teeLeft: "\u251c",
  teeRight: "\u2524",
  teeTop: "\u252c",
  teeBottom: "\u2534",
  cross: "\u253c",
};

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const renderTable = (title, headers, rows, options = {}) => {
  const colWidths =
    options.colWidths ||
    headers.map((h, i) =>
      Math.max(h.length, ...rows.map((r) => String(r[i] || "").length)) + 2
    );

  console.log(`\n${colors.bold}${colors.cyan}${title}${colors.reset}`);

  // Top border
  let topBorder = box.topLeft;
  colWidths.forEach((w, i) => {
    topBorder += box.horizontal.repeat(w);
    topBorder += i < colWidths.length - 1 ? box.teeTop : box.topRight;
  });
  console.log(topBorder);

  // Headers
  let headerRow = box.vertical;
  headers.forEach((h, i) => {
    const padded = " " + h.padEnd(colWidths[i] - 1);
    headerRow += `${colors.bold}${padded}${colors.reset}${box.vertical}`;
  });
  console.log(headerRow);

  // Header separator
  let sep = box.teeLeft;
  colWidths.forEach((w, i) => {
    sep += box.horizontal.repeat(w);
    sep += i < colWidths.length - 1 ? box.cross : box.teeRight;
  });
  console.log(sep);

  // Data rows
  rows.forEach((row) => {
    let rowStr = box.vertical;
    row.forEach((cell, i) => {
      const align = options.align?.[i] || "left";
      const cellStr = String(cell || "");
      const padded =
        align === "right"
          ? cellStr.padStart(colWidths[i] - 1) + " "
          : " " + cellStr.padEnd(colWidths[i] - 1);
      rowStr += padded + box.vertical;
    });
    console.log(rowStr);
  });

  // Bottom border
  let bottomBorder = box.bottomLeft;
  colWidths.forEach((w, i) => {
    bottomBorder += box.horizontal.repeat(w);
    bottomBorder += i < colWidths.length - 1 ? box.teeBottom : box.bottomRight;
  });
  console.log(bottomBorder);
};

// ============================================================
// PART 2: FILE BUNDLE PARSING
// ============================================================

const parseFileBundleFromSW = (swContent) => {
  const files = {};

  // FILE_BUNDLE format: {"path":{content:`...`,mimeType:"..."},...}
  // We need to parse this carefully since content contains backticks

  const startMarker = "const FILE_BUNDLE=";
  const startIndex = swContent.indexOf(startMarker);

  if (startIndex === -1) {
    throw new Error("FILE_BUNDLE not found in sw.js");
  }

  // Find where FILE_BUNDLE object starts
  const objectStart = startIndex + startMarker.length;

  // Extract file entries by finding pattern: "path":{content:`
  // and tracking balanced backticks
  let pos = objectStart + 1; // skip opening {

  while (pos < swContent.length) {
    // Find next file path
    const pathStart = swContent.indexOf('"', pos);
    if (pathStart === -1 || swContent[pathStart - 1] === "\\") break;

    const pathEnd = swContent.indexOf('"', pathStart + 1);
    if (pathEnd === -1) break;

    const filePath = swContent.slice(pathStart + 1, pathEnd);

    // Find content start (after `content:` and backtick)
    const contentMarker = swContent.indexOf("content:`", pathEnd);
    if (contentMarker === -1) break;

    const contentStart = contentMarker + 9; // "content:`".length

    // Find matching closing backtick (not escaped)
    let contentEnd = contentStart;
    let depth = 1;
    while (contentEnd < swContent.length && depth > 0) {
      const char = swContent[contentEnd];
      if (char === "`" && swContent[contentEnd - 1] !== "\\") {
        depth--;
      } else if (char === "$" && swContent[contentEnd + 1] === "{") {
        // Skip template expressions - find matching }
        let braceDepth = 1;
        contentEnd += 2;
        while (contentEnd < swContent.length && braceDepth > 0) {
          if (swContent[contentEnd] === "{") braceDepth++;
          else if (swContent[contentEnd] === "}") braceDepth--;
          contentEnd++;
        }
        continue;
      }
      contentEnd++;
    }

    const content = swContent.slice(contentStart, contentEnd - 1);

    // Find mimeType
    const mimeMarker = swContent.indexOf('mimeType:"', contentEnd);
    let mimeType = "application/octet-stream";
    if (mimeMarker !== -1 && mimeMarker < contentEnd + 50) {
      const mimeStart = mimeMarker + 10;
      const mimeEnd = swContent.indexOf('"', mimeStart);
      if (mimeEnd !== -1) {
        mimeType = swContent.slice(mimeStart, mimeEnd);
      }
    }

    files[filePath] = {
      content,
      mimeType,
      size: content.length,
    };

    // Move to next entry
    pos = swContent.indexOf("},", contentEnd);
    if (pos === -1) break;
    pos += 2;

    // Check if we've reached the end of FILE_BUNDLE
    if (swContent[pos] === "}" || swContent.slice(pos, pos + 10).includes(";")) {
      break;
    }
  }

  return files;
};

const categorizeFile = (filePath) => {
  if (filePath.startsWith("/$app/")) return "framework";
  if (
    filePath.startsWith("/npm/") ||
    filePath.startsWith("/fflate") ||
    filePath.startsWith("/lit-html") ||
    filePath.includes("@")
  )
    return "external";
  if (
    filePath.startsWith("/views/") ||
    filePath.startsWith("/models/") ||
    filePath.startsWith("/controllers/") ||
    filePath.startsWith("/locales/")
  )
    return "project";
  if (filePath.endsWith(".css")) return "styles";
  return "other";
};

// ============================================================
// PART 3: DEPENDENCY ANALYSIS
// ============================================================

const extractImports = (content) => {
  const imports = [];

  // Match: import X from "path"
  const importRegex = /import\s+(?:[^"']+\s+from\s+)?["']([^"']+)["']/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  // Match: export * from "path"
  const exportRegex = /export\s*\*\s*from\s*["']([^"']+)["']/g;
  while ((match = exportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
};

const buildDependencyGraph = (files) => {
  const graph = {};

  for (const [path, fileData] of Object.entries(files)) {
    if (fileData.mimeType?.includes("javascript")) {
      const imports = extractImports(fileData.content);
      // Filter out self-references
      graph[path] = imports.filter((imp) => imp !== path);
    }
  }

  // Detect circular dependencies using DFS
  const circular = [];
  const visited = new Set();
  const recursionStack = new Set();
  const seenCycles = new Set();

  const dfs = (node, path = []) => {
    if (recursionStack.has(node)) {
      const cycleStart = path.indexOf(node);
      if (cycleStart !== -1) {
        const cycle = path.slice(cycleStart).concat(node);
        // Only record unique cycles (by sorted string representation)
        const cycleKey = [...cycle].sort().join("|");
        if (!seenCycles.has(cycleKey) && cycle.length > 2) {
          seenCycles.add(cycleKey);
          circular.push(cycle);
        }
      }
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    recursionStack.add(node);

    for (const dep of graph[node] || []) {
      dfs(dep, [...path, node]);
    }

    recursionStack.delete(node);
  };

  for (const node of Object.keys(graph)) {
    dfs(node);
  }

  return { graph, circular };
};

// ============================================================
// PART 4: FRAMEWORK & PACKAGE ANALYSIS
// ============================================================

const groupFrameworkByModule = (files) => {
  const modules = {};

  for (const [path, data] of Object.entries(files)) {
    if (!path.startsWith("/$app/")) continue;

    // Extract module name from path: /$app/{module}/...
    const parts = path.replace("/$app/", "").split("/");
    const moduleName = parts[0] || "root";

    if (!modules[moduleName]) {
      modules[moduleName] = { files: [], totalSize: 0 };
    }
    modules[moduleName].files.push({ path, size: data.size });
    modules[moduleName].totalSize += data.size;
  }

  return modules;
};

const groupExternalByPackage = (files) => {
  const packages = {};

  for (const [path, data] of Object.entries(files)) {
    let packageName = null;

    // Match /npm/{package} or /{package}@{version}
    if (path.startsWith("/npm/")) {
      packageName = path.split("/")[2] || "npm";
    } else if (path.match(/^\/[^/]+@[\d.]+/)) {
      packageName = path.split("@")[0].slice(1);
    } else if (path.startsWith("/lit-html")) {
      packageName = "lit-html";
    } else if (path.startsWith("/fflate")) {
      packageName = "fflate";
    }

    if (!packageName) continue;

    if (!packages[packageName]) {
      packages[packageName] = { files: [], totalSize: 0 };
    }
    packages[packageName].files.push({ path, size: data.size });
    packages[packageName].totalSize += data.size;
  }

  return packages;
};

const findMostImported = (graph) => {
  const importCounts = {};

  for (const deps of Object.values(graph)) {
    for (const dep of deps) {
      importCounts[dep] = (importCounts[dep] || 0) + 1;
    }
  }

  return Object.entries(importCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
};

const analyzeFileContent = (content) => {
  // Count exports
  const namedExports = (content.match(/export\s+(const|let|var|function|class|async\s+function)\s+\w+/g) || []).length;
  const defaultExport = content.includes("export default") ? 1 : 0;
  const reExports = (content.match(/export\s*\*\s*from/g) || []).length;
  const exportedNames = (content.match(/export\s*\{[^}]+\}/g) || []).length;

  // Count functions (rough estimate)
  const functions = (content.match(/(?:function\s+\w+|=>\s*\{|=>\s*[^{]|\w+\s*\([^)]*\)\s*\{)/g) || []).length;

  // Count classes
  const classes = (content.match(/class\s+\w+/g) || []).length;

  return {
    exports: namedExports + defaultExport + reExports + exportedNames,
    functions,
    classes,
  };
};

// ============================================================
// PART 5: TAILWIND/CSS ANALYSIS
// ============================================================

const extractTailwindClasses = (cssContent) => {
  const classFrequency = {};

  // Match CSS class selectors more carefully
  // Pattern: .classname followed by { or , or : (pseudo) or space
  // Must start with letter or underscore
  const classRegex = /\.([a-zA-Z_][a-zA-Z0-9_\-\[\]\(\)\.\%\/\\:]*?)(?:\s*\{|,|\s|::)/g;

  let match;
  while ((match = classRegex.exec(cssContent)) !== null) {
    let className = match[1];

    // Unescape common patterns
    className = className.replace(/\\/g, "");

    // Handle hover:, focus:, etc. variants - keep the full class with variant
    // But also extract the base class for categorization
    const baseName = className.includes(":") ? className.split(":").pop() : className;

    // Skip invalid patterns
    if (!baseName) continue;
    if (baseName.length < 2) continue;
    // Skip if it looks like a CSS value (pure numbers, percentages without class prefix)
    if (/^\d+(%|s|px|rem|em)?$/.test(baseName)) continue;
    if (/^\d+\.\d+/.test(baseName)) continue;
    // Skip if it contains problematic characters at the start
    if (/^[\d\(\)\[\]]/.test(baseName)) continue;

    classFrequency[className] = (classFrequency[className] || 0) + 1;
  }

  return {
    classes: Object.keys(classFrequency),
    frequency: classFrequency,
  };
};

const categorizeTailwindClasses = (classes) => {
  const categories = {
    layout: [],
    spacing: [],
    sizing: [],
    typography: [],
    colors: [],
    borders: [],
    effects: [],
    transforms: [],
    responsive: [],
    other: [],
  };

  for (const cls of classes) {
    if (
      /^(flex|grid|block|inline|hidden|absolute|relative|fixed|sticky|items-|justify-|self-|place-|order-)/.test(
        cls
      )
    ) {
      categories.layout.push(cls);
    } else if (/^(p-|m-|gap-|space-|px-|py-|pt-|pb-|pl-|pr-|mx-|my-)/.test(cls)) {
      categories.spacing.push(cls);
    } else if (/^(w-|h-|min-|max-|size-)/.test(cls)) {
      categories.sizing.push(cls);
    } else if (/^(text-|font-|leading-|tracking-|uppercase|lowercase|capitalize)/.test(cls)) {
      categories.typography.push(cls);
    } else if (/^(bg-|text-(?:black|white|gray|red|green|blue|yellow|pink|purple|orange))/.test(cls)) {
      categories.colors.push(cls);
    } else if (/^(border|rounded|ring-)/.test(cls)) {
      categories.borders.push(cls);
    } else if (/^(shadow|opacity|ring|blur|brightness|contrast)/.test(cls)) {
      categories.effects.push(cls);
    } else if (/^(translate|rotate|scale|transform|skew)/.test(cls)) {
      categories.transforms.push(cls);
    } else if (/^(sm:|md:|lg:|xl:|2xl:)/.test(cls)) {
      categories.responsive.push(cls);
    } else {
      categories.other.push(cls);
    }
  }

  return categories;
};

// ============================================================
// PART 5: MAIN ANALYZE COMMAND
// ============================================================

export const parseAnalyzeArgs = (args) => {
  const options = {
    project: null,
    build: "latest",
    verbose: false,
    json: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--verbose" || arg === "-v") {
      options.verbose = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--build" || arg === "-b") {
      options.build = args[++i];
    } else if (!arg.startsWith("-")) {
      options.project = arg;
    }
  }

  return options;
};

export const analyze = async (adapter, options = {}) => {
  const { project, build, verbose, json } = options;

  // 1. Locate project and builds
  const cwd = adapter.getCwd();
  const projectPath = project ? adapter.resolve(cwd, project) : cwd;

  const buildsDir = adapter.join(projectPath, ".deployed", "builds");

  if (!(await adapter.exists(buildsDir))) {
    adapter.error(`No builds found at: ${buildsDir}`);
    adapter.log('Run a local deploy first with "Deploy Locally" in the bundler UI.');
    return false;
  }

  // 2. Find build to analyze
  const allEntries = await adapter.readdir(buildsDir);
  const builds = allEntries
    .filter((d) => /^\d{8}-\d{6}$/.test(d))
    .sort()
    .reverse();

  if (builds.length === 0) {
    adapter.error("No builds found in .deployed/builds/");
    return false;
  }

  const selectedBuild =
    build === "latest" ? builds[0] : builds.find((b) => b.includes(build));

  if (!selectedBuild) {
    adapter.error(`Build not found: ${build}`);
    adapter.log(`Available builds: ${builds.join(", ")}`);
    return false;
  }

  const buildPath = adapter.join(buildsDir, selectedBuild);

  // 3. Read build files
  const swPath = adapter.join(buildPath, "sw.js");
  const cssPath = adapter.join(buildPath, "style.css");

  if (!(await adapter.exists(swPath))) {
    adapter.error(`sw.js not found at: ${swPath}`);
    return false;
  }

  adapter.log(`\n${colors.gray}Analyzing build: ${selectedBuild}...${colors.reset}\n`);

  const swContent = await adapter.readFile(swPath);
  const cssContent = (await adapter.exists(cssPath))
    ? await adapter.readFile(cssPath)
    : "";

  // 4. Parse FILE_BUNDLE
  let files;
  try {
    files = parseFileBundleFromSW(swContent);
  } catch (err) {
    adapter.error(`Failed to parse FILE_BUNDLE: ${err.message}`);
    return false;
  }

  // 5. Calculate metrics
  const fileList = Object.entries(files).map(([path, data]) => ({
    path,
    size: data.size,
    category: categorizeFile(path),
    mimeType: data.mimeType,
  }));

  const totalSize = fileList.reduce((sum, f) => sum + f.size, 0);
  const categorySizes = {};
  const categoryCounts = {};

  for (const file of fileList) {
    categorySizes[file.category] = (categorySizes[file.category] || 0) + file.size;
    categoryCounts[file.category] = (categoryCounts[file.category] || 0) + 1;
  }

  // 6. Build dependency graph
  const { graph, circular } = buildDependencyGraph(files);
  const totalImports = Object.values(graph).reduce((sum, deps) => sum + deps.length, 0);

  // 7. Extract Tailwind classes
  const { classes, frequency } = extractTailwindClasses(cssContent);
  const tailwindCategories = categorizeTailwindClasses(classes);

  // 8. Compute additional analysis
  const frameworkModulesData = groupFrameworkByModule(files);
  const externalPackagesData = groupExternalByPackage(files);
  const mostImportedData = findMostImported(graph);

  // 9. Output results
  if (json) {
    console.log(
      JSON.stringify(
        {
          build: selectedBuild,
          totalFiles: fileList.length,
          totalSize,
          categories: categorySizes,
          frameworkModules: Object.fromEntries(
            Object.entries(frameworkModulesData).map(([mod, data]) => [
              mod,
              { fileCount: data.files.length, size: data.totalSize },
            ])
          ),
          externalPackages: Object.fromEntries(
            Object.entries(externalPackagesData).map(([pkg, data]) => [
              pkg,
              { fileCount: data.files.length, size: data.totalSize },
            ])
          ),
          mostImported: mostImportedData,
          topFiles: fileList.sort((a, b) => b.size - a.size).slice(0, 20),
          circularDependencies: circular,
          tailwindClasses: {
            total: classes.length,
            topClasses: Object.entries(frequency)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 20),
            categories: Object.fromEntries(
              Object.entries(tailwindCategories).map(([k, v]) => [k, v.length])
            ),
          },
        },
        null,
        2
      )
    );
    return true;
  }

  // Pretty CLI output
  console.log(
    `${colors.bold}${colors.magenta}${"━".repeat(60)}${colors.reset}`
  );
  console.log(
    `${colors.bold}${colors.magenta}           BOOTSTRAPP BUNDLE ANALYSIS${colors.reset}`
  );
  console.log(
    `${colors.bold}${colors.magenta}${"━".repeat(60)}${colors.reset}`
  );

  // Summary section
  const buildDate = `${selectedBuild.slice(0, 4)}-${selectedBuild.slice(4, 6)}-${selectedBuild.slice(6, 8)} ${selectedBuild.slice(9, 11)}:${selectedBuild.slice(11, 13)}:${selectedBuild.slice(13, 15)}`;

  renderTable(
    "Build Summary",
    ["Metric", "Value"],
    [
      ["Build ID", selectedBuild],
      ["Build Date", buildDate],
      ["Total Files (embedded)", fileList.length.toString()],
      ["Total Size (embedded)", formatBytes(totalSize)],
      ["CSS Size", formatBytes(cssContent.length)],
      ["SW.js Size", formatBytes(swContent.length)],
      ["Total Imports", totalImports.toString()],
    ],
    { colWidths: [22, 35], align: ["left", "right"] }
  );

  // Files by category
  renderTable(
    "Files by Category",
    ["Category", "Count", "Size", "% of Total"],
    Object.entries(categorySizes)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, size]) => [
        cat,
        categoryCounts[cat].toString(),
        formatBytes(size),
        ((size / totalSize) * 100).toFixed(1) + "%",
      ]),
    { colWidths: [15, 10, 15, 15], align: ["left", "right", "right", "right"] }
  );

  // Framework module breakdown
  const frameworkTotal = Object.values(frameworkModulesData).reduce((sum, m) => sum + m.totalSize, 0);

  renderTable(
    "Framework Breakdown (/$app/*)",
    ["Module", "Files", "Size", "% of FW"],
    Object.entries(frameworkModulesData)
      .sort((a, b) => b[1].totalSize - a[1].totalSize)
      .map(([mod, data]) => [
        mod,
        data.files.length.toString(),
        formatBytes(data.totalSize),
        ((data.totalSize / frameworkTotal) * 100).toFixed(1) + "%",
      ]),
    { colWidths: [20, 10, 15, 12], align: ["left", "right", "right", "right"] }
  );

  // Verbose: Show top files per framework module
  if (verbose) {
    console.log(`\n${colors.bold}${colors.yellow}Detailed Framework Analysis (--verbose)${colors.reset}`);

    const sortedModules = Object.entries(frameworkModulesData)
      .sort((a, b) => b[1].totalSize - a[1].totalSize)
      .slice(0, 8); // Top 8 modules

    for (const [moduleName, moduleData] of sortedModules) {
      const sortedFiles = moduleData.files.sort((a, b) => b.size - a.size).slice(0, 5);

      console.log(`\n${colors.cyan}  /$app/${moduleName}/${colors.reset} ${colors.gray}(${formatBytes(moduleData.totalSize)}, ${moduleData.files.length} files)${colors.reset}`);

      for (const file of sortedFiles) {
        const fileName = file.path.replace(`/$app/${moduleName}/`, "");
        const pct = ((file.size / moduleData.totalSize) * 100).toFixed(1);
        const bar = "█".repeat(Math.ceil(parseFloat(pct) / 5)) + "░".repeat(20 - Math.ceil(parseFloat(pct) / 5));
        console.log(`    ${colors.gray}${bar}${colors.reset} ${formatBytes(file.size).padStart(10)} ${colors.dim}(${pct}%)${colors.reset} ${fileName}`);
      }

      if (moduleData.files.length > 5) {
        console.log(`    ${colors.gray}... and ${moduleData.files.length - 5} more files${colors.reset}`);
      }
    }
  }

  // External packages breakdown
  if (Object.keys(externalPackagesData).length > 0) {
    const externalTotal = Object.values(externalPackagesData).reduce((sum, p) => sum + p.totalSize, 0);

    renderTable(
      "External Packages",
      ["Package", "Files", "Size", "% of Ext"],
      Object.entries(externalPackagesData)
        .sort((a, b) => b[1].totalSize - a[1].totalSize)
        .map(([pkg, data]) => [
          pkg,
          data.files.length.toString(),
          formatBytes(data.totalSize),
          ((data.totalSize / externalTotal) * 100).toFixed(1) + "%",
        ]),
      { colWidths: [25, 10, 15, 12], align: ["left", "right", "right", "right"] }
    );
  }

  // Most imported files (dependency hotspots)
  if (mostImportedData.length > 0) {
    renderTable(
      "Most Imported Files (Dependency Hotspots)",
      ["File", "Import Count"],
      mostImportedData.map(([file, count]) => [
        file.length > 50 ? "..." + file.slice(-47) : file,
        count.toString(),
      ]),
      { colWidths: [52, 15], align: ["left", "right"] }
    );
  }

  // Top 10 largest files
  renderTable(
    "Top 10 Largest Files",
    ["File", "Size", "Category"],
    fileList
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .map((f) => [
        f.path.length > 42 ? "..." + f.path.slice(-39) : f.path,
        formatBytes(f.size),
        f.category,
      ]),
    { colWidths: [45, 12, 12], align: ["left", "right", "left"] }
  );

  // Circular dependencies
  if (circular.length > 0) {
    console.log(
      `\n${colors.bold}${colors.red}Circular Dependencies Detected (${circular.length})!${colors.reset}`
    );
    circular.slice(0, 5).forEach((cycle, i) => {
      const shortCycle = cycle.map((p) =>
        p.length > 30 ? "..." + p.slice(-27) : p
      );
      console.log(`${colors.yellow}  ${i + 1}. ${shortCycle.join(" -> ")}${colors.reset}`);
    });
    if (circular.length > 5) {
      console.log(`${colors.gray}  ... and ${circular.length - 5} more${colors.reset}`);
    }
  } else {
    console.log(
      `\n${colors.green}✓ No circular dependencies detected${colors.reset}`
    );
  }

  // Tailwind classes summary
  console.log(
    `\n${colors.bold}${colors.cyan}Tailwind CSS Analysis${colors.reset}`
  );
  console.log(`${colors.gray}Total unique classes: ${classes.length}${colors.reset}`);

  // Top Tailwind classes
  const topTailwind = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  renderTable(
    "Top 15 Tailwind Classes",
    ["Class", "Occurrences"],
    topTailwind.map(([cls, count]) => [cls, count.toString()]),
    { colWidths: [42, 15], align: ["left", "right"] }
  );

  // Tailwind by category
  renderTable(
    "Tailwind Classes by Category",
    ["Category", "Count", "Examples"],
    Object.entries(tailwindCategories)
      .filter(([, arr]) => arr.length > 0)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([cat, arr]) => [
        cat,
        arr.length.toString(),
        arr.slice(0, 3).join(", ") + (arr.length > 3 ? "..." : ""),
      ]),
    { colWidths: [15, 10, 42], align: ["left", "right", "left"] }
  );

  console.log(
    `\n${colors.bold}${colors.magenta}${"━".repeat(60)}${colors.reset}\n`
  );

  return true;
};

export default analyze;
