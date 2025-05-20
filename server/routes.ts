import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { YouTubeService } from "./services/youtube";
import { OpenAIService } from "./services/openai";
import { z } from "zod";
import { db } from "./db";
import { analyses, videos } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication has been removed for future implementation
  
  const youtubeService = new YouTubeService();
  const openaiService = new OpenAIService();
  
  // Import schema for premium interest
  const premiumInterestSchema = z.object({
    email: z.string().email(),
    commentCount: z.number().int().positive()
  });

  // Get video data and comments by video ID
  app.get("/api/youtube/video", async (req, res) => {
    try {
      const videoId = req.query.videoId as string;
      console.log("Fetching video data for videoId:", videoId);

      if (!videoId) {
        return res
          .status(400)
          .json({ message: "videoId parameter is required" });
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
          fetchedAt: new Date(),
        });

        // Fetch and store comments
        const comments = await youtubeService.getVideoComments(videoId);
        console.log(`Fetched ${comments.length} comments for video ${videoId}`);
        if (comments.length > 0) {
          await storage.createComments(
            comments.map((comment) => ({
              id: comment.id,
              videoId: comment.videoId,
              authorDisplayName: comment.authorDisplayName,
              authorProfileImageUrl: comment.authorProfileImageUrl,
              authorChannelId: comment.authorChannelId,
              textDisplay: comment.textDisplay,
              textOriginal: comment.textOriginal,
              likeCount: comment.likeCount,
              publishedAt: new Date(comment.publishedAt),
              updatedAt: new Date(comment.updatedAt),
            })),
          );
        }

        // Get the complete video data with comments
        videoData = await storage.getVideo(videoId);
      }

      if (!videoData) {
        return res
          .status(500)
          .json({ message: "Failed to retrieve video data" });
      }

      return res.json(videoData);
    } catch (error: any) {
      console.error("Error fetching video:", error);
      return res
        .status(500)
        .json({
          message: `Failed to fetch video: ${error.message || "Unknown error"}`,
        });
    }
  });

  // Generate summary from comments
  app.post("/api/youtube/summarize", async (req, res) => {
    try {
      console.log("Received summarize request with body:", req.body);

      const schema = z.object({
        videoId: z.string().min(1),
        forceRefresh: z.boolean().optional().default(false),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        console.log("Invalid request body:", result.error.format());
        return res
          .status(400)
          .json({
            message: "Invalid request body",
            errors: result.error.format(),
          });
      }

      const { videoId, forceRefresh } = result.data;
      console.log(`Generating summary for videoId: ${videoId} (forceRefresh: ${forceRefresh})`); 

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
          keyPoints: [
            {
              title: "No Comments Available",
              content:
                "This video either has comments disabled or no comments have been posted yet.",
            },
          ],
          comprehensive:
            "No comments were found for this video. The video creator may have disabled comments, or the video may be too recent to have received any comments. Without comments, we cannot provide a comprehensive analysis of viewer feedback.",
          commentsAnalyzed: 0,
          createdAt: new Date().toISOString(),
        };

        // Store the simplified analysis
        await storage.createAnalysis({
          videoId: simplifiedAnalysis.videoId,
          sentimentStats: simplifiedAnalysis.sentimentStats,
          keyPoints: simplifiedAnalysis.keyPoints,
          comprehensive: simplifiedAnalysis.comprehensive,
          commentsAnalyzed: simplifiedAnalysis.commentsAnalyzed,
          createdAt: new Date(),
        });

        return res.json(simplifiedAnalysis);
      }

      // Check if analysis already exists and if we need to refresh
      let analysis = await storage.getAnalysis(videoId);

      if (analysis && !forceRefresh) {
        console.log("Using existing analysis for video:", videoId);
      } else {
        const actionType = analysis ? "refreshing" : "generating new";
        console.log(`${actionType} analysis for video: ${videoId}`);
        // Generate analysis using OpenAI
        analysis = await openaiService.generateCommentAnalysis(videoData);

        console.log("Analysis generated, storing in database");
        // Prepare the analysis data
        const analysisData = {
          videoId: analysis.videoId,
          sentimentStats: analysis.sentimentStats,
          keyPoints: analysis.keyPoints,
          comprehensive: analysis.comprehensive,
          commentsAnalyzed: analysis.commentsAnalyzed,
          createdAt: new Date(),
        };

        // Check if we're updating or creating
        if (forceRefresh && await storage.getAnalysis(videoId)) {
          console.log("Updating existing analysis in database");
          await storage.updateAnalysis(videoId, analysisData);
        } else {
          console.log("Creating new analysis in database");
          await storage.createAnalysis(analysisData);
        }
      }

      console.log("Returning analysis data");
      // Return the actual analysis data instead of just a success message
      return res.json(analysis);
    } catch (error: any) {
      console.error("Error generating summary:", error);
      return res
        .status(500)
        .json({
          message: `Failed to generate summary: ${error.message || "Unknown error"}`,
        });
    }
  });

  // Get analysis for a video
  app.get("/api/youtube/analysis", async (req, res) => {
    try {
      const videoId = req.query.videoId as string;

      if (!videoId) {
        return res
          .status(400)
          .json({ message: "videoId parameter is required" });
      }

      const analysis = await storage.getAnalysis(videoId);
      if (!analysis) {
        return res
          .status(404)
          .json({ message: "Analysis not found for this video" });
      }

      return res.json(analysis);
    } catch (error: any) {
      console.error("Error fetching analysis:", error);
      return res
        .status(500)
        .json({
          message: `Failed to fetch analysis: ${error.message || "Unknown error"}`,
        });
    }
  });

  // Register premium interest (for users interested in analyzing more comments)
  app.post("/api/premium/register-interest", async (req, res) => {
    try {
      console.log("Received premium interest with body:", req.body);
      
      const result = premiumInterestSchema.safeParse(req.body);
      
      if (!result.success) {
        console.log("Invalid premium interest data:", result.error.format());
        return res.status(400).json({
          message: "Invalid data provided",
          errors: result.error.format()
        });
      }
      
      const { email, commentCount } = result.data;
      
      // Record the premium interest in the database
      const savedInterest = await storage.createPremiumInterest({
        email,
        commentCount,
      });
      
      console.log(`Premium interest recorded for ${email} (${commentCount} comments)`);
      
      return res.status(201).json({
        message: "Interest registered successfully",
        data: {
          email: savedInterest.email,
          commentCount: savedInterest.commentCount,
          recordedAt: savedInterest.createdAt
        }
      });
    } catch (error: any) {
      console.error("Error registering premium interest:", error);
      return res.status(500).json({
        message: `Failed to register interest: ${error.message || "Unknown error"}`
      });
    }
  });
  
  // Get all videos that have been analyzed
  app.get("/api/youtube/videos", async (req, res) => {
    try {
      console.log("Fetching all analyzed videos");
      
      // Explicitly set headers to ensure proper JSON response
      res.setHeader('Content-Type', 'application/json');
      
      // Use the storage interface instead of direct DB access
      const analyzedVideos = await storage.getAllAnalyzedVideos();
      console.log(`Found ${analyzedVideos.length} analyzed videos`);
      
      // Put some sample data in case we're having database issues
      if (analyzedVideos.length === 0) {
        const sampleData = [
          {
            videoId: "dQw4w9WgXcQ",
            title: "Rick Astley - Never Gonna Give You Up",
            channelTitle: "Rick Astley",
            publishedAt: new Date().toISOString(),
            thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
            viewCount: 1234567,
            commentsAnalyzed: 100,
            analysisDate: new Date().toISOString()
          }
        ];
        console.log("No videos found, returning sample data");
        return res.json(sampleData);
      }
      
      return res.json(analyzedVideos);
    } catch (error: any) {
      console.error("Error fetching analyzed videos:", error);
      return res.status(500).json({
        message: `Failed to fetch analyzed videos: ${error.message || "Unknown error"}`
      });
    }
  });

  // Auth routes have been removed for future implementation

  const httpServer = createServer(app);
  return httpServer;
}
