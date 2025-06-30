import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { storage } from '../storage.js';
import { campaignAutomation } from '../services/campaignAutomation.js';
import { tiktokApi } from '../services/tiktokApi.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get user's campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await storage.getCampaignsByUser(req.user!.id);

    // Get analytics for each campaign
    const campaignsWithAnalytics = await Promise.all(
      campaigns.map(async (campaign) => {
        const analytics = await storage.getCampaignAnalytics(campaign.id);
        const jobStatus = campaignAutomation.getJobStatus(campaign.id);

        return {
          ...campaign,
          analytics,
          automationStatus: jobStatus
        };
      })
    );

    res.json(campaignsWithAnalytics);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Failed to fetch campaigns' });
  }
});

// Create new campaign
router.post('/', async (req, res) => {
  try {
    const campaignData = insertCampaignSchema.parse(req.body);

    // Validate budget against user's limits (in production, check subscription tier)
    if (parseFloat(campaignData.budget) > 10000) {
      return res.status(400).json({ message: 'Budget exceeds maximum allowed' });
    }

    // Get AI-powered campaign strategy
    const strategy = await aiService.generateCampaignStrategy(
      campaignData.targetCategories?.[0] || 'technology',
      parseFloat(campaignData.budget),
      campaignData.targetLocations?.[0] || 'UK'
    );

    // Create campaign with AI recommendations
    const campaign = await storage.createCampaign({
      ...campaignData,
      userId: req.user!.id,
      targetFollowerMin: strategy.targetCreatorProfile.followerRange.min,
      targetFollowerMax: strategy.targetCreatorProfile.followerRange.max,
      targetEngagementMin: strategy.targetCreatorProfile.engagementRate.toString()
    });

    res.status(201).json({
      campaign,
      aiStrategy: strategy
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid campaign data', errors: error.errors });
    }
    console.error('Campaign creation error:', error);
    res.status(500).json({ message: 'Failed to create campaign' });
  }
});

// Get campaign details
router.get('/:id', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const campaign = await storage.getCampaign(campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Verify ownership
    if (campaign.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get invitations and analytics
    const invitations = await storage.getInvitationsByCampaign(campaignId);
    const analytics = await storage.getCampaignAnalytics(campaignId);
    const jobStatus = campaignAutomation.getJobStatus(campaignId);

    res.json({
      ...campaign,
      invitations,
      analytics,
      automationStatus: jobStatus
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ message: 'Failed to fetch campaign' });
  }
});

// Start campaign automation
router.post('/:id/start', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const campaign = await storage.getCampaign(campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update campaign status
    await storage.updateCampaignStatus(campaignId, 'active');

    // Start automation
    await campaignAutomation.startCampaign(campaignId);

    res.json({ 
      message: 'Campaign started successfully',
      status: 'active'
    });
  } catch (error) {
    console.error('Error starting campaign:', error);
    res.status(500).json({ message: 'Failed to start campaign' });
  }
});

// Pause campaign
router.post('/:id/pause', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const campaign = await storage.getCampaign(campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Pause automation
    await campaignAutomation.pauseCampaign(campaignId);

    res.json({ 
      message: 'Campaign paused successfully',
      status: 'paused'
    });
  } catch (error) {
    console.error('Error pausing campaign:', error);
    res.status(500).json({ message: 'Failed to pause campaign' });
  }
});

// Get campaign performance report
router.get('/:id/report', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const campaign = await storage.getCampaign(campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get comprehensive campaign data
    const analytics = await storage.getCampaignAnalytics(campaignId);
    const invitations = await storage.getInvitationsByCampaign(campaignId);

    // Generate AI-powered performance report
    const report = await aiService.generatePerformanceReport({
      campaign,
      analytics,
      invitations
    });

    res.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

// Optimize campaign message
router.post('/:id/optimize-message', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const campaign = await storage.getCampaign(campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get optimized message from AI
    const optimizedMessage = await aiService.optimizeMessage(
      campaign.messageTemplate,
      campaign.targetCategories?.join(', ') || 'general',
      campaign.productDetails?.toString() || 'mobile accessories'
    );

    res.json({ 
      original: campaign.messageTemplate,
      optimized: optimizedMessage
    });
  } catch (error) {
    console.error('Error optimizing message:', error);
    res.status(500).json({ message: 'Failed to optimize message' });
  }
});

// Get bot status
router.get('/bot-status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const campaigns = await storage.getCampaignsByUser(userId);

    // Check if any campaigns are currently running
    const hasRunningCampaigns = campaigns.some(campaign => campaign.status === 'running');

    res.json({
      status: hasRunningCampaigns ? 'running' : 'inactive',
      activeCampaigns: campaigns.filter(c => c.status === 'running').length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get bot status' });
  }
});

export default router;