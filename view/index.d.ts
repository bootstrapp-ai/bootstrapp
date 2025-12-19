/**
 * Generated from @bootstrapp/view test file
 * @generated
 */

declare module "@bootstrapp/view" {
  export class _Default {
    properties?: Record<string, any>;
    components?: Record<string, any>;
    plugins?: any[];
    tag?: string;
    createClass(tag: string, definition: Record<string, any>, BaseClass: any): any;
    define(tag: string, definition: Record<string, any>): any;
    state?: Record<string, any>;
    hasUpdated?: boolean;
    on(eventName: string, listener: () => void): () => void;
    off(eventName: string, listener: () => void): any;
    emit(eventName: string, data: any): any;
    requestUpdate(key: string, oldValue: any): any;
    render(): any;
    connectedCallback(): any;
    disconnectedCallback(): any;
  }
  export default _Default;

  export const settings: Record<string, any>;

}
