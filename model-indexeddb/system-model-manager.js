/**
 * @file System Model Manager
 * @description Manages system models (App, User, Device) for local-first applications
 */

export class SystemModelManager {
  /**
   * @param {Object} db - Database adapter instance
   * @param {Object} [options={}] - Configuration options
   * @param {Function} [options.eventEmitter] - Function to emit events
   * @param {Function} [options.getBackendUser] - Function to get backend user
   * @param {Function} [options.importData] - Function to import data
   */
  constructor(db, options = {}) {
    this.db = db;
    this.MODELS = { APP: "App", USER: "User", DEVICE: "Device" };

    // Injectable dependencies
    this.eventEmitter = options.eventEmitter || (() => {});
    this.getBackendUser = options.getBackendUser || (() => null);
    this.setBackendUser = options.setBackendUser || (() => {});
    this.importData = options.importData || (() => {});
  }

  /**
   * Generate RSA-OAEP key pair for encryption
   * @returns {Promise<{publicKey: string, privateKey: string}>}
   * @private
   */
  async generateKeyPair() {
    const keyPair = await self.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"],
    );

    const publicKey = await self.crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey,
    );
    const privateKey = await self.crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey,
    );

    return {
      publicKey: btoa(String.fromCharCode(...new Uint8Array(publicKey))),
      privateKey: btoa(String.fromCharCode(...new Uint8Array(privateKey))),
    };
  }

  /**
   * Get current active app
   * @returns {Promise<Object|null>}
   */
  async getApp() {
    const results = await this.db.getAll(this.MODELS.APP, {
      where: { active: true },
      limit: 1,
    });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get current active user for an app
   * @param {Object} _app - App object
   * @returns {Promise<Object|null>}
   */
  async getUser(_app) {
    const backendUser = this.getBackendUser();
    if (backendUser) return backendUser;

    const app = _app || (await this.getApp());
    const currentBackendUser = this.getBackendUser();

    if (currentBackendUser && currentBackendUser.appId !== app.id) {
      this.setBackendUser(null);
    }

    if (!this.getBackendUser()) {
      let puser = await this.db.get(this.MODELS.USER, {
        appId: app.id,
        active: true,
      });
      if (!puser) {
        puser = await this.createUserEntry({ app });
      }
      const { privateKey, active, ...user } = puser;
      this.setBackendUser(user);
    }
    return this.getBackendUser();
  }

  /**
   * Get device for user
   * @param {Object} options
   * @param {Object} options.app - App object
   * @param {Object} options.user - User object
   * @returns {Promise<Object|null>}
   */
  async getDevice({ app: _app, user: _user } = {}) {
    const app = _app || (await this.getApp());
    const user = _user || (await this.getUser(app));
    if (!user) throw new Error("User not found");
    const device = await this.db.get(this.MODELS.DEVICE, {
      userId: user.id,
      active: true,
    });
    return device || null;
  }

  /**
   * Create new app entry
   * @param {Object} options
   * @param {number} options.timestamp - Creation timestamp
   * @param {string} options.id - App ID
   * @param {number} options.version - App version
   * @returns {Promise<Object>}
   */
  async createAppEntry({
    timestamp = Date.now(),
    id = timestamp.toString(),
    version = 1,
  } = {}) {
    const app = {
      id,
      version,
      active: true,
    };

    await this.db.add(this.MODELS.APP, app);
    await this.eventEmitter("APP:CREATED", { app });
    return app;
  }

  /**
   * Create user entry for app
   * @param {Object} options
   * @param {Object} options.app - App object
   * @param {Object} options.device - Device data
   * @param {Object} options.user - User data
   * @returns {Promise<Object>}
   */
  async createUserEntry({ app: _app, device, user } = {}) {
    const app = _app || (await this.getApp());
    if (!user) {
      const existingUsers = await this.db.getAll(this.MODELS.USER, {
        where: {
          active: true,
          appId: app.id,
        },
        limit: 1,
      });
      const existingUser = existingUsers.length > 0 ? existingUsers[0] : null;

      if (existingUser) {
        existingUser.privateKey = null;
        const existingDevices = await this.db.getAll(this.MODELS.DEVICE, {
          where: {
            userId: existingUser.id,
            active: true,
          },
          limit: 1,
        });
        const existingDevice =
          existingDevices.length > 0 ? existingDevices[0] : null;
        if (!existingDevice) await this.db.add(this.MODELS.DEVICE, device);
        return existingUser;
      }
    }

    const { publicKey, privateKey } = await this.generateKeyPair();
    const newUser = user || {
      id: user?.id,
      name: user?.name || "Local User",
      publicKey,
      privateKey,
      appId: app.id,
      active: true,
    };
    await this.db.add(this.MODELS.USER, newUser);

    const newDevice = device || {
      userId: newUser.id,
      appId: app.id,
      active: true,
    };
    await this.db.add(this.MODELS.DEVICE, newDevice);
    newUser.privateKey = null;
    return newUser;
  }

  /**
   * List all apps
   * @returns {Promise<Array>}
   */
  async listApps() {
    return await this.db.getAll(this.MODELS.APP);
  }

  /**
   * Select app by ID
   * @param {string} appId - App ID to select
   * @returns {Promise<Object>}
   */
  async selectApp(appId) {
    const currentApp = await this.getApp();
    if (currentApp && currentApp.id !== appId) {
      await this.db.edit(this.MODELS.APP, currentApp.id, {
        active: false,
      });
    }

    await this.db.edit(this.MODELS.APP, appId, {
      active: true,
    });

    return await this.db.get(this.MODELS.APP, appId);
  }

  /**
   * Migrate data to database
   * @param {Object} data - Data to migrate
   * @param {Object} opts - Migration options
   * @param {boolean} opts.skipDynamicCheck - Skip dynamic model check
   */
  async migrateData(data) {
    const app = await this.getApp();
    const appsData = Object.entries(data || {});
    if (appsData.length) {
      const dump = {};
      for (const [modelName, entries] of appsData) {
        dump[modelName] = entries;
      }
      console.error({ dump, app });
      this.importData({ dump, app });

      await this.db.edit(this.MODELS.APP, app.id, {
        migrationTimestamp: Date.now(),
      });
    }
  }
}

export default SystemModelManager;
