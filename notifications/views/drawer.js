/**
 * @bootstrapp/notifications - Drawer Component
 * Quick-view drawer for notifications
 */
import T from "/$app/types/index.js";
import $APP from "/$app.js";
import { html, nothing } from "/npm/lit-html";

export default {
  tag: "notifications-drawer",
  style: true,
  properties: {
    open: T.boolean(false),
    notifications: T.array({ defaultValue: [] }),
    onClose: T.function({ attribute: false }),
    position: T.string({ defaultValue: "right" }),
    size: T.string({ defaultValue: "md" }),
    maxItems: T.number({ defaultValue: 5 }),
    showViewAll: T.boolean({ defaultValue: true }),
    viewAllUrl: T.string({ defaultValue: "/notifications" }),
    emptyIcon: T.string({ defaultValue: "bell-off" }),
    emptyMessage: T.string({ defaultValue: "No notifications yet" }),
  },

  async markAsRead(notification) {
    if (!notification.read) {
      await $APP.notifications.markAsRead(notification.id);
      this.notifications = this.notifications.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n,
      );
    }
  },

  handleNotificationClick(notification) {
    this.markAsRead(notification);
    this.onClose?.();
    if (notification.contentType && notification.contentSlug) {
      $APP.Router.go(`${notification.contentType}-detail`, {
        slug: notification.contentSlug,
      });
    }
  },

  viewAll() {
    this.onClose?.();
    $APP.Router.go(this.viewAllUrl);
  },

  getUnreadCount() {
    return (this.notifications || []).filter((n) => !n.read).length;
  },

  render() {
    const unreadCount = this.getUnreadCount();
    const recentNotifications = (this.notifications || []).slice(0, this.maxItems);

    return html`
      <uix-drawer
        position=${this.position}
        ?open=${this.open}
        @drawer-closed=${() => this.onClose?.()}
        size=${this.size}
      >
        <div class="notifications-drawer">
          <!-- Header -->
          <div class="notifications-drawer-header">
            <div class="notifications-drawer-title-wrapper">
              <h2 class="notifications-drawer-title">Notifications</h2>
              ${unreadCount > 0
                ? html`<span class="notifications-drawer-badge">${unreadCount}</span>`
                : nothing}
            </div>
            <button
              @click=${() => this.onClose?.()}
              class="notifications-drawer-close"
              aria-label="Close"
            >
              <uix-icon name="x" size="sm"></uix-icon>
            </button>
          </div>

          <!-- Notifications List -->
          <div class="notifications-drawer-content">
            ${recentNotifications.length > 0
              ? recentNotifications.map(
                  (n) => html`
                    <notifications-item
                      .notification=${n}
                      .onClick=${(notif) => this.handleNotificationClick(notif)}
                      compact
                    ></notifications-item>
                  `,
                )
              : html`
                  <div class="notifications-drawer-empty">
                    <uix-icon name=${this.emptyIcon} size="lg" class="notifications-drawer-empty-icon"></uix-icon>
                    <p class="notifications-drawer-empty-message">${this.emptyMessage}</p>
                  </div>
                `}
          </div>

          <!-- Footer -->
          ${this.showViewAll && this.notifications.length > 0
            ? html`
                <div class="notifications-drawer-footer">
                  <button @click=${() => this.viewAll()} class="notifications-drawer-view-all">
                    View All Notifications
                  </button>
                </div>
              `
            : nothing}
        </div>
      </uix-drawer>
    `;
  },
};
