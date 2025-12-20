import $APP from "/$app.js";
import T from "/$app/types/index.js";

$APP.addModule({
  name: "chat",
  root: true,
});

$APP.addModule({
  name: "mcp-chat",
  settings: {
    appbar: {
      label: "MCP Chat",
      icon: "bot-message-square",
    },
  },
});

$APP.models.set({
  users: {
    name: T.string(),
    avatar: T.string(),
    conversations: T.many("conversations", "user"),
  },
  conversations: {
    name: T.string(),
    user: T.belongs("users", "conversations"),
    server: T.belongs("servers", "conversations"),
    messages: T.many("messages", "chat"),
    createdAt: T.timestamp(),
    updatedAt: T.timestamp({ update: true }),
  },
  messages: {
    content: T.string(),
    timestamp: T.string({ index: true }),
    role: T.string({ options: ["user", "assistant", "tool"] }),
    toolCalls: T.array(),
    toolCallId: T.string(),
    result: T.object(),
    chat: T.belongs("conversations", "messages"),
  },
});

export const extension = {};
