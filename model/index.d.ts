/**
 * Generated from @bootstrapp/model test file
 * @generated
 */

declare module "@bootstrapp/model" {
  export interface _DefaultExport {
    createModel($APP: Record<string, any>): Record<string, any>;
    ModelType?: any;
  }
  declare const _default: _DefaultExport;
  export default _default;

  export const createModel: ($APP: Record<string, any>) => Record<string, any>;

  export class ModelType {
  }

  export interface ModelApi {
    name?: string;
    get(arg0: any, opts: Record<string, any>): any;
    getAll(opts: { where?: Record<string, any>; limit?: number; offset?: number; order?: string; includes?: string }): any[];
    add(row: Record<string, any>, opts: Record<string, any>): any;
    addMany(rows: any[], opts: Record<string, any>): any[];
    edit(row: Record<string, any>): any;
    remove(id: string): any;
    upsert(row: Record<string, any>, opts: Record<string, any>): any;
    subscribe(callback: () => void): () => void;
  }

  export interface ReactiveArray {
    total?: number;
    limit?: number;
    offset?: number;
    count?: number;
    subscribe(callback: () => void): any;
    unsubscribe(callback: () => void): any;
  }

  export interface RowInstance {
    id: string;
    _modelName?: string;
    remove(): any;
    update(): any;
    include(relationName: string): any;
    subscribe(callback: () => void): any;
    unsubscribe(callback: () => void): any;
  }

}
