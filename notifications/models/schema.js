import T from "/$app/types/index.js";

export default {
  notifications: {
    id: T.string({ required: true }),
    recipient: T.belongs("users", { required: true }),
    sender: T.belongs("users"),
    type: T.string({
      required: true,
      enum: [
        "like",
        "join",
        "follow",
        "mention",
        "system",
        "announcement",
        "update",
      ],
      index: true,
    }),
    title: T.string({ required: true }),
    message: T.string({ required: true }),
    contentType: T.string({
      enum: ["place", "event", "meetup", "group", "guide"],
    }),
    contentSlug: T.string({ index: true }),
    read: T.boolean({ defaultValue: false, index: true }),
    createdAt: T.string({ required: true, index: true }),
    readAt: T.string(),
  },
};
