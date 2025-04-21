import OpenAI from "openai";
import { VideoData, VideoAnalysis, KeyPoint, SentimentStats } from "@shared/types";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

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
      // Use only a subset of comments if there are too many
      const MAX_COMMENTS = 100;
      const commentsToAnalyze = videoData.comments.slice(0, MAX_COMMENTS);
      
      // Prepare comments for analysis
      const commentsText = commentsToAnalyze.map(comment => 
        `${comment.authorDisplayName}: ${comment.textOriginal}`
      ).join('\n\n');
      
      const prompt = `
        Analyze these YouTube comments for the video titled "${videoData.title}".
        
        VIDEO DETAILS:
        - Title: ${videoData.title}
        - Channel: ${videoData.channelTitle}
        - Comment Count: ${videoData.commentCount}
        
        COMMENTS:
        ${commentsText}
        
        Please create a comprehensive analysis and provide your response in the following JSON format:
        {
          "sentimentStats": {
            "positive": (percentage of positive comments, as a number from 0-100),
            "neutral": (percentage of neutral comments, as a number from 0-100),
            "negative": (percentage of negative comments, as a number from 0-100)
          },
          "keyPoints": [
            {
              "title": "Key point title or theme",
              "content": "Detailed explanation of this discussion point with specific examples from comments"
            },
            ... (3-5 key points in total)
          ],
          "comprehensive": "A multi-paragraph summary (4-5 paragraphs) of the overall comment sentiment, main discussion points, controversies, questions, and patterns in the comments. The summary should be detailed, insightful and focus on what viewers are saying about the content."
        }
      `;
      
      const response = await this.openai.chat.completions.create({
        model: MODEL,
        messages: [{ 
          role: "user", 
          content: prompt 
        }],
        response_format: { type: "json_object" },
        temperature: 0.5,
      });
      
      const content = response.choices[0].message.content || '';
      console.log("OpenAI response content:", content);
      const analysis = JSON.parse(content);
      
      return {
        videoId: videoData.id,
        sentimentStats: analysis.sentimentStats,
        keyPoints: analysis.keyPoints,
        comprehensive: analysis.comprehensive,
        commentsAnalyzed: commentsToAnalyze.length,
        createdAt: new Date().toISOString()
      };
    } catch (error: any) {
      console.error("Error generating comment analysis:", error);
      throw new Error(`Failed to generate analysis: ${error.message || 'Unknown error'}`);
    }
  }
}
