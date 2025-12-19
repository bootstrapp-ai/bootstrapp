/**
 * Generated from @bootstrapp/notifications
 * @generated
 */

  export interface notifications {
    getUnreadCount(userId: string): number;
    markAsRead(notificationId: string): any;
    markAllAsRead(userId: string): any;
    send(options: Record<string, any>): any[];
    broadcast(options: Record<string, any>): any[];
    remove(notificationId: string): any;
    removeAllForUser(userId: string): any;
  }

  export interface SendOptions {
    recipients?: any;
    title?: string;
    message?: string;
    type?: string;
    contentType?: string;
    contentSlug?: string;
    senderId?: string;
  }

  export interface BroadcastOptions {
    title?: string;
    message?: string;
    type?: string;
    contentType?: string;
    contentSlug?: string;
    senderId?: string;
  }

  export interface NotificationSchema {
    id?: string;
    recipient?: string;
    sender?: string;
    type?: string;
    title?: string;
    message?: string;
    contentType?: string;
    contentSlug?: string;
    read?: boolean;
    createdAt?: string;
    readAt?: string;
  }

export default notifications;
