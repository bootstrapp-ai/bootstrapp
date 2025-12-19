/**
 * Generated from @bootstrapp/router
 * @generated
 */

  export interface _DefaultExport {
    stack?: any[];
    routes?: any[];
    namedRoutes?: Record<string, any>;
    currentRoute?: Record<string, any>;
    defaultTitle?: string;
    options?: Record<string, any>;
    init(routesConfig: Record<string, any>, options: Record<string, any>): any;
    go(routeNameOrPath: string, params: Record<string, any>): any;
    navigate(routeName: string, params: Record<string, any>): any;
    replace(routeNameOrPath: string, params: Record<string, any>): any;
    create(routeName: string, params: Record<string, any>): string;
    setCurrentRoute(path: string, pushState: boolean): any;
    back(): any;
    forward(): any;
    home(): any;
    flattenRoutes(routes: Record<string, any>, basePath: string, parentRoute: Record<string, any>): Record<string, any>;
    normalizePath(path: string): string;
    isRoot(): boolean;
    truncateStack(index: number): any;
    handleLinkClick(event: any, options: Record<string, any>): boolean;
  }
  declare const _default: _DefaultExport;
  export default _default;

  export interface Route {
    path?: string;
    name?: string;
    title?: string;
    component?: any;
    template?: string;
    routes?: Record<string, any>;
    parent?: Record<string, any>;
    namedParams?: any[];
    ssg?: boolean;
    action(): void;
    redirect?: string;
  }

  export interface CurrentRoute {
    route?: Record<string, any>;
    params?: Record<string, any>;
    queryParams?: Record<string, any>;
    name?: string;
    component?: any;
    template?: string;
    path?: string;
    querystring?: string;
    hash?: string;
    root?: boolean;
    matched?: Record<string, any>;
  }

  export interface RouterOptions {
    appName?: string;
    isProduction?: boolean;
    onRouteChange(): void;
    onTitleChange(): void;
  }
