export const version = 1;

import $APP from "/node_modules/@bootstrapp/base/app.js";
import T from "/node_modules/@bootstrapp/types/index.js";

$APP.models.set({
  users: {
    name: T.string(),
    avatar: T.string(),
    conversations: T.many("conversations", "user"),
  },
  tags: {
    name: T.string(),
    tagged: T.many("*", "tags", { polymorphic: true }),
  },
  conversations: {
    name: T.string(),
    user: T.belongs("users", "conversations"),
    server: T.belongs("servers", "conversations"),
    messages: T.many("messages", "chat"),
    createdAt: T.timestamp(),
  },
  messages: {
    content: T.string(),
    createdAt: T.timestamp(),
    role: T.string({ options: ["user", "assistant", "tool"] }),
    toolCalls: T.array(),
    toolCallId: T.string(),
    result: T.object(),
    chat: T.belongs("conversations", "messages"),
  },
});
