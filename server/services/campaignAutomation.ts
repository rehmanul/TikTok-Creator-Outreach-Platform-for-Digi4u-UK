
import { Campaign, Creator, Invitation } from '@shared/schema';
import { tiktokApi } from './tiktokApi';
import { storage } from '../storage';
import EventEmitter from 'events';
import cron from 'node-cron';

interface AutomationRule {
  id: string;
  campaignId: string;
  isActive: boolean;
  dailyInviteLimit: number;
  delayBetweenInvites: number; // minutes
  creatorCriteria: {
    categories: string[];
    minFollowers: number;
    maxFollowers: number;
    minEngagementRate: number;
    locations: string[];
    verified?: boolean;
  };
  messageTemplate: string;
  schedule: {
    enabled: boolean;
    time: string; // HH:MM format
    timezone: string;
  };
}

interface AutomationStats {
  totalInvitesSent: number;
  responseRate: number;
  acceptanceRate: number;
  campaignsActive: number;
  todayInvites: number;
  pendingResponses: number;
}

export class CampaignAutomationService extends EventEmitter {
  private automationRules: Map<string, AutomationRule> = new Map();
  private runningAutomations: Set<string> = new Set();
  private scheduledJobs: Map<string, any> = new Map();

  constructor() {
    super();
    this.initializeScheduler();
  }

  // Initialize cron scheduler for automated campaigns
  private initializeScheduler(): void {
    // Run every hour to check for scheduled automations
    cron.schedule('0 * * * *', () => {
      this.checkScheduledAutomations();
    });

    // Daily cleanup and reporting at midnight
    cron.schedule('0 0 * * *', () => {
      this.dailyCleanup();
    });
  }

  // Create new automation rule
  async createAutomationRule(
    campaignId: string,
    rule: Omit<AutomationRule, 'id' | 'campaignId'>
  ): Promise<string> {
    const ruleId = `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const automationRule: AutomationRule = {
      id: ruleId,
      campaignId,
      ...rule
    };

    this.automationRules.set(ruleId, automationRule);

    // Schedule if needed
    if (rule.schedule.enabled) {
      this.scheduleAutomation(ruleId);
    }

    this.emit('automationRuleCreated', { ruleId, campaignId });
    return ruleId;
  }

  // Start automated creator discovery and invitation
  async startAutomatedCampaign(ruleId: string): Promise<void> {
    const rule = this.automationRules.get(ruleId);
    if (!rule || !rule.isActive) {
      throw new Error('Automation rule not found or inactive');
    }

    if (this.runningAutomations.has(ruleId)) {
      throw new Error('Automation already running for this rule');
    }

    this.runningAutomations.add(ruleId);
    this.emit('automationStarted', { ruleId, campaignId: rule.campaignId });

    try {
      // Step 1: Discover creators based on criteria
      const creators = await tiktokApi.discoverCreatorsAutomated({
        categories: rule.creatorCriteria.categories,
        minFollowers: rule.creatorCriteria.minFollowers,
        maxFollowers: rule.creatorCriteria.maxFollowers,
        minEngagementRate: rule.creatorCriteria.minEngagementRate,
        locations: rule.creatorCriteria.locations,
        verified: rule.creatorCriteria.verified,
        limit: rule.dailyInviteLimit
      });

      this.emit('creatorsDiscovered', { 
        ruleId, 
        campaignId: rule.campaignId, 
        count: creators.length 
      });

      // Step 2: Filter out already contacted creators
      const newCreators = await this.filterNewCreators(rule.campaignId, creators);

      this.emit('creatorsFiltered', { 
        ruleId, 
        campaignId: rule.campaignId, 
        newCount: newCreators.length,
        totalFound: creators.length
      });

      // Step 3: Get campaign and product info for personalization
      const campaign = await storage.getCampaignById(rule.campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Step 4: Send automated invitations with rate limiting
      const results = await tiktokApi.sendAutomatedInvitations(
        rule.campaignId,
        newCreators,
        rule.messageTemplate,
        campaign
      );

      // Step 5: Store invitation records
      await this.storeInvitationResults(rule.campaignId, newCreators, results);

      this.emit('automationCompleted', {
        ruleId,
        campaignId: rule.campaignId,
        results
      });

      // Schedule next run if needed
      if (rule.schedule.enabled && results.nextRunTime) {
        this.scheduleNextRun(ruleId, results.nextRunTime);
      }

    } catch (error) {
      this.emit('automationError', {
        ruleId,
        campaignId: rule.campaignId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    } finally {
      this.runningAutomations.delete(ruleId);
    }
  }

  // Filter creators who haven't been contacted yet
  private async filterNewCreators(
    campaignId: string,
    creators: any[]
  ): Promise<any[]> {
    const existingInvitations = await storage.getInvitationsByCampaign(campaignId);
    const contactedCreatorIds = new Set(
      existingInvitations.map(inv => inv.creatorId)
    );

    return creators.filter(creator => !contactedCreatorIds.has(creator.user_id));
  }

  // Store invitation results in database
  private async storeInvitationResults(
    campaignId: string,
    creators: any[],
    results: any
  ): Promise<void> {
    for (let i = 0; i < results.totalInvitesSent; i++) {
      const creator = creators[i];
      if (creator) {
        try {
          // First ensure creator exists in database
          let dbCreator = await storage.getCreatorByTikTokId(creator.user_id);
          if (!dbCreator) {
            dbCreator = await storage.createCreator({
              tiktokId: creator.user_id,
              username: creator.username,
              displayName: creator.display_name,
              followerCount: creator.follower_count,
              bio: creator.bio,
              isVerified: creator.is_verified,
              categories: creator.categories || []
            });
          }

          // Create invitation record
          await storage.createInvitation({
            campaignId,
            creatorId: dbCreator.id,
            message: '', // Will be filled with personalized message
            status: i < results.successfulInvites ? 'sent' : 'failed',
            sentAt: new Date(),
            automationRuleId: campaignId // Link to automation rule
          });
        } catch (error) {
          console.error('Error storing invitation result:', error);
        }
      }
    }
  }

  // Schedule automation to run at specific time
  private scheduleAutomation(ruleId: string): void {
    const rule = this.automationRules.get(ruleId);
    if (!rule || !rule.schedule.enabled) return;

    const [hour, minute] = rule.schedule.time.split(':').map(Number);
    const cronExpression = `${minute} ${hour} * * *`; // Daily at specified time

    const job = cron.schedule(cronExpression, () => {
      this.startAutomatedCampaign(ruleId).catch(error => {
        console.error(`Scheduled automation failed for rule ${ruleId}:`, error);
      });
    }, {
      scheduled: false,
      timezone: rule.schedule.timezone
    });

    job.start();
    this.scheduledJobs.set(ruleId, job);
  }

  // Schedule next run for rate-limited automations
  private scheduleNextRun(ruleId: string, nextRunTime: Date): void {
    setTimeout(() => {
      this.startAutomatedCampaign(ruleId).catch(error => {
        console.error(`Delayed automation failed for rule ${ruleId}:`, error);
      });
    }, nextRunTime.getTime() - Date.now());
  }

  // Check for scheduled automations
  private async checkScheduledAutomations(): Promise<void> {
    for (const [ruleId, rule] of this.automationRules) {
      if (rule.isActive && rule.schedule.enabled && !this.runningAutomations.has(ruleId)) {
        const now = new Date();
        const [hour, minute] = rule.schedule.time.split(':').map(Number);
        
        if (now.getHours() === hour && now.getMinutes() === minute) {
          this.startAutomatedCampaign(ruleId).catch(error => {
            console.error(`Scheduled automation failed for rule ${ruleId}:`, error);
          });
        }
      }
    }
  }

  // Daily cleanup and reporting
  private async dailyCleanup(): Promise<void> {
    // Clean up old logs, send daily reports, etc.
    this.emit('dailyReport', await this.getAutomationStats());
  }

  // Get automation statistics
  async getAutomationStats(): Promise<AutomationStats> {
    const allInvitations = await storage.getAllInvitations();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayInvites = allInvitations.filter(inv => 
      inv.sentAt && inv.sentAt >= today
    ).length;

    const totalSent = allInvitations.length;
    const responded = allInvitations.filter(inv => 
      inv.status === 'accepted' || inv.status === 'rejected'
    ).length;
    const accepted = allInvitations.filter(inv => inv.status === 'accepted').length;
    const pending = allInvitations.filter(inv => inv.status === 'sent').length;

    return {
      totalInvitesSent: totalSent,
      responseRate: totalSent > 0 ? (responded / totalSent) * 100 : 0,
      acceptanceRate: responded > 0 ? (accepted / responded) * 100 : 0,
      campaignsActive: this.runningAutomations.size,
      todayInvites,
      pendingResponses: pending
    };
  }

  // Stop automation rule
  stopAutomationRule(ruleId: string): void {
    const rule = this.automationRules.get(ruleId);
    if (rule) {
      rule.isActive = false;
      
      // Stop scheduled job if exists
      const job = this.scheduledJobs.get(ruleId);
      if (job) {
        job.stop();
        this.scheduledJobs.delete(ruleId);
      }

      this.emit('automationStopped', { ruleId, campaignId: rule.campaignId });
    }
  }

  // Get all automation rules
  getAutomationRules(): AutomationRule[] {
    return Array.from(this.automationRules.values());
  }

  // Get automation rule by ID
  getAutomationRule(ruleId: string): AutomationRule | undefined {
    return this.automationRules.get(ruleId);
  }

  // Update automation rule
  updateAutomationRule(ruleId: string, updates: Partial<AutomationRule>): void {
    const rule = this.automationRules.get(ruleId);
    if (rule) {
      Object.assign(rule, updates);
      
      // Reschedule if schedule changed
      if (updates.schedule) {
        const job = this.scheduledJobs.get(ruleId);
        if (job) {
          job.stop();
          this.scheduledJobs.delete(ruleId);
        }
        
        if (rule.schedule.enabled) {
          this.scheduleAutomation(ruleId);
        }
      }
    }
  }
}

export const campaignAutomation = new CampaignAutomationService();
