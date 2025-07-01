import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import authRoutes from "./routes/auth";
import campaignRoutes from "./routes/campaigns";
import creatorRoutes from "./routes/creators";
import invitationsRoutes from "./routes/invitations";
import webhookRoutes from "./routes/webhooks";
import analyticsRoutes from "./routes/analytics";
import tiktokRoutes from "./routes/tiktok";
import { campaignAutomation } from "./services/campaignAutomation";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  });

  // Root OAuth callback for Replit development
  app.get("/oauth-callback", async (req, res) => {
    try {
      const { auth_code, state } = req.query;
      
      if (!auth_code) {
        return res.status(400).json({ error: 'Authorization code is required' });
      }
      
      // Forward to TikTok API handler
      const { tiktokApi } = await import('./services/tiktokApi.js');
      const accessToken = await tiktokApi.authenticate(auth_code as string);
      
      // Validate the connection
      const validation = await tiktokApi.validateConnection();
      
      if (validation.connected) {
        // Redirect to the main app with success indicator
        res.redirect('/?tiktok_connected=true&dev=true');
      } else {
        res.status(500).json({ 
          error: 'Failed to validate TikTok connection',
          details: validation.error
        });
      }
    } catch (error) {
      console.error('Root OAuth callback error:', error);
      res.status(500).json({ error: 'Failed to connect TikTok account' });
    }
  });

  // Register API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/campaigns", campaignRoutes);
  app.use("/api/creators", creatorRoutes);
  app.use("/api/invitations", invitationsRoutes);
  app.use("/api/webhooks", webhookRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/tiktok", tiktokRoutes);

  // Listen to campaign automation events
  campaignAutomation.on("campaign:started", async ({ campaignId }) => {
    await storage.trackEvent({
      eventType: "campaign_started",
      campaignId,
      data: { timestamp: new Date() }
    });
  });

  campaignAutomation.on("invitation:sent", async ({ campaignId, creatorId }) => {
    await storage.trackEvent({
      eventType: "invitation_sent",
      campaignId,
      creatorId,
      data: { timestamp: new Date() }
    });
  });

  campaignAutomation.on("invitation:accepted", async ({ invitationId }) => {
    await storage.trackEvent({
      eventType: "invitation_accepted",
      invitationId,
      data: { timestamp: new Date() }
    });
  });

  campaignAutomation.on("campaign:completed", async ({ campaignId, stats }) => {
    await storage.trackEvent({
      eventType: "campaign_completed",
      campaignId,
      data: { stats, timestamp: new Date() }
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}