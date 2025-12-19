/**
 * Generated from @bootstrapp/controller
 * @generated
 */

  export interface _DefaultExport {
    add(nameOrAdapters: string, adapter: Record<string, any>): any;
    createAdapter(store: Record<string, any>, name: string): any;
    createSync(target: any, adapterName: string, keys: any[]): Record<string, any>;
    registerSyncType(check: () => void, handler: () => void): any;
    getSyncInfo(sync: string): Record<string, any>;
    initUrlSync(): any;
    installViewPlugin(View: any, options: Record<string, any>): any;
  }
  declare const _default: _DefaultExport;
  export default _default;

  export const createController: (initialAdapters: Record<string, any>) => Record<string, any>;

  export const createSync: (target: any, adapterName: string, keys: any[]) => Record<string, any>;

  export const registerSyncType: (check: () => void, handler: () => void) => any;

  export const getSyncInfo: (sync: string) => Record<string, any>;

  export const bindAdapterSync: (options: Record<string, any>) => any;

  export const bindCustomSync: (options: Record<string, any>) => any;

  export const cleanupSyncBindings: (instance: any, Controller: any) => any;

  export const syncUrl: (adapter: any) => any;

  export const updateState: (instance: any, key: string, value: any) => any;

  export const getScopedKey: (instance: any, key: string, prop: Record<string, any>) => string;

  export const needsAsyncLoad: (syncObj: Record<string, any>) => boolean;

  export const checkDependsOn: (instance: any, component: any, changedProps: any) => any;

  export interface Adapter {
    get(key: string): any;
    set(key: string, value: any): any;
    remove(key: string): Record<string, any>;
    has(key: string): boolean;
    keys(): any[];
    entries(): any[];
    on(key: string, callback: () => void): any;
    off(key: string, callback: () => void): any;
    emit(key: string, value: any): any;
    broadcast(data: any): any;
  }
