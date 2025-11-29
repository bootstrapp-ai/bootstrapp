export default {
  tag: "uix-tree",
  style: true,
};

/**
 * Tree Component
 *
 * @component
 * @category navigation
 * @tag uix-tree
 *
 * A container for tree items. Use with uix-tree-item for nested structures.
 * Automatically shows folder/folder-open icons and depth guide lines.
 *
 * @example Basic Tree
 * ```html
 * <uix-tree>
 *   <uix-tree-item label="Folder 1">
 *     <uix-tree-item label="File 1.1" icon="file"></uix-tree-item>
 *     <uix-tree-item label="File 1.2" icon="file"></uix-tree-item>
 *   </uix-tree-item>
 *   <uix-tree-item label="Folder 2">
 *     <uix-tree-item label="Subfolder 2.1">
 *       <uix-tree-item label="File 2.1.1" icon="file"></uix-tree-item>
 *     </uix-tree-item>
 *     <uix-tree-item label="File 2.2" icon="file"></uix-tree-item>
 *   </uix-tree-item>
 * </uix-tree>
 * ```
 *
 * @example Expanded Folders
 * ```html
 * <uix-tree>
 *   <uix-tree-item label="src" expanded>
 *     <uix-tree-item label="components" expanded>
 *       <uix-tree-item label="Button.js" icon="file"></uix-tree-item>
 *       <uix-tree-item label="Input.js" icon="file"></uix-tree-item>
 *     </uix-tree-item>
 *     <uix-tree-item label="index.js" icon="file"></uix-tree-item>
 *   </uix-tree-item>
 * </uix-tree>
 * ```
 *
 * @example With Active and Modified States
 * ```html
 * <uix-tree>
 *   <uix-tree-item label="project" expanded>
 *     <uix-tree-item label="App.js" icon="file" active modified></uix-tree-item>
 *     <uix-tree-item label="index.js" icon="file"></uix-tree-item>
 *     <uix-tree-item label="config.json" icon="file" modified></uix-tree-item>
 *   </uix-tree-item>
 * </uix-tree>
 * ```
 *
 * @example File Explorer
 * ```html
 * <uix-tree>
 *   <uix-tree-item label="Documents">
 *     <uix-tree-item label="report.pdf" icon="file"></uix-tree-item>
 *     <uix-tree-item label="notes.txt" icon="file"></uix-tree-item>
 *   </uix-tree-item>
 *   <uix-tree-item label="Pictures">
 *     <uix-tree-item label="vacation" expanded>
 *       <uix-tree-item label="beach.jpg" icon="image"></uix-tree-item>
 *       <uix-tree-item label="sunset.jpg" icon="image"></uix-tree-item>
 *     </uix-tree-item>
 *   </uix-tree-item>
 *   <uix-tree-item label="Downloads">
 *     <uix-tree-item label="installer.exe" icon="file"></uix-tree-item>
 *   </uix-tree-item>
 * </uix-tree>
 * ```
 *
 * @example With Event Handlers
 * ```js
 * html`<uix-tree>
 *   <uix-tree-item
 *     label="Project Files"
 *     @toggle=${(e) => console.log('Toggled:', e.detail.expanded)}
 *     @click=${(e) => console.log('Clicked:', e.detail.item.label)}
 *   >
 *     <uix-tree-item label="index.html" icon="file"></uix-tree-item>
 *   </uix-tree-item>
 * </uix-tree>`
 * ```
 */
