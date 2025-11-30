import T from "@bootstrapp/types";
import { html } from "lit-html";

export default {
  tag: "uix-tree-item",
  properties: {
    label: T.string(""),
    icon: T.string(""),
    expanded: T.boolean(false),
    active: T.boolean(false),
    modified: T.boolean(false),
    hasChildren: T.boolean(),
  },
  style: true,
  shadow: true,

  connected() {
    this.hasChildren = this.children.length > 0;
  },

  toggle() {
    this.expanded = !this.expanded;
    this.emit("toggle", { expanded: this.expanded });
  },

  handleClick(e) {
    if (this.hasChildren) {
      this.toggle();
    }
    this.emit("click", { item: this });
  },

  render() {
    const displayIcon = this.hasChildren
      ? this.expanded
        ? "folder-open"
        : "folder"
      : this.icon;

    return html`
      <div part="item-content" class="item-content" @click=${this.handleClick.bind(this)}>
        ${displayIcon ? html`<uix-icon name="${displayIcon}"></uix-icon>` : ""}
        <span class="label">${this.label}</span>
        ${this.modified ? html`<span class="modified"></span>` : ""}
      </div>
      <div part="children" class="children">
        <slot></slot>
      </div>
    `;
  },
};

/**
 * Tree Item Component
 *
 * @component
 * @category navigation
 * @tag uix-tree-item
 *
 * Individual tree item. Can be nested for hierarchical structures.
 *
 * @example Basic Item
 * ```html
 * <uix-tree-item label="File" icon="file"></uix-tree-item>
 * ```
 *
 * @example With Children
 * ```html
 * <uix-tree-item label="Folder" icon="folder" expanded>
 *   <uix-tree-item label="Nested File" icon="file"></uix-tree-item>
 * </uix-tree-item>
 * ```
 *
 * @example Active and Modified
 * ```html
 * <uix-tree-item label="App.js" icon="file" active modified></uix-tree-item>
 * ```
 */
