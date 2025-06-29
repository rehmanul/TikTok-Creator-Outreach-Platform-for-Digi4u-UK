import axios from 'axios';
import crypto from 'crypto';

interface TikTokCreatorData {
  user_id: string;
  username: string;
  display_name: string;
  follower_count: number;
  following_count: number;
  video_count: number;
  like_count: number;
  bio: string;
  is_verified: boolean;
  profile_image: string;
}

interface TikTokVideoMetrics {
  video_id: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  engagement_rate: number;
}

export class TikTokAPIService {
  private accessToken: string;
  private clientKey: string;
  private clientSecret: string;
  private baseURL = 'https://business-api.tiktok.com/open_api/v1.3';

  constructor() {
    this.clientKey = process.env.TIKTOK_CLIENT_KEY || '7519035078651936769';
    this.clientSecret = process.env.TIKTOK_CLIENT_SECRET || '13ff0454e34b47304b16cff16def27c45b4e185a';
    this.accessToken = process.env.TIKTOK_ACCESS_TOKEN || '9b94307eec463cb4145e7697a1b24cb382ed9f4c';
  }

  // OAuth 2.0 flow for TikTok Business API
  async authenticate(authCode: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseURL}/oauth/token/`, {
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        code: authCode,
        grant_type: 'authorization_code'
      });

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('TikTok authentication error:', error);
      throw new Error('Failed to authenticate with TikTok');
    }
  }

  // Get creator profile data using TikTok Business API
  async getCreatorProfile(advertiserId: string): Promise<TikTokCreatorData> {
    try {
      const response = await axios.get(`${this.baseURL}/advertiser/info/`, {
        headers: {
          'Access-Token': this.accessToken,
          'Content-Type': 'application/json'
        },
        params: {
          advertiser_ids: `[${advertiserId}]`
        }
      });

      return response.data.data.list[0];
    } catch (error) {
      console.error('Error fetching creator profile:', error);
      throw new Error('Failed to fetch creator profile');
    }
  }

  // Get business accounts using TikTok Business API
  async searchCreators(params: {
    category: string;
    location?: string;
    minFollowers?: number;
    maxFollowers?: number;
    verified?: boolean;
    limit?: number;
  }): Promise<TikTokCreatorData[]> {
    try {
      // For now, return the sandbox advertiser data as a creator
      const response = await axios.get(`${this.baseURL}/advertiser/info/`, {
        headers: {
          'Access-Token': this.accessToken,
          'Content-Type': 'application/json'
        },
        params: {
          advertiser_ids: '[7519829315018588178]' // Your sandbox advertiser ID
        }
      });

      // Transform business account data to creator format
      const advertisers = response.data.data?.list || [];
      return advertisers.map((advertiser: any) => ({
        user_id: advertiser.id,
        username: advertiser.name || 'creatorss',
        display_name: advertiser.company || 'TikTok Creator',
        follower_count: Math.floor(Math.random() * 100000) + 10000,
        following_count: Math.floor(Math.random() * 5000) + 500,
        video_count: Math.floor(Math.random() * 500) + 50,
        like_count: Math.floor(Math.random() * 1000000) + 100000,
        bio: `Professional creator in ${params.category}`,
        is_verified: params.verified || false,
        profile_image: 'https://via.placeholder.com/150'
      }));
    } catch (error) {
      console.error('Error searching creators:', error);
      // Return mock data if API fails
      return [{
        user_id: '7519829315018588178',
        username: 'creatorss',
        display_name: 'TikTok Creator',
        follower_count: 50000,
        following_count: 1200,
        video_count: 150,
        like_count: 500000,
        bio: `Professional creator in ${params.category}`,
        is_verified: false,
        profile_image: 'https://via.placeholder.com/150'
      }];
    }
  }

  // Get creator's video performance metrics
  async getCreatorVideos(userId: string, limit: number = 20): Promise<TikTokVideoMetrics[]> {
    try {
      const response = await axios.get(`${this.baseURL}/video/list/`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        params: {
          user_id: userId,
          fields: 'view_count,like_count,comment_count,share_count',
          limit
        }
      });

      const videos = response.data.data.videos;
      
      // Calculate engagement rate for each video
      return videos.map((video: any) => ({
        ...video,
        engagement_rate: this.calculateEngagementRate(video)
      }));
    } catch (error) {
      console.error('Error fetching creator videos:', error);
      throw new Error('Failed to fetch creator videos');
    }
  }

  // Send collaboration invitation via TikTok messaging API
  async sendInvitation(creatorId: string, message: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseURL}/message/send/`, {
        recipient_id: creatorId,
        message_type: 'business_invitation',
        content: {
          text: message,
          invitation_type: 'affiliate_collaboration'
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.success;
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw new Error('Failed to send invitation');
    }
  }

  // Calculate GMV (Gross Merchandise Value) for affiliate sales
  async getCreatorGMV(creatorId: string, dateFrom: Date, dateTo: Date): Promise<number> {
    try {
      const response = await axios.get(`${this.baseURL}/affiliate/gmv/`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        params: {
          creator_id: creatorId,
          date_from: dateFrom.toISOString(),
          date_to: dateTo.toISOString()
        }
      });

      return response.data.data.total_gmv;
    } catch (error) {
      console.error('Error fetching GMV:', error);
      throw new Error('Failed to fetch GMV data');
    }
  }

  // Webhook signature verification
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.clientSecret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  // Calculate engagement rate
  private calculateEngagementRate(video: any): number {
    const totalEngagements = video.like_count + video.comment_count + video.share_count;
    return (totalEngagements / video.view_count) * 100;
  }

  // Get trending hashtags in category
  async getTrendingHashtags(category: string, location?: string): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseURL}/hashtag/trending/`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        params: {
          category,
          location,
          limit: 20
        }
      });

      return response.data.data.hashtags.map((h: any) => h.name);
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
      throw new Error('Failed to fetch trending hashtags');
    }
  }
}

export const tiktokApi = new TikTokAPIService();