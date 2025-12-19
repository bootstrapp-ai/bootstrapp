/**
 * @bootstrapp/auth - Type Schema
 * Defines the Auth API for TypeScript declaration generation
 */
import T from "../types/index.js";

export default {
  name: "@bootstrapp/auth",
  exports: {
    // Default export: module object
    default: T.object({
      description: "Auth module exports",
    }),

    // AuthSession class - localStorage session management
    AuthSession: {
      $interface: true,
      $static: true,
      STORAGE_KEY: T.string({ description: "LocalStorage key for auth session" }),
      TOKEN_KEY: T.string({ description: "LocalStorage key for auth token" }),

      get: T.function({
        description: "Get stored auth session",
        args: [],
        returns: T.object({ description: "{ token, user, timestamp } or null" }),
      }),

      set: T.function({
        description: "Store auth session",
        args: [
          T.string({ name: "token", description: "Auth token" }),
          T.object({ name: "user", description: "User object" }),
          T.object({ name: "$APP", description: "App instance for cross-tab sync" }),
        ],
        returns: T.any(),
      }),

      clear: T.function({
        description: "Clear stored auth session",
        args: [T.object({ name: "$APP", description: "App instance for cross-tab sync" })],
        returns: T.any(),
      }),

      getToken: T.function({
        description: "Get stored token",
        args: [],
        returns: T.string({ description: "Token or null" }),
      }),

      isValid: T.function({
        description: "Check if stored token is valid (not expired)",
        args: [],
        returns: T.boolean(),
      }),

      getExpiration: T.function({
        description: "Get token expiration time in ms",
        args: [],
        returns: T.number({ description: "Expiration timestamp or null" }),
      }),
    },

    // createAuth factory function
    createAuth: T.function({
      description: "Create Auth module instance",
      args: [T.object({ name: "$APP", description: "App instance with Backend, SW, events" })],
      returns: T.object({ description: "Auth module instance" }),
    }),

    // initAuthFrontend function
    initAuthFrontend: T.function({
      description: "Initialize Auth module on frontend",
      args: [T.object({ name: "$APP", description: "App instance" })],
      returns: T.object({ description: "Auth module" }),
    }),

    // createAuthEventHandlers function
    createAuthEventHandlers: T.function({
      description: "Create auth event handlers for worker context",
      args: [T.object({ name: "$APP", description: "App instance with Database" })],
      returns: T.object({ description: "Event handlers object" }),
    }),

    // initAuthBackend function
    initAuthBackend: T.function({
      description: "Initialize Auth backend in worker context",
      args: [T.object({ name: "$APP", description: "App instance" })],
      returns: T.any(),
    }),

    // initAuth function
    initAuth: T.function({
      description: "Initialize auth module based on runtime environment",
      args: [T.object({ name: "$APP", description: "App instance with settings.runtime" })],
      returns: T.any({ description: "Auth module on frontend, void on backend" }),
    }),

    // Auth module interface (returned by createAuth)
    Auth: {
      $interface: true,
      user: T.object({ description: "Current authenticated user or null" }),
      token: T.string({ description: "Current auth token or null" }),
      isAuthenticated: T.boolean({ description: "Whether user is authenticated (getter)" }),
      isGuest: T.boolean({ description: "Whether user is a guest (getter)" }),
      currentUserId: T.string({ description: "User ID or guest ID (getter)" }),

      getGuestId: T.function({
        description: "Get or create a persistent guest ID",
        args: [],
        returns: T.string({ description: "Guest ID in format guest_{timestamp}_{random}" }),
      }),

      clearGuestId: T.function({
        description: "Clear the stored guest ID",
        args: [],
        returns: T.any(),
      }),

      isGuestId: T.function({
        description: "Check if a given user ID is a guest ID",
        args: [T.string({ name: "userId" })],
        returns: T.boolean(),
      }),

      login: T.function({
        description: "Login with email and password",
        args: [T.string({ name: "email" }), T.string({ name: "password" })],
        returns: T.object({ description: "{ success, user?, error? }" }),
      }),

      register: T.function({
        description: "Register a new user",
        args: [T.object({ name: "data", description: "{ email, password, name, ...extraData }" })],
        returns: T.object({ description: "{ success, user?, error? }" }),
      }),

      loginWithOAuth: T.function({
        description: "Start OAuth login flow",
        args: [T.string({ name: "provider", description: "'google' or 'apple'" })],
        returns: T.object({ description: "{ success, error?, redirecting? }" }),
      }),

      completeOAuth: T.function({
        description: "Complete OAuth login after redirect",
        args: [
          T.string({ name: "code", description: "Authorization code" }),
          T.string({ name: "state", description: "State parameter" }),
        ],
        returns: T.object({ description: "{ success, user?, error? }" }),
      }),

      logout: T.function({
        description: "Logout current user",
        args: [],
        returns: T.any(),
      }),

      refreshToken: T.function({
        description: "Refresh the auth token",
        args: [],
        returns: T.boolean(),
      }),

      restore: T.function({
        description: "Restore auth session from localStorage",
        args: [],
        returns: T.boolean(),
      }),

      updateUser: T.function({
        description: "Update current user profile",
        args: [T.object({ name: "data", description: "Fields to update" })],
        returns: T.object({ description: "{ success, user?, error? }" }),
      }),

      convertGuest: T.function({
        description: "Convert guest to registered user",
        args: [
          T.object({ name: "guestData", description: "Guest's current data/preferences" }),
          T.object({ name: "registrationData", description: "Registration data" }),
        ],
        returns: T.object({ description: "{ success, user?, error? }" }),
      }),
    },

    // AuthResult interface
    AuthResult: {
      $interface: true,
      success: T.boolean({ description: "Whether operation succeeded" }),
      user: T.object({ description: "User object if successful" }),
      error: T.string({ description: "Error message if failed" }),
    },
  },
};
