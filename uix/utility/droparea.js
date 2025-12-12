import T from "/$app/types/index.js";

export default {
  tag: "uix-droparea",
  style: true,
  properties: {
    ondrop: T.function(),
    ondragleave: T.function(),
    ondragend: T.function(),
    "droparea-id": T.string(),
  },
  connected() {
    this.addEventListener("dragover", this.handleDragOver.bind(this));
    this.addEventListener("drop", this.handleDrop.bind(this));
    this.addEventListener("dragenter", this.handleDragEnter.bind(this));
    this.addEventListener("dragleave", this.handleDragLeave.bind(this));
  },
  handleDragOver(event) {
    this.classList.add("over");
    event.preventDefault();
  },

  handleDrop(event) {
    this.classList.remove("over");
    event.preventDefault();
    if (this.ondrop) this.ondrop(event);
  },

  handleDragEnter(event) {
    this.classList.add("over");
    event.preventDefault();
    if (this.ondragleave) this.ondragleave(event);
  },
  handleDragLeave(event) {
    this.classList.remove("over");
    if (this.ondragleave) this.ondragleave(event);
  },
};
