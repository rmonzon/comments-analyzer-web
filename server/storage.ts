import { 
  videos, 
  comments, 
  analyses,
  type Comment, 
  type Video, 
  type Analysis, 
  type InsertComment, 
  type InsertVideo, 
  type InsertAnalysis 
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
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // Video operations
  async getVideo(id: string): Promise<VideoData | undefined> {
    try {
      const [video] = await db.select().from(videos).where(eq(videos.id, id));
      
      if (!video) return undefined;
      
      const videoComments = await this.getComments(id);
      
      return {
        ...video,
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
      return results;
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
  
  async createComments(comments: InsertComment[]): Promise<Comment[]> {
    if (comments.length === 0) return [];
    
    try {
      const results = await db.insert(comments).values(comments).returning();
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
}

// Create and export the storage instance
// We'll use the DatabaseStorage since we have a PostgreSQL database configured
export const storage = new DatabaseStorage();
