import T from "../types/index.js";

export default {
  name: "@bootstrapp/notifications",
  exports: {
    notifications: {
      $interface: true,

      getUnreadCount: T.function({
        description: "Get unread notification count for a user",
        args: [T.string({ name: "userId", description: "The user ID" })],
        returns: T.number({ description: "Unread count" }),
      }),

      markAsRead: T.function({
        description: "Mark a notification as read",
        args: [T.string({ name: "notificationId", description: "The notification ID" })],
        returns: T.any(),
      }),

      markAllAsRead: T.function({
        description: "Mark all notifications as read for a user",
        args: [T.string({ name: "userId", description: "The user ID" })],
        returns: T.any(),
      }),

      send: T.function({
        description: "Send notification to one or more users",
        args: [
          T.object({
            name: "options",
            description: "{ recipients, title, message, type?, contentType?, contentSlug?, senderId? }",
          }),
        ],
        returns: T.array({ description: "Created notifications" }),
      }),

      broadcast: T.function({
        description: "Broadcast notification to all users",
        args: [
          T.object({
            name: "options",
            description: "{ title, message, type?, contentType?, contentSlug?, senderId? }",
          }),
        ],
        returns: T.array({ description: "Created notifications" }),
      }),

      remove: T.function({
        description: "Delete a notification",
        args: [T.string({ name: "notificationId", description: "The notification ID" })],
        returns: T.any(),
      }),

      removeAllForUser: T.function({
        description: "Delete all notifications for a user",
        args: [T.string({ name: "userId", description: "The user ID" })],
        returns: T.any(),
      }),
    },

    SendOptions: {
      $interface: true,
      recipients: T.any({ description: "User ID or array of user IDs to send to" }),
      title: T.string({ description: "Notification title" }),
      message: T.string({ description: "Notification message" }),
      type: T.string({ description: "Notification type: like, join, follow, mention, system, announcement, update" }),
      contentType: T.string({ description: "Content type: place, event, meetup, group, guide" }),
      contentSlug: T.string({ description: "Content slug for linking" }),
      senderId: T.string({ description: "Sender user ID" }),
    },

    BroadcastOptions: {
      $interface: true,
      title: T.string({ description: "Notification title" }),
      message: T.string({ description: "Notification message" }),
      type: T.string({ description: "Notification type" }),
      contentType: T.string({ description: "Content type for linking" }),
      contentSlug: T.string({ description: "Content slug for linking" }),
      senderId: T.string({ description: "Sender user ID" }),
    },

    NotificationSchema: {
      $interface: true,
      id: T.string({ description: "Notification ID" }),
      recipient: T.string({ description: "Recipient user ID" }),
      sender: T.string({ description: "Sender user ID (optional)" }),
      type: T.string({ description: "Notification type" }),
      title: T.string({ description: "Notification title" }),
      message: T.string({ description: "Notification message" }),
      contentType: T.string({ description: "Content type for linking" }),
      contentSlug: T.string({ description: "Content slug for linking" }),
      read: T.boolean({ description: "Whether notification has been read" }),
      createdAt: T.string({ description: "Creation timestamp" }),
      readAt: T.string({ description: "Read timestamp" }),
    },
  },
};
