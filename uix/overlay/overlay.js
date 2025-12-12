import T from "/node_modules/@bootstrapp/types/index.js";

export default {
  tag: "uix-overlay",

  properties: {
    x: T.string({
      defaultValue: "right",
    }),
    y: T.string({
      defaultValue: "bottom",
    }),
  },
};
