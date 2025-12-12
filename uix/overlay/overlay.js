import T from "/$app/types/index.js";

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
