/**
 * UIX Flex Component
 * Flexible container for flexbox layouts
 * No shadow DOM - host element is the flex container
 */

import T from "/$app/types/index.js";

export default {
  style: true,
  properties: {
    direction: T.string({
      defaultValue: "row",
      enum: ["row", "column", "row-reverse", "column-reverse"],
    }),
    gap: T.string({
      enum: ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"],
    }),
    align: T.string({
      defaultValue: "stretch",
      enum: ["start", "center", "end", "stretch", "baseline"],
    }),
    justify: T.string({
      defaultValue: "start",
      enum: [
        "start",
        "center",
        "end",
        "space-between",
        "space-around",
        "space-evenly",
      ],
    }),
    wrap: T.string({
      defaultValue: "nowrap",
      enum: ["wrap", "nowrap", "wrap-reverse"],
    }),
  },
};

/**
 * UIX Flex Component
 *
 * @component
 * @category layout
 * @tag uix-flex
 *
 * A flexible container component for creating flexbox layouts.
 * No shadow DOM - the host element itself becomes the flex container.
 *
 * ## Flex Item Attributes
 *
 * Direct children can use these attributes for individual flex behavior:
 * - `flex-1` - Grow and shrink equally (flex: 1 1 0%)
 * - `flex-auto` - Grow and shrink with auto basis (flex: 1 1 auto)
 * - `flex-initial` - Don't grow, can shrink (flex: 0 1 auto)
 * - `flex-none` - Don't grow or shrink (flex: none)
 * - `flex-grow` - Allow growing (flex-grow: 1)
 * - `flex-shrink="0"` - Prevent shrinking
 * - `align-self="center|start|end|stretch"` - Individual alignment
 *
 * @example
 * // Basic row layout
 * ```html
 * <uix-flex gap="md">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </uix-flex>
 * ```
 *
 * @example
 * // Column layout with gap
 * ```html
 * <uix-flex direction="column" gap="lg">
 *   <div>Top</div>
 *   <div>Middle</div>
 *   <div>Bottom</div>
 * </uix-flex>
 * ```
 *
 * @example
 * // Centered content
 * ```html
 * <uix-flex align="center" justify="center" style="min-height: 200px;">
 *   <div>Centered Content</div>
 * </uix-flex>
 * ```
 *
 * @example
 * // Sidebar layout with flex-1
 * ```html
 * <uix-flex gap="md">
 *   <aside style="width: 250px;">
 *     Sidebar (fixed width)
 *   </aside>
 *   <main flex-1>
 *     Main content (takes remaining space)
 *   </main>
 * </uix-flex>
 * ```
 *
 * @example
 * // Toolbar with flexible search
 * ```html
 * <uix-flex align="center" gap="sm">
 *   <uix-button flex-none>New</uix-button>
 *   <uix-button flex-none>Save</uix-button>
 *   <uix-input flex-1 placeholder="Search..."></uix-input>
 *   <uix-button flex-none variant="primary">Submit</uix-button>
 * </uix-flex>
 * ```
 *
 * @example
 * // Card with flexible body
 * ```html
 * <uix-flex direction="column" gap="none" style="height: 400px;">
 *   <div flex-none style="padding: 1rem; border-bottom: 1px solid #ddd;">
 *     Header
 *   </div>
 *   <div flex-1 style="padding: 1rem; overflow-y: auto;">
 *     Body content that grows to fill available space
 *   </div>
 *   <div flex-none style="padding: 1rem; border-top: 1px solid #ddd;">
 *     Footer
 *   </div>
 * </uix-flex>
 * ```
 *
 * @example
 * // Space between items
 * ```html
 * <uix-flex justify="space-between" align="center">
 *   <h2>Page Title</h2>
 *   <uix-button variant="primary">Action</uix-button>
 * </uix-flex>
 * ```
 *
 * @example
 * // Individual item alignment
 * ```html
 * <uix-flex gap="md" style="height: 150px;">
 *   <div align-self="start">Aligned to start</div>
 *   <div align-self="center">Centered</div>
 *   <div align-self="end">Aligned to end</div>
 *   <div align-self="stretch">Stretched</div>
 * </uix-flex>
 * ```
 *
 * @example
 * // Wrap items
 * ```html
 * <uix-flex wrap="wrap" gap="sm">
 *   <uix-badge>Tag 1</uix-badge>
 *   <uix-badge>Tag 2</uix-badge>
 *   <uix-badge>Tag 3</uix-badge>
 *   <uix-badge>Tag 4</uix-badge>
 *   <uix-badge>Tag 5</uix-badge>
 * </uix-flex>
 * ```
 *
 * @example
 * // Dashboard layout
 * ```html
 * <uix-flex direction="column" gap="lg" style="height: 100vh;">
 *   <header flex-none>
 *     <uix-navbar>Navigation</uix-navbar>
 *   </header>
 *
 *   <uix-flex flex-1 gap="md">
 *     <aside flex-none style="width: 300px;">
 *       <uix-sidebar>Sidebar</uix-sidebar>
 *     </aside>
 *
 *     <main flex-1>
 *       <div style="padding: 2rem;">
 *         Main content area
 *       </div>
 *     </main>
 *   </uix-flex>
 *
 *   <footer flex-none>
 *     Footer content
 *   </footer>
 * </uix-flex>
 * ```
 *
 * @example
 * // Form row with labels
 * ```html
 * <uix-flex direction="column" gap="md">
 *   <uix-flex align="center" gap="sm">
 *     <label flex-none style="width: 120px;">Name:</label>
 *     <uix-input flex-1></uix-input>
 *   </uix-flex>
 *
 *   <uix-flex align="center" gap="sm">
 *     <label flex-none style="width: 120px;">Email:</label>
 *     <uix-input flex-1 type="email"></uix-input>
 *   </uix-flex>
 * </uix-flex>
 * ```
 */
