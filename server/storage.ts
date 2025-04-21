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

// In-memory storage implementation
export class MemStorage implements IStorage {
  private videos: Map<string, Video>;
  private comments: Map<string, Comment[]>;
  private analyses: Map<string, Analysis>;
  private analysisCounter: number;
  
  constructor() {
    this.videos = new Map();
    this.comments = new Map();
    this.analyses = new Map();
    this.analysisCounter = 1;
  }
  
  // Video operations
  async getVideo(id: string): Promise<VideoData | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const videoComments = this.comments.get(id) || [];
    return {
      ...video,
      comments: videoComments
    };
  }
  
  async createVideo(video: InsertVideo): Promise<Video> {
    this.videos.set(video.id, video as Video);
    return video as Video;
  }
  
  // Comment operations
  async getComments(videoId: string): Promise<Comment[]> {
    return this.comments.get(videoId) || [];
  }
  
  async createComment(comment: InsertComment): Promise<Comment> {
    const videoComments = this.comments.get(comment.videoId) || [];
    videoComments.push(comment as Comment);
    this.comments.set(comment.videoId, videoComments);
    return comment as Comment;
  }
  
  async createComments(comments: InsertComment[]): Promise<Comment[]> {
    if (comments.length === 0) return [];
    
    const videoId = comments[0].videoId;
    const existingComments = this.comments.get(videoId) || [];
    
    const newComments = comments.map(comment => comment as Comment);
    this.comments.set(videoId, [...existingComments, ...newComments]);
    
    return newComments;
  }
  
  // Analysis operations
  async getAnalysis(videoId: string): Promise<VideoAnalysis | undefined> {
    const analysis = Array.from(this.analyses.values()).find(a => a.videoId === videoId);
    if (!analysis) return undefined;
    
    return {
      videoId: analysis.videoId,
      sentimentStats: analysis.sentimentStats as SentimentStats,
      keyPoints: analysis.keyPoints as KeyPoint[],
      comprehensive: analysis.comprehensive,
      commentsAnalyzed: analysis.commentsAnalyzed,
      createdAt: analysis.createdAt.toISOString()
    };
  }
  
  async createAnalysis(analysis: InsertAnalysis): Promise<Analysis> {
    const id = this.analysisCounter++;
    const newAnalysis = {
      ...analysis,
      id,
      createdAt: new Date()
    } as Analysis;
    
    this.analyses.set(id.toString(), newAnalysis);
    return newAnalysis;
  }
  
  async updateAnalysis(videoId: string, updatedAnalysis: Partial<InsertAnalysis>): Promise<Analysis | undefined> {
    const existingAnalysis = Array.from(this.analyses.values()).find(a => a.videoId === videoId);
    if (!existingAnalysis) return undefined;
    
    const updated = {
      ...existingAnalysis,
      ...updatedAnalysis,
      createdAt: new Date()
    };
    
    this.analyses.set(existingAnalysis.id.toString(), updated);
    return updated;
  }
}

// Create and export the storage instance
export const storage = new MemStorage();
