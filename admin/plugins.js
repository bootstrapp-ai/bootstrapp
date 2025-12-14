/**
 * @bootstrapp/admin - Plugin System
 * Simple function-based plugin registry for admin extensibility
 */

// Plugin registry using closures
const plugins = new Map();

/**
 * Register an admin plugin
 * @param {string} name - Unique plugin name
 * @param {Object} config - Plugin configuration
 * @param {Object} config.actions - Model-specific actions { modelName: [{ label, icon, handler }] }
 * @param {Object} config.modals - Custom modals { name: { component } }
 * @param {Object} config.fieldTypes - Custom field type renderers
 */
export const registerPlugin = (name, config) => {
  plugins.set(name, { name, ...config });
};

/**
 * Get all registered plugins
 * @returns {Array} Array of plugin configs
 */
export const getPlugins = () => [...plugins.values()];

/**
 * Get custom actions for a specific model
 * @param {string} model - Model name
 * @returns {Array} Array of action configs
 */
export const getModelActions = (model) =>
  getPlugins()
    .filter((p) => p.actions?.[model])
    .flatMap((p) => p.actions[model]);

/**
 * Get all custom modals from plugins
 * @returns {Object} Merged modals object
 */
export const getPluginModals = () =>
  getPlugins().reduce((acc, p) => ({ ...acc, ...p.modals }), {});

/**
 * Get all custom field types from plugins
 * @returns {Object} Merged field types object
 */
export const getFieldTypes = () =>
  getPlugins().reduce((acc, p) => ({ ...acc, ...p.fieldTypes }), {});

/**
 * Get all sidebar items from plugins
 * @returns {Array} Array of sidebar item configs
 */
export const getSidebarItems = () =>
  getPlugins()
    .filter((p) => p.sidebar)
    .flatMap((p) => p.sidebar);

/**
 * Get all routes from plugins
 * @returns {Object} Merged routes object
 */
export const getPluginRoutes = () =>
  getPlugins().reduce((acc, p) => ({ ...acc, ...p.routes }), {});
