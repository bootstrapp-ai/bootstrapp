const generateComponent = async (adapter, options) => {
    const { name, path: targetPath = "./src/components" } = options;
    
    const componentDir = adapter.join(adapter.getCwd(), targetPath, name);
    await adapter.mkdir(componentDir);
    
    const componentContent = `export function ${name}() {
  return <div>${name} Component</div>;
}`;
    
    const filePath = adapter.join(componentDir, `${name}.jsx`);
    await adapter.writeFile(filePath, componentContent);
    
    adapter.log(`✅ Generated component: ${name} at ${targetPath}`);
};

const generatePage = async (adapter, options) => {
    const { name, path: targetPath = "./src/pages" } = options;
    
    const pageDir = adapter.join(adapter.getCwd(), targetPath);
    await adapter.mkdir(pageDir);
    
    const pageContent = `export default function ${name}Page() {
  return (
    <div>
      <h1>${name}</h1>
    </div>
  );
}`;
    
    const filePath = adapter.join(pageDir, `${name}.jsx`);
    await adapter.writeFile(filePath, pageContent);
    
    adapter.log(`✅ Generated page: ${name} at ${targetPath}`);
};

const generateAPI = async (adapter, options) => {
    const { name, path: targetPath = "./server/api" } = options;
    
    const apiDir = adapter.join(adapter.getCwd(), targetPath);
    await adapter.mkdir(apiDir);
    
    const apiContent = `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/${name.toLowerCase()}') {
      return new Response(JSON.stringify({ message: 'Hello from ${name}' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('API Route Not Found', { status: 404 });
  }
};`;
    
    const filePath = adapter.join(apiDir, `${name}.js`);
    await adapter.writeFile(filePath, apiContent);
    
    adapter.log(`✅ Generated API route: ${name} at ${targetPath}`);
};

const generators = {
    component: generateComponent,
    page: generatePage,
    api: generateAPI,
};

export const generate = async (adapter, type, options = {}) => {
    const generator = generators[type];
    if (!generator) {
        throw new Error(`Unknown generator type: ${type}`);
    }

    return generator(adapter, options);
};
