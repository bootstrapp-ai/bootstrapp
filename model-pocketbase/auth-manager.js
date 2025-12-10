/**
 * @file PocketBase Authentication Manager
 * @description Handles authentication for PocketBase
 */

export class AuthManager {
  constructor(pb, config = {}) {
    this.pb = pb;
    this.email = config.email;
    this.password = config.password;
    this.authToken = config.authToken;
    this.autoAuth = config.autoAuth || false;

    // Admin credentials for collection management
    this.adminEmail = config.adminEmail;
    this.adminPassword = config.adminPassword;
  }

  /**
   * Authenticate with PocketBase
   * @returns {Promise<Object>} Auth data
   */
  async authenticate() {
    try {
      // Try admin authentication first (required for collection management)
      if (this.adminEmail && this.adminPassword) {
        try {
          const adminAuth = await this.pb.admins.authWithPassword(
            this.adminEmail,
            this.adminPassword,
          );
          console.log("PocketBase: Authenticated as admin");
          return adminAuth;
        } catch (error) {
          console.warn(
            "PocketBase: Admin auth failed, trying user auth...",
            error,
          );
        }
      }

      // Use token if provided
      if (this.authToken) {
        this.pb.authStore.save(this.authToken);
        console.log("PocketBase: Authenticated with token");
        return { token: this.authToken };
      }

      // Use email/password if provided
      if (this.email && this.password) {
        const authData = await this.pb
          .collection("users")
          .authWithPassword(this.email, this.password);
        console.log("PocketBase: Authenticated with email/password");
        return authData;
      }

      console.warn("PocketBase: No authentication credentials provided");
      return null;
    } catch (error) {
      console.error("PocketBase: Authentication failed", error);
      throw error;
    }
  }

  /**
   * Check if currently authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.pb.authStore.isValid;
  }

  /**
   * Get current auth token
   * @returns {string|null}
   */
  getToken() {
    return this.pb.authStore.token;
  }

  /**
   * Get current user
   * @returns {Object|null}
   */
  getUser() {
    return this.pb.authStore.model;
  }

  /**
   * Logout
   */
  logout() {
    this.pb.authStore.clear();
    console.log('PocketBase: Logged out');
  }
}

export default AuthManager;
