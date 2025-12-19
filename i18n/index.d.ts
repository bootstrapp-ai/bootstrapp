/**
 * Generated from @bootstrapp/i18n
 * @generated
 */

  declare const _default: Record<string, any>;
  export default _default;

  export interface NumberFormatOptions {
    style?: string;
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }

  export interface DateFormatOptions {
    dateStyle?: string;
    timeStyle?: string;
  }

  export const t: (key: string, params: Record<string, any>) => string;

  export const n: (number: number, options: Record<string, any>) => string;

  export const d: (date: any, options: Record<string, any>) => string;

  export const r: (date: any) => string;

  export const setLanguage: (locale: string) => string;

  export const getLanguage: () => string;

  export const getAvailableLocales: () => any[];

  export const registerLocale: (locale: string, loader: () => void) => any;

  export const addTranslations: (locale: string, translations: Record<string, any>) => any;

  export interface I18n {
    translations?: Record<string, any>;
    currentLocale?: string;
    fallbackLocale?: string;
    loadedLocales?: Record<string, any>;
    localeLoaders?: Record<string, any>;
    registerLocale(locale: string, loader: () => void): any;
    addTranslations(locale: string, translations: Record<string, any>): any;
    loadLocale(locale: string): any;
    setLanguage(locale: string): string;
    getLanguage(): string;
    getAvailableLocales(): any[];
    t(key: string, params: Record<string, any>): string;
    formatNumber(number: number, options: Record<string, any>): string;
    formatDate(date: any, options: Record<string, any>): string;
    formatRelativeDate(date: any): string;
  }
