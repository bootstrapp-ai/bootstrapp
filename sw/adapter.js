class SWAdapter {
  constructor(app) {
    this.$APP = app;
  }

  async namespaceExists({ namespace }) {
    try {
      const files = await this.listDirectory({ namespace });
      return files.length > 0;
    } catch (error) {
      console.error("Error checking namespace existence:", error);
      return false;
    }
  }

  async createFiles({ namespace, files, system }) {
    return this.$APP.SW.request("FS:WRITE_FILES", { namespace, files, system });
  }

  async createFile({ namespace, path, content = "" }) {
    return this.writeFile({ namespace, path, content });
  }

  async saveFile({ namespace, path, content, system }) {
    return this.writeFile({ namespace, path, content, system });
  }

  async writeFile({ namespace, path, system, content = "" }) {
    return this.$APP.SW.request("FS:WRITE_FILE", {
      namespace,
      path,
      content,
      system,
    });
  }

  async readFile({ namespace, path, system }) {
    const { content } = await this.$APP.SW.request("FS:READ_FILE", {
      namespace,
      path,
      system,
    });
    return content;
  }

  async deleteFile({ namespace, path }) {
    return this.$APP.SW.request("FS:DELETE_FILE", { namespace, path });
  }

  async createFolder({ namespace, path }) {
    const dirPath = path.endsWith("/") ? path : `${path}/`;
    const placeholderPath = `${dirPath}.dir-placeholder`;
    return this.writeFile({ namespace, path: placeholderPath, content: "" });
  }

  async deleteDirectory({ namespace, path }) {
    return this.$APP.SW.request("FS:DELETE_DIRECTORY", { namespace, path });
  }

  async listDirectory({ namespace, path = "/", recursive = true }) {
    const { files } = await this.$APP.SW.request("FS:LIST_FILES", {
      namespace,
      path,
      recursive,
    });
    return files;
  }

  async deleteNamespace({ namespace }) {
    return this.$APP.SW.request("FS:DELETE_NAMESPACE", { namespace });
  }
}

export function createSWAdapter(app) {
  return new SWAdapter(app);
}

export default SWAdapter;
