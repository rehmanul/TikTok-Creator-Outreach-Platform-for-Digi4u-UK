import { Router } from 'express';
import crypto from 'crypto';
import { tiktokApi } from '../services/tiktokApi';
import { campaignAutomation } from '../services/campaignAutomation';
import { env } from '../config/environment.js';

const router = Router();

// TikTok webhook endpoint
router.post('/tiktok', async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-tiktok-signature'] as string;
    const payload = JSON.stringify(req.body);
    
    if (!tiktokApi.verifyWebhookSignature(payload, signature)) {
      return res.status(401).json({ message: 'Invalid signature' });
    }
    
    const { event_type, data } = req.body;
    
    // Process webhook event
    // await campaignAutomation.handleWebhook(event_type, data);
    
    // Acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

// Stripe webhook for payment processing (if implementing paid features)
router.post('/stripe', async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    
    // In production, verify Stripe webhook signature
    // const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    
    const { type, data } = req.body;
    
    switch (type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        console.log('Payment succeeded:', data.object.id);
        break;
      case 'subscription.created':
        // Handle new subscription
        console.log('New subscription:', data.object.id);
        break;
      case 'subscription.updated':
        // Handle subscription changes
        console.log('Subscription updated:', data.object.id);
        break;
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ message: 'Webhook error' });
  }
});

// GitHub webhook endpoint for deployments and repository events
router.post('/github', async (req, res) => {
  try {
    // Verify GitHub webhook signature
    const signature = req.headers['x-hub-signature-256'] as string;
    const payload = JSON.stringify(req.body);
    
    if (env.WEBHOOK_SECRET) {
      const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', env.WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');
      
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        console.log('GitHub webhook: Invalid signature');
        return res.status(401).json({ message: 'Invalid signature' });
      }
    }
    
    const { action, repository, ref } = req.body;
    const eventType = req.headers['x-github-event'] as string;
    
    console.log(`GitHub webhook received: ${eventType}`, {
      action,
      repository: repository?.name,
      ref
    });
    
    // Handle different GitHub events
    switch (eventType) {
      case 'push':
        if (ref === 'refs/heads/main' || ref === 'refs/heads/master') {
          console.log('Push to main branch detected - deployment will auto-trigger');
          // Auto-deployment is handled by Render automatically
        }
        break;
        
      case 'pull_request':
        if (action === 'opened' || action === 'synchronize') {
          console.log(`Pull request ${action}: #${req.body.number}`);
          // Could trigger preview deployments or tests here
        }
        break;
        
      case 'release':
        if (action === 'published') {
          console.log('New release published:', req.body.release.tag_name);
          // Could trigger production deployment or notifications
        }
        break;
        
      case 'workflow_run':
        if (action === 'completed') {
          console.log('GitHub Action completed:', req.body.workflow_run.conclusion);
          // Handle CI/CD pipeline results
        }
        break;
        
      default:
        console.log(`Unhandled GitHub event: ${eventType}`);
    }
    
    res.status(200).json({ 
      received: true, 
      event: eventType,
      processed: true 
    });
    
  } catch (error) {
    console.error('GitHub webhook processing error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

export default router;