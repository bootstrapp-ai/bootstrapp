/**
 * Breakpoint System for UIX Components
 *
 * Mobile-first responsive breakpoints following common conventions:
 * - xs: 0px (mobile phones, portrait)
 * - sm: 576px (mobile phones, landscape)
 * - md: 768px (tablets, portrait)
 * - lg: 992px (tablets, landscape / small desktops)
 * - xl: 1200px (desktops)
 * - xxl: 1400px (large desktops)
 */

export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

/**
 * Generate media query string for a breakpoint
 * @param {string} breakpoint - Breakpoint name (sm, md, lg, xl, xxl)
 * @returns {string} Media query string
 */
export const mediaQuery = (breakpoint) => {
  const minWidth = BREAKPOINTS[breakpoint];
  if (minWidth === undefined) {
    console.warn(`Unknown breakpoint: ${breakpoint}`);
    return "";
  }
  return minWidth === 0 ? "" : `(min-width: ${minWidth}px)`;
};

/**
 * Create a MediaQueryList object for a breakpoint
 * @param {string} breakpoint - Breakpoint name
 * @returns {MediaQueryList|null}
 */
export const createMediaQueryList = (breakpoint) => {
  const query = mediaQuery(breakpoint);
  if (!query) return null;
  return window.matchMedia(query);
};

/**
 * Get the current active breakpoint
 * @returns {string} Current breakpoint name (xs, sm, md, lg, xl, xxl)
 */
export const getCurrentBreakpoint = () => {
  const width = window.innerWidth;

  if (width >= BREAKPOINTS.xxl) return "xxl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
};

/**
 * Check if current viewport matches a breakpoint or above
 * @param {string} breakpoint - Breakpoint name
 * @returns {boolean}
 */
export const matchesBreakpoint = (breakpoint) => {
  const minWidth = BREAKPOINTS[breakpoint];
  if (minWidth === undefined) return false;
  return window.innerWidth >= minWidth;
};

/**
 * Reactive breakpoint hook for web components
 *
 * Usage in a component:
 * ```javascript
 * import { useBreakpoint } from './utils/breakpoints.js';
 *
 * class MyComponent extends HTMLElement {
 *   constructor() {
 *     super();
 *     this.breakpoint = useBreakpoint((bp) => {
 *       this.breakpoint = bp;
 *       this.requestUpdate?.(); // For lit-based components
 *     });
 *   }
 * }
 * ```
 *
 * @param {Function} callback - Called when breakpoint changes, receives breakpoint name
 * @returns {Object} Object with current breakpoint and cleanup function
 */
export const useBreakpoint = (callback) => {
  let currentBreakpoint = getCurrentBreakpoint();

  const handleResize = () => {
    const newBreakpoint = getCurrentBreakpoint();
    if (newBreakpoint !== currentBreakpoint) {
      currentBreakpoint = newBreakpoint;
      callback?.(currentBreakpoint);
    }
  };

  // Debounced resize handler
  let resizeTimeout;
  const debouncedResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
  };

  window.addEventListener("resize", debouncedResize);

  return {
    current: currentBreakpoint,
    cleanup: () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimeout);
    },
  };
};

/**
 * Parse responsive prop value based on current breakpoint
 *
 * Example usage:
 * ```javascript
 * // Component has props: cols="1" cols-md="2" cols-lg="3"
 * const columns = getResponsiveValue(this, 'cols', ['xs', 'sm', 'md', 'lg', 'xl']);
 * // Returns: "3" on large screens, "2" on medium, "1" on small
 * ```
 *
 * @param {Object} element - Element with responsive props
 * @param {string} baseProp - Base property name (e.g., 'cols')
 * @param {Array<string>} breakpoints - Array of breakpoint names to check
 * @returns {*} Resolved property value
 */
export const getResponsiveValue = (element, baseProp, breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']) => {
  const currentBp = getCurrentBreakpoint();
  const currentIndex = breakpoints.indexOf(currentBp);

  // Check from current breakpoint down to xs
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpoints[i];
    const propName = bp === 'xs' ? baseProp : `${baseProp}-${bp}`;

    // Check attribute first
    if (element.hasAttribute(propName)) {
      return element.getAttribute(propName);
    }

    // Check property
    if (element[propName] !== undefined && element[propName] !== null) {
      return element[propName];
    }
  }

  return null;
};

/**
 * Generate CSS custom properties for responsive values
 *
 * @param {Object} element - Element with responsive props
 * @param {string} baseProp - Base property name
 * @param {string} cssVar - CSS variable name
 * @returns {string} CSS string with media queries
 */
export const generateResponsiveCSS = (element, baseProp, cssVar) => {
  const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  let css = '';

  breakpointOrder.forEach((bp) => {
    const propName = bp === 'xs' ? baseProp : `${baseProp}-${bp}`;
    const value = element.getAttribute(propName) || element[propName];

    if (value) {
      if (bp === 'xs') {
        css += `${cssVar}: ${value}; `;
      } else {
        const query = mediaQuery(bp);
        css += `@media ${query} { ${cssVar}: ${value}; } `;
      }
    }
  });

  return css;
};

/**
 * Copyright (c) Alan Carlos Meira Leal
 *
 * Breakpoint Utilities
 *
 * @module utils/breakpoints
 * @category utils
 *
 * Provides mobile-first responsive breakpoint system for UIX components.
 * Includes hooks, utilities, and helpers for creating responsive components.
 *
 * @example Basic Breakpoint Check
 * ```javascript
 * import { matchesBreakpoint } from './utils/breakpoints.js';
 *
 * if (matchesBreakpoint('md')) {
 *   console.log('Medium screen or larger');
 * }
 * ```
 *
 * @example Reactive Hook
 * ```javascript
 * import { useBreakpoint } from './utils/breakpoints.js';
 *
 * const bp = useBreakpoint((breakpoint) => {
 *   console.log('Breakpoint changed to:', breakpoint);
 * });
 *
 * console.log('Current:', bp.current);
 * // Later: bp.cleanup();
 * ```
 *
 * @example Responsive Props
 * ```javascript
 * import { getResponsiveValue } from './utils/breakpoints.js';
 *
 * // Element has: cols="1" cols-md="2" cols-lg="3"
 * const columns = getResponsiveValue(this, 'cols');
 * ```
 */
