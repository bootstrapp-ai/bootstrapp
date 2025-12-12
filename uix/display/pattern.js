import T from "/node_modules/@bootstrapp/types/index.js";

export default {
  tag: "uix-pattern",
  style: true,
  properties: {
    pattern: T.string(),
    random: T.boolean(false),
  },
  connected() {
    const patterns = ["pattern-1", "pattern-2", "pattern-3", "pattern-4"];
    let patternClass = this.pattern;

    if (this.random) {
      const randomIndex = Math.floor(Math.random() * patterns.length);
      patternClass = patterns[randomIndex];
    }

    if (patternClass) {
      this.classList.add(patternClass);
    }
  },
};
