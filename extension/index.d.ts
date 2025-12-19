/**
 * Generated from @bootstrapp/extension
 * @generated
 */

  export const createExtensionBridge: (extensionId: string) => Record<string, any>;

  export const getExtensionBridge: () => Record<string, any>;

  export const connectExtension: (extensionId: string) => Record<string, any>;

  export const disconnectExtension: () => any;

  export const isConnected: () => boolean;

  export const getExtensionId: () => string;

  export const onConnectionChange: (callback: () => void) => () => void;

  export interface ExtensionBridge {
    isAvailable(): boolean;
    isConnected(): boolean;
    connect(): boolean;
    disconnect(): any;
    getTabs(): any[];
    scrape(tabId: number, selector: any, options: Record<string, any>): Record<string, any>;
    scrapeInstagram(tabId: number): Record<string, any>;
    fetchInstagramProfile(tabId: number, username: string): Record<string, any>;
    updateDocId(tabId: number, type: string, docId: string): Record<string, any>;
    startIntercept(tabId: number): Record<string, any>;
    stopIntercept(tabId: number): Record<string, any>;
    onInterceptedData(callback: () => void): () => void;
    inject(tabId: number, html: string, target: string, options: Record<string, any>): Record<string, any>;
    execute(tabId: number, script: string, args: any[]): any;
    observe(tabId: number, selector: string, callback: () => void, events: any[]): string;
    stopObserving(observerId: string): any;
    ping(): boolean;
    onDisconnect(callback: () => void): () => void;
  }
