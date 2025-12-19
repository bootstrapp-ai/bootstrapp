/**
 * Generated from @bootstrapp/theme
 * @generated
 */

  declare const _default: Record<string, any>;
  export default _default;

  export interface HSL {
    h?: number;
    s?: number;
    l?: number;
  }

  export interface ShadeConfig {
    lightness?: number;
    mix?: string;
    amount?: number;
  }

  export const parseColor: (colorString: string) => Record<string, any>;

  export const generateShades: (baseHSL: Record<string, any>, config: Record<string, any>) => Record<string, any>;

  export const generateThemeVariables: (themeObj: Record<string, any>, prefix: string) => Record<string, any>;

  export const injectThemeCSS: (variables: Record<string, any>) => any;

  export const registerTheme: (name: string, loader: () => void) => any;

  export const loadTheme: (themeInput: string) => any;

  export const applyTheme: (themeData: Record<string, any>) => any;

  export const availableThemes: Record<string, any>;

  export const loadCSS: (href: string, prepend: boolean) => any;

  export const loadFont: (fontFamily: string) => any;

  export const getComponentCSS: (tag: string) => string;

  export const rgbToHSL: (r: number, g: number, b: number) => Record<string, any>;

  export const hslToCSS: (hsl: Record<string, any>) => string;

  export const adjustLightness: (hsl: Record<string, any>, delta: number) => Record<string, any>;

  export const mixWithColor: (hsl: Record<string, any>, mixWith: string, amount: number) => Record<string, any>;
