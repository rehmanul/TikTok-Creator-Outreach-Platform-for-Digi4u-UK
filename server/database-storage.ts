import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, and, sql, desc, asc } from 'drizzle-orm';
import { 
  users, type User, type InsertUser,
  creators, type Creator, type InsertCreator,
  campaigns, type Campaign, type InsertCampaign,
  invitations, type Invitation, type InsertInvitation,
  collaborations, type Collaboration, type InsertCollaboration,
  analyticsEvents, apiKeys
} from '@shared/schema';
import type { IStorage } from './storage.js';
import { env } from './config/environment.js';

export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  
  constructor() {
    if (!env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required for production database storage');
    }
    
    const sqlConnection = neon(env.DATABASE_URL);
    this.db = drizzle(sqlConnection);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  // Creator operations
  async getCreator(id: number): Promise<Creator | undefined> {
    const result = await this.db.select().from(creators).where(eq(creators.id, id)).limit(1);
    return result[0];
  }

  async getCreatorByTikTokId(tiktokId: string): Promise<Creator | undefined> {
    const result = await this.db.select().from(creators).where(eq(creators.tiktokId, tiktokId)).limit(1);
    return result[0];
  }

  async createCreator(creator: InsertCreator): Promise<Creator> {
    const result = await this.db.insert(creators).values(creator).returning();
    return result[0];
  }

  async updateCreatorMetrics(id: number, metrics: { engagementRate?: string; avgViews?: number }): Promise<void> {
    await this.db.update(creators)
      .set({
        engagementRate: metrics.engagementRate,
        avgViews: metrics.avgViews,
        lastUpdated: new Date()
      })
      .where(eq(creators.id, id));
  }

  async updateCreatorProfile(id: number, updates: Partial<Creator>): Promise<void> {
    await this.db.update(creators)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(creators.id, id));
  }

  async searchCreators(filters: {
    categories?: string[];
    minFollowers?: number;
    maxFollowers?: number;
    location?: string;
    minEngagement?: number;
    minGmv?: number;
  }): Promise<Creator[]> {
    let query = this.db.select().from(creators);
    
    const conditions = [];
    
    if (filters.categories && filters.categories.length > 0) {
      // PostgreSQL array overlap operator
      conditions.push(sql`${creators.categories} && ${filters.categories}`);
    }
    
    if (filters.minFollowers) {
      conditions.push(sql`${creators.followerCount} >= ${filters.minFollowers}`);
    }
    
    if (filters.maxFollowers) {
      conditions.push(sql`${creators.followerCount} <= ${filters.maxFollowers}`);
    }
    
    if (filters.location) {
      conditions.push(sql`${creators.location} ILIKE ${'%' + filters.location + '%'}`);
    }
    
    if (filters.minEngagement) {
      conditions.push(sql`CAST(${creators.engagementRate} AS FLOAT) >= ${filters.minEngagement}`);
    }
    
    if (filters.minGmv) {
      conditions.push(sql`${creators.gmv} >= ${filters.minGmv}`);
    }
    
    if (conditions.length > 0) {
      query = query.where(conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`));
    }
    
    return await query.orderBy(desc(creators.followersCount)).limit(100);
  }

  // Campaign operations
  async getCampaign(id: number): Promise<Campaign | undefined> {
    const result = await this.db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
    return result[0];
  }

  async getCampaignsByUser(userId: number): Promise<Campaign[]> {
    return await this.db.select().from(campaigns)
      .where(eq(campaigns.userId, userId))
      .orderBy(desc(campaigns.createdAt));
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const result = await this.db.insert(campaigns).values(campaign).returning();
    return result[0];
  }

  async updateCampaignStatus(id: number, status: string): Promise<void> {
    await this.db.update(campaigns)
      .set({ status, updatedAt: new Date() })
      .where(eq(campaigns.id, id));
  }

  async updateCampaignSpent(id: number, amount: number): Promise<void> {
    await this.db.update(campaigns)
      .set({ 
        amountSpent: sql`${campaigns.amountSpent} + ${amount}`,
        updatedAt: new Date()
      })
      .where(eq(campaigns.id, id));
  }

  // Invitation operations
  async getInvitation(campaignId: number, creatorId: number): Promise<Invitation | undefined> {
    const result = await this.db.select().from(invitations)
      .where(and(eq(invitations.campaignId, campaignId), eq(invitations.creatorId, creatorId)))
      .limit(1);
    return result[0];
  }

  async getInvitationByTikTokId(tiktokMessageId: string): Promise<Invitation | undefined> {
    const result = await this.db.select().from(invitations)
      .where(eq(invitations.tiktokMessageId, tiktokMessageId))
      .limit(1);
    return result[0];
  }

  async createInvitation(invitation: InsertInvitation): Promise<Invitation> {
    const result = await this.db.insert(invitations).values(invitation).returning();
    return result[0];
  }

  async updateInvitationStatus(id: number, status: string, updates?: Partial<Invitation>): Promise<void> {
    await this.db.update(invitations)
      .set({ 
        status, 
        ...updates,
        updatedAt: new Date() 
      })
      .where(eq(invitations.id, id));
  }

  async getInvitationsByCampaign(campaignId: number): Promise<Invitation[]> {
    return await this.db.select().from(invitations)
      .where(eq(invitations.campaignId, campaignId))
      .orderBy(desc(invitations.createdAt));
  }

  // Collaboration operations
  async createCollaboration(collaboration: InsertCollaboration): Promise<Collaboration> {
    const result = await this.db.insert(collaborations).values(collaboration).returning();
    return result[0];
  }

  async updateCollaboration(id: number, updates: Partial<Collaboration>): Promise<void> {
    await this.db.update(collaborations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(collaborations.id, id));
  }

  async getCollaborationsByUser(userId: number): Promise<Collaboration[]> {
    return await this.db.select().from(collaborations)
      .where(eq(collaborations.userId, userId))
      .orderBy(desc(collaborations.createdAt));
  }

  async getCollaborationsByCampaign(campaignId: number): Promise<Collaboration[]> {
    return await this.db.select().from(collaborations)
      .where(eq(collaborations.campaignId, campaignId))
      .orderBy(desc(collaborations.createdAt));
  }

  // Analytics operations
  async trackEvent(event: {
    eventType: string;
    campaignId?: number;
    creatorId?: number;
    invitationId?: number;
    data?: any;
  }): Promise<void> {
    await this.db.insert(analyticsEvents).values({
      eventType: event.eventType,
      campaignId: event.campaignId || null,
      creatorId: event.creatorId || null,
      invitationId: event.invitationId || null,
      data: event.data || null,
      createdAt: new Date()
    });
  }

  async getCampaignAnalytics(campaignId: number): Promise<{
    totalInvites: number;
    responseRate: number;
    acceptanceRate: number;
    totalRevenue: number;
  }> {
    // Get invitation statistics
    const inviteStats = await this.db.select({
      total: sql<number>`count(*)`,
      responded: sql<number>`count(case when status in ('accepted', 'declined') then 1 end)`,
      accepted: sql<number>`count(case when status = 'accepted' then 1 end)`
    }).from(invitations).where(eq(invitations.campaignId, campaignId));

    const stats = inviteStats[0];
    const totalInvites = stats.total || 0;
    const responded = stats.responded || 0;
    const accepted = stats.accepted || 0;

    // Get revenue from collaborations
    const revenueStats = await this.db.select({
      totalRevenue: sql<number>`coalesce(sum(revenue), 0)`
    }).from(collaborations).where(eq(collaborations.campaignId, campaignId));

    return {
      totalInvites,
      responseRate: totalInvites > 0 ? (responded / totalInvites) * 100 : 0,
      acceptanceRate: responded > 0 ? (accepted / responded) * 100 : 0,
      totalRevenue: revenueStats[0]?.totalRevenue || 0
    };
  }

  // API Key operations
  async saveApiKey(userId: number, service: string, keyHash: string): Promise<void> {
    await this.db.insert(apiKeys).values({
      userId,
      service,
      keyHash,
      createdAt: new Date()
    }).onConflictDoUpdate({
      target: [apiKeys.userId, apiKeys.service],
      set: { keyHash, updatedAt: new Date() }
    });
  }

  async getApiKey(userId: number, service: string): Promise<{ keyHash: string } | undefined> {
    const result = await this.db.select({ keyHash: apiKeys.keyHash })
      .from(apiKeys)
      .where(and(eq(apiKeys.userId, userId), eq(apiKeys.service, service)))
      .limit(1);
    return result[0];
  }

  // Additional analytics methods
  async getRecentEvents(userId: number, limit: number): Promise<any[]> {
    return await this.db.select().from(analyticsEvents)
      .innerJoin(campaigns, eq(analyticsEvents.campaignId, campaigns.id))
      .where(eq(campaigns.userId, userId))
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(limit);
  }

  async getCampaignTimeSeries(campaignId: number, period: string): Promise<any[]> {
    // Simplified time series - can be enhanced based on requirements
    return await this.db.select({
      date: sql<string>`date_trunc('day', created_at)`,
      count: sql<number>`count(*)`
    }).from(analyticsEvents)
      .where(eq(analyticsEvents.campaignId, campaignId))
      .groupBy(sql`date_trunc('day', created_at)`)
      .orderBy(sql`date_trunc('day', created_at)`);
  }
}