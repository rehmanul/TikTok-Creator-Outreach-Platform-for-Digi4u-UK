import { Router } from 'express';
import { tiktokApi } from '../services/tiktokApi.js';
import { authMiddleware } from '../middleware/auth.js';
import { env } from '../config/environment.js';

const router = Router();

// TikTok OAuth authorization URL
router.get('/auth/url', (req, res) => {
  const clientKey = env.TIKTOK_CLIENT_KEY;
  const redirectUri = env.TIKTOK_REDIRECT_URI;
  const state = Math.random().toString(36).substring(7);
  
  const authUrl = `https://business-api.tiktok.com/portal/auth?app_id=${clientKey}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  res.json({ authUrl, state, redirectUri });
});

// TikTok OAuth callback (legacy route)
router.get('/callback', async (req, res) => {
  try {
    const { auth_code, state } = req.query;
    
    if (!auth_code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    const accessToken = await tiktokApi.authenticate(auth_code as string);
    
    // Validate the connection and get seller info
    const validation = await tiktokApi.validateConnection();
    
    if (validation.connected) {
      // Store the session (in production, use proper session management)
      // For now, redirect back to the main app
      res.redirect('/?tiktok_connected=true');
    } else {
      res.status(500).json({ 
        error: 'Failed to validate TikTok connection',
        details: validation.error
      });
    }
  } catch (error) {
    console.error('TikTok callback error:', error);
    res.status(500).json({ error: 'Failed to connect TikTok account' });
  }
});

// TikTok OAuth callback (matches TikTok app configuration)
router.get('/oauth-callback', async (req, res) => {
  try {
    const { auth_code, state } = req.query;
    
    if (!auth_code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    const accessToken = await tiktokApi.authenticate(auth_code as string);
    
    // Validate the connection and get seller info
    const validation = await tiktokApi.validateConnection();
    
    if (validation.connected) {
      // Store the session (in production, use proper session management)
      // For now, redirect back to the main app
      res.redirect('/?tiktok_connected=true');
    } else {
      res.status(500).json({ 
        error: 'Failed to validate TikTok connection',
        details: validation.error
      });
    }
  } catch (error) {
    console.error('TikTok OAuth callback error:', error);
    res.status(500).json({ error: 'Failed to connect TikTok account' });
  }
});

// Check TikTok authentication status
router.get('/auth/status', async (req, res) => {
  try {
    const validation = await tiktokApi.validateConnection();
    
    if (validation.connected) {
      res.json({
        connected: true,
        userInfo: {
          id: validation.advertiserInfo?.advertiser_id || 'demo-seller',
          email: 'seller@tiktok.com',
          companyName: validation.advertiserInfo?.advertiser_name || 'TikTok Seller',
          role: 'seller'
        },
        accessToken: 'tiktok-session-token',
        permissions: validation.permissions
      });
    } else {
      res.json({
        connected: false,
        error: validation.error
      });
    }
  } catch (error) {
    console.error('TikTok status check error:', error);
    res.json({
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// TikTok logout endpoint
router.get('/auth/logout', (req, res) => {
  // Clear any stored TikTok tokens/sessions
  // Redirect to TikTok logout or back to auth
  res.redirect('https://business-api.tiktok.com/portal/auth/logout');
});

// Test TikTok API connection
router.get('/test', async (req, res) => {
  try {
    const validation = await tiktokApi.validateConnection();
    
    res.json({
      success: validation.connected,
      message: validation.connected ? 'TikTok API connection successful' : 'TikTok API connection failed',
      data: validation.advertiserInfo,
      permissions: validation.permissions,
      error: validation.error
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