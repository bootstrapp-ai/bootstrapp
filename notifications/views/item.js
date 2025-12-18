/**
 * @bootstrapp/notifications - Notification Item Component
 * Reusable component to display a single notification
 */
import T from "/$app/types/index.js";
import { html, nothing } from "/npm/lit-html";

const NOTIFICATION_ICONS = {
  like: { icon: "heart", colorClass: "notifications-icon-like" },
  join: { icon: "user-plus", colorClass: "notifications-icon-join" },
  follow: { icon: "user-check", colorClass: "notifications-icon-follow" },
  mention: { icon: "at-sign", colorClass: "notifications-icon-mention" },
  system: { icon: "bell", colorClass: "notifications-icon-system" },
  announcement: { icon: "megaphone", colorClass: "notifications-icon-announcement" },
  update: { icon: "refresh-cw", colorClass: "notifications-icon-update" },
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default {
  tag: "notifications-item",
  style: true,
  properties: {
    notification: T.object({ attribute: false }),
    onClick: T.function({ attribute: false }),
    compact: T.boolean({ defaultValue: false }),
  },

  handleClick() {
    if (this.onClick) {
      this.onClick(this.notification);
    }
  },

  render() {
    const n = this.notification;
    if (!n) return nothing;

    const iconInfo = NOTIFICATION_ICONS[n.type] || NOTIFICATION_ICONS.system;
    const isUnread = !n.read;

    return html`
      <div
        class="notifications-item ${isUnread ? "unread" : ""} ${this.compact ? "compact" : ""}"
        @click=${() => this.handleClick()}
        role="button"
        tabindex="0"
      >
        <div class="notifications-item-icon ${iconInfo.colorClass}">
          <uix-icon name=${iconInfo.icon} size="sm"></uix-icon>
        </div>
        <div class="notifications-item-content">
          <div class="notifications-item-header">
            <span class="notifications-item-title">${n.title}</span>
            ${isUnread
              ? html`<span class="notifications-item-unread-dot"></span>`
              : nothing}
          </div>
          <p class="notifications-item-message">${n.message}</p>
          <span class="notifications-item-time">${formatTimeAgo(n.createdAt)}</span>
        </div>
      </div>
    `;
  },
};
