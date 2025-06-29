import { Campaign, Creator, Invitation } from '@shared/schema';
import { tiktokApi } from './tiktokApi';
import { storage } from '../storage';
import EventEmitter from 'events';

interface CampaignJob {
  campaignId: number;
  status: 'running' | 'paused' | 'completed';
  processed: number;
  successful: number;
  failed: number;
  startedAt: Date;
}

export class CampaignAutomationEngine extends EventEmitter {
  private activeJobs: Map<number, CampaignJob> = new Map();
  private jobIntervals: Map<number, NodeJS.Timeout> = new Map();

  // Start automated campaign execution
  async startCampaign(campaignId: number): Promise<void> {
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) throw new Error('Campaign not found');
    
    if (campaign.status !== 'active') {
      throw new Error('Campaign must be active to start');
    }

    // Initialize job tracking
    const job: CampaignJob = {
      campaignId,
      status: 'running',
      processed: 0,
      successful: 0,
      failed: 0,
      startedAt: new Date()
    };
    
    this.activeJobs.set(campaignId, job);
    this.emit('campaign:started', { campaignId });

    // Start the automation loop
    await this.processCampaignBatch(campaignId);
    
    // Schedule recurring batch processing
    const interval = setInterval(
      () => this.processCampaignBatch(campaignId),
      campaign.inviteDelay * 1000
    );
    
    this.jobIntervals.set(campaignId, interval);
  }

  // Process a batch of creators for the campaign
  private async processCampaignBatch(campaignId: number): Promise<void> {
    const job = this.activeJobs.get(campaignId);
    if (!job || job.status !== 'running') return;

    try {
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) return;

      // Check if we've reached limits
      if (job.processed >= campaign.inviteLimit) {
        await this.completeCampaign(campaignId);
        return;
      }

      // Find matching creators that haven't been invited
      const creators = await this.findTargetCreators(campaign);
      
      if (creators.length === 0) {
        this.emit('campaign:no_creators', { campaignId });
        return;
      }

      // Process creators in parallel with rate limiting
      const batchSize = Math.min(5, campaign.inviteLimit - job.processed);
      const batch = creators.slice(0, batchSize);
      
      const results = await Promise.allSettled(
        batch.map(creator => this.sendInvitation(campaign, creator))
      );

      // Update job statistics
      results.forEach((result, index) => {
        job.processed++;
        if (result.status === 'fulfilled' && result.value) {
          job.successful++;
          this.emit('invitation:sent', { 
            campaignId, 
            creatorId: batch[index].id 
          });
        } else {
          job.failed++;
          this.emit('invitation:failed', { 
            campaignId, 
            creatorId: batch[index].id,
            error: result.status === 'rejected' ? result.reason : 'Unknown error'
          });
        }
      });

      // Update campaign spending
      await storage.updateCampaignSpent(campaignId, job.processed * 0.10); // $0.10 per invite

    } catch (error) {
      console.error('Campaign batch processing error:', error);
      this.emit('campaign:error', { campaignId, error });
    }
  }

  // Find creators matching campaign criteria
  private async findTargetCreators(campaign: Campaign): Promise<Creator[]> {
    try {
      // Search TikTok API for matching creators
      const searchResults = await tiktokApi.searchCreators({
        category: campaign.targetCategories?.[0] || 'technology',
        location: campaign.targetLocations?.[0],
        minFollowers: campaign.targetFollowerMin || 10000,
        maxFollowers: campaign.targetFollowerMax || 1000000,
        limit: 50
      });

      // Filter by additional criteria
      const filteredCreators = [];
      
      for (const tiktokCreator of searchResults) {
        // Check if already in database
        let creator = await storage.getCreatorByTikTokId(tiktokCreator.user_id);
        
        if (!creator) {
          // Add new creator to database
          creator = await storage.createCreator({
            tiktokId: tiktokCreator.user_id,
            username: tiktokCreator.username,
            displayName: tiktokCreator.display_name,
            followerCount: tiktokCreator.follower_count,
            bio: tiktokCreator.bio,
            isVerified: tiktokCreator.is_verified,
            categories: campaign.targetCategories || [],
            location: campaign.targetLocations?.[0] || null
          });
        }

        // Check if already invited to this campaign
        const existingInvite = await storage.getInvitation(campaign.id, creator.id);
        if (existingInvite) continue;

        // Check GMV threshold if specified
        if (campaign.targetGmvMin) {
          const gmv = await tiktokApi.getCreatorGMV(
            creator.tiktokId,
            new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
            new Date()
          );
          
          if (gmv < Number(campaign.targetGmvMin)) continue;
        }

        // Calculate engagement rate
        const videos = await tiktokApi.getCreatorVideos(creator.tiktokId, 10);
        const avgEngagement = videos.reduce((sum, v) => sum + v.engagement_rate, 0) / videos.length;
        
        if (campaign.targetEngagementMin && avgEngagement < Number(campaign.targetEngagementMin)) {
          continue;
        }

        // Update creator metrics
        await storage.updateCreatorMetrics(creator.id, {
          engagementRate: avgEngagement.toString(),
          avgViews: Math.round(videos.reduce((sum, v) => sum + v.view_count, 0) / videos.length)
        });

        filteredCreators.push(creator);
      }

      return filteredCreators;
    } catch (error) {
      console.error('Error finding target creators:', error);
      return [];
    }
  }

  // Send personalized invitation to creator
  private async sendInvitation(campaign: Campaign, creator: Creator): Promise<boolean> {
    try {
      // Personalize the message template
      const personalizedMessage = this.personalizeMessage(campaign.messageTemplate, creator);
      
      // Send via TikTok API
      const sent = await tiktokApi.sendInvitation(creator.tiktokId, personalizedMessage);
      
      if (sent) {
        // Record invitation in database
        await storage.createInvitation({
          campaignId: campaign.id,
          creatorId: creator.id,
          status: 'sent',
          sentAt: new Date()
        });
        
        // Track analytics event
        await storage.trackEvent({
          eventType: 'invitation_sent',
          campaignId: campaign.id,
          creatorId: creator.id,
          data: { message: personalizedMessage }
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error sending invitation:', error);
      return false;
    }
  }

  // Personalize message template with creator data
  private personalizeMessage(template: string, creator: Creator): string {
    return template
      .replace('{creator_name}', creator.displayName || creator.username)
      .replace('{follower_count}', creator.followerCount.toLocaleString())
      .replace('{engagement_rate}', creator.engagementRate ? `${creator.engagementRate}%` : 'high')
      .replace('{categories}', creator.categories?.join(', ') || 'your content');
  }

  // Pause campaign execution
  async pauseCampaign(campaignId: number): Promise<void> {
    const job = this.activeJobs.get(campaignId);
    if (!job) throw new Error('Campaign job not found');
    
    job.status = 'paused';
    
    // Clear the interval
    const interval = this.jobIntervals.get(campaignId);
    if (interval) {
      clearInterval(interval);
      this.jobIntervals.delete(campaignId);
    }
    
    await storage.updateCampaignStatus(campaignId, 'paused');
    this.emit('campaign:paused', { campaignId });
  }

  // Complete campaign
  private async completeCampaign(campaignId: number): Promise<void> {
    const job = this.activeJobs.get(campaignId);
    if (!job) return;
    
    job.status = 'completed';
    
    // Clear the interval
    const interval = this.jobIntervals.get(campaignId);
    if (interval) {
      clearInterval(interval);
      this.jobIntervals.delete(campaignId);
    }
    
    await storage.updateCampaignStatus(campaignId, 'completed');
    
    this.emit('campaign:completed', { 
      campaignId,
      stats: {
        processed: job.processed,
        successful: job.successful,
        failed: job.failed,
        duration: Date.now() - job.startedAt.getTime()
      }
    });
    
    this.activeJobs.delete(campaignId);
  }

  // Get campaign job status
  getJobStatus(campaignId: number): CampaignJob | undefined {
    return this.activeJobs.get(campaignId);
  }

  // Handle incoming webhooks from TikTok
  async handleWebhook(eventType: string, data: any): Promise<void> {
    switch (eventType) {
      case 'message.viewed':
        await this.handleMessageViewed(data);
        break;
      case 'message.replied':
        await this.handleMessageReplied(data);
        break;
      case 'creator.profile_updated':
        await this.handleCreatorUpdate(data);
        break;
    }
  }

  private async handleMessageViewed(data: any): Promise<void> {
    const invitation = await storage.getInvitationByTikTokId(data.message_id);
    if (invitation) {
      await storage.updateInvitationStatus(invitation.id, 'viewed', { viewedAt: new Date() });
      this.emit('invitation:viewed', { invitationId: invitation.id });
    }
  }

  private async handleMessageReplied(data: any): Promise<void> {
    const invitation = await storage.getInvitationByTikTokId(data.message_id);
    if (invitation) {
      await storage.updateInvitationStatus(invitation.id, 'responded', {
        respondedAt: new Date(),
        response: data.reply_text
      });
      
      // Analyze response sentiment (you would integrate with AI here)
      const isPositive = data.reply_text.toLowerCase().includes('interested') || 
                        data.reply_text.toLowerCase().includes('yes');
      
      if (isPositive) {
        this.emit('invitation:accepted', { invitationId: invitation.id });
      } else {
        this.emit('invitation:declined', { invitationId: invitation.id });
      }
    }
  }

  private async handleCreatorUpdate(data: any): Promise<void> {
    const creator = await storage.getCreatorByTikTokId(data.user_id);
    if (creator) {
      await storage.updateCreatorProfile(creator.id, data.updated_fields);
      this.emit('creator:updated', { creatorId: creator.id });
    }
  }
}

export const campaignEngine = new CampaignAutomationEngine();