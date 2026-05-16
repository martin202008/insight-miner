export interface ChannelConfig {
  platform: 'douyin' | 'xiaohongshu' | 'kuaishou' | 'bilibili';
  appId: string;
  appSecret: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface PublishResult {
  success: boolean;
  platformId: string;
  externalId?: string;
  url?: string;
  error?: string;
}

export interface ContentPayload {
  title: string;
  description: string;
  coverImage?: string;
  videoPath?: string;
  tags?: string[];
}

export interface ChannelPlatform {
  id: string;
  name: string;
  icon: string;
  publish(content: ContentPayload, config: ChannelConfig): Promise<PublishResult>;
  refreshToken?(config: ChannelConfig): Promise<ChannelConfig>;
}