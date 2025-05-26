import OpenAI from "openai";
import {
  VideoData,
  VideoAnalysis,
  SentimentStats,
  Comment,
} from "@shared/types";

// Using GPT-3.5 Turbo to reduce API costs
const MODEL = "gpt-3.5-turbo";

// Constants for token optimization
const MAX_COMMENT_LENGTH = 300; // 300 characters per comment
const MAX_COMMENT_BATCH_SIZE = 15; // Process comments in batches of 15

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate a comprehensive analysis of video comments
   */
  async generateCommentAnalysis(videoData: VideoData, maxComments: number = 1000): Promise<VideoAnalysis> {
    console.log("Starting OpenAI comment analysis for video:", videoData.id);
    try {
      // Check if API key is available
      if (!process.env.OPENAI_API_KEY) {
        console.error("OpenAI API key is not available");
        throw new Error(
          "OpenAI API key is not configured. Please provide a valid API key.",
        );
      }

      // Filter out comments from the video creator/channel
      const filteredComments = videoData.comments.filter(comment => {
        // Check if the comment author name matches the channel name (case insensitive)
        const isAuthor = comment.authorDisplayName.toLowerCase() === videoData.channelTitle.toLowerCase();
        // Also check if the comment author's channel ID matches the video's channel ID
        const isChannelOwner = comment.authorChannelId === videoData.channelId;
        
        // Only keep comments that are NOT from the author/channel
        return !(isAuthor || isChannelOwner);
      });
      
      console.log(`Filtered out ${videoData.comments.length - filteredComments.length} comments from the video creator`);
      
      // If there are no comments, return a simplified analysis
      if (filteredComments.length === 0) {
        console.log(
          "No comments available for analysis, returning simplified response",
        );
        return {
          videoId: videoData.id,
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
      }

      // Use the full amount of comments the user selected
      const analysisSize = Math.min(filteredComments.length, maxComments);
      const prioritizedComments = this.prioritizeComments(filteredComments, analysisSize);
      
      console.log(
        `Analyzing ${prioritizedComments.length} comments for video ${videoData.id}`,
      );

      // Use optimized approach based on comment count
      if (prioritizedComments.length > 100) {
        // For large sets (100-1000 comments), use highly optimized multi-step analysis
        return await this.analyzeLargeCommentSet(videoData, prioritizedComments);
      } else {
        // For smaller sets, use standard analysis
        return await this.analyzeCommentsBatch(videoData, prioritizedComments);
      }
    } catch (error: any) {
      console.error("Error generating comment analysis:", error);

      // Enhance error message based on error type
      let errorMessage = "Failed to generate analysis";

      if (
        error.status === 429 ||
        (error.error && error.error.type === "insufficient_quota")
      ) {
        errorMessage =
          "429 You exceeded your current quota, please check your plan and billing details.";
      } else if (error.status === 401 || error.message.includes("API key")) {
        errorMessage =
          "401 Invalid API key. Please check your OpenAI API key and try again.";
      } else if (error.message.includes("timed out")) {
        errorMessage =
          "The request to OpenAI API timed out. Please try again later.";
      } else {
        errorMessage = `${errorMessage}: ${error.message || "Unknown error"}`;
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * Prioritize comments that are likely to be more meaningful for analysis
   */
  private prioritizeComments(comments: Comment[], maxComments: number): Comment[] {
    // First, prioritize comments with more likes (they're usually more representative)
    // Then prioritize longer comments that have more substance
    return [...comments]
      .sort((a, b) => {
        // First sort by likes
        if (a.likeCount !== b.likeCount) {
          return b.likeCount - a.likeCount;
        }
        // Then by content length for comments with the same likes
        return b.textOriginal.length - a.textOriginal.length;
      })
      .slice(0, maxComments);
  }

  /**
   * Preprocess comments to reduce token usage
   */
  private preprocessComments(comments: Comment[]): string[] {
    return comments.map((comment) => {
      // Truncate long comments
      const truncatedText =
        comment.textOriginal.length > MAX_COMMENT_LENGTH
          ? comment.textOriginal.substring(0, MAX_COMMENT_LENGTH) + "..."
          : comment.textOriginal;

      // Add like count for more context (only if it has likes)
      const likeInfo = comment.likeCount > 0 ? ` [${comment.likeCount} likes]` : '';
      
      return `${truncatedText}${likeInfo}`;
    });
  }

  /**
   * Analyze a single batch of comments
   */
  private async analyzeCommentsBatch(
    videoData: VideoData,
    commentsToAnalyze: Comment[]
  ): Promise<VideoAnalysis> {
    // Process comments to reduce token usage
    const processedComments = this.preprocessComments(commentsToAnalyze);
    const commentsText = processedComments.join("\n");

    // Simplified prompt to conserve tokens
    const prompt = `
      Analyze these YouTube comments for the video "${videoData.title}" by ${videoData.channelTitle}.
      
      COMMENTS:
      ${commentsText}
      
      Respond with a JSON object containing:
      1. "sentimentStats": percentage distribution of positive, neutral, and negative comments (numbers must sum to 100)
      2. "keyPoints": exactly 3 key discussion points, each with a title and content explanation
      3. "comprehensive": a concise one-paragraph summary of the overall sentiment and main points
    `;

    console.log("Sending request to OpenAI API");
    const response = await this.openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You analyze YouTube comments and provide concise, accurate insights. Always provide exactly 3 key points." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Lower temperature for more consistent outputs
      max_tokens: 600, // Reduced from 800 to 600 to save tokens
    });

    const content = response.choices[0].message.content || "";
    console.log("OpenAI response received successfully");

    try {
      const analysis = JSON.parse(content);

      // Validate the response format contains our expected fields
      if (
        !analysis.sentimentStats ||
        !analysis.keyPoints ||
        !analysis.comprehensive
      ) {
        console.error("Invalid response format from OpenAI", content);
        throw new Error("OpenAI returned an invalid response format");
      }

      return {
        videoId: videoData.id,
        sentimentStats: analysis.sentimentStats,
        keyPoints: analysis.keyPoints,
        comprehensive: analysis.comprehensive,
        commentsAnalyzed: commentsToAnalyze.length,
        createdAt: new Date().toISOString(),
      };
    } catch (parseError: any) {
      console.error("Failed to parse OpenAI response:", parseError);
      throw new Error(
        `Failed to parse analysis: ${parseError?.message || "JSON parsing error"}`,
      );
    }
  }

  /**
   * Analyze a large set of comments using a two-step approach for efficiency
   */
  private async analyzeLargeCommentSet(
    videoData: VideoData,
    allComments: Comment[],
    processedComments: string[]
  ): Promise<VideoAnalysis> {
    console.log("Using two-step analysis for large comment set");
    
    // Step 1: Split comments into batches and analyze each batch
    const batches: string[][] = [];
    for (let i = 0; i < processedComments.length; i += MAX_COMMENT_BATCH_SIZE) {
      batches.push(processedComments.slice(i, i + MAX_COMMENT_BATCH_SIZE));
    }
    
    // Generate initial analyses for each batch
    const batchPromises = batches.map(async (batchComments, index) => {
      console.log(`Analyzing batch ${index + 1} of ${batches.length}`);
      
      const commentsText = batchComments.join("\n");
      const prompt = `
        Analyze this batch of YouTube comments for "${videoData.title}".
        COMMENTS:
        ${commentsText}
        
        Provide a JSON with:
        1. "sentimentCounts": count of {positive, neutral, negative} comments in this batch
        2. "keyPoints": list of key discussion points in these specific comments (1-2 sentence each)
        3. "summary": very brief 1-sentence summary of this batch
      `;
      
      const response = await this.openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: "You extract key themes and sentiment from comment batches. Be extremely concise." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 500, // Very limited tokens for batch analysis
      });
      
      return JSON.parse(response.choices[0].message.content || "{}");
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    // Step 2: Synthesize the batch analyses into a final comprehensive analysis
    const sentimentCounts = {
      positive: 0,
      neutral: 0,
      negative: 0
    };
    
    // Combine all batch key points and summaries
    const allKeyPoints: string[] = [];
    const batchSummaries: string[] = [];
    
    batchResults.forEach(result => {
      if (result.sentimentCounts) {
        sentimentCounts.positive += result.sentimentCounts.positive || 0;
        sentimentCounts.neutral += result.sentimentCounts.neutral || 0;
        sentimentCounts.negative += result.sentimentCounts.negative || 0;
      }
      
      if (result.keyPoints && Array.isArray(result.keyPoints)) {
        allKeyPoints.push(...result.keyPoints);
      }
      
      if (result.summary) {
        batchSummaries.push(result.summary);
      }
    });
    
    // Calculate sentiment percentages
    const total = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;
    const sentimentStats = {
      positive: Math.round((sentimentCounts.positive / total) * 100) || 0,
      neutral: Math.round((sentimentCounts.neutral / total) * 100) || 0,
      negative: Math.round((sentimentCounts.negative / total) * 100) || 0
    };
    
    // Ensure percentages add up to 100
    const sum = sentimentStats.positive + sentimentStats.neutral + sentimentStats.negative;
    if (sum !== 100 && sum > 0) {
      // Adjust the largest value to make sum 100
      const largest = Object.entries(sentimentStats).reduce(
        (a, b) => (a[1] > b[1] ? a : b)
      );
      sentimentStats[largest[0] as keyof SentimentStats] += (100 - sum);
    }
    
    // Final synthesis to get top key points and comprehensive summary
    const finalPrompt = `
      Synthesize analyses from ${batches.length} batches of YouTube comments for "${videoData.title}".
      
      BATCH SUMMARIES:
      ${batchSummaries.join("\n")}
      
      KEY POINT CANDIDATES:
      ${allKeyPoints.slice(0, 15).join("\n")}
      
      Create a final analysis JSON with:
      1. "keyPoints": exactly 3 most important overall key points, each with a "title" and "content"
      2. "comprehensive": concise 1-paragraph overall summary of the comment section
    `;
    
    const finalResponse = await this.openai.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You synthesize multiple analyses into a coherent final analysis. Always provide exactly 3 key points with clear titles."
        },
        { role: "user", content: finalPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 5000,
    });
    
    const finalAnalysis = JSON.parse(finalResponse.choices[0].message.content || "{}");
    
    return {
      videoId: videoData.id,
      sentimentStats: sentimentStats,
      keyPoints: finalAnalysis.keyPoints || [],
      comprehensive: finalAnalysis.comprehensive || "Analysis could not be completed.",
      commentsAnalyzed: allComments.length,
      createdAt: new Date().toISOString(),
    };
  }
}
