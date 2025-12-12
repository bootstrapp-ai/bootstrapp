const createBasicProject = async (adapter, name, options) => {
    const projectDir = adapter.join(adapter.getCwd(), name);
    await adapter.mkdir(projectDir);
    
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
</head>
<body>
  <h1>Welcome to ${name}</h1>
</body>
</html>`;
    
    await adapter.writeFile(adapter.join(projectDir, "index.html"), indexHtml);
    
    const packageJson = {
        name,
        version: "1.0.0",
        type: "module",
        scripts: {
            dev: "bootstrapp"
        }
    };
    
    await adapter.writeFile(
        adapter.join(projectDir, "package.json"),
        JSON.stringify(packageJson, null, 2)
    );
    
    adapter.log(`✅ Created basic project: ${name}`);
};

const createReactProject = async (adapter, name, options) => {
    const projectDir = adapter.join(adapter.getCwd(), name);
    await adapter.mkdir(projectDir);
    
    const packageJson = {
        name,
        version: "1.0.0",
        type: "module",
        scripts: {
            dev: "bootstrapp"
        },
        dependencies: {
            react: "^18.2.0",
            "react-dom": "^18.2.0"
        }
    };
    
    await adapter.writeFile(
        adapter.join(projectDir, "package.json"),
        JSON.stringify(packageJson, null, 2)
    );
    
    adapter.log(`✅ Created React project: ${name}`);
};

const createElectronProject = async (adapter, name, options) => {
    adapter.log(`✅ Created Electron project: ${name}`);
};

const templates = {
    basic: createBasicProject,
    react: createReactProject,
    electron: createElectronProject,
};

export const newProject = async (adapter, projectType, name, options = {}) => {
    const template = templates[projectType];
    if (!template) {
        throw new Error(`Unknown project type: ${projectType}`);
    }

    return template(adapter, name, options);
};
