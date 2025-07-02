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
      error: req.query.error || 'none',
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
    
    try {
      const accessToken = await tiktokApi.authenticate(authCode);
      console.log('Authentication successful, access token received');
      
      // Small delay to ensure token is properly set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validate the connection and get seller info
      console.log('Validating TikTok connection...');
      const validation = await tiktokApi.validateConnection();
      
      if (validation.connected) {
        console.log('TikTok connection validated successfully');
        // Redirect to frontend with success
        res.redirect('/?tiktok_connected=true');
      } else {
        console.error('TikTok connection validation failed:', validation.error);
        
        // Redirect with validation error instead of demo mode
        res.redirect('/?tiktok_error=validation_failed');
      }
    } catch (authError) {
      console.error('TikTok authentication failed:', authError);
      
      // Check for specific error types
      if (authError instanceof Error) {
        if (authError.message.includes('Auth_code is used')) {
          console.log('Auth code already used, need fresh auth');
          return res.redirect('/?tiktok_error=code_expired');
        }
        if (authError.message.includes('invalid_grant')) {
          console.log('Invalid grant error, need re-authorization');
          return res.redirect('/?tiktok_error=invalid_grant');
        }
      }
      
      // Redirect with auth error
      res.redirect('/?tiktok_error=auth_failed');
    }
  } catch (error) {
    console.error('TikTok OAuth callback error:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    
    res.redirect('/?tiktok_error=callback_failed');
  }
});

// Check TikTok authentication status
router.get('/auth/status', async (req, res) => {
  try {
    // Check if we have an access token first
    const hasToken = await tiktokApi.hasValidToken();
    
    if (!hasToken) {
      console.log('No valid TikTok token found');
      return res.json({
        connected: false,
        error: 'No authentication token'
      });
    }
    
    console.log('Checking TikTok connection status...');
    const validation = await tiktokApi.validateConnection();
    
    if (validation.connected) {
      console.log('TikTok connection is valid');
      res.json({
        connected: true,
        userInfo: {
          id: validation.advertiserInfo?.advertiser_id || 'demo-seller',
          email: validation.advertiserInfo?.contact_email || 'seller@tiktok.com',
          companyName: validation.advertiserInfo?.advertiser_name || 'TikTok Seller',
          role: 'seller'
        },
        accessToken: 'tiktok-session-token',
        permissions: validation.permissions || ['creator_marketplace', 'messaging'],
        advertiserInfo: validation.advertiserInfo
      });
    } else {
      console.log('TikTok connection validation failed:', validation.error);
      
      // In development, provide demo user info
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: providing demo user');
        res.json({
          connected: true,
          userInfo: {
            id: 'demo-seller',
            email: 'demo@tiktokseller.com',
            companyName: 'Demo TikTok Seller',
            role: 'seller'
          },
          accessToken: 'demo-token',
          permissions: ['creator_marketplace', 'messaging'],
          isDemoMode: true
        });
      } else {
        res.json({
          connected: false,
          error: validation.error || 'Connection validation failed'
        });
      }
    }
  } catch (error) {
    console.error('TikTok status check error:', error);
    
    // In development, provide demo response
    if (process.env.NODE_ENV === 'development') {
      console.log('Development fallback: providing demo user due to error');
      res.json({
        connected: true,
        userInfo: {
          id: 'demo-seller',
          email: 'demo@tiktokseller.com',
          companyName: 'Demo TikTok Seller',
          role: 'seller'
        },
        accessToken: 'demo-token',
        permissions: ['creator_marketplace', 'messaging'],
        isDemoMode: true,
        error: 'Using demo mode due to API error'
      });
    } else {
      res.json({
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
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