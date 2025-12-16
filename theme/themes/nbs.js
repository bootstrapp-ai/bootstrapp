/**
 * Neobrutalist (NBS) Theme
 * Bold borders, hard shadows, vibrant colors
 * Playful, interactive design with tactile feedback
 */

const fontFamily = "Manrope";

export default {
  font: {
    family: fontFamily,
    icon: { family: "lucide" },
    // Font weights
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    black: "900",
  },

  link: { color: "var(--text-color)" },
  text: {
    color: "#1a1a1a",
    muted: "#6b7280",
    // Font sizes
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
  },
  background: { color: "#faf5f0" },

  color: {
    // Vibrant, saturated colors
    primary: "#fabd2f",
    "primary-lighter": "#fde8a3",
    "primary-light": "#fcd875",
    "primary-dark": "#d79921",
    "primary-darker": "#b57614",

    secondary: "#ec4899",
    "secondary-lighter": "#fbcfe8",
    "secondary-light": "#f9a8d4",
    "secondary-dark": "#db2777",
    "secondary-darker": "#be185d",

    success: "#22c55e",
    "success-lighter": "#bbf7d0",
    "success-light": "#86efac",
    "success-dark": "#16a34a",
    "success-darker": "#15803d",

    danger: "#ef4444",
    "danger-lighter": "#fecaca",
    "danger-light": "#fca5a5",
    "danger-dark": "#dc2626",
    "danger-darker": "#b91c1c",

    warning: "#f97316",
    "warning-lighter": "#fed7aa",
    "warning-light": "#fdba74",
    "warning-dark": "#ea580c",
    "warning-darker": "#c2410c",

    info: "#3b82f6",
    "info-lighter": "#bfdbfe",
    "info-light": "#93c5fd",
    "info-dark": "#2563eb",
    "info-darker": "#1d4ed8",

    surface: "#ffffff",
    "surface-light": "#faf5f0",
    "surface-lighter": "#ffffff",
    "surface-dark": "#f5f0eb",
    "surface-darker": "#ebe5df",

    hover: "#d79921",
    focus: "#fabd2f",
    inverse: "#1a1a1a",
    "inverse-lighter": "#525252",
    "inverse-light": "#404040",
    "inverse-dark": "#0a0a0a",
    "inverse-darker": "#000000",
  },

  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "2rem",
    "3xl": "3rem",
    "4xl": "5rem",
  },

  // Line heights (generates --leading-tight, --leading-normal, etc.)
  leading: {
    tight: "1.2",
    normal: "1.5",
    relaxed: "1.75",
  },

  // NBS uses larger border radii
  radius: {
    none: "0",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    full: "9999px",
  },

  // Hard offset shadows (NBS signature)
  shadow: {
    none: "none",
    sm: "2px 2px 0px 0px rgba(0,0,0,1)",
    md: "4px 4px 0px 0px rgba(0,0,0,1)",
    lg: "6px 6px 0px 0px rgba(0,0,0,1)",
    xl: "8px 8px 0px 0px rgba(0,0,0,1)",
    "2xl": "12px 12px 0px 0px rgba(0,0,0,1)",
  },

  // NBS-specific component styling (kebab-case keys!)
  button: {
    "border-size": "3px",
    "border-color": "black",
    "border-radius": "0.75rem",
    shadow: "4px 4px 0px 0px rgba(0,0,0,1)",
    "hover-shadow": "2px 2px 0px 0px rgba(0,0,0,1)",
    "active-shadow": "none",
    "hover-translate-x": "-2px",
    "hover-translate-y": "-2px",
    "active-translate-x": "2px",
    "active-translate-y": "2px",
    "font-weight": "900",
    "text-transform": "uppercase",
  },

  input: {
    background: "#ffffff",
    "background-focus": "#ffffff",
    "background-disabled": "#f5f5f5",
    "border-color": "#000000",
    "border-width": "3px",
    "border-radius": "0.75rem",
    "border-focus": "#000000",
    "border-error": "#ef4444",
    text: "#1a1a1a",
    placeholder: "#9ca3af",
    icon: "#6b7280",
    shadow: "4px 4px 0px 0px rgba(0,0,0,1)",
    "focus-shadow": "6px 6px 0px 0px rgba(0,0,0,1)",
  },

  checkbox: {
    "border-width": "3px",
    "border-color": "#000000",
    "border-radius": "0.375rem",
    shadow: "3px 3px 0px 0px rgba(0,0,0,1)",
    "hover-border-color": "#000000",
    "checked-background-color": "#fabd2f",
    "checked-border-color": "#000000",
    "label-font-weight": "600",
  },

  label: {
    "font-size": "1rem",
    "font-weight": "700",
    color: "#1a1a1a",
    "letter-spacing": "0.05em",
    "text-transform": "uppercase",
    margin: "0.5rem",
  },

  tabs: {
    background: "#ffffff",
    "border-color": "#000000",
    "border-width": "3px",
    "border-radius": "0.75rem",
    shadow: "4px 4px 0px 0px rgba(0,0,0,1)",
    "list-background": "#f5f5f5",
    "list-border-color": "#000000",
    tab: {
      padding: "1rem 1.5rem",
      gap: "0.5rem",
      "font-size": "0.875rem",
      "font-weight": "900",
      "text-transform": "uppercase",
      "letter-spacing": "0.05em",
      color: "#6b7280",
      "color-hover": "#1a1a1a",
      "color-active": "#1a1a1a",
      background: "transparent",
      "background-hover": "#e5e5e5",
      "background-active": "#ffffff",
      "border-width": "3px",
      "border-active": "#000000",
    },
  },

  card: {
    background: "#ffffff",
    border: "#000000",
    "border-width": "3px",
    "border-hover": "#000000",
    text: "#1a1a1a",
    "text-muted": "#6b7280",
    header: {
      background: "transparent",
      border: "#000000",
      padding: "0.75rem 1rem",
    },
    footer: {
      background: "transparent",
      border: "#000000",
      "border-style": "solid",
      padding: "0.75rem 1rem",
    },
    icon: {
      background: "#f5f5f5",
      size: "3rem",
      "border-radius": "0.75rem",
    },
    tag: {
      background: "#fabd2f",
      text: "#1a1a1a",
      padding: "0.25rem 0.5rem",
      "border-radius": "0.5rem",
    },
  },

  modal: {
    background: "#ffffff",
    "border-width": "3px",
    "border-color": "#000000",
    "border-radius": "1rem",
    shadow: "8px 8px 0px 0px rgba(0,0,0,1)",
    color: "#1a1a1a",
    overlay: "rgba(0, 0, 0, 0.5)",
    "header-padding": "1.25rem 1.5rem",
    "header-border-width": "3px",
    "header-background": "#ffffff",
    "header-font-size": "1.25rem",
    "header-font-weight": "900",
    "header-color": "#1a1a1a",
    "body-padding": "1.5rem",
    "body-color": "#4b5563",
    "footer-padding": "1rem 1.5rem",
    "footer-border-width": "3px",
    "footer-background": "#f9fafb",
  },

  panel: {
    background: "#ffffff",
    "background-hover": "#f5f5f5",
    border: "#000000",
    "header-background": "transparent",
    "header-text": "#1a1a1a",
    "header-border": "#000000",
  },

  dropdown: {
    background: "#ffffff",
    "background-hover": "#f5f5f5",
    "background-active": "#e5e5e5",
    border: "#000000",
    text: "#1a1a1a",
    "text-muted": "#6b7280",
    separator: "#e5e5e5",
    shadow: "4px 4px 0px 0px rgba(0,0,0,1)",
  },

  badge: {
    default: {
      background: "#f5f5f5",
      text: "#1a1a1a",
      border: "#000000",
    },
    success: {
      background: "#22c55e",
      text: "#ffffff",
      border: "#000000",
    },
    danger: {
      background: "#ef4444",
      text: "#ffffff",
      border: "#000000",
    },
    warning: {
      background: "#f97316",
      text: "#ffffff",
      border: "#000000",
    },
    info: {
      background: "#3b82f6",
      text: "#ffffff",
      border: "#000000",
    },
  },

  list: {
    background: "transparent",
    "background-hover": "#f5f5f5",
    "background-active": "#e5e5e5",
    "background-selected": "#fabd2f",
    border: "#000000",
    "border-hover": "#000000",
    text: "#1a1a1a",
    "text-muted": "#6b7280",
  },

  tree: {
    background: "transparent",
    "background-hover": "#f5f5f5",
    "background-selected": "#fabd2f",
    border: "#000000",
    indent: "1rem",
    icon: "#6b7280",
    "icon-hover": "#1a1a1a",
  },

  table: {
    "border-width": "3px",
    "border-color": "#000000",
    "border-radius": "1rem",
    shadow: "4px 4px 0px 0px rgba(0,0,0,1)",
    "header-background": "#ffffff",
    "header-color": "#1a1a1a",
    "header-font-weight": "900",
    "header-font-size": "0.75rem",
    "header-text-transform": "uppercase",
    "row-background": "#ffffff",
    "row-hover-background": "#fef3c7",
    "cell-padding": "1rem 1.25rem",
    "cell-font-size": "0.875rem",
    "cell-color": "#4b5563",
  },

  pagination: {
    "border-width": "3px",
    "border-color": "#000000",
    "border-radius": "0.75rem",
    background: "#ffffff",
    color: "#1a1a1a",
    "font-weight": "700",
    shadow: "3px 3px 0px 0px rgba(0,0,0,1)",
    "hover-background": "#f5f5f5",
    "hover-border-color": "#000000",
    "hover-shadow": "2px 2px 0px 0px rgba(0,0,0,1)",
    "hover-transform": "translate(-1px, -1px)",
    "active-background": "#fabd2f",
    "active-border-color": "#000000",
    "active-color": "#000000",
    "active-shadow": "3px 3px 0px 0px rgba(0,0,0,1)",
    "nav-font-weight": "900",
  },

  breadcrumbs: {
    "font-size": "0.875rem",
    "font-weight": "700",
    "current-font-weight": "900",
    "text-transform": "uppercase",
    "letter-spacing": "0.05em",
    "link-color": "#6b7280",
    "link-hover-color": "#1a1a1a",
    "current-color": "#1a1a1a",
    "separator-color": "#9ca3af",
    gap: "0.5rem",
  },

  sidebar: {
    background: "#ffffff",
    "border-width": "3px",
    "border-color": "#000000",
    "border-radius": "0",
    shadow: "none",
    width: "256px",
    "collapsed-width": "80px",
    // Header
    "header-padding": "1rem",
    "header-background": "#ffffff",
    "header-border-width": "3px",
    "header-font-weight": "900",
    // Content
    "content-padding": "0.75rem",
    // Footer
    "footer-padding": "0.75rem",
    "footer-background": "#ffffff",
    "footer-border-width": "3px",
    // Toggle button
    "toggle-background": "transparent",
    "toggle-hover-background": "#f5f5f5",
    "toggle-border-radius": "0.5rem",
    // Nav items
    "item-padding": "0.75rem 1rem",
    "item-border-radius": "0.75rem",
    "item-font-weight": "500",
    "item-color": "#4b5563",
    "item-hover-background": "#f5f5f5",
    "item-hover-color": "#1a1a1a",
    "item-active-background": "#000000",
    "item-active-color": "#ffffff",
    "item-active-font-weight": "600",
  },
};
