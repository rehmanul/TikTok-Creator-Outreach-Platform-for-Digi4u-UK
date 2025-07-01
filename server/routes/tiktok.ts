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
  
  // Add required scope parameter for TikTok Business API
  const scope = 'user.info.basic,business.get,ad_management.get,page.manage';
  
  const authUrl = `https://business-api.tiktok.com/portal/auth?app_id=${clientKey}&state=${state}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  console.log('Generated TikTok auth URL:', {
    clientKey: clientKey?.substring(0, 10) + '...',
    redirectUri,
    scope,
    state
  });
  
  res.json({ authUrl, state, redirectUri });
});

// TikTok OAuth callback (legacy route - redirects to main callback)
router.get('/callback', async (req, res) => {
  // Redirect to the correct OAuth callback route with all parameters
  const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
  res.redirect(`/api/tiktok/oauth-callback?${queryString}`);
});

// TikTok OAuth callback (matches TikTok app configuration)
router.get('/oauth-callback', async (req, res) => {
  try {
    console.log('TikTok OAuth callback received:', {
      authCode: req.query.auth_code ? 'present' : 'missing',
      code: req.query.code ? 'present' : 'missing',
      state: req.query.state ? 'present' : 'missing',
      allParams: Object.keys(req.query)
    });

    // Check for error parameters from TikTok
    if (req.query.error) {
      console.error('TikTok OAuth error:', req.query.error, req.query.error_description);
      return res.redirect('/?tiktok_error=auth_denied');
    }

    // TikTok may send either 'auth_code' or 'code' parameter
    const authCode = (req.query.auth_code || req.query.code) as string;
    const { state } = req.query;
    
    if (!authCode) {
      console.error('Missing authorization code in callback');
      return res.redirect('/?tiktok_error=missing_code');
    }
    
    console.log('Attempting TikTok authentication...');
    const accessToken = await tiktokApi.authenticate(authCode);
    console.log('Authentication successful, validating connection...');
    
    // Validate the connection and get seller info
    const validation = await tiktokApi.validateConnection();
    
    if (validation.connected) {
      console.log('TikTok connection validated successfully');
      // Redirect to frontend with success
      res.redirect('/?tiktok_connected=true');
    } else {
      console.error('TikTok connection validation failed:', validation.error);
      res.redirect('/?tiktok_error=validation_failed');
    }
  } catch (error) {
    console.error('TikTok OAuth callback error:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    
    // Check if it's an auth code reuse error
    if (error instanceof Error && error.message.includes('Auth_code is used')) {
      console.log('Auth code already used, redirecting to start new auth flow');
      return res.redirect('/?tiktok_error=code_expired');
    }
    
    // For other errors, still redirect with error flag
    res.redirect('/?tiktok_error=auth_failed');
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