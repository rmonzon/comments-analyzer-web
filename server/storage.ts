import { 
  videos, 
  comments, 
  analyses,
  premiumInterest,
  users,
  sessions,
  type Comment, 
  type Video, 
  type Analysis, 
  type InsertComment, 
  type InsertVideo, 
  type InsertAnalysis,
  type PremiumInterest,
  type InsertPremiumInterest,
  type User,
  type InsertUser,
  type UpsertUser
} from "@shared/schema";
import { VideoData, VideoAnalysis, KeyPoint, SentimentStats } from "@shared/types";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // Video operations
  getVideo(id: string): Promise<VideoData | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  
  // Comment operations
  getComments(videoId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  createComments(comments: InsertComment[]): Promise<Comment[]>;
  
  // Analysis operations
  getAnalysis(videoId: string): Promise<VideoAnalysis | undefined>;
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  updateAnalysis(videoId: string, analysis: Partial<InsertAnalysis>): Promise<Analysis | undefined>;
  getAllAnalyzedVideos(): Promise<{videoId: string; title: string; channelTitle: string; publishedAt: string; thumbnail: string | null; viewCount: number | null; commentsAnalyzed: number; analysisDate: string}[]>;
  
  // Premium interest operations
  createPremiumInterest(interest: InsertPremiumInterest): Promise<PremiumInterest>;
  getPremiumInterests(): Promise<PremiumInterest[]>;

  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Session store
  sessionStore: any;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // Video operations
  async getVideo(id: string): Promise<VideoData | undefined> {
    try {
      if (!db) throw new Error("Database is not initialized");
      
      const [video] = await db.select().from(videos).where(eq(videos.id, id));
      
      if (!video) return undefined;
      
      const videoComments = await this.getComments(id);
      
      return {
        id: video.id,
        title: video.title,
        description: video.description || "",
        channelId: video.channelId,
        channelTitle: video.channelTitle,
        thumbnail: video.thumbnail || "",
        viewCount: video.viewCount || 0,
        likeCount: video.likeCount || 0,
        commentCount: video.commentCount || 0,
        publishedAt: video.publishedAt.toISOString(),
        comments: videoComments
      };
    } catch (error) {
      console.error("Database error in getVideo:", error);
      throw error;
    }
  }
  
  async createVideo(video: InsertVideo): Promise<Video> {
    try {
      const [result] = await db.insert(videos).values(video).returning();
      return result;
    } catch (error) {
      console.error("Database error in createVideo:", error);
      throw error;
    }
  }
  
  // Comment operations
  async getComments(videoId: string): Promise<Comment[]> {
    try {
      const results = await db.select().from(comments).where(eq(comments.videoId, videoId));
      
      // Map DB comment objects to Comment interface
      return results.map(comment => ({
        id: comment.id,
        videoId: comment.videoId,
        authorDisplayName: comment.authorDisplayName,
        authorProfileImageUrl: comment.authorProfileImageUrl || undefined,
        authorChannelId: comment.authorChannelId || undefined,
        textDisplay: comment.textDisplay,
        textOriginal: comment.textOriginal,
        likeCount: comment.likeCount || 0,
        publishedAt: comment.publishedAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString()
      }));
    } catch (error) {
      console.error("Database error in getComments:", error);
      throw error;
    }
  }
  
  async createComment(comment: InsertComment): Promise<Comment> {
    try {
      const [result] = await db.insert(comments).values(comment).returning();
      return result;
    } catch (error) {
      console.error("Database error in createComment:", error);
      throw error;
    }
  }
  
  async createComments(commentsToInsert: InsertComment[]): Promise<Comment[]> {
    if (commentsToInsert.length === 0) return [];
    
    try {
      // Process comments in batches to avoid issues
      const batchSize = 10;
      const results: Comment[] = [];
      
      for (let i = 0; i < commentsToInsert.length; i += batchSize) {
        const batch = commentsToInsert.slice(i, i + batchSize);
        try {
          console.log(`Inserting batch of ${batch.length} comments`);
          
          // Use on conflict do nothing to handle duplicate IDs
          const batchResults = await db
            .insert(comments)
            .values(batch)
            .onConflictDoNothing({ target: comments.id })
            .returning();
            
          results.push(...batchResults);
          console.log(`Successfully inserted ${batchResults.length} comments`);
        } catch (err) {
          console.error(`Error inserting comment batch:`, err);
          // Try one by one if batch fails
          for (const comment of batch) {
            try {
              const [result] = await db
                .insert(comments)
                .values(comment)
                .onConflictDoNothing({ target: comments.id })
                .returning();
                
              if (result) results.push(result);
            } catch (innerErr) {
              console.error(`Error inserting comment ${comment.id}:`, innerErr);
            }
          }
        }
      }
      
      console.log(`Total comments inserted: ${results.length}`);
      return results;
    } catch (error) {
      console.error("Database error in createComments:", error);
      throw error;
    }
  }
  
  // Analysis operations
  async getAnalysis(videoId: string): Promise<VideoAnalysis | undefined> {
    try {
      const [analysis] = await db.select().from(analyses).where(eq(analyses.videoId, videoId));
      
      if (!analysis) return undefined;
      
      return {
        videoId: analysis.videoId,
        sentimentStats: analysis.sentimentStats as SentimentStats,
        keyPoints: analysis.keyPoints as KeyPoint[],
        comprehensive: analysis.comprehensive,
        commentsAnalyzed: analysis.commentsAnalyzed,
        createdAt: analysis.createdAt.toISOString()
      };
    } catch (error) {
      console.error("Database error in getAnalysis:", error);
      throw error;
    }
  }
  
  async createAnalysis(analysis: InsertAnalysis): Promise<Analysis> {
    try {
      const [result] = await db.insert(analyses).values(analysis).returning();
      return result;
    } catch (error) {
      console.error("Database error in createAnalysis:", error);
      throw error;
    }
  }
  
  async updateAnalysis(videoId: string, updatedAnalysis: Partial<InsertAnalysis>): Promise<Analysis | undefined> {
    try {
      const [existingAnalysis] = await db.select().from(analyses).where(eq(analyses.videoId, videoId));
      
      if (!existingAnalysis) return undefined;
      
      const [updated] = await db
        .update(analyses)
        .set({
          ...updatedAnalysis,
          createdAt: new Date() // Update the timestamp
        })
        .where(eq(analyses.videoId, videoId))
        .returning();
      
      return updated;
    } catch (error) {
      console.error("Database error in updateAnalysis:", error);
      throw error;
    }
  }

  // Premium interest operations
  async createPremiumInterest(interest: InsertPremiumInterest): Promise<PremiumInterest> {
    try {
      console.log("Recording premium interest:", interest);
      const [result] = await db.insert(premiumInterest).values(interest).returning();
      console.log("Premium interest recorded successfully");
      return result;
    } catch (error) {
      console.error("Database error in createPremiumInterest:", error);
      throw error;
    }
  }

  async getPremiumInterests(): Promise<PremiumInterest[]> {
    try {
      const results = await db.select().from(premiumInterest).orderBy(premiumInterest.createdAt);
      return results;
    } catch (error) {
      console.error("Database error in getPremiumInterests:", error);
      throw error;
    }
  }
  
  // Get all analyzed videos with their analysis information
  async getAllAnalyzedVideos(): Promise<{videoId: string; title: string; channelTitle: string; publishedAt: string; thumbnail: string | null; viewCount: number | null; commentsAnalyzed: number; analysisDate: string}[]> {
    try {
      console.log("Getting all analyzed videos from database");
      
      if (!db) {
        console.error("Database connection is not initialized");
        return [];
      }
      
      // Create a simple dataset of analyzed videos for testing
      // In production, this would be replaced with a proper database query
      const sampleVideos = [
        {
          videoId: "dQw4w9WgXcQ",
          title: "Rick Astley - Never Gonna Give You Up",
          channelTitle: "Rick Astley",
          publishedAt: new Date().toISOString(),
          thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
          viewCount: 1234567,
          commentsAnalyzed: 100,
          analysisDate: new Date().toISOString()
        },
        {
          videoId: "9bZkp7q19f0",
          title: "PSY - GANGNAM STYLE",
          channelTitle: "officialpsy",
          publishedAt: new Date().toISOString(),
          thumbnail: "https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg",
          viewCount: 4567890,
          commentsAnalyzed: 150,
          analysisDate: new Date().toISOString()
        }
      ];
      
      console.log("Returning sample data for development purposes");
      return sampleVideos;
    } catch (error) {
      console.error("Error in getAllAnalyzedVideos:", error);
      return []; // Return empty array on error instead of throwing
    }
  }
  
  // Helper method to get all analyses
  private async getAllAnalyses(): Promise<VideoAnalysis[]> {
    try {
      if (!db) return [];
      
      const allAnalyses = await db.select().from(analyses);
      
      return allAnalyses.map(analysis => ({
        videoId: analysis.videoId,
        sentimentStats: analysis.sentimentStats as SentimentStats,
        keyPoints: analysis.keyPoints as KeyPoint[],
        comprehensive: analysis.comprehensive,
        commentsAnalyzed: analysis.commentsAnalyzed,
        createdAt: analysis.createdAt.toISOString()
      }));
    } catch (error) {
      console.error("Error in getAllAnalyses:", error);
      return [];
    }
  }

  // Session store property for Replit Auth
  sessionStore: any;

  constructor() {
    // Session store will be initialized by the Replit Auth setup
    this.sessionStore = null;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error("Database error in getUser:", error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error("Database error in getUserByUsername:", error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      if (!email) return undefined;
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user || undefined;
    } catch (error) {
      console.error("Database error in getUserByEmail:", error);
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      console.log("Creating new user:", user.username);
      const [result] = await db.insert(users).values({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      console.log("User created successfully");
      return result;
    } catch (error) {
      console.error("Database error in createUser:", error);
      throw error;
    }
  }
  
  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      console.log("Upserting user:", userData.username);
      
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      
      console.log("User upserted successfully");
      return user;
    } catch (error) {
      console.error("Database error in upsertUser:", error);
      throw error;
    }
  }
}

// Create and export the storage instance
// We'll use the DatabaseStorage since we have a PostgreSQL database configured
export const storage = new DatabaseStorage();
