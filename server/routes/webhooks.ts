import { Router } from 'express';
import crypto from 'crypto';
import { tiktokApi } from '../services/tiktokApi';
import { campaignAutomation } from '../services/campaignAutomation';

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

export default router;