/**
 * Generated from @bootstrapp/sw
 * @generated
 */

  export interface SWAdapter {
    namespaceExists(options: Record<string, any>): boolean;
    createFiles(options: Record<string, any>): Record<string, any>;
    createFile(options: Record<string, any>): Record<string, any>;
    saveFile(options: Record<string, any>): Record<string, any>;
    writeFile(options: Record<string, any>): Record<string, any>;
    readFile(options: Record<string, any>): string;
    deleteFile(options: Record<string, any>): Record<string, any>;
    createFolder(options: Record<string, any>): Record<string, any>;
    deleteDirectory(options: Record<string, any>): Record<string, any>;
    listDirectory(options: Record<string, any>): any[];
    deleteNamespace(options: Record<string, any>): Record<string, any>;
  }

  export const initSWBackend: (app: Record<string, any>, config: Record<string, any>) => any;

  export const initSWFrontend: (app: Record<string, any>) => Record<string, any>;

  export const createFSHandlers: (options: Record<string, any>) => Record<string, any>;

  export const setRegistration: (registration: Record<string, any>) => any;

  export const enableAutoUpdates: (config: Record<string, any>) => any;

  export const disableAutoUpdates: () => any;

  export const checkForUpdates: () => boolean;

  export const applyUpdate: (timeout: number) => boolean;

  export const hasUpdate: () => boolean;

  export interface SW {
    postMessage(type: string, payload: any): any;
    request(type: string, payload: any, timeout: number): any;
    setRegistration(registration: Record<string, any>): any;
    enableAutoUpdates(config: Record<string, any>): any;
    disableAutoUpdates(): any;
    checkForUpdates(): boolean;
    applyUpdate(timeout: number): boolean;
    hasUpdate(): boolean;
    getRegistration(): Record<string, any>;
    enableLocalCaching(): Record<string, any>;
    disableLocalCaching(): Record<string, any>;
    clearLocalCache(): Record<string, any>;
  }
