import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb, uuid, decimal, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  companyName: text("company_name").notNull(),
  role: text("role").notNull().default('admin'),
  tiktokBusinessId: text("tiktok_business_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    emailIdx: index("users_email_idx").on(table.email),
  };
});

// TikTok Creators table
export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  tiktokId: text("tiktok_id").notNull().unique(),
  username: text("username").notNull(),
  displayName: text("display_name"),
  followerCount: integer("follower_count").notNull(),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }),
  avgViews: integer("avg_views"),
  categories: text().array(),
  location: text("location"),
  language: text("language"),
  email: text("email"),
  bio: text("bio"),
  gmv: decimal("gmv", { precision: 12, scale: 2 }),
  isVerified: boolean("is_verified").default(false),
  metadata: jsonb("metadata"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    usernameIdx: index("creators_username_idx").on(table.username),
    followerCountIdx: index("creators_follower_count_idx").on(table.followerCount),
    categoriesIdx: index("creators_categories_idx").on(table.categories),
  };
});

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default('draft'), // draft, active, paused, completed
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  spent: decimal("spent", { precision: 10, scale: 2 }).default('0'),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  targetCategories: text().array(),
  targetFollowerMin: integer("target_follower_min"),
  targetFollowerMax: integer("target_follower_max"),
  targetEngagementMin: decimal("target_engagement_min", { precision: 5, scale: 2 }),
  targetGmvMin: decimal("target_gmv_min", { precision: 12, scale: 2 }),
  targetLocations: text().array(),
  inviteLimit: integer("invite_limit").default(100),
  inviteDelay: integer("invite_delay").default(30), // seconds
  messageTemplate: text("message_template").notNull(),
  productDetails: jsonb("product_details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index("campaigns_user_id_idx").on(table.userId),
    statusIdx: index("campaigns_status_idx").on(table.status),
  };
});

// Invitations table
export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  creatorId: integer("creator_id").references(() => creators.id).notNull(),
  status: text("status").notNull().default('pending'), // pending, sent, viewed, responded, accepted, declined
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  respondedAt: timestamp("responded_at"),
  response: text("response"),
  collaborationTerms: jsonb("collaboration_terms"),
  retryCount: integer("retry_count").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    campaignIdIdx: index("invitations_campaign_id_idx").on(table.campaignId),
    creatorIdIdx: index("invitations_creator_id_idx").on(table.creatorId),
    statusIdx: index("invitations_status_idx").on(table.status),
  };
});

// Collaborations table
export const collaborations = pgTable("collaborations", {
  id: serial("id").primaryKey(),
  invitationId: integer("invitation_id").references(() => invitations.id).notNull(),
  status: text("status").notNull().default('active'), // active, completed, cancelled
  agreedTerms: jsonb("agreed_terms").notNull(),
  deliverables: jsonb("deliverables"),
  performance: jsonb("performance"),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default('0'),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Analytics events table
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(), // invitation_sent, response_received, collaboration_started, etc.
  campaignId: integer("campaign_id").references(() => campaigns.id),
  creatorId: integer("creator_id").references(() => creators.id),
  invitationId: integer("invitation_id").references(() => invitations.id),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    eventTypeIdx: index("analytics_events_type_idx").on(table.eventType),
    campaignIdIdx: index("analytics_events_campaign_idx").on(table.campaignId),
    createdAtIdx: index("analytics_events_created_idx").on(table.createdAt),
  };
});

// API Keys table for third-party integrations
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  service: text("service").notNull(), // tiktok, gemini, stripe, etc.
  keyHash: text("key_hash").notNull(),
  isActive: boolean("is_active").default(true),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreatorSchema = createInsertSchema(creators).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  spent: true,
});

export const insertInvitationSchema = createInsertSchema(invitations).omit({
  id: true,
  createdAt: true,
});

export const insertCollaborationSchema = createInsertSchema(collaborations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCreator = z.infer<typeof insertCreatorSchema>;
export type Creator = typeof creators.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type Invitation = typeof invitations.$inferSelect;
export type InsertCollaboration = z.infer<typeof insertCollaborationSchema>;
export type Collaboration = typeof collaborations.$inferSelect;
