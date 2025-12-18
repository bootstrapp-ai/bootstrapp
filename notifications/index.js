/**
 * @bootstrapp/notifications
 * Notifications system for Bootstrapp framework
 *
 * Provides:
 * - Notifications schema
 * - Reusable UI components (item, list, drawer)
 * - Admin plugin for composing/sending notifications
 * - Helper methods for managing notifications
 */
import $APP from "/$app.js";

// Import admin plugin if admin module is available
const loadPlugin = async () => {
  try {
    await import("./plugin.js");
  } catch (e) {
    // Admin plugin not needed or admin module not loaded
  }
};

$APP.addModule({
  name: "notifications",
  path: "/$app/notifications/views",
  base: {
    /**
     * Get unread notification count for a user
     * @param {string} userId - The user ID
     * @returns {Promise<number>} Unread count
     */
    async getUnreadCount(userId) {
      if (!userId) return 0;
      const notifications = await $APP.Model.notifications.getAll({
        where: { recipient: userId, read: false },
      });
      return notifications?.length || 0;
    },

    /**
     * Mark a notification as read
     * @param {string} notificationId - The notification ID
     */
    async markAsRead(notificationId) {
      if (!notificationId) return;
      await $APP.Model.notifications.edit({
        id: notificationId,
        read: true,
        readAt: new Date().toISOString(),
      });
    },

    /**
     * Mark all notifications as read for a user
     * @param {string} userId - The user ID
     */
    async markAllAsRead(userId) {
      if (!userId) return;
      const unread = await $APP.Model.notifications.getAll({
        where: { recipient: userId, read: false },
      });
      await Promise.all(unread.map((n) => this.markAsRead(n.id)));
    },

    /**
     * Send notification to one or more users
     * @param {Object} options
     * @param {string|string[]} options.recipients - User ID(s) to send to
     * @param {string} options.title - Notification title
     * @param {string} options.message - Notification message
     * @param {string} [options.type='system'] - Notification type
     * @param {string} [options.contentType] - Content type (place, event, etc.)
     * @param {string} [options.contentSlug] - Content slug for linking
     * @param {string} [options.senderId] - Sender user ID
     * @returns {Promise<Object[]>} Created notifications
     */
    async send({
      recipients,
      title,
      message,
      type = "system",
      contentType,
      contentSlug,
      senderId,
    }) {
      const now = new Date().toISOString();
      const recipientList = Array.isArray(recipients) ? recipients : [recipients];

      return Promise.all(
        recipientList.map((userId) =>
          $APP.Model.notifications.add({
            recipient: userId,
            sender: senderId || null,
            type,
            title,
            message,
            contentType: contentType || null,
            contentSlug: contentSlug || null,
            read: false,
            createdAt: now,
          }),
        ),
      );
    },

    /**
     * Broadcast notification to all users
     * @param {Object} options - Same as send(), but no recipients needed
     * @returns {Promise<Object[]>} Created notifications
     */
    async broadcast({ title, message, type = "system", contentType, contentSlug, senderId }) {
      const users = await $APP.Model.users.getAll();
      return this.send({
        recipients: users.map((u) => u.id),
        title,
        message,
        type,
        contentType,
        contentSlug,
        senderId,
      });
    },

    /**
     * Delete a notification
     * @param {string} notificationId - The notification ID
     */
    async remove(notificationId) {
      if (!notificationId) return;
      await $APP.Model.notifications.remove(notificationId);
    },

    /**
     * Delete all notifications for a user
     * @param {string} userId - The user ID
     */
    async removeAllForUser(userId) {
      if (!userId) return;
      const notifications = await $APP.Model.notifications.getAll({
        where: { recipient: userId },
      });
      await Promise.all(notifications.map((n) => this.remove(n.id)));
    },
  },
});

// Load admin plugin after module is registered
loadPlugin();

export default $APP.notifications;
