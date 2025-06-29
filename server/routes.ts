import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import authRoutes from "./routes/auth";
import campaignRoutes from "./routes/campaigns";
import creatorRoutes from "./routes/creators";
import webhookRoutes from "./routes/webhooks";
import analyticsRoutes from "./routes/analytics";
import { campaignEngine } from "./services/campaignAutomation";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  });

  // Register API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/campaigns", campaignRoutes);
  app.use("/api/creators", creatorRoutes);
  app.use("/api/webhooks", webhookRoutes);
  app.use("/api/analytics", analyticsRoutes);

  // Listen to campaign automation events
  campaignEngine.on("campaign:started", async ({ campaignId }) => {
    await storage.trackEvent({
      eventType: "campaign_started",
      campaignId,
      data: { timestamp: new Date() }
    });
  });

  campaignEngine.on("invitation:sent", async ({ campaignId, creatorId }) => {
    await storage.trackEvent({
      eventType: "invitation_sent",
      campaignId,
      creatorId,
      data: { timestamp: new Date() }
    });
  });

  campaignEngine.on("invitation:accepted", async ({ invitationId }) => {
    await storage.trackEvent({
      eventType: "invitation_accepted",
      invitationId,
      data: { timestamp: new Date() }
    });
  });

  campaignEngine.on("campaign:completed", async ({ campaignId, stats }) => {
    await storage.trackEvent({
      eventType: "campaign_completed",
      campaignId,
      data: { stats, timestamp: new Date() }
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
