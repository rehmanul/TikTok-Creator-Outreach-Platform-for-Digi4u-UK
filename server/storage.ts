import { 
  users, type User, type InsertUser,
  creators, type Creator, type InsertCreator,
  campaigns, type Campaign, type InsertCampaign,
  invitations, type Invitation, type InsertInvitation,
  collaborations, type Collaboration, type InsertCollaboration,
  analyticsEvents, apiKeys
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Creator operations
  getCreator(id: number): Promise<Creator | undefined>;
  getCreatorByTikTokId(tiktokId: string): Promise<Creator | undefined>;
  createCreator(creator: InsertCreator): Promise<Creator>;
  updateCreatorMetrics(id: number, metrics: { engagementRate?: string; avgViews?: number }): Promise<void>;
  updateCreatorProfile(id: number, updates: Partial<Creator>): Promise<void>;
  searchCreators(filters: {
    categories?: string[];
    minFollowers?: number;
    maxFollowers?: number;
    location?: string;
    minEngagement?: number;
    minGmv?: number;
  }): Promise<Creator[]>;
  
  // Campaign operations
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignsByUser(userId: number): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaignStatus(id: number, status: string): Promise<void>;
  updateCampaignSpent(id: number, amount: number): Promise<void>;
  
  // Invitation operations
  getInvitation(campaignId: number, creatorId: number): Promise<Invitation | undefined>;
  getInvitationByTikTokId(tiktokMessageId: string): Promise<Invitation | undefined>;
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  updateInvitationStatus(id: number, status: string, updates?: Partial<Invitation>): Promise<void>;
  getInvitationsByCampaign(campaignId: number): Promise<Invitation[]>;
  
  // Collaboration operations
  createCollaboration(collaboration: InsertCollaboration): Promise<Collaboration>;
  updateCollaboration(id: number, updates: Partial<Collaboration>): Promise<void>;
  getCollaborationsByUser(userId: number): Promise<Collaboration[]>;
  
  // Analytics operations
  trackEvent(event: {
    eventType: string;
    campaignId?: number;
    creatorId?: number;
    invitationId?: number;
    data?: any;
  }): Promise<void>;
  getCampaignAnalytics(campaignId: number): Promise<{
    totalInvites: number;
    responseRate: number;
    acceptanceRate: number;
    totalRevenue: number;
  }>;
  
  // API Key operations
  saveApiKey(userId: number, service: string, keyHash: string): Promise<void>;
  getApiKey(userId: number, service: string): Promise<{ keyHash: string } | undefined>;
  
  // Additional analytics methods
  getRecentEvents(userId: number, limit: number): Promise<any[]>;
  getCampaignTimeSeries(campaignId: number, period: string): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private creators: Map<number, Creator> = new Map();
  private campaigns: Map<number, Campaign> = new Map();
  private invitations: Map<number, Invitation> = new Map();
  private collaborations: Map<number, Collaboration> = new Map();
  private analyticsEvents: any[] = [];
  private apiKeys: Map<string, { keyHash: string }> = new Map();
  private currentId = 1;

  constructor() {
    // Initialize with some demo data for development
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      id,
      email: insertUser.email,
      passwordHash: insertUser.passwordHash,
      companyName: insertUser.companyName,
      role: insertUser.role || 'admin',
      tiktokBusinessId: insertUser.tiktokBusinessId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Creator operations
  async getCreator(id: number): Promise<Creator | undefined> {
    return this.creators.get(id);
  }

  async getCreatorByTikTokId(tiktokId: string): Promise<Creator | undefined> {
    return Array.from(this.creators.values()).find(c => c.tiktokId === tiktokId);
  }

  async createCreator(insertCreator: InsertCreator): Promise<Creator> {
    const id = this.currentId++;
    const creator: Creator = {
      ...insertCreator,
      id,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    this.creators.set(id, creator);
    return creator;
  }

  async updateCreatorMetrics(id: number, metrics: { engagementRate?: string; avgViews?: number }): Promise<void> {
    const creator = this.creators.get(id);
    if (creator) {
      if (metrics.engagementRate) creator.engagementRate = metrics.engagementRate;
      if (metrics.avgViews) creator.avgViews = metrics.avgViews;
      creator.lastUpdated = new Date();
    }
  }

  async updateCreatorProfile(id: number, updates: Partial<Creator>): Promise<void> {
    const creator = this.creators.get(id);
    if (creator) {
      Object.assign(creator, updates, { lastUpdated: new Date() });
    }
  }

  async searchCreators(filters: any): Promise<Creator[]> {
    return Array.from(this.creators.values()).filter(creator => {
      if (filters.minFollowers && creator.followerCount < filters.minFollowers) return false;
      if (filters.maxFollowers && creator.followerCount > filters.maxFollowers) return false;
      if (filters.location && creator.location !== filters.location) return false;
      if (filters.categories?.length && !creator.categories?.some(c => filters.categories.includes(c))) return false;
      return true;
    });
  }

  // Campaign operations
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getCampaignsByUser(userId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(c => c.userId === userId);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentId++;
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      spent: '0',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaignStatus(id: number, status: string): Promise<void> {
    const campaign = this.campaigns.get(id);
    if (campaign) {
      campaign.status = status;
      campaign.updatedAt = new Date();
    }
  }

  async updateCampaignSpent(id: number, amount: number): Promise<void> {
    const campaign = this.campaigns.get(id);
    if (campaign) {
      campaign.spent = (parseFloat(campaign.spent || '0') + amount).toString();
      campaign.updatedAt = new Date();
    }
  }

  // Invitation operations
  async getInvitation(campaignId: number, creatorId: number): Promise<Invitation | undefined> {
    return Array.from(this.invitations.values()).find(
      i => i.campaignId === campaignId && i.creatorId === creatorId
    );
  }

  async getInvitationByTikTokId(tiktokMessageId: string): Promise<Invitation | undefined> {
    // In production, this would map TikTok message IDs to invitations
    return undefined;
  }

  async createInvitation(insertInvitation: InsertInvitation): Promise<Invitation> {
    const id = this.currentId++;
    const invitation: Invitation = {
      ...insertInvitation,
      id,
      createdAt: new Date()
    };
    this.invitations.set(id, invitation);
    return invitation;
  }

  async updateInvitationStatus(id: number, status: string, updates?: Partial<Invitation>): Promise<void> {
    const invitation = this.invitations.get(id);
    if (invitation) {
      invitation.status = status;
      if (updates) Object.assign(invitation, updates);
    }
  }

  async getInvitationsByCampaign(campaignId: number): Promise<Invitation[]> {
    return Array.from(this.invitations.values()).filter(i => i.campaignId === campaignId);
  }

  // Collaboration operations
  async createCollaboration(insertCollaboration: InsertCollaboration): Promise<Collaboration> {
    const id = this.currentId++;
    const collaboration: Collaboration = {
      ...insertCollaboration,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.collaborations.set(id, collaboration);
    return collaboration;
  }

  async updateCollaboration(id: number, updates: Partial<Collaboration>): Promise<void> {
    const collaboration = this.collaborations.get(id);
    if (collaboration) {
      Object.assign(collaboration, updates, { updatedAt: new Date() });
    }
  }

  async getCollaborationsByUser(userId: number): Promise<Collaboration[]> {
    // Get user's campaigns first
    const userCampaigns = await this.getCampaignsByUser(userId);
    const campaignIds = userCampaigns.map(c => c.id);
    
    // Get invitations for those campaigns
    const invitations = Array.from(this.invitations.values())
      .filter(i => campaignIds.includes(i.campaignId));
    const invitationIds = invitations.map(i => i.id);
    
    // Get collaborations for those invitations
    return Array.from(this.collaborations.values())
      .filter(c => invitationIds.includes(c.invitationId));
  }

  // Analytics operations
  async trackEvent(event: any): Promise<void> {
    this.analyticsEvents.push({
      ...event,
      id: this.currentId++,
      createdAt: new Date()
    });
  }

  async getCampaignAnalytics(campaignId: number): Promise<any> {
    const invitations = await this.getInvitationsByCampaign(campaignId);
    const totalInvites = invitations.length;
    const responses = invitations.filter(i => i.status === 'responded' || i.status === 'accepted').length;
    const acceptances = invitations.filter(i => i.status === 'accepted').length;
    
    const collaborations = Array.from(this.collaborations.values())
      .filter(c => invitations.some(i => i.id === c.invitationId));
    const totalRevenue = collaborations.reduce((sum, c) => sum + parseFloat(c.revenue || '0'), 0);

    return {
      totalInvites,
      responseRate: totalInvites > 0 ? (responses / totalInvites) * 100 : 0,
      acceptanceRate: totalInvites > 0 ? (acceptances / totalInvites) * 100 : 0,
      totalRevenue
    };
  }

  // API Key operations
  async saveApiKey(userId: number, service: string, keyHash: string): Promise<void> {
    this.apiKeys.set(`${userId}-${service}`, { keyHash });
  }

  async getApiKey(userId: number, service: string): Promise<{ keyHash: string } | undefined> {
    return this.apiKeys.get(`${userId}-${service}`);
  }

  // Additional methods for analytics
  async getRecentEvents(userId: number, limit: number): Promise<any[]> {
    const userCampaigns = await this.getCampaignsByUser(userId);
    const campaignIds = userCampaigns.map(c => c.id);
    
    return this.analyticsEvents
      .filter(e => campaignIds.includes(e.campaignId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getCampaignTimeSeries(campaignId: number, period: string): Promise<any[]> {
    // In production, this would aggregate time-series data
    const events = this.analyticsEvents.filter(e => e.campaignId === campaignId);
    
    // Group by date and return time series
    const timeSeries: any[] = [];
    const now = new Date();
    const days = period === '24h' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 90;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEvents = events.filter(e => 
        e.createdAt.toISOString().split('T')[0] === dateStr
      );
      
      timeSeries.push({
        date: dateStr,
        invitations: dayEvents.filter(e => e.eventType === 'invitation_sent').length,
        responses: dayEvents.filter(e => e.eventType === 'invitation_responded').length,
        collaborations: dayEvents.filter(e => e.eventType === 'collaboration_started').length
      });
    }
    
    return timeSeries.reverse();
  }
}

export const storage = new MemStorage();
