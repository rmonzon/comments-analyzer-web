import { pgTable, text, serial, integer, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
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

// Session storage table for Replit Auth
export const sessions = pgTable(
  "session",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users entity for authentication with Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  bio: text("bio"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments);
export const insertVideoSchema = createInsertSchema(videos);
export const insertAnalysisSchema = createInsertSchema(analyses).omit({ id: true });
export const insertPremiumInterestSchema = createInsertSchema(premiumInterest).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const upsertUserSchema = createInsertSchema(users);

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type InsertPremiumInterest = z.infer<typeof insertPremiumInterestSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

export type Comment = typeof comments.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type Analysis = typeof analyses.$inferSelect;
export type PremiumInterest = typeof premiumInterest.$inferSelect;
export type User = typeof users.$inferSelect;
