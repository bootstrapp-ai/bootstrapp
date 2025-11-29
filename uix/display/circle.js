import T from "@bootstrapp/types";

export default {
  tag: "uix-circle",
  style: true,
  class:
    "inline-block align-middle box-border w-4 h-4 rounded-full border-1 border-solid border-gray-900",
  properties: {
    solid: T.boolean({
      defaultValue: false,
    }),
  },
};
