import T from "@bootstrapp/types";

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
