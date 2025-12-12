import T from "/$app/types/index.js";
import Controller from "/$app/controller/index.js";
export default {
  tag: "uix-draggable",
  style: true,
  dataQuery: true,
  properties: {
    draggable: T.string(),
    "dragged-id": T.string(),
    target: T.string(),
    onDragged: T.function(),
  },
  connected() {
    this.draggable = true;
    this.addEventListener("dragstart", this.handleDragStart.bind(this));
    this.addEventListener("dragend", this.handleDragEnd.bind(this));
  },
  handleDragStart(event) {
    this.classList.add("dragging");
    event.dataTransfer.setData("text/plain", this.dragData);
    event.dataTransfer.effectAllowed = "move";
    const startDropArea = this.closest("uix-droparea");
    if (this.ondragstart) {
      this.ondragstart(event, startDropArea);
    }
  },
  handleDragEnd(event) {
    this.classList.remove("dragging");
    const targetContainer = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest("uix-droparea");
    const { target } = this;
    const targetId = targetContainer["droparea-id"];
    const draggedId = this["dragged-id"];
    if (targetId) {
      if (this.onDragged) this.onDragged(draggedId);
      Controller.backend("EDIT", {
        model: this["data-query"].model,
        row: { id: draggedId, [target]: targetId },
      });
    }
  },
};
