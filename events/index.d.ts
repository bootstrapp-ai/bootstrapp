/**
 * Generated from @bootstrapp/events
 * @generated
 */

  declare const _default: (target: Record<string, any>, options: Record<string, any>) => Record<string, any>;
  export default _default;

  export interface EventHandler {
    listeners?: Record<string, any>;
    hasListeners(key: string): boolean;
    on(key: string, callback: () => void): any;
    off(key: string, callback: () => void): any;
    emit(key: string, data: any): any[];
    set(events: Record<string, any>): any;
    get(key: string): any[];
  }

  export interface EventOptions {
    getter?: boolean;
  }
