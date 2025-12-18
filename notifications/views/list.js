/**
 * @bootstrapp/notifications - List Component
 * Full notification list with grouping by date
 */
import T from "/$app/types/index.js";
import $APP from "/$app.js";
import { html, nothing } from "/npm/lit-html";

const groupByDate = (notifications) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  (notifications || []).forEach((n) => {
    const date = new Date(n.createdAt);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      groups.today.push(n);
    } else if (date.getTime() === yesterday.getTime()) {
      groups.yesterday.push(n);
    } else if (date >= weekAgo) {
      groups.thisWeek.push(n);
    } else {
      groups.older.push(n);
    }
  });

  return groups;
};

export default {
  tag: "notifications-list",
  style: true,
  properties: {
    notifications: T.array({ defaultValue: [] }),
    userId: T.string(),
    loading: T.boolean(true),
    showHeader: T.boolean({ defaultValue: true }),
    emptyIcon: T.string({ defaultValue: "bell-off" }),
    emptyTitle: T.string({ defaultValue: "No Notifications" }),
    emptyMessage: T.string({ defaultValue: "You're all caught up!" }),
    onNotificationClick: T.function({ attribute: false }),
  },

  async connected() {
    this.userId = $APP.Auth.isAuthenticated ? $APP.Auth.currentUserId : null;
    if (this.userId) {
      await this.loadNotifications();
    } else {
      this.loading = false;
    }
  },

  async loadNotifications() {
    try {
      const notifications = await $APP.Model.notifications.getAll({
        where: { recipient: this.userId },
        order: "-createdAt",
      });
      this.notifications = notifications || [];
    } catch (err) {
      console.error("Failed to load notifications:", err);
      this.notifications = [];
    }
    this.loading = false;
  },

  async markAsRead(notification) {
    if (!notification.read) {
      await $APP.notifications.markAsRead(notification.id);
      this.notifications = this.notifications.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n,
      );
    }
  },

  async markAllAsRead() {
    await $APP.notifications.markAllAsRead(this.userId);
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
  },

  handleNotificationClick(notification) {
    this.markAsRead(notification);
    if (this.onNotificationClick) {
      this.onNotificationClick(notification);
    } else if (notification.contentType && notification.contentSlug) {
      $APP.Router.go(`${notification.contentType}-detail`, {
        slug: notification.contentSlug,
      });
    }
  },

  getUnreadCount() {
    return (this.notifications || []).filter((n) => !n.read).length;
  },

  renderSection(title, items) {
    if (!items || items.length === 0) return nothing;

    return html`
      <div class="notifications-list-section">
        <h3 class="notifications-list-section-title">${title}</h3>
        <div class="notifications-list-section-content">
          ${items.map(
            (n) => html`
              <notifications-item
                .notification=${n}
                .onClick=${(notif) => this.handleNotificationClick(notif)}
              ></notifications-item>
            `,
          )}
        </div>
      </div>
    `;
  },

  renderEmpty() {
    return html`
      <div class="notifications-list-empty">
        <uix-icon name=${this.emptyIcon} size="xl" class="notifications-list-empty-icon"></uix-icon>
        <h3 class="notifications-list-empty-title">${this.emptyTitle}</h3>
        <p class="notifications-list-empty-message">${this.emptyMessage}</p>
      </div>
    `;
  },

  renderLoading() {
    return html`
      <div class="notifications-list-loading">
        <uix-spinner size="lg"></uix-spinner>
      </div>
    `;
  },

  renderLoginRequired() {
    return html`
      <div class="notifications-list-login">
        <uix-icon name="bell" size="xl" class="notifications-list-login-icon"></uix-icon>
        <h3 class="notifications-list-login-title">Login Required</h3>
        <p class="notifications-list-login-message">Sign in to see your notifications</p>
      </div>
    `;
  },

  render() {
    if (this.loading) return this.renderLoading();
    if (!this.userId) return this.renderLoginRequired();

    const unreadCount = this.getUnreadCount();
    const grouped = groupByDate(this.notifications);

    return html`
      <div class="notifications-list">
        ${this.showHeader
          ? html`
              <div class="notifications-list-header">
                <h2 class="notifications-list-title">Notifications</h2>
                ${unreadCount > 0
                  ? html`
                      <button
                        @click=${() => this.markAllAsRead()}
                        class="notifications-list-mark-all"
                      >
                        Mark all read
                      </button>
                    `
                  : nothing}
              </div>
              ${unreadCount > 0
                ? html`
                    <div class="notifications-list-unread-badge">
                      <span>${unreadCount} unread</span>
                    </div>
                  `
                : nothing}
            `
          : nothing}

        ${this.notifications.length > 0
          ? html`
              <div class="notifications-list-groups">
                ${this.renderSection("Today", grouped.today)}
                ${this.renderSection("Yesterday", grouped.yesterday)}
                ${this.renderSection("This Week", grouped.thisWeek)}
                ${this.renderSection("Older", grouped.older)}
              </div>
            `
          : this.renderEmpty()}
      </div>
    `;
  },
};
