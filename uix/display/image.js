import T from "/$app/types/index.js";

const imageStyleCache = new Map();
const createBase64Style = async (url, className) => {
  if (imageStyleCache.has(url)) {
    return; // Avoid re-processing the same image
  }
  imageStyleCache.set(url, true); // Mark as being processed

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok.");
    const blob = await response.blob();
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      let styleSheet = document.getElementById("uix-image-styles");
      if (!styleSheet) {
        styleSheet = document.createElement("style");
        styleSheet.id = "uix-image-styles";
        document.head.appendChild(styleSheet);
      }
      styleSheet.innerHTML += `.${className} { background-image: url(${base64String}); }`;
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    console.error("Failed to fetch and convert image:", error);
  }
};

export default {
  tag: "uix-image",
  class: "bg-cover bg-center",
  properties: {
    src: T.string(),
    alt: T.string(""),
  },
  connected() {
    this.on("srcChanged", ({ key, value }) => {
      const uniqueClass = `uix-img-${btoa(value).replace(/=/g, "")}`;
      this.classList.add(uniqueClass);
      createBase64Style(value, uniqueClass);
    });
    if (this.src) {
      const uniqueClass = `uix-img-${btoa(this.src).replace(/=/g, "")}`;
      this.classList.add(uniqueClass);
      createBase64Style(this.src, uniqueClass);
    }
  },
};
