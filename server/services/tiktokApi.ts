
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
  engagement_rate?: number;
  avg_views?: number;
  categories?: string[];
  location?: string;
}

interface AutomationConfig {
  dailyInviteLimit: number;
  delayBetweenInvites: number; // milliseconds
  maxRetries: number;
  personalizedMessages: boolean;
}

interface CampaignAutomationResult {
  totalInvitesSent: number;
  successfulInvites: number;
  failedInvites: number;
  errors: string[];
  nextRunTime?: Date;
}

export class TikTokAPIService {
  private accessToken: string;
  private clientKey: string;
  private clientSecret: string;
  private advertiserId: string;
  private baseURL = 'https://business-api.tiktok.com/open_api/v1.3';
  private creatorMarketplaceURL = 'https://business-api.tiktok.com/creator_marketplace/v1';
  private automationConfig: AutomationConfig;

  constructor() {
    this.clientKey = process.env.TIKTOK_CLIENT_KEY || '7519035078651936769';
    this.clientSecret = process.env.TIKTOK_CLIENT_SECRET || '';
    this.advertiserId = process.env.TIKTOK_ADVERTISER_ID || '7519829315018588178';
    this.accessToken = process.env.TIKTOK_ACCESS_TOKEN || '';
    
    // Default automation configuration following TikTok policies
    this.automationConfig = {
      dailyInviteLimit: 50, // Conservative limit to avoid spam detection
      delayBetweenInvites: 120000, // 2 minutes between invites
      maxRetries: 3,
      personalizedMessages: true
    };
  }

  // Clear stored tokens
  clearTokens(): void {
    this.accessToken = '';
    console.log('TikTok tokens cleared');
  }

  // Check if we have a valid token
  hasValidToken(): boolean {
    return !!this.accessToken && this.accessToken.length > 0;
  }

  // OAuth 2.0 authentication with TikTok Business API
  async authenticate(authCode: string): Promise<string> {
    try {
      console.log('TikTok authentication attempt with:', {
        baseURL: this.baseURL,
        clientKey: this.clientKey?.substring(0, 10) + '...',
        authCode: authCode?.substring(0, 10) + '...',
        hasClientSecret: !!this.clientSecret
      });

      if (!this.clientSecret) {
        throw new Error('TIKTOK_CLIENT_SECRET environment variable is required');
      }

      // Clear any existing tokens before new authentication
      this.clearTokens();

      const requestData = {
        app_id: this.clientKey,
        secret: this.clientSecret,
        auth_code: authCode,
        grant_type: 'authorization_code'
      };

      console.log('Making request to TikTok OAuth endpoint...');
      const response = await axios.post(`${this.baseURL}/oauth2/access_token/`, requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('TikTok OAuth response:', {
        status: response.status,
        code: response.data?.code,
        message: response.data?.message
      });

      if (response.data.code === 0 && response.data.data?.access_token) {
        this.accessToken = response.data.data.access_token;
        console.log('TikTok authentication successful, token length:', this.accessToken.length);
        return this.accessToken;
      } else {
        console.error('TikTok authentication failed:', {
          code: response.data.code,
          message: response.data.message,
          data: response.data.data
        });
        
        // Handle specific error cases
        if (response.data.message) {
          if (response.data.message.includes('Auth_code is used')) {
            throw new Error('Auth_code is used，please re-authorize.');
          }
          if (response.data.message.includes('invalid_grant')) {
            throw new Error('Invalid authorization code. Please try authenticating again.');
          }
          if (response.data.message.includes('expired')) {
            throw new Error('Authorization code has expired. Please try again.');
          }
        }
        
        throw new Error(`Authentication failed: ${response.data.message || `Error code: ${response.data.code}`}`);
      }
    } catch (error) {
      console.error('TikTok authentication error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
        console.error('Response headers:', error.response?.headers);
      }
      throw new Error(`Failed to authenticate with TikTok Business API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Automated creator discovery with advanced filtering
  async discoverCreatorsAutomated(criteria: {
    categories: string[];
    minFollowers: number;
    maxFollowers: number;
    minEngagementRate?: number;
    locations?: string[];
    verified?: boolean;
    languages?: string[];
    limit: number;
  }): Promise<TikTokCreatorData[]> {
    try {
      if (!this.accessToken) {
        throw new Error('No access token. Please authenticate first.');
      }

      const response = await axios.post(`${this.creatorMarketplaceURL}/creator/search/`, {
        advertiser_id: this.advertiserId,
        filters: {
          content_categories: criteria.categories,
          countries: criteria.locations || [],
          follower_count: {
            min: criteria.minFollowers,
            max: criteria.maxFollowers
          },
          engagement_rate: {
            min: criteria.minEngagementRate || 0.02 // Minimum 2%
          },
          is_verified: criteria.verified,
          languages: criteria.languages || ['en']
        },
        sort_by: 'engagement_rate',
        sort_order: 'desc',
        page_size: criteria.limit
      }, {
        headers: {
          'Access-Token': this.accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.code === 0) {
        return response.data.data.creators.map((creator: any) => ({
          user_id: creator.creator_id,
          username: creator.username,
          display_name: creator.display_name,
          follower_count: creator.follower_count,
          following_count: creator.following_count || 0,
          video_count: creator.video_count || 0,
          like_count: creator.total_likes || 0,
          bio: creator.bio_description,
          is_verified: creator.is_verified,
          profile_image: creator.avatar_url,
          engagement_rate: creator.engagement_rate,
          avg_views: creator.avg_video_views,
          categories: creator.content_categories,
          location: creator.country_code
        }));
      } else {
        throw new Error(`Creator search failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Creator discovery error:', error);
      throw error;
    }
  }

  // Automated campaign creation following TikTok policies
  async createAutomatedCampaign(params: {
    name: string;
    description: string;
    budget: number;
    startDate: Date;
    endDate: Date;
    productInfo: {
      name: string;
      category: string;
      link: string;
      description: string;
      price: number;
      commission_rate: number;
    };
    targetAudience: {
      countries: string[];
      ageRange: string[];
      interests: string[];
    };
  }): Promise<string> {
    try {
      const response = await axios.post(`${this.creatorMarketplaceURL}/order/create/`, {
        advertiser_id: this.advertiserId,
        campaign_info: {
          name: params.name,
          description: params.description,
          budget: params.budget,
          start_date: params.startDate.toISOString(),
          end_date: params.endDate.toISOString(),
          objective: 'affiliate_sales',
          product_categories: [params.productInfo.category],
          collaboration_type: 'affiliate_partnership'
        },
        product_info: {
          name: params.productInfo.name,
          category: params.productInfo.category,
          link: params.productInfo.link,
          description: params.productInfo.description,
          price: params.productInfo.price,
          commission_rate: params.productInfo.commission_rate
        },
        target_audience: params.targetAudience,
        automation_settings: {
          auto_approve_creators: false, // Manual approval for quality control
          daily_invite_limit: this.automationConfig.dailyInviteLimit,
          message_personalization: this.automationConfig.personalizedMessages
        }
      }, {
        headers: {
          'Access-Token': this.accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.code === 0) {
        return response.data.data.order_id;
      } else {
        throw new Error(`Campaign creation failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Campaign creation error:', error);
      throw error;
    }
  }

  // Automated invitation sending with rate limiting and personalization
  async sendAutomatedInvitations(
    campaignId: string,
    creators: TikTokCreatorData[],
    messageTemplate: string,
    productInfo: any
  ): Promise<CampaignAutomationResult> {
    const result: CampaignAutomationResult = {
      totalInvitesSent: 0,
      successfulInvites: 0,
      failedInvites: 0,
      errors: []
    };

    let invitesSentToday = 0;
    const maxDailyInvites = this.automationConfig.dailyInviteLimit;

    for (const creator of creators) {
      if (invitesSentToday >= maxDailyInvites) {
        result.nextRunTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Next day
        break;
      }

      try {
        // Personalize message based on creator data
        const personalizedMessage = this.personalizeMessage(
          messageTemplate,
          creator,
          productInfo
        );

        const invitationResult = await this.sendCreatorInvitation(
          creator.user_id,
          campaignId,
          personalizedMessage
        );

        if (invitationResult.success) {
          result.successfulInvites++;
          invitesSentToday++;
        } else {
          result.failedInvites++;
          result.errors.push(`Failed to invite ${creator.username}: ${invitationResult.error}`);
        }

        result.totalInvitesSent++;

        // Respect rate limits - wait between invites
        if (invitesSentToday < maxDailyInvites) {
          await this.delay(this.automationConfig.delayBetweenInvites);
        }

      } catch (error) {
        result.failedInvites++;
        result.errors.push(`Error inviting ${creator.username}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return result;
  }

  // Send individual creator invitation through TikTok messaging
  async sendCreatorInvitation(
    creatorId: string,
    campaignId: string,
    message: string
  ): Promise<{ success: boolean; invitationId?: string; error?: string }> {
    try {
      const response = await axios.post(`${this.creatorMarketplaceURL}/invitation/send/`, {
        advertiser_id: this.advertiserId,
        order_id: campaignId,
        creator_id: creatorId,
        invitation_content: {
          message: message,
          collaboration_type: 'affiliate',
          payment_terms: 'commission_based',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days deadline
        }
      }, {
        headers: {
          'Access-Token': this.accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.code === 0) {
        return {
          success: true,
          invitationId: response.data.data.invitation_id
        };
      } else {
        return {
          success: false,
          error: response.data.message
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Personalize invitation messages based on creator data
  private personalizeMessage(template: string, creator: TikTokCreatorData, productInfo: any): string {
    return template
      .replace('{creator_name}', creator.display_name || creator.username)
      .replace('{follower_count}', creator.follower_count.toLocaleString())
      .replace('{product_name}', productInfo.name)
      .replace('{commission_rate}', `${productInfo.commission_rate}%`)
      .replace('{product_category}', productInfo.category)
      .replace('{engagement_rate}', creator.engagement_rate ? `${(creator.engagement_rate * 100).toFixed(1)}%` : 'high');
  }

  // Monitor campaign performance and responses
  async monitorCampaignResponses(campaignId: string): Promise<{
    totalInvites: number;
    responses: number;
    acceptances: number;
    rejections: number;
    pending: number;
    responseRate: number;
  }> {
    try {
      const response = await axios.get(`${this.creatorMarketplaceURL}/invitation/status/`, {
        headers: {
          'Access-Token': this.accessToken,
          'Content-Type': 'application/json'
        },
        params: {
          advertiser_id: this.advertiserId,
          order_id: campaignId
        }
      });

      if (response.data.code === 0) {
        const data = response.data.data;
        return {
          totalInvites: data.total_invitations,
          responses: data.total_responses,
          acceptances: data.accepted_invitations,
          rejections: data.rejected_invitations,
          pending: data.pending_invitations,
          responseRate: data.total_invitations > 0 ? (data.total_responses / data.total_invitations) * 100 : 0
        };
      } else {
        throw new Error(`Failed to fetch campaign responses: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Campaign monitoring error:', error);
      throw error;
    }
  }

  // Get detailed campaign analytics
  async getCampaignAnalytics(campaignId: string): Promise<{
    performance: any;
    creators: any[];
    revenue: number;
    conversions: number;
    roi: number;
  }> {
    try {
      const response = await axios.get(`${this.creatorMarketplaceURL}/order/analytics/`, {
        headers: {
          'Access-Token': this.accessToken,
          'Content-Type': 'application/json'
        },
        params: {
          advertiser_id: this.advertiserId,
          order_id: campaignId
        }
      });

      if (response.data.code === 0) {
        const data = response.data.data;
        return {
          performance: {
            views: data.total_views,
            likes: data.total_likes,
            comments: data.total_comments,
            shares: data.total_shares,
            engagement_rate: data.avg_engagement_rate
          },
          creators: data.creator_performance || [],
          revenue: data.total_revenue || 0,
          conversions: data.total_conversions || 0,
          roi: data.roi || 0
        };
      } else {
        throw new Error(`Failed to fetch analytics: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Analytics error:', error);
      throw error;
    }
  }

  // Utility function for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Validate API connection and permissions
  async validateConnection(): Promise<{
    connected: boolean;
    permissions: string[];
    advertiserInfo: any;
    error?: string;
  }> {
    try {
      if (!this.accessToken) {
        return {
          connected: false,
          permissions: [],
          advertiserInfo: null,
          error: 'No access token available'
        };
      }

      console.log('Validating TikTok connection with advertiser ID:', this.advertiserId);
      
      const response = await axios.get(`${this.baseURL}/advertiser/info/`, {
        headers: {
          'Access-Token': this.accessToken,
          'Content-Type': 'application/json'
        },
        params: {
          advertiser_ids: JSON.stringify([this.advertiserId])
        },
        timeout: 10000
      });

      console.log('TikTok validation response:', {
        status: response.status,
        code: response.data?.code,
        message: response.data?.message,
        hasData: !!response.data?.data
      });

      if (response.data.code === 0 && response.data.data?.list?.length > 0) {
        const advertiserInfo = response.data.data.list[0];
        console.log('TikTok validation successful:', {
          advertiserId: advertiserInfo.advertiser_id,
          name: advertiserInfo.advertiser_name,
          status: advertiserInfo.status
        });
        
        return {
          connected: true,
          permissions: ['creator_marketplace', 'messaging', 'analytics'],
          advertiserInfo: advertiserInfo
        };
      } else {
        console.error('TikTok validation failed:', response.data);
        return {
          connected: false,
          permissions: [],
          advertiserInfo: null,
          error: response.data.message || `API error code: ${response.data.code}`
        };
      }
    } catch (error) {
      console.error('TikTok validation error:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        // Handle specific HTTP errors
        if (error.response?.status === 401) {
          return {
            connected: false,
            permissions: [],
            advertiserInfo: null,
            error: 'Access token is invalid or expired'
          };
        }
        
        if (error.response?.status === 403) {
          return {
            connected: false,
            permissions: [],
            advertiserInfo: null,
            error: 'Access forbidden - check API permissions'
          };
        }
      }
      
      return {
        connected: false,
        permissions: [],
        advertiserInfo: null,
        error: error instanceof Error ? error.message : 'Connection validation failed'
      };
    }
  }

  // Check if we have an active TikTok seller session
  async checkSellerSession(): Promise<{
    hasSession: boolean;
    sellerInfo?: any;
    error?: string;
  }> {
    try {
      if (!this.accessToken) {
        return { hasSession: false, error: 'No access token available' };
      }

      const validation = await this.validateConnection();
      
      if (validation.connected && validation.advertiserInfo) {
        return {
          hasSession: true,
          sellerInfo: {
            advertiserId: validation.advertiserInfo.advertiser_id,
            advertiserName: validation.advertiserInfo.advertiser_name,
            status: validation.advertiserInfo.status,
            permissions: validation.permissions
          }
        };
      } else {
        return { hasSession: false, error: validation.error };
      }
    } catch (error) {
      return {
        hasSession: false,
        error: error instanceof Error ? error.message : 'Session check failed'
      };
    }
  }

  // Update automation configuration
  updateAutomationConfig(config: Partial<AutomationConfig>): void {
    this.automationConfig = { ...this.automationConfig, ...config };
  }

  // Get current automation configuration
  getAutomationConfig(): AutomationConfig {
    return { ...this.automationConfig };
  }

  // Verify webhook signature for security
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const webhookSecret = process.env.WEBHOOK_SECRET || 'your_webhook_secret';
      const expectedSignature = crypto.createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(`sha256=${expectedSignature}`)
      );
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }
}

export const tiktokApi = new TikTokAPIService();
