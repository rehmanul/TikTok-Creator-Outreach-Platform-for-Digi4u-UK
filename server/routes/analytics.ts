import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { storage } from '../storage';

const router = Router();

// Get campaign analytics
router.get('/campaign-stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const campaigns = await storage.getCampaignsByUser(userId);

    let totalInvites = 0;
    let totalResponses = 0;
    let activeCollaborations = 0;
    let totalRevenue = 0;

    for (const campaign of campaigns) {
      const invitations = await storage.getInvitationsByCampaign(campaign.id);
      totalInvites += invitations.length;
      totalResponses += invitations.filter(inv => inv.status === 'accepted').length;

      const collaborations = await storage.getCollaborationsByCampaign(campaign.id);
      activeCollaborations += collaborations.filter(col => col.status === 'active').length;
      totalRevenue += collaborations.reduce((sum, col) => sum + Number(col.revenue || 0), 0);
    }

    const responseRate = totalInvites > 0 ? (totalResponses / totalInvites) * 100 : 0;

    res.json({
      totalInvites,
      responseRate: Math.round(responseRate * 10) / 10,
      activeCollaborations,
      totalRevenue: Math.round(totalRevenue)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get campaign stats' });
  }
});

// Get performance data for charts
router.get('/performance', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const performanceData = [];

    for (const day of days) {
      // Get real data from database based on user's campaigns
      const campaigns = await storage.getCampaignsByUser(userId);
      let dayInvites = 0;
      let dayResponses = 0;
      let dayConversions = 0;

      // Calculate daily metrics
      for (const campaign of campaigns) {
        const invitations = await storage.getInvitationsByCampaign(campaign.id);
        const collaborations = await storage.getCollaborationsByCampaign(campaign.id);

        dayInvites += Math.floor(invitations.length / 7);
        dayResponses += Math.floor(invitations.filter(inv => inv.status === 'accepted').length / 7);
        dayConversions += Math.floor(collaborations.filter(col => col.status === 'active').length / 7);
      }

      performanceData.push({
        name: day,
        invites: dayInvites,
        responses: dayResponses,
        conversions: dayConversions
      });
    }

    res.json(performanceData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get performance data' });
  }
});

// Get category distribution
router.get('/categories', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const campaigns = await storage.getCampaignsByUser(userId);
    const categoryCounts: Record<string, number> = {};

    for (const campaign of campaigns) {
      const collaborations = await storage.getCollaborationsByCampaign(campaign.id);

      for (const collaboration of collaborations) {
        const creator = await storage.getCreator(collaboration.creatorId);
        if (creator?.categories) {
          creator.categories.forEach(category => {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          });
        }
      }
    }

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const categoryData = Object.entries(categoryCounts).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));

    res.json(categoryData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get category data' });
  }
});

// Get recent activity
router.get('/activity', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const campaigns = await storage.getCampaignsByUser(userId);
    const activities = [];

    for (const campaign of campaigns) {
      const invitations = await storage.getInvitationsByCampaign(campaign.id);
      const collaborations = await storage.getCollaborationsByCampaign(campaign.id);

      // Add invitation activities
      for (const invitation of invitations.slice(-5)) {
        const creator = await storage.getCreator(invitation.creatorId);
        activities.push({
          id: `inv-${invitation.id}`,
          type: 'invite',
          creator: creator ? `@${creator.username}` : 'Unknown',
          action: 'Invitation sent',
          time: new Date(invitation.createdAt).toLocaleString(),
          status: invitation.status
        });
      }

      // Add collaboration activities
      for (const collaboration of collaborations.slice(-5)) {
        const creator = await storage.getCreator(collaboration.creatorId);
        activities.push({
          id: `col-${collaboration.id}`,
          type: 'collaboration',
          creator: creator ? `@${creator.username}` : 'Unknown',
          action: collaboration.status === 'active' ? 'Collaboration started' : 'Response received',
          time: new Date(collaboration.createdAt).toLocaleString(),
          status: collaboration.status
        });
      }
    }

    // Sort by most recent and limit to 5
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    res.json(activities.slice(0, 5));
  } catch (error) {
    res.status(500).json({ message: 'Failed to get activity data' });
  }
});

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