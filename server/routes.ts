import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { YouTubeService } from "./services/youtube";
import { OpenAIService } from "./services/openai";
import { z } from "zod";
import { validateYouTubeUrl, extractVideoId } from "../client/src/lib/utils";

export async function registerRoutes(app: Express): Promise<Server> {
  const youtubeService = new YouTubeService();
  const openaiService = new OpenAIService();
  
  // Get video data and comments by video ID
  app.get('/api/youtube/video', async (req, res) => {
    try {
      const videoId = req.query.videoId as string;
      
      if (!videoId) {
        return res.status(400).json({ message: "videoId parameter is required" });
      }
      
      // Check if we already have this video's data in storage
      let videoData = await storage.getVideo(videoId);
      
      if (!videoData) {
        // Fetch from YouTube API
        const videoInfo = await youtubeService.getVideoInfo(videoId);
        if (!videoInfo) {
          return res.status(404).json({ message: "Video not found" });
        }
        
        // Store video info
        await storage.createVideo({
          id: videoInfo.id,
          title: videoInfo.title,
          description: videoInfo.description,
          channelId: videoInfo.channelId,
          channelTitle: videoInfo.channelTitle,
          publishedAt: new Date(videoInfo.publishedAt),
          thumbnail: videoInfo.thumbnail,
          viewCount: videoInfo.viewCount,
          likeCount: videoInfo.likeCount,
          commentCount: videoInfo.commentCount,
          fetchedAt: new Date()
        });
        
        // Fetch and store comments
        const comments = await youtubeService.getVideoComments(videoId);
        if (comments.length > 0) {
          await storage.createComments(comments.map(comment => ({
            id: comment.id,
            videoId: comment.videoId,
            authorDisplayName: comment.authorDisplayName,
            authorProfileImageUrl: comment.authorProfileImageUrl,
            authorChannelId: comment.authorChannelId,
            textDisplay: comment.textDisplay,
            textOriginal: comment.textOriginal,
            likeCount: comment.likeCount,
            publishedAt: new Date(comment.publishedAt),
            updatedAt: new Date(comment.updatedAt)
          })));
        }
        
        // Get the complete video data with comments
        videoData = await storage.getVideo(videoId);
      }
      
      if (!videoData) {
        return res.status(500).json({ message: "Failed to retrieve video data" });
      }
      
      return res.json(videoData);
    } catch (error) {
      console.error("Error fetching video:", error);
      return res.status(500).json({ message: `Failed to fetch video: ${error.message}` });
    }
  });
  
  // Generate summary from comments
  app.post('/api/youtube/summarize', async (req, res) => {
    try {
      const schema = z.object({
        videoId: z.string().min(1)
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request body", errors: result.error.format() });
      }
      
      const { videoId } = result.data;
      
      // Get video data with comments
      const videoData = await storage.getVideo(videoId);
      if (!videoData) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      if (videoData.comments.length === 0) {
        return res.status(400).json({ message: "No comments available for this video" });
      }
      
      // Check if analysis already exists
      let analysis = await storage.getAnalysis(videoId);
      
      if (!analysis) {
        // Generate analysis using OpenAI
        analysis = await openaiService.generateCommentAnalysis(videoData);
        
        // Store the analysis
        await storage.createAnalysis({
          videoId: analysis.videoId,
          sentimentStats: analysis.sentimentStats,
          keyPoints: analysis.keyPoints,
          comprehensive: analysis.comprehensive,
          commentsAnalyzed: analysis.commentsAnalyzed,
          createdAt: new Date()
        });
      }
      
      return res.json({ message: "Analysis generated successfully" });
    } catch (error) {
      console.error("Error generating summary:", error);
      return res.status(500).json({ message: `Failed to generate summary: ${error.message}` });
    }
  });
  
  // Get analysis for a video
  app.get('/api/youtube/analysis', async (req, res) => {
    try {
      const videoId = req.query.videoId as string;
      
      if (!videoId) {
        return res.status(400).json({ message: "videoId parameter is required" });
      }
      
      const analysis = await storage.getAnalysis(videoId);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found for this video" });
      }
      
      return res.json(analysis);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      return res.status(500).json({ message: `Failed to fetch analysis: ${error.message}` });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
