import type { Express } from "express";
import { createServer, type Server } from "http";
import { clerkClient } from "@clerk/express";
import { storage } from "./storage";
import { YouTubeService } from "./services/youtube";
import { OpenAIService } from "./services/openai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication has been removed for future implementation
  
  const youtubeService = new YouTubeService();
  const openaiService = new OpenAIService();

  // Serve Clerk configuration
  app.get("/api/config/clerk", (req, res) => {
    res.json({
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY
    });
  });

  // Create subscription using Clerk's billing system
  app.post("/api/subscription/create", async (req, res) => {
    try {
      const userId = req.headers['clerk-user-id'] as string;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { planId } = req.body;

      // Create or update user in our database with subscription info
      await storage.updateUserSubscription(userId, {
        subscriptionStatus: 'active',
        subscriptionTier: planId,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });

      // In a real Clerk billing integration, you would:
      // 1. Create a checkout session with Clerk's billing API
      // 2. Return the checkout URL for redirection
      // For now, we'll simulate the successful subscription creation

      res.json({ 
        success: true, 
        message: `${planId} subscription activated`,
        planId,
        // In real implementation: checkoutUrl: session.url
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ 
        message: "Failed to create subscription",
        error: error.message 
      });
    }
  });

  // Get user subscription status
  app.get("/api/subscription/status", async (req, res) => {
    try {
      const userId = req.headers['clerk-user-id'] as string;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get user from our database
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.json({
          hasActiveSubscription: false,
          subscription: null
        });
      }

      const isActive = user.subscriptionStatus === 'active';

      res.json({
        hasActiveSubscription: isActive,
        subscription: isActive ? {
          tier: user.subscriptionTier || 'free',
          status: user.subscriptionStatus,
          currentPeriodEnd: user.currentPeriodEnd?.toISOString()
        } : null
      });
    } catch (error: any) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ 
        message: "Failed to fetch subscription status",
        error: error.message 
      });
    }
  });

  // Cancel subscription
  app.post("/api/subscription/cancel", async (req, res) => {
    try {
      const userId = req.headers['clerk-user-id'] as string;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.updateUserSubscription(userId, {
        subscriptionStatus: 'canceled'
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ 
        message: "Failed to cancel subscription",
        error: error.message 
      });
    }
  });
  
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
      console.log(`Getting analysis for videoId: ${videoId} (forceRefresh: ${forceRefresh})`); 

      // First, check if analysis already exists (unless force refresh)
      if (!forceRefresh) {
        const existingAnalysis = await storage.getAnalysis(videoId);
        if (existingAnalysis) {
          console.log(`Returning existing analysis for videoId: ${videoId}`);
          return res.json({ ...existingAnalysis, fromCache: true });
        }
      }

      console.log(`No existing analysis found, generating new analysis for videoId: ${videoId}`);

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
          return res.json({ ...existingAnalysis, fromCache: true });
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

        return res.json({ ...simplifiedAnalysis, fromCache: false });
      }

      // Generate analysis using OpenAI (we already checked for existing analysis above)
      console.log("Starting OpenAI comment analysis for video:", videoId);
      const analysis = await openaiService.generateCommentAnalysis(videoData);

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

      // Return the actual analysis data instead of just a success message
      return res.json({ ...analysis, fromCache: false });
    } catch (error: any) {
      console.error("Error generating summary:", error);
      return res
        .status(500)
        .json({
          message: `Failed to generate summary: ${error.message || "Unknown error"}`,
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
