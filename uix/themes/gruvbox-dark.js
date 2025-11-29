/**
 * Gruvbox Dark Theme
 * Dark theme with warm, retro groove colors
 * Based on the Gruvbox color scheme
 */

const fontFamily = "Manrope";
export default {
  font: {
    family: `'${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`,
    icon: {
      family: "lucide",
    },
  },
  link: { color: "var(--color-primary)" },
  text: { color: "#ebdbb2", muted: "#bdae93" },
  background: { color: "var(--color-surface-dark)" },
  color: {
    surface: "#504945", // neutral accent
    "surface-light": "#3c3836",
    "surface-lighter": "#665c54",
    "surface-dark": "#32302f",
    "surface-darker": "#282828",
    primary: "#fabd2f", // primary accent - yellow/gold for primary actions
    "primary-lighter": "#fde8a3", // lightest yellow/gold
    "primary-light": "#fcd875", // light yellow/gold
    "primary-dark": "#d79921", // dark yellow/gold
    "primary-darker": "#b57614", // darkest yellow/gold
    secondary: "#83a598", // secondary accent - teal/blue for secondary actions
    "secondary-lighter": "#c7d7dd", // lightest teal/blue
    "secondary-light": "#a8c5cc", // light teal/blue
    "secondary-dark": "#6a8d99", // dark teal/blue
    "secondary-darker": "#527580", // darkest teal/blue
    success: "#b8bb26", // success accent - lime green for success states
    "success-lighter": "#e7e9a6", // lightest lime green
    "success-light": "#d3d566", // light lime green
    "success-dark": "#98971a", // dark lime green
    "success-darker": "#79740e", // darkest lime green
    danger: "#fb4934", // danger accent - red for danger/error states
    "danger-lighter": "#fdb8ae", // lightest red
    "danger-light": "#fc8171", // light red
    "danger-dark": "#cc241d", // dark red
    "danger-darker": "#9d0006", // darkest red
    warning: "#fe8019", // warning accent - orange for warnings
    "warning-lighter": "#fec896", // lightest orange
    "warning-light": "#fea457", // light orange
    "warning-dark": "#d65d0e", // dark orange
    "warning-darker": "#af3a03", // darkest orange
    info: "#83a598", // info accent - teal for info states (same as secondary)
    "info-lighter": "#c7d7dd", // lightest teal
    "info-light": "#a8c5cc", // light teal
    "info-dark": "#6a8d99", // dark teal
    "info-darker": "#527580", // darkest teal
    hover: "#d79921", // hover state accent - darker gold
    focus: "#fabd2f", // focus state accent
    inverse: "#282828", // contrasting accent
    "inverse-lighter": "#7c6f64", // lightest inverse (gray)
    "inverse-light": "#504945", // light inverse (medium gray)
    "inverse-dark": "#1d2021", // dark inverse (darker than base)
    "inverse-darker": "#0d0e0f", // darkest inverse (almost black)
  },

  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "0.75rem", // 12px
    lg: "1rem", // 16px
    xl: "1.5rem", // 24px
    "2xl": "2rem", // 32px
    "3xl": "3rem", // 48px
    "4xl": "5rem", // 80px
  },

  // Typography
  typography: {
    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: {
      tight: "1.2",
      normal: "1.5",
      relaxed: "1.75",
    },
  },

  // Border radius
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.375rem", // 6px
    lg: "0.5rem", // 8px
    xl: "0.75rem", // 12px
    full: "9999px",
  },

  // Shadows
  shadow: {
    none: "none",
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  },

  input: {
    bg: "#504945",
    bgFocus: "#665c54",
    bgDisabled: "#3c3836",
    border: "#665c54",
    borderFocus: "#fabd2f",
    borderError: "#fb4934",
    text: "#ebdbb2",
    placeholder: "#bdae93",
    icon: "#bdae93",
  },

  panel: {
    bg: "#282828",
    "bg-hover": "#32302f",
    border: "#504945",
    headerBg: "transparent",
    headerText: "#bdae93",
    headerBorder: "#504945",
  },

  modal: {
    bg: "#3c3836",
    overlay: "rgba(0, 0, 0, 0.75)",
    border: "#504945",
    shadow: "0 25px 50px -12px rgb(0 0 0 / 0.5)",
  },

  dropdown: {
    bg: "#3c3836",
    "bg-hover": "#504945",
    bgActive: "#665c54",
    border: "#504945",
    text: "#ebdbb2",
    textMuted: "#bdae93",
    separator: "#504945",
    shadow: "0 10px 15px -3px rgb(0 0 0 / 0.3)",
  },

  badge: {
    default: {
      bg: "#504945",
      text: "#ebdbb2",
      border: "transparent",
    },
    success: {
      bg: "#98971a",
      text: "#282828",
      border: "transparent",
    },
    danger: {
      bg: "#cc241d",
      text: "#ebdbb2",
      border: "transparent",
    },
    warning: {
      bg: "#d65d0e",
      text: "#282828",
      border: "transparent",
    },
    info: {
      bg: "#458588",
      text: "#ebdbb2",
      border: "transparent",
    },
  },
  list: {
    bg: "transparent",
    "bg-hover": "#3c3836",
    bgActive: "#504945",
    bgSelected: "#3c3836",
    border: "transparent",
    borderHover: "#83a598",
    text: "#ebdbb2",
    textMuted: "#bdae93",
  },
  tree: {
    bg: "transparent",
    "bg-hover": "#3c3836",
    bgSelected: "#504945",
    border: "transparent",
    indent: "1rem",
    icon: "#bdae93",
    iconHover: "#fabd2f",
  },
  tabs: {
    bg: "#3c3836",
    border: "#504945",
    tab: {
      color: "#bdae93",
      colorActive: "#fabd2f",
      bg: "transparent",
      bgHover: "#504945",
      bgActive: "#282828",
      borderActive: "#fabd2f",
    },
  },
  card: {
    bg: "#3c3836",
    border: "#504945",
    borderHover: "#83a598",
    text: "#ebdbb2",
    textMuted: "#bdae93",
    shadow: {
      brutalist: "4px 4px 0px #1d2021",
      brutalistHover: "6px 6px 0px #83a598",
      brutalistColor: "#1d2021",
      brutalistHoverColor: "#83a598",
    },
    header: {
      bg: "transparent",
      border: "#504945",
      padding: "0.75rem 1rem",
    },
    footer: {
      bg: "transparent",
      border: "#504945",
      borderStyle: "dashed",
      padding: "0.75rem 1rem",
    },
    icon: {
      bg: "#282828",
      size: "3rem",
      borderRadius: "0.375rem",
    },
    tag: {
      bg: "#504945",
      text: "#ebdbb2",
      padding: "0.25rem 0.5rem",
      borderRadius: "0.25rem",
    },
  },
};
