import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";

export default {
  tag: "uix-skeleton",
  properties: {
    variant: T.string({
      defaultValue: "text",
      enum: ["text", "circle", "rect", "rounded"],
    }),
    width: T.string({ defaultValue: "100%" }),
    height: T.string({ defaultValue: "1em" }),
    count: T.number({ defaultValue: 1 }),
    animated: T.boolean(true),
  },
  style: true,
  shadow: false,

  render() {
    const skeletons = Array.from({ length: this.count }, (_, i) => i);

    return html`
      <div class="skeleton-container">
        ${skeletons.map(
          () => html`
            <div
              class="skeleton skeleton-${this.variant} ${this.animated ? "animated" : ""}"
              style="width: ${this.width}; height: ${this.height};"
            ></div>
          `,
        )}
      </div>
    `;
  },
};

/**
 * Skeleton Component
 *
 * @component
 * @category feedback
 * @tag uix-skeleton
 *
 * Loading placeholder that mimics the shape of content being loaded.
 *
 * @example
 * // Text skeleton
 * ```html
 * <uix-skeleton></uix-skeleton>
 * ```
 *
 * @example
 * // Multiple text lines
 * ```html
 * <uix-skeleton count="3"></uix-skeleton>
 * ```
 *
 * @example
 * // Circle skeleton (for avatars)
 * ```html
 * <uix-skeleton variant="circle" width="40px" height="40px"></uix-skeleton>
 * ```
 *
 * @example
 * // Rectangle skeleton (for images)
 * ```html
 * <uix-skeleton variant="rect" width="200px" height="150px"></uix-skeleton>
 * ```
 *
 * @example
 * // Rounded rectangle skeleton
 * ```html
 * <uix-skeleton variant="rounded" width="300px" height="200px"></uix-skeleton>
 * ```
 *
 * @example
 * // Without animation
 * ```html
 * <uix-skeleton animated="false"></uix-skeleton>
 * ```
 *
 * @example
 * // Loading card skeleton
 * ```html
 * <div style="border: 1px solid #ddd; padding: 1rem; border-radius: 8px;">
 *   <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
 *     <uix-skeleton variant="circle" width="48px" height="48px"></uix-skeleton>
 *     <div style="flex: 1;">
 *       <uix-skeleton width="40%" height="16px"></uix-skeleton>
 *       <uix-skeleton width="60%" height="12px"></uix-skeleton>
 *     </div>
 *   </div>
 *   <uix-skeleton variant="rounded" width="100%" height="200px"></uix-skeleton>
 *   <uix-skeleton count="3" height="12px"></uix-skeleton>
 * </div>
 * ```
 *
 * @example
 * // Loading list skeleton
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 1rem;">
 *   ${[1, 2, 3, 4].map(() => html`
 *     <div style="display: flex; gap: 1rem; align-items: center;">
 *       <uix-skeleton variant="circle" width="32px" height="32px"></uix-skeleton>
 *       <div style="flex: 1;">
 *         <uix-skeleton width="80%" height="14px"></uix-skeleton>
 *         <uix-skeleton width="60%" height="12px"></uix-skeleton>
 *       </div>
 *     </div>
 *   `)}
 * </div>
 * ```
 *
 * @example
 * // Loading profile skeleton
 * ```html
 * <div style="text-align: center; padding: 2rem;">
 *   <div style="display: flex; justify-content: center; margin-bottom: 1rem;">
 *     <uix-skeleton variant="circle" width="120px" height="120px"></uix-skeleton>
 *   </div>
 *   <uix-skeleton width="200px" height="24px" style="margin: 0 auto 0.5rem;"></uix-skeleton>
 *   <uix-skeleton width="150px" height="16px" style="margin: 0 auto;"></uix-skeleton>
 *   <div style="margin-top: 2rem;">
 *     <uix-skeleton count="4" height="14px"></uix-skeleton>
 *   </div>
 * </div>
 * ```
 *
 * @example
 * // Loading table skeleton
 * ```html
 * <table style="width: 100%; border-collapse: collapse;">
 *   <thead>
 *     <tr>
 *       <th><uix-skeleton height="16px"></uix-skeleton></th>
 *       <th><uix-skeleton height="16px"></uix-skeleton></th>
 *       <th><uix-skeleton height="16px"></uix-skeleton></th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     ${[1, 2, 3, 4, 5].map(() => html`
 *       <tr>
 *         <td><uix-skeleton height="14px"></uix-skeleton></td>
 *         <td><uix-skeleton height="14px"></uix-skeleton></td>
 *         <td><uix-skeleton height="14px"></uix-skeleton></td>
 *       </tr>
 *     `)}
 *   </tbody>
 * </table>
 * ```
 *
 * @example
 * // Custom sizing
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *   <uix-skeleton width="100%" height="20px"></uix-skeleton>
 *   <uix-skeleton width="90%" height="16px"></uix-skeleton>
 *   <uix-skeleton width="75%" height="16px"></uix-skeleton>
 *   <uix-skeleton width="85%" height="16px"></uix-skeleton>
 * </div>
 * ```
 */
