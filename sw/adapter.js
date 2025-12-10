/**
 * @file Service Worker Filesystem Adapter
 * @description Virtual filesystem API that uses Service Worker cache storage
 */

/**
 * Service Worker Adapter for filesystem-like operations
 * Uses $APP.SW to communicate with the Service Worker
 */
class SWAdapter {
  /**
   * Create an SWAdapter instance
   * @param {Object} app - $APP instance
   */
  constructor(app) {
    this.$APP = app;
  }

  /**
   * Check if a namespace exists (has any files)
   * @param {Object} options - Options
   * @param {string} options.namespace - Namespace to check
   * @returns {Promise<boolean>} True if namespace exists
   */
  async namespaceExists({ namespace }) {
    try {
      const files = await this.listDirectory({ namespace });
      return files.length > 0;
    } catch (error) {
      console.error("Error checking namespace existence:", error);
      return false;
    }
  }

  /**
   * Create multiple files in batch
   * @param {Object} options - Options
   * @param {string} options.namespace - Target namespace
   * @param {Array} options.files - Array of file objects
   * @param {boolean} options.system - Whether to use system cache
   * @returns {Promise<Object>} Result
   */
  async createFiles({ namespace, files, system }) {
    return this.$APP.SW.request("FS:WRITE_FILES", { namespace, files, system });
  }

  /**
   * Create a single file
   * @param {Object} options - Options
   * @param {string} options.namespace - Target namespace
   * @param {string} options.path - File path
   * @param {string} options.content - File content
   * @returns {Promise<Object>} Result
   */
  async createFile({ namespace, path, content = "" }) {
    return this.writeFile({ namespace, path, content });
  }

  /**
   * Save a file (alias for writeFile)
   * @param {Object} options - Options
   * @param {string} options.namespace - Target namespace
   * @param {string} options.path - File path
   * @param {string} options.content - File content
   * @param {boolean} options.system - Whether to use system cache
   * @returns {Promise<Object>} Result
   */
  async saveFile({ namespace, path, content, system }) {
    return this.writeFile({ namespace, path, content, system });
  }

  /**
   * Write content to a file
   * @param {Object} options - Options
   * @param {string} options.namespace - Target namespace
   * @param {string} options.path - File path
   * @param {string} options.content - File content
   * @param {boolean} options.system - Whether to use system cache
   * @returns {Promise<Object>} Result
   */
  async writeFile({ namespace, path, system, content = "" }) {
    return this.$APP.SW.request("FS:WRITE_FILE", {
      namespace,
      path,
      content,
      system,
    });
  }

  /**
   * Read content from a file
   * @param {Object} options - Options
   * @param {string} options.namespace - Target namespace
   * @param {string} options.path - File path
   * @param {boolean} options.system - Whether to use system cache
   * @returns {Promise<string>} File content
   */
  async readFile({ namespace, path, system }) {
    const { content } = await this.$APP.SW.request("FS:READ_FILE", {
      namespace,
      path,
      system,
    });
    return content;
  }

  /**
   * Delete a file
   * @param {Object} options - Options
   * @param {string} options.namespace - Target namespace
   * @param {string} options.path - File path
   * @returns {Promise<Object>} Result
   */
  async deleteFile({ namespace, path }) {
    return this.$APP.SW.request("FS:DELETE_FILE", { namespace, path });
  }

  /**
   * Create a folder (creates a placeholder file)
   * @param {Object} options - Options
   * @param {string} options.namespace - Target namespace
   * @param {string} options.path - Folder path
   * @returns {Promise<Object>} Result
   */
  async createFolder({ namespace, path }) {
    const dirPath = path.endsWith("/") ? path : `${path}/`;
    const placeholderPath = `${dirPath}.dir-placeholder`;
    return this.writeFile({ namespace, path: placeholderPath, content: "" });
  }

  /**
   * Delete a directory and all its contents
   * @param {Object} options - Options
   * @param {string} options.namespace - Target namespace
   * @param {string} options.path - Directory path
   * @returns {Promise<Object>} Result
   */
  async deleteDirectory({ namespace, path }) {
    return this.$APP.SW.request("FS:DELETE_DIRECTORY", { namespace, path });
  }

  /**
   * List files in a directory
   * @param {Object} options - Options
   * @param {string} options.namespace - Target namespace
   * @param {string} options.path - Directory path (default: "/")
   * @param {boolean} options.recursive - Whether to list recursively
   * @returns {Promise<Array>} List of files
   */
  async listDirectory({ namespace, path = "/", recursive = true }) {
    const { files } = await this.$APP.SW.request("FS:LIST_FILES", {
      namespace,
      path,
      recursive,
    });
    return files;
  }

  /**
   * Delete an entire namespace
   * @param {Object} options - Options
   * @param {string} options.namespace - Namespace to delete
   * @returns {Promise<Object>} Result
   */
  async deleteNamespace({ namespace }) {
    return this.$APP.SW.request("FS:DELETE_NAMESPACE", { namespace });
  }
}

/**
 * Create an SWAdapter instance
 * @param {Object} app - $APP instance
 * @returns {SWAdapter} Adapter instance
 */
export function createSWAdapter(app) {
  return new SWAdapter(app);
}

export default SWAdapter;
