import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { authMiddleware } from '../middleware/auth';
import { aiService } from '../services/aiService';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Get all user's campaigns
    const campaigns = await storage.getCampaignsByUser(userId);
    
    // Calculate overall metrics
    let totalInvites = 0;
    let totalResponses = 0;
    let totalCollaborations = 0;
    let totalRevenue = 0;
    let totalSpent = 0;
    
    for (const campaign of campaigns) {
      const analytics = await storage.getCampaignAnalytics(campaign.id);
      totalInvites += analytics.totalInvites;
      totalResponses += Math.round(analytics.totalInvites * analytics.responseRate / 100);
      totalCollaborations += Math.round(analytics.totalInvites * analytics.acceptanceRate / 100);
      totalRevenue += analytics.totalRevenue;
      totalSpent += parseFloat(campaign.spent || '0');
    }
    
    // Get recent activity
    const recentEvents = await storage.getRecentEvents(userId, 10);
    
    // Calculate trends (comparing to previous period)
    const responseRate = totalInvites > 0 ? (totalResponses / totalInvites) * 100 : 0;
    const roi = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0;
    
    res.json({
      overview: {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalInvites,
        totalResponses,
        totalCollaborations,
        totalRevenue,
        totalSpent,
        responseRate,
        roi
      },
      recentActivity: recentEvents,
      topPerformingCampaigns: campaigns
        .sort((a, b) => parseFloat(b.spent || '0') - parseFloat(a.spent || '0'))
        .slice(0, 5)
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Get campaign performance over time
router.get('/campaigns/:id/performance', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const { period = '7d' } = z.object({ period: z.enum(['24h', '7d', '30d', '90d']).optional() }).parse(req.query);
    
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    if (campaign.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get time-series data
    const timeSeriesData = await storage.getCampaignTimeSeries(campaignId, period);
    
    res.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status
      },
      timeSeries: timeSeriesData,
      period
    });
  } catch (error) {
    console.error('Campaign performance error:', error);
    res.status(500).json({ message: 'Failed to fetch performance data' });
  }
});

// Get creator performance analytics
router.get('/creators/performance', async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Get all invitations from user's campaigns
    const campaigns = await storage.getCampaignsByUser(userId);
    const creatorStats = new Map();
    
    for (const campaign of campaigns) {
      const invitations = await storage.getInvitationsByCampaign(campaign.id);
      
      for (const invitation of invitations) {
        const creator = await storage.getCreator(invitation.creatorId);
        if (!creator) continue;
        
        if (!creatorStats.has(creator.id)) {
          creatorStats.set(creator.id, {
            creator: {
              id: creator.id,
              username: creator.username,
              followerCount: creator.followerCount,
              engagementRate: creator.engagementRate
            },
            invitations: 0,
            responses: 0,
            collaborations: 0,
            revenue: 0
          });
        }
        
        const stats = creatorStats.get(creator.id);
        stats.invitations++;
        
        if (['responded', 'accepted'].includes(invitation.status)) {
          stats.responses++;
        }
        
        if (invitation.status === 'accepted') {
          stats.collaborations++;
        }
      }
    }
    
    // Convert to array and sort by performance
    const creatorPerformance = Array.from(creatorStats.values())
      .map(stats => ({
        ...stats,
        responseRate: stats.invitations > 0 ? (stats.responses / stats.invitations) * 100 : 0
      }))
      .sort((a, b) => b.responseRate - a.responseRate);
    
    res.json({
      topPerformers: creatorPerformance.slice(0, 10),
      total: creatorPerformance.length
    });
  } catch (error) {
    console.error('Creator performance error:', error);
    res.status(500).json({ message: 'Failed to fetch creator performance' });
  }
});

// Get market insights
router.get('/market-insights', async (req, res) => {
  try {
    const { category = 'technology', region = 'UK' } = z.object({
      category: z.string().optional(),
      region: z.string().optional()
    }).parse(req.query);
    
    // Get AI-powered market insights
    const insights = await aiService.getMarketInsights(category, region);
    
    res.json({
      category,
      region,
      insights,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Market insights error:', error);
    res.status(500).json({ message: 'Failed to fetch market insights' });
  }
});

export default router;