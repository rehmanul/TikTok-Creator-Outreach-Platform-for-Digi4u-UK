
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { storage } from '../storage';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Create individual invitation
router.post('/create', async (req, res) => {
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
        products: products?.length || 0,
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

// Bulk invitations
router.post('/bulk', async (req, res) => {
  try {
    const { creatorIds } = req.body;
    const results = [];
    
    for (const creatorId of creatorIds) {
      try {
        const invitation = await storage.createInvitation({
          campaignId: null,
          creatorId: creatorId,
          status: 'sent',
          sentAt: new Date()
        });
        results.push({ creatorId, success: true, invitationId: invitation.id });
      } catch (error) {
        results.push({ creatorId, success: false, error: error.message });
      }
    }
    
    res.json({ results });
  } catch (error) {
    console.error('Error sending bulk invitations:', error);
    res.status(500).json({ message: 'Failed to send bulk invitations' });
  }
});

export default router;
