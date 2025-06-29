import { Router } from 'express';
import { tiktokApi } from '../services/tiktokApi.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// TikTok OAuth authorization URL
router.get('/auth/url', authMiddleware, (req, res) => {
  const clientKey = process.env.TIKTOK_CLIENT_KEY || '7519035078651936769';
  const redirectUri = process.env.TIKTOK_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/tiktok/callback`;
  const state = Math.random().toString(36).substring(7);
  
  const authUrl = `https://business-api.tiktok.com/portal/auth?app_id=${clientKey}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  res.json({ authUrl, state });
});

// TikTok OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { auth_code, state } = req.query;
    
    if (!auth_code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    const accessToken = await tiktokApi.authenticate(auth_code as string);
    
    // In production, you'd save this token to the user's account
    res.json({ 
      success: true, 
      message: 'TikTok account connected successfully',
      accessToken: accessToken.substring(0, 10) + '...' // Don't expose full token
    });
  } catch (error) {
    console.error('TikTok callback error:', error);
    res.status(500).json({ error: 'Failed to connect TikTok account' });
  }
});

// Test TikTok API connection
router.get('/test', authMiddleware, async (req, res) => {
  try {
    const advertiserId = process.env.TIKTOK_ADVERTISER_ID || '7519829315018588178';
    const profile = await tiktokApi.getCreatorProfile(advertiserId);
    
    res.json({
      success: true,
      message: 'TikTok API connection successful',
      data: profile
    });
  } catch (error) {
    console.error('TikTok test error:', error);
    res.status(500).json({ 
      error: 'Failed to test TikTok API connection',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;