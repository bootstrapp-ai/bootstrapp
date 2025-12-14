/**
 * Bundler Target Registry
 * Manages deployment targets (GitHub, Cloudflare, ZIP, etc.)
 */

const targets = new Map();

/**
 * Register a deployment target
 * @param {string} name - Unique target identifier
 * @param {Object} config - Target configuration
 * @param {string} config.name - Target name
 * @param {string} config.label - Display label
 * @param {string} config.icon - Icon name
 * @param {Array} config.credentials - Credential fields needed
 * @param {Function} config.deploy - Deploy function (files, options) => result
 */
export const registerTarget = (name, config) => {
  targets.set(name, { name, ...config });
};

/**
 * Get a target by name
 */
export const getTarget = (name) => targets.get(name);

/**
 * Get all registered targets
 */
export const getTargets = () => [...targets.values()];

/**
 * Get all target names
 */
export const getTargetNames = () => [...targets.keys()];

/**
 * Deploy files to a target
 * @param {string} targetName - Target to deploy to
 * @param {Array} files - Files to deploy [{path, content, mimeType}]
 * @param {Object} options - Deployment options (credentials, version, etc.)
 */
export const deployToTarget = async (targetName, files, options) => {
  const target = targets.get(targetName);
  if (!target) {
    throw new Error(`Unknown deployment target: ${targetName}`);
  }
  return target.deploy(files, options);
};
