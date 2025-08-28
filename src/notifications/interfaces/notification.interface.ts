export interface ICreateNotification {
  title: string;
  message: string;
  userId: string;
  imageUrl?: string;
  slug?: string;
  category?: string;
  priority?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface IUpdateNotification {
  id: string;
  isRead: boolean;
}

export interface IAddDeviceToken {
  userId: string;
  deviceToken: string;
  deviceId?: string;
  deviceType?: string;
  appVersion?: string;
}

export interface ISendTopicNotification {
  topic: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface ISubscribeToTopic {
  userId: string;
  deviceToken: string;
  topic: string;
}

export interface IUnsubscribeFromTopic {
  userId: string;
  deviceToken: string;
  topic: string;
}

export interface PushMessage {
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  };
  data: Record<string, any>;
}

export interface INotificationTemplate {
  slug: string;
  title: string;
  message: string;
  imageUrl?: string;
  category?: string;
  priority?: string;
  language?: string;
  metadata?: Record<string, any>;
}

export interface ISendNotificationWithTemplate {
  userId: string;
  templateSlug: string;
  data?: Record<string, any>;
  language?: string;
}
