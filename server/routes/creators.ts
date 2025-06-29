import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { authMiddleware } from '../middleware/auth';
import { tiktokApi } from '../services/tiktokApi';
import { aiService } from '../services/aiService';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Search creators
const searchSchema = z.object({
  categories: z.array(z.string()).optional(),
  minFollowers: z.number().optional(),
  maxFollowers: z.number().optional(),
  location: z.string().optional(),
  minEngagement: z.number().optional(),
  minGmv: z.number().optional(),
  page: z.number().default(1),
  limit: z.number().default(20)
});

router.get('/search', async (req, res) => {
  try {
    const queryParams = {
      categories: req.query.categories ? req.query.categories.toString().split(',') : undefined,
      minFollowers: req.query.minFollowers ? parseInt(req.query.minFollowers.toString()) : undefined,
      maxFollowers: req.query.maxFollowers ? parseInt(req.query.maxFollowers.toString()) : undefined,
      location: req.query.location?.toString(),
      minEngagement: req.query.minEngagement ? parseFloat(req.query.minEngagement.toString()) : undefined,
      minGmv: req.query.minGmv ? parseInt(req.query.minGmv.toString()) : undefined,
      page: req.query.page ? parseInt(req.query.page.toString()) : 1,
      limit: req.query.limit ? parseInt(req.query.limit.toString()) : 20
    };
    const params = searchSchema.parse(queryParams);
    
    // Search in database first
    const dbCreators = await storage.searchCreators({
      categories: params.categories,
      minFollowers: params.minFollowers,
      maxFollowers: params.maxFollowers,
      location: params.location,
      minEngagement: params.minEngagement,
      minGmv: params.minGmv
    });
    
    // If not enough results, search TikTok API
    if (dbCreators.length < params.limit) {
      try {
        const tiktokResults = await tiktokApi.searchCreators({
          category: params.categories?.[0] || 'technology',
          location: params.location,
          minFollowers: params.minFollowers,
          maxFollowers: params.maxFollowers,
          limit: params.limit - dbCreators.length
        });
        
        // Save new creators to database
        for (const tiktokCreator of tiktokResults) {
          const exists = await storage.getCreatorByTikTokId(tiktokCreator.user_id);
          if (!exists) {
            await storage.createCreator({
              tiktokId: tiktokCreator.user_id,
              username: tiktokCreator.username,
              displayName: tiktokCreator.display_name,
              followerCount: tiktokCreator.follower_count,
              bio: tiktokCreator.bio,
              isVerified: tiktokCreator.is_verified,
              categories: params.categories || []
            });
          }
        }
      } catch (error) {
        console.error('TikTok API search error:', error);
        // Continue with database results only
      }
    }
    
    // Paginate results
    const start = (params.page - 1) * params.limit;
    const paginatedCreators = dbCreators.slice(start, start + params.limit);
    
    res.json({
      creators: paginatedCreators,
      total: dbCreators.length,
      page: params.page,
      totalPages: Math.ceil(dbCreators.length / params.limit)
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid search parameters', errors: error.errors });
    }
    console.error('Creator search error:', error);
    res.status(500).json({ message: 'Failed to search creators' });
  }
});

// Get creator insights from TikTok API
router.get('/:id/insights', async (req, res) => {
  try {
    const creator = await storage.getCreator(parseInt(req.params.id));
    
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }
    
    try {
      const insights = await tiktokApi.getCreatorInsights(creator.tiktokId);
      res.json(insights);
    } catch (apiError) {
      console.error('Failed to fetch creator insights:', apiError);
      res.status(500).json({ 
        message: 'Failed to fetch creator insights from TikTok API',
        fallback: {
          avg_engagement_rate: parseFloat(creator.engagementRate || '0'),
          avg_video_views: creator.avgViews || 0,
          growth_rate: 0,
          best_posting_times: [],
          top_performing_content: [],
          audience_data: {
            gender_distribution: { male: 50, female: 50, other: 0 },
            age_distribution: { '18-24': 40, '25-34': 35, '35-44': 20, '45+': 5 },
            top_countries: [],
            top_interests: creator.categories || []
          }
        }
      });
    }
  } catch (error) {
    console.error('Creator insights error:', error);
    res.status(500).json({ message: 'Failed to get creator insights' });
  }
});

// Get creator details
router.get('/:id', async (req, res) => {
  try {
    const creatorId = parseInt(req.params.id);
    const creator = await storage.getCreator(creatorId);
    
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }
    
    // Update metrics from TikTok if data is stale (older than 24 hours)
    const lastUpdated = new Date(creator.lastUpdated);
    const isStale = Date.now() - lastUpdated.getTime() > 24 * 60 * 60 * 1000;
    
    if (isStale) {
      try {
        // Get updated profile data
        const profile = await tiktokApi.getCreatorProfile(creator.username);
        
        // Get recent video metrics
        const videos = await tiktokApi.getCreatorVideos(creator.tiktokId, 20);
        const avgEngagement = videos.reduce((sum, v) => sum + v.engagement_rate, 0) / videos.length;
        const avgViews = Math.round(videos.reduce((sum, v) => sum + v.view_count, 0) / videos.length);
        
        // Get GMV data
        const gmv = await tiktokApi.getCreatorGMV(
          creator.tiktokId,
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          new Date()
        );
        
        // Update creator in database
        await storage.updateCreatorProfile(creatorId, {
          followerCount: profile.follower_count,
          bio: profile.bio,
          isVerified: profile.is_verified
        });
        
        await storage.updateCreatorMetrics(creatorId, {
          engagementRate: avgEngagement.toFixed(2),
          avgViews,
        });
        
        // Update the creator object
        Object.assign(creator, {
          followerCount: profile.follower_count,
          bio: profile.bio,
          isVerified: profile.is_verified,
          engagementRate: avgEngagement.toFixed(2),
          avgViews,
          gmv: gmv.toString()
        });
      } catch (error) {
        console.error('Failed to update creator metrics:', error);
      }
    }
    
    res.json(creator);
  } catch (error) {
    console.error('Error fetching creator:', error);
    res.status(500).json({ message: 'Failed to fetch creator' });
  }
});

// Analyze creator for campaign
router.post('/:id/analyze', async (req, res) => {
  try {
    const creatorId = parseInt(req.params.id);
    const { campaignId } = z.object({ campaignId: z.number() }).parse(req.body);
    
    const creator = await storage.getCreator(creatorId);
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }
    
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Verify campaign ownership
    if (campaign.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get AI analysis
    const analysis = await aiService.analyzeCreator(creator, campaign);
    
    res.json(analysis);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid request', errors: error.errors });
    }
    console.error('Creator analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze creator' });
  }
});

// Get trending creators by category
router.get('/trending/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { location } = z.object({ location: z.string().optional() }).parse(req.query);
    
    // Get trending hashtags first
    const trendingHashtags = await tiktokApi.getTrendingHashtags(category, location);
    
    // Search for creators using trending content
    const creators = await storage.searchCreators({
      categories: [category],
      location,
      minEngagement: 3.0 // Higher engagement for trending
    });
    
    res.json({
      creators: creators.slice(0, 10),
      trendingHashtags
    });
  } catch (error) {
    console.error('Trending creators error:', error);
    res.status(500).json({ message: 'Failed to fetch trending creators' });
  }
});

// Get top performing creators
router.get('/top-performers', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const campaigns = await storage.getCampaignsByUser(userId);
    const creatorPerformance = new Map();

    for (const campaign of campaigns) {
      const collaborations = await storage.getCollaborationsByCampaign(campaign.id);
      
      for (const collaboration of collaborations) {
        const creator = await storage.getCreator(collaboration.creatorId);
        if (creator) {
          const existing = creatorPerformance.get(creator.id) || {
            name: `@${creator.username}`,
            followers: creator.followerCount > 1000 ? `${Math.round(creator.followerCount / 1000)}K` : creator.followerCount.toString(),
            engagement: creator.engagementRate ? `${creator.engagementRate}%` : 'N/A',
            revenue: 0,
            status: collaboration.status
          };
          
          existing.revenue += Number(collaboration.revenue || 0);
          creatorPerformance.set(creator.id, existing);
        }
      }
    }

    const topCreators = Array.from(creatorPerformance.values())
      .map(creator => ({
        ...creator,
        revenue: `£${creator.revenue.toLocaleString()}`
      }))
      .sort((a, b) => {
        const aRevenue = parseFloat(a.revenue.replace('£', '').replace(',', ''));
        const bRevenue = parseFloat(b.revenue.replace('£', '').replace(',', ''));
        return bRevenue - aRevenue;
      })
      .slice(0, 4);

    res.json(topCreators);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get top creators' });
  }
});

// Create individual invitation
router.post('/invite', async (req, res) => {
  try {
    const { creatorId, message, contentType, products, commissionRate } = req.body;
    
    const creator = await storage.getCreator(creatorId);
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    // Create invitation record
    const invitation = await storage.createInvitation({
      campaignId: null, // Individual invitation
      creatorId: creatorId,
      status: 'sent',
      sentAt: new Date(),
      message,
      contentType,
      products: JSON.stringify(products),
      commissionRate
    });

    // Track analytics event
    await storage.trackEvent({
      eventType: 'invitation_sent',
      campaignId: null,
      creatorId: creatorId,
      data: { 
        message, 
        contentType, 
        products: products.length,
        commissionRate 
      }
    });

    res.json({ 
      success: true, 
      invitationId: invitation.id,
      message: 'Invitation sent successfully' 
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({ message: 'Failed to create invitation' });
  }
});

export default router;