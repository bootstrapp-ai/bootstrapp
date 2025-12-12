import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-panel",
  properties: {
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "bordered", "elevated"],
    }),
    padding: T.string({
      defaultValue: "md",
      enum: ["none", "sm", "md", "lg"],
    }),
  },
  style: true,
  shadow: true,

  render() {
    return html`
      <div part="container" class="panel">
        <div part="header" class="panel-header">
          <slot name="header"></slot>
        </div>

        <div part="body" class="panel-body">
          <slot></slot>
        </div>

        <div part="footer" class="panel-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  },
};

/**
 * Panel Component
 *
 * @component
 * @category layout
 * @tag uix-panel
 *
 * A container component with optional header and footer sections.
 *
 * @slot header - Panel header content
 * @slot default - Panel body content
 * @slot footer - Panel footer content
 *
 * @example
 * // Basic panel
 * ```html
 * <uix-panel>
 *   <div slot="header">
 *     <h3>Panel Title</h3>
 *   </div>
 *   <p>Panel content goes here...</p>
 * </uix-panel>
 * ```
 *
 * @example
 * // Bordered variant
 * ```html
 * <uix-panel variant="bordered">
 *   <div slot="header">
 *     <h3>Bordered Panel</h3>
 *   </div>
 *   <p>Content with a border around it.</p>
 * </uix-panel>
 * ```
 *
 * @example
 * // Elevated variant (with shadow)
 * ```html
 * <uix-panel variant="elevated">
 *   <div slot="header">
 *     <h3>Elevated Panel</h3>
 *   </div>
 *   <p>Content with a shadow effect.</p>
 * </uix-panel>
 * ```
 *
 * @example
 * // With footer
 * ```html
 * <uix-panel variant="bordered">
 *   <div slot="header">
 *     <h3>User Profile</h3>
 *   </div>
 *   <div>
 *     <p><strong>Name:</strong> John Doe</p>
 *     <p><strong>Email:</strong> john@example.com</p>
 *   </div>
 *   <div slot="footer">
 *     <uix-button variant="primary">Edit Profile</uix-button>
 *     <uix-button ghost>Cancel</uix-button>
 *   </div>
 * </uix-panel>
 * ```
 *
 * @example
 * // Padding variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 1rem;">
 *   <uix-panel variant="bordered" padding="none">
 *     <div slot="header" style="padding: 1rem;">
 *       <h4>No Padding</h4>
 *     </div>
 *     <div style="padding: 1rem; background: #f5f5f5;">
 *       Custom padding applied manually
 *     </div>
 *   </uix-panel>
 *
 *   <uix-panel variant="bordered" padding="sm">
 *     <div slot="header"><h4>Small Padding</h4></div>
 *     <p>Less padding around content</p>
 *   </uix-panel>
 *
 *   <uix-panel variant="bordered" padding="lg">
 *     <div slot="header"><h4>Large Padding</h4></div>
 *     <p>More padding around content</p>
 *   </uix-panel>
 * </div>
 * ```
 *
 * @example
 * // Dashboard panels
 * ```html
 * <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
 *   <uix-panel variant="elevated">
 *     <div slot="header">
 *       <h4>Total Users</h4>
 *     </div>
 *     <div style="font-size: 2rem; font-weight: bold;">1,234</div>
 *     <div slot="footer" style="color: green;">
 *       ↑ 12% from last month
 *     </div>
 *   </uix-panel>
 *
 *   <uix-panel variant="elevated">
 *     <div slot="header">
 *       <h4>Revenue</h4>
 *     </div>
 *     <div style="font-size: 2rem; font-weight: bold;">$45,678</div>
 *     <div slot="footer" style="color: green;">
 *       ↑ 8% from last month
 *     </div>
 *   </uix-panel>
 *
 *   <uix-panel variant="elevated">
 *     <div slot="header">
 *       <h4>Active Sessions</h4>
 *     </div>
 *     <div style="font-size: 2rem; font-weight: bold;">456</div>
 *     <div slot="footer" style="color: red;">
 *       ↓ 3% from last month
 *     </div>
 *   </uix-panel>
 * </div>
 * ```
 *
 * @example
 * // Settings panel
 * ```html
 * <uix-panel variant="bordered">
 *   <div slot="header">
 *     <h3>Account Settings</h3>
 *   </div>
 *   <div style="display: flex; flex-direction: column; gap: 1rem;">
 *     <uix-form-control label="Username">
 *       <uix-input value="johndoe"></uix-input>
 *     </uix-form-control>
 *     <uix-form-control label="Email">
 *       <uix-input type="email" value="john@example.com"></uix-input>
 *     </uix-form-control>
 *     <uix-form-control label="Notifications">
 *       <uix-switch checked></uix-switch>
 *     </uix-form-control>
 *   </div>
 *   <div slot="footer" style="display: flex; gap: 0.5rem; justify-content: flex-end;">
 *     <uix-button ghost>Cancel</uix-button>
 *     <uix-button variant="primary">Save Changes</uix-button>
 *   </div>
 * </uix-panel>
 * ```
 */
