export default {
  name: "uix",
  path: "/$app",
  root: true,
  i18n: {
    pt: () => import("./locales/pt.js"),
  },
  // Component paths are now defined in package.json under bootstrapp.components
};
