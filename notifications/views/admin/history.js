/**
 * @bootstrapp/notifications - Admin History Page
 * Shows sent notifications history
 */
import T from "/$app/types/index.js";
import $APP from "/$app.js";
import { html, nothing } from "/npm/lit-html";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const truncate = (str, length = 50) => {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
};

export default {
  tag: "notifications-admin-history",
  style: true,
  properties: {
    notifications: T.array({ defaultValue: [] }),
    loading: T.boolean({ defaultValue: true }),
    filterType: T.string({ defaultValue: "all" }),
  },

  async connected() {
    await this.loadNotifications();
  },

  async loadNotifications() {
    this.loading = true;
    try {
      // Get all notifications (for admin view, we show all system notifications)
      const all = await $APP.Model.notifications.getAll({
        order: "-createdAt",
      });
      this.notifications = all || [];
    } catch (err) {
      console.error("Failed to load notifications:", err);
      this.notifications = [];
    }
    this.loading = false;
  },

  getFilteredNotifications() {
    if (this.filterType === "all") return this.notifications;
    return this.notifications.filter((n) => n.type === this.filterType);
  },

  setFilter(type) {
    this.filterType = type;
  },

  navigateToCompose() {
    $APP.Router.go("/admin/notifications/compose");
  },

  async deleteNotification(id) {
    if (confirm("Are you sure you want to delete this notification?")) {
      await $APP.Model.notifications.remove(id);
      this.notifications = this.notifications.filter((n) => n.id !== id);
    }
  },

  getTypeStats() {
    const stats = {};
    this.notifications.forEach((n) => {
      stats[n.type] = (stats[n.type] || 0) + 1;
    });
    return stats;
  },

  render() {
    if (this.loading) {
      return html`
        <div class="notifications-admin-loading">
          <uix-spinner size="lg"></uix-spinner>
        </div>
      `;
    }

    const filtered = this.getFilteredNotifications();
    const typeStats = this.getTypeStats();
    const types = ["all", "system", "announcement", "update", "like", "join", "follow", "mention"];

    return html`
      <div class="notifications-admin">
        <!-- Header -->
        <div class="notifications-admin-header">
          <div>
            <h1 class="notifications-admin-title">System Notifications</h1>
            <p class="notifications-admin-subtitle">Manage and send notifications to users</p>
          </div>
          <uix-button variant="primary" @click=${() => this.navigateToCompose()}>
            <uix-icon name="plus" size="sm"></uix-icon>
            Compose New
          </uix-button>
        </div>

        <!-- Stats -->
        <div class="notifications-admin-stats">
          <uix-card class="notifications-admin-stat-card">
            <div class="notifications-admin-stat-value">${this.notifications.length}</div>
            <div class="notifications-admin-stat-label">Total Sent</div>
          </uix-card>
          <uix-card class="notifications-admin-stat-card">
            <div class="notifications-admin-stat-value">${typeStats.system || 0}</div>
            <div class="notifications-admin-stat-label">System</div>
          </uix-card>
          <uix-card class="notifications-admin-stat-card">
            <div class="notifications-admin-stat-value">${typeStats.announcement || 0}</div>
            <div class="notifications-admin-stat-label">Announcements</div>
          </uix-card>
        </div>

        <!-- Filters -->
        <div class="notifications-admin-filters">
          ${types.map(
            (type) => html`
              <button
                class="notifications-admin-filter ${this.filterType === type ? "active" : ""}"
                @click=${() => this.setFilter(type)}
              >
                ${type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
                ${type !== "all" && typeStats[type] ? html`<span>(${typeStats[type]})</span>` : nothing}
              </button>
            `,
          )}
        </div>

        <!-- Table -->
        <uix-card class="notifications-admin-table-card">
          ${filtered.length > 0
            ? html`
                <table class="notifications-admin-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Title</th>
                      <th>Message</th>
                      <th>Recipient</th>
                      <th>Sent</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filtered.map(
                      (n) => html`
                        <tr>
                          <td>
                            <span class="notifications-admin-type-badge ${n.type}">${n.type}</span>
                          </td>
                          <td class="notifications-admin-cell-title">${truncate(n.title, 30)}</td>
                          <td class="notifications-admin-cell-message">${truncate(n.message, 40)}</td>
                          <td>${n.recipient || "—"}</td>
                          <td class="notifications-admin-cell-date">${formatDate(n.createdAt)}</td>
                          <td>
                            <button
                              class="notifications-admin-delete"
                              @click=${() => this.deleteNotification(n.id)}
                              title="Delete"
                            >
                              <uix-icon name="trash-2" size="sm"></uix-icon>
                            </button>
                          </td>
                        </tr>
                      `,
                    )}
                  </tbody>
                </table>
              `
            : html`
                <div class="notifications-admin-empty">
                  <uix-icon name="bell-off" size="xl" class="notifications-admin-empty-icon"></uix-icon>
                  <h3 class="notifications-admin-empty-title">No notifications found</h3>
                  <p class="notifications-admin-empty-message">
                    ${this.filterType === "all"
                      ? "Get started by composing a new notification"
                      : `No ${this.filterType} notifications yet`}
                  </p>
                  ${this.filterType === "all"
                    ? html`
                        <uix-button variant="primary" @click=${() => this.navigateToCompose()}>
                          Compose Notification
                        </uix-button>
                      `
                    : nothing}
                </div>
              `}
        </uix-card>
      </div>
    `;
  },
};
