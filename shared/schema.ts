import { pgTable, text, serial, integer, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Comment entity
export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  videoId: text("video_id").notNull(),
  authorDisplayName: text("author_display_name").notNull(),
  authorProfileImageUrl: text("author_profile_image_url"),
  authorChannelId: text("author_channel_id"),
  textDisplay: text("text_display").notNull(),
  textOriginal: text("text_original").notNull(),
  likeCount: integer("like_count").default(0),
  publishedAt: timestamp("published_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Video entity
export const videos = pgTable("videos", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  channelId: text("channel_id").notNull(),
  channelTitle: text("channel_title").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  thumbnail: text("thumbnail"),
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  fetchedAt: timestamp("fetched_at").notNull(),
});

// Analysis entity for storing the AI generated summary
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  videoId: text("video_id").notNull().unique(),
  sentimentStats: jsonb("sentiment_stats").notNull(),
  keyPoints: jsonb("key_points").notNull(),
  comprehensive: text("comprehensive").notNull(),
  commentsAnalyzed: integer("comments_analyzed").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

// Premium interest entity to track users interested in analyzing more comments
export const premiumInterest = pgTable("premium_interest", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  commentCount: integer("comment_count").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Users entity for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Shared Analysis entity - for public sharing of analyses
export const sharedAnalyses = pgTable("shared_analyses", {
  shareId: text("share_id").primaryKey(),
  videoId: text("video_id").notNull().references(() => videos.id),
  userId: integer("user_id").references(() => users.id),
  username: text("username"), // Denormalized for performance
  createdAt: timestamp("created_at").defaultNow().notNull(),
  views: integer("views").default(0),
});

export const insertCommentSchema = createInsertSchema(comments);
export const insertVideoSchema = createInsertSchema(videos);
export const insertAnalysisSchema = createInsertSchema(analyses).omit({ id: true });
export const insertPremiumInterestSchema = createInsertSchema(premiumInterest).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSharedAnalysisSchema = createInsertSchema(sharedAnalyses).omit({ views: true, createdAt: true });

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type InsertPremiumInterest = z.infer<typeof insertPremiumInterestSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSharedAnalysis = z.infer<typeof insertSharedAnalysisSchema>;

export type Comment = typeof comments.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type Analysis = typeof analyses.$inferSelect;
export type PremiumInterest = typeof premiumInterest.$inferSelect;
export type User = typeof users.$inferSelect;
export type SharedAnalysis = typeof sharedAnalyses.$inferSelect;
