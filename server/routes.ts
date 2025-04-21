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
    } catch (error: any) {
      console.error("Error fetching video:", error);
      return res.status(500).json({ message: `Failed to fetch video: ${error.message || 'Unknown error'}` });
    }
  });
  
  // Generate summary from comments
  app.post('/api/youtube/summarize', async (req, res) => {
    try {
      console.log("Received summarize request with body:", req.body);
      
      const schema = z.object({
        videoId: z.string().min(1)
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        console.log("Invalid request body:", result.error.format());
        return res.status(400).json({ message: "Invalid request body", errors: result.error.format() });
      }
      
      const { videoId } = result.data;
      console.log("Generating summary for videoId:", videoId);
      
      // Get video data with comments
      const videoData = await storage.getVideo(videoId);
      if (!videoData) {
        console.log("Video not found in storage:", videoId);
        return res.status(404).json({ message: "Video not found" });
      }
      
      console.log(`Video found with ${videoData.comments.length} comments`);
      
      // If there are no comments, we'll generate a simplified analysis
      if (videoData.comments.length === 0) {
        console.log("No comments available for video:", videoId);
        console.log("We'll generate a simplified analysis");
        
        // Check if simplified analysis already exists for this video
        const existingAnalysis = await storage.getAnalysis(videoId);
        if (existingAnalysis) {
          console.log("Using existing simplified analysis");
          return res.json(existingAnalysis);
        }
        
        // Create a simplified analysis when there are no comments
        const simplifiedAnalysis = {
          videoId,
          sentimentStats: { positive: 0, neutral: 100, negative: 0 },
          keyPoints: [{ 
            title: "No Comments Available", 
            content: "This video either has comments disabled or no comments have been posted yet."
          }],
          comprehensive: "No comments were found for this video. The video creator may have disabled comments, or the video may be too recent to have received any comments. Without comments, we cannot provide a comprehensive analysis of viewer feedback.",
          commentsAnalyzed: 0,
          createdAt: new Date().toISOString()
        };
        
        // Store the simplified analysis
        await storage.createAnalysis({
          videoId: simplifiedAnalysis.videoId,
          sentimentStats: simplifiedAnalysis.sentimentStats,
          keyPoints: simplifiedAnalysis.keyPoints,
          comprehensive: simplifiedAnalysis.comprehensive,
          commentsAnalyzed: simplifiedAnalysis.commentsAnalyzed,
          createdAt: new Date()
        });
        
        return res.json(simplifiedAnalysis);
      }
      
      // Check if analysis already exists
      let analysis = await storage.getAnalysis(videoId);
      
      if (analysis) {
        console.log("Using existing analysis for video:", videoId);
      } else {
        console.log("Generating new analysis for video:", videoId);
        // Generate analysis using OpenAI
        analysis = await openaiService.generateCommentAnalysis(videoData);
        
        console.log("Analysis generated, storing in database");
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
      
      console.log("Returning analysis data");
      // Return the actual analysis data instead of just a success message
      return res.json(analysis);
    } catch (error: any) {
      console.error("Error generating summary:", error);
      return res.status(500).json({ message: `Failed to generate summary: ${error.message || 'Unknown error'}` });
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
    } catch (error: any) {
      console.error("Error fetching analysis:", error);
      return res.status(500).json({ message: `Failed to fetch analysis: ${error.message || 'Unknown error'}` });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
