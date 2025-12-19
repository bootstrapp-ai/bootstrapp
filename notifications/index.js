import $APP from "/$app.js";

const loadPlugin = async () => {
  try {
    await import("./plugin.js");
  } catch (e) {
  }
};

$APP.addModule({
  name: "notifications",
  path: "/$app/notifications/views",
  base: {
    async getUnreadCount(userId) {
      if (!userId) return 0;
      const notifications = await $APP.Model.notifications.getAll({
        where: { recipient: userId, read: false },
      });
      return notifications?.length || 0;
    },

    async markAsRead(notificationId) {
      if (!notificationId) return;
      await $APP.Model.notifications.edit({
        id: notificationId,
        read: true,
        readAt: new Date().toISOString(),
      });
    },

    async markAllAsRead(userId) {
      if (!userId) return;
      const unread = await $APP.Model.notifications.getAll({
        where: { recipient: userId, read: false },
      });
      await Promise.all(unread.map((n) => this.markAsRead(n.id)));
    },

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

    async remove(notificationId) {
      if (!notificationId) return;
      await $APP.Model.notifications.remove(notificationId);
    },

    async removeAllForUser(userId) {
      if (!userId) return;
      const notifications = await $APP.Model.notifications.getAll({
        where: { recipient: userId },
      });
      await Promise.all(notifications.map((n) => this.remove(n.id)));
    },
  },
});

loadPlugin();

export default $APP.notifications;
