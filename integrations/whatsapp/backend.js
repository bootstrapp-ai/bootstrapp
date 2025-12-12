import Model from "/node_modules/@bootstrapp/model/index.js";
import T from "/node_modules/@bootstrapp/types/index.js";

if (self.chrome) {
  (async () => {
    const commandRegistry = new Map();

    // Message type constants
    const WA_EVENTS = {
      SEND_MESSAGE: "WHATSAPP_SEND_MESSAGE",
      JOIN_GROUP: "WHATSAPP_JOIN_GROUP",
      LEAVE_GROUP: "WHATSAPP_LEAVE_GROUP",
    };

    // Create standard message structure
    const createCommand = (type, payload) => ({
      type,
      payload,
      mv3: true,
    });

    // Send message to tab with standard structure
    const sendToWA = (tabId, type, payload) => {
      const message = createCommand(type, payload);
      console.log("Sending to tab:", { tabId, message });
      return self.chrome.tabs.sendMessage(tabId, message);
    };

    // WhatsApp action creators
    const WAActions = {
      sendMessage: (tabId, chatId, message) =>
        sendToWA(tabId, WA_EVENTS.SEND_MESSAGE, {
          chatId,
          message,
        }),

      joinGroup: (tabId, groupLink) =>
        sendToWA(tabId, WA_EVENTS.JOIN_GROUP, {
          groupLink,
        }),

      leaveGroup: (tabId, groupId) =>
        sendToWA(tabId, WA_EVENTS.LEAVE_GROUP, {
          groupId,
        }),
    };

    const registerCommand = (name, { handler, requiredRank }) => {
      commandRegistry.set(name, { handler, requiredRank });
    };

    // Permission Helpers
    const checkRankPermission = async (phoneNumber, requiredRank) => {
      const user = await Model.get("users", { phoneNumber });
      return user && user.rank >= requiredRank;
    };

    const ensureUser = async (phoneNumber) => {
      let user = await Model.get("users", { phoneNumber });
      if (!user) {
        const existingUsers = await Model.getMany("users", {
          limit: 1,
        });
        const isFirstUser = existingUsers.count === 0;

        user = await Model.add("users", {
          phoneNumber,
          status: "active",
          role: isFirstUser ? "admin" : "user",
          rank: isFirstUser ? 9999 : 1,
          createdAt: new Date(),
          lastActivity: new Date(),
        });
      }
      return user;
    };
    // Command Handlers
    const commandHandlers = {
      join: {
        name: "join",
        requiredRank: 9999,
        handler: async (params, from, tabId) => {
          const hasPermission = await checkRankPermission(
            from,
            commandHandlers.join.requiredRank,
          );
          if (!hasPermission) {
            WAActions.sendMessage(
              tabId,
              from,
              "You don't have permission to use this command. Required rank: 9999",
            );
            return;
          }

          if (params.length < 1) {
            WAActions.sendMessage(tabId, from, "Please provide a group link");
            return;
          }
          const groupLink = params[0];
          WAActions.joinGroup(tabId, groupLink);
        },
      },

      leave: {
        name: "leave",
        requiredRank: 100,
        handler: async (params, from, tabId) => {
          const hasPermission = await checkRankPermission(
            from,
            commandHandlers.leave.requiredRank,
          );
          if (!hasPermission) {
            WAActions.sendMessage(
              tabId,
              from,
              `You don't have permission to use this command. Required rank: ${commandHandlers.leave.requiredRank}`,
            );
            return;
          }

          if (params.length < 1) {
            WAActions.sendMessage(tabId, from, "Please provide a group ID");
            return;
          }
          const groupId = params[0];
          WAActions.leaveGroup(tabId, groupId);
        },
      },

      echo: {
        name: "echo",
        requiredRank: 1,
        handler: async (params, from, tabId) => {
          const hasPermission = await checkRankPermission(
            from,
            commandHandlers.echo.requiredRank,
          );
          if (!hasPermission) {
            WAActions.sendMessage(
              tabId,
              from,
              `You don't have permission to use this command. Required rank: ${commandHandlers.echo.requiredRank}`,
            );
            return;
          }

          const message = params.join(" ");
          WAActions.sendMessage(tabId, from, message);
        },
      },

      help: {
        name: "help",
        requiredRank: 1,
        handler: async (params, from, tabId) => {
          const user = await Model.get("users", from);
          const userRank = user?.rank || 1;

          const availableCommands = Array.from(commandRegistry.entries())
            .filter(([_, command]) => command.requiredRank <= userRank)
            .map(
              ([name, command]) => `/${name} (Rank ${command.requiredRank})`,
            );

          const helpMessage = `Available commands for your rank (${userRank}):\n${availableCommands.join("\n")}`;
          WAActions.sendMessage(tabId, from, helpMessage);
        },
      },

      rank: {
        name: "rank",
        requiredRank: 1,
        handler: async (params, from, tabId) => {
          const user = await Model.get("users", from);
          WAActions.sendMessage(
            tabId,
            from,
            `Your current rank is: ${user.rank}`,
          );
        },
      },
    };

    // Message Processing
    const processCommand = async (message, tabId) => {
      if (message.isMe || message.isGroup) {
        console.log("group message or me, doing nothing");
        return;
      }

      const { command, params, from } = message;
      const handler = commandRegistry.get(command);
      await Model.add("messages", {
        messageId: $APP.Backend.generateId(),
        body: `/${command} ${params.join(" ")}`,
        sender: from,
        timestamp: new Date(),
        isCommand: true,
        command,
        params,
        status: "processing",
      });

      if (handler) {
        await handler.handler(params, from, tabId);
      } else {
        WAActions.sendMessage(tabId, from, `Unknown command: ${command}`);
      }
    };

    const handleWhatsAppMessage = async (payload, tabId) => {
      const { from, body, isCommand, command, params } = payload;
      const shouldReply = !(payload.isMe || payload.isGroup);

      // Ensure user exists and update last activity
      await ensureUser(from);

      // Store message
      const message = {
        ...payload,
        messageId: payload.id,
        body,
        sender: from,
        timestamp: new Date(),
        isCommand,
        command: isCommand ? command : null,
        params: isCommand ? params : [],
        status: "pending",
      };

      await Model.add("messages", message);

      if (shouldReply && isCommand) {
        await processCommand(message, tabId);
      } else {
        console.log("Regular message:", body);
      }
    };

    // Event Handlers
    const events = {
      WHATSAPP_NEW_MESSAGE: async (payload, sender) => {
        await handleWhatsAppMessage(payload, sender.tab.id);
      },
    };
    $APP.mv3Events.set(events);

    // Register default commands
    Object.values(commandHandlers).forEach(
      ({ name, handler, requiredRank }) => {
        registerCommand(name, { handler, requiredRank });
      },
    );

    const CONTENT_SCRIPTS = [
      {
        id: "whatsapp_wppconnect",
        matches: ["https://web.whatsapp.com/*"],
        js: ["modules/whatsapp/wppconnect.js"],
        runAt: "document_start",
        world: "MAIN", // Runs in the page's JS context
      },
      {
        id: "whatsapp_index",
        matches: ["https://web.whatsapp.com/*"],
        js: ["modules/whatsapp/index.mv3.js"],
        runAt: "document_idle",
        world: "MAIN", // Runs in the same context as wppconnect.js
      },
    ];

    $APP.mv3ContentScripts.add(...CONTENT_SCRIPTS);
  })();
}

$APP.models.set({
  /* Core User and Group Models - Shared between both systems */
  members: {
    phoneNumber: T.string({ primary: true }),
    name: T.string(),
    status: T.string({
      enum: ["pending", "active", "blocked"],
      defaultValue: "pending",
      index: true,
    }),
    rank: T.number({ defaultValue: 1 }),
    lastActivity: T.date(),
    createdAt: T.date(),
    joinedAt: T.date(),
    groups: T.many("groupMembers", "user"),
    messages: T.many("messages", "sender"),
    settings: T.object({
      defaultValue: {
        notifications: true,
        timezone: "UTC",
      },
    }),
    karmaPoints: T.number({ defaultValue: 0 }),
  },

  groups: {
    groupId: T.string({ primary: true }),
    name: T.string(),
    inviteLink: T.string(),
    description: T.string(),
    createdAt: T.date(),
    lastActivity: T.date(),
    members: T.many("groupMembers", "group"),
    messages: T.many("messages", "group"),
    waEvents: T.many("waEvents", "group"),
    settings: T.object({
      defaultValue: {
        commandsEnabled: true,
        adminOnly: false,
        language: "en",
        karmaEnabled: true,
      },
    }),
  },

  groupMembers: {
    id: T.string({ primary: true }),
    group: T.one("groups", "members"),
    user: T.one("members", "groups"),
    role: T.string({
      enum: ["member", "admin"],
      defaultValue: "member",
      index: true,
    }),
    status: T.string({
      enum: ["active", "left", "removed"],
      defaultValue: "active",
      index: true,
    }),
    joinedAt: T.date(),
    leftAt: T.date(),
  },
  /* Analytics System Specific Models */
  reactions: {
    id: T.string({ primary: true }),
    type: T.string(),
    timestamp: T.date({ index: true }),
    user: T.one("members", "reactions"),
    targetUser: T.one("members", "receivedReactions"),
    message: T.one("messages", "reactions"),
    karmaValue: T.number({ defaultValue: 1 }),
  },

  waEvents: {
    id: T.string({ primary: true }),
    type: T.string({
      enum: ["join", "leave", "remove"],
      index: true,
    }),
    timestamp: T.date({ index: true }),
    user: T.one("members", "waEvents"),
    group: T.one("groups", "waEvents"),
    performedBy: T.one("members", "actionsPerformed", { optional: true }),
  },

  karmaRules: {
    id: T.string({ primary: true }),
    name: T.string(),
    action: T.string({
      enum: [
        "message_sent",
        "reaction_received",
        "daily_activity",
        "weekly_activity",
      ],
    }),
    points: T.number(),
    active: T.boolean({ defaultValue: true }),
  },

  dailyStats: {
    id: T.string({ primary: true }),
    date: T.date({ index: true }),
    group: T.one("groups", "stats"),
    messageCount: T.number({ defaultValue: 0 }),
    activeMembers: T.number({ defaultValue: 0 }),
    reactionCount: T.number({ defaultValue: 0 }),
    newMembers: T.number({ defaultValue: 0 }),
    departedMembers: T.number({ defaultValue: 0 }),
    topPosters: T.array(),
    topReactions: T.array(),
    hourlyActivity: T.array({
      defaultValue: Array(24).fill(0),
    }),
  },

  /* Shared Message System - Used by both Command and Analytics */
  messages: {
    messageId: T.string({ primary: true }),
    type: T.string({
      enum: ["text", "image", "video", "audio", "document", "sticker"],
      index: true,
    }),
    body: T.string(),
    timestamp: T.date({ index: true }),
    sender: T.one("members", "messages"),
    group: T.one("groups", "messages", { optional: true }),

    // Command related
    isMe: T.boolean({ defaultValue: false, index: true }),
    isGroup: T.boolean({ defaultValue: false, index: true }),
    isCommand: T.boolean({ defaultValue: false, index: true }),
    command: T.string({ optional: true }),
    params: T.array({ defaultValue: [] }),
    parentMessage: T.one("messages", "childMessages", { optional: true }),
    childMessages: T.many("messages", "parentMessage"),
    commandContext: T.one("commandContexts", "messages", { optional: true }),

    // Processing
    status: T.string({
      enum: ["pending", "processing", "completed", "failed", "expired"],
      defaultValue: "pending",
      index: true,
    }),
    processedAt: T.date({ optional: true }),
    error: T.string({ optional: true }),

    // Analytics related
    deleted: T.boolean({ defaultValue: false }),
    reactions: T.many("reactions", "message"),
    replyCount: T.number({ defaultValue: 0 }),

    // Metadata
    metadata: T.object({
      defaultValue: {
        media: null,
        quotedMessage: null,
        mentions: [],
        buttons: null,
        location: null,
      },
    }),
  },
});
