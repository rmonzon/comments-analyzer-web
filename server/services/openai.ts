import OpenAI from "openai";
import {
  VideoData,
  VideoAnalysis,
  KeyPoint,
  SentimentStats,
} from "@shared/types";

// Using GPT-3.5 Turbo to reduce API costs
const MODEL = "gpt-3.5-turbo";

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
  async generateCommentAnalysis(videoData: VideoData): Promise<VideoAnalysis> {
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
      
      // Use only a subset of comments if there are too many - now using a smaller sample
      const MAX_COMMENTS = 20; // Reduced from 100 to 20 to conserve tokens
      const commentsToAnalyze = filteredComments.slice(0, MAX_COMMENTS);

      // If there are no comments, return a simplified analysis
      if (commentsToAnalyze.length === 0) {
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

      // Prepare comments for analysis - truncate long comments to save tokens
      console.log(
        `Analyzing ${commentsToAnalyze.length} comments for video ${videoData.id}`,
      );

      // Process comments to reduce token usage
      const MAX_COMMENT_LENGTH = 300; // Limit each comment to 300 characters
      const processedComments = commentsToAnalyze.map((comment) => {
        // Truncate long comments
        const truncatedText =
          comment.textOriginal.length > MAX_COMMENT_LENGTH
            ? comment.textOriginal.substring(0, MAX_COMMENT_LENGTH) + "..."
            : comment.textOriginal;

        return `${comment.authorDisplayName}: ${truncatedText}`;
      });

      // Take only the first N comments to keep the context window smaller
      const commentsText = processedComments.join("\n\n");

      // Simplified prompt to conserve tokens
      const prompt = `
        Analyze these ${commentsToAnalyze.length} YouTube comments for the video "${videoData.title}" by ${videoData.channelTitle}.
        Note: Comments from the video creator have been excluded to focus on viewer feedback only.
        
        COMMENTS:
        ${commentsText}
        
        Create a concise analysis in this JSON format:
        {
          "sentimentStats": {
            "positive": (% of positive comments, 0-100),
            "neutral": (% of neutral comments, 0-100),
            "negative": (% of negative comments, 0-100)
          },
          "keyPoints": [
            {
              "title": "Key point theme",
              "content": "Brief explanation with examples"
            },
            ... (3 key points total)
          ],
          "comprehensive": "A concise 1-paragraph summary of the overall sentiment and main discussion points."
        }
      `;

      // Make standard API call with GPT-3.5 Turbo to reduce costs
      console.log("Sending request to OpenAI API");
      const response = await this.openai.chat.completions.create({
        model: MODEL, // Using GPT-3.5-Turbo to reduce costs
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3, // Lower temperature for more focused outputs
        max_tokens: 800, // Limit the response size
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
}
