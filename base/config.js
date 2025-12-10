/**
 * Bootstrapp Framework Configuration
 *
 * Central configuration for framework constants and settings
 * @module config
 */

/**
 * Service Worker configuration
 */
export const serviceWorker = {
  /** Timeout in milliseconds for Service Worker initialization */
  initTimeout: 200,
  /** Maximum number of retries for Service Worker registration */
  maxRetries: 5,
};

/**
 * Cache configuration for Service Worker file caching
 */
export const cache = {
  /** Cache name for local files */
  localFiles: "local-files-v1",
  /** Cache name for staging files */
  stagingFiles: "staging-files-v1",
};

/**
 * Backend communication configuration
 */
export const backend = {
  /** Default timeout in milliseconds for client requests to backend */
  requestTimeout: 5000,
};

/**
 * Test configuration
 */
export const test = {
  /** Default test server host */
  host: "test.localhost",
  /** Default test server port */
  port: 1313,
  /** Get full test URL */
  getUrl(path = '/test.html') {
    return `http://${this.host}:${this.port}${path}`;
  }
};

/**
 * Development server configuration
 */
export const devServer = {
  /**
   * Calculate WebSocket port for dev server hot reload
   * @param {number} currentPort - Current application port
   * @returns {number} WebSocket port
   */
  getWsPort(currentPort) {
    return Number.parseInt(currentPort, 10) + 1;
  }
};

/**
 * Default configuration object
 */
export default {
  serviceWorker,
  cache,
  backend,
  test,
  devServer,
};
