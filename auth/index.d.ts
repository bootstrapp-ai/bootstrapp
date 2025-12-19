/**
 * Generated from @bootstrapp/auth
 * @generated
 */

  declare const _default: Record<string, any>;
  export default _default;

  export interface AuthSession {
    STORAGE_KEY?: string;
    TOKEN_KEY?: string;
    get(): Record<string, any>;
    set(token: string, user: Record<string, any>, $APP: Record<string, any>): any;
    clear($APP: Record<string, any>): any;
    getToken(): string;
    isValid(): boolean;
    getExpiration(): number;
  }

  export const createAuth: ($APP: Record<string, any>) => Record<string, any>;

  export const initAuthFrontend: ($APP: Record<string, any>) => Record<string, any>;

  export const createAuthEventHandlers: ($APP: Record<string, any>) => Record<string, any>;

  export const initAuthBackend: ($APP: Record<string, any>) => any;

  export const initAuth: ($APP: Record<string, any>) => any;

  export interface Auth {
    user?: Record<string, any>;
    token?: string;
    isAuthenticated?: boolean;
    isGuest?: boolean;
    currentUserId?: string;
    getGuestId(): string;
    clearGuestId(): any;
    isGuestId(userId: string): boolean;
    login(email: string, password: string): Record<string, any>;
    register(data: Record<string, any>): Record<string, any>;
    loginWithOAuth(provider: string): Record<string, any>;
    completeOAuth(code: string, state: string): Record<string, any>;
    logout(): any;
    refreshToken(): boolean;
    restore(): boolean;
    updateUser(data: Record<string, any>): Record<string, any>;
    convertGuest(guestData: Record<string, any>, registrationData: Record<string, any>): Record<string, any>;
  }

  export interface AuthResult {
    success?: boolean;
    user?: Record<string, any>;
    error?: string;
  }
