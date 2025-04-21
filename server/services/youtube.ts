import { google } from 'googleapis';
import { YouTubeVideoItem, Comment } from '@shared/types';

// Ensure required environment variables are set
const API_KEY = process.env.YOUTUBE_API_KEY || '';

export class YouTubeService {
  private youtube;
  
  constructor() {
    this.youtube = google.youtube({
      version: 'v3',
      auth: API_KEY
    });
  }
  
  /**
   * Get video information by ID
   */
  async getVideoInfo(videoId: string) {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'statistics'],
        id: [videoId]
      });
      
      if (!response.data.items || response.data.items.length === 0) {
        return null;
      }
      
      const videoItem = response.data.items[0] as YouTubeVideoItem;
      
      // Extract the best available thumbnail
      let thumbnail = '';
      const thumbnails = videoItem.snippet.thumbnails;
      if (thumbnails.maxres) {
        thumbnail = thumbnails.maxres.url;
      } else if (thumbnails.standard) {
        thumbnail = thumbnails.standard.url;
      } else if (thumbnails.high) {
        thumbnail = thumbnails.high.url;
      } else if (thumbnails.medium) {
        thumbnail = thumbnails.medium.url;
      } else if (thumbnails.default) {
        thumbnail = thumbnails.default.url;
      }
      
      return {
        id: videoId,
        title: videoItem.snippet.title,
        description: videoItem.snippet.description,
        channelId: videoItem.snippet.channelId,
        channelTitle: videoItem.snippet.channelTitle,
        publishedAt: videoItem.snippet.publishedAt,
        thumbnail,
        viewCount: parseInt(videoItem.statistics.viewCount, 10) || 0,
        likeCount: parseInt(videoItem.statistics.likeCount, 10) || 0,
        commentCount: parseInt(videoItem.statistics.commentCount, 10) || 0
      };
    } catch (error) {
      console.error('Error fetching video info:', error);
      throw error;
    }
  }
  
  /**
   * Get comments for a video
   */
  async getVideoComments(videoId: string, maxComments: number = 100): Promise<Comment[]> {
    try {
      const comments: Comment[] = [];
      let nextPageToken: string | undefined = undefined;
      
      // We'll fetch in pages until we have enough comments or there are no more
      while (comments.length < maxComments) {
        const response = await this.youtube.commentThreads.list({
          part: ['snippet'],
          videoId,
          maxResults: Math.min(100, maxComments - comments.length), // YouTube API limit is 100 per request
          pageToken: nextPageToken,
          order: 'relevance' // Get most relevant comments first
        });
        
        if (!response.data.items || response.data.items.length === 0) {
          break;
        }
        
        for (const item of response.data.items) {
          const { snippet } = item;
          const commentSnippet = snippet.topLevelComment.snippet;
          
          comments.push({
            id: item.id,
            videoId,
            authorDisplayName: commentSnippet.authorDisplayName,
            authorProfileImageUrl: commentSnippet.authorProfileImageUrl,
            authorChannelId: commentSnippet.authorChannelId?.value,
            textDisplay: commentSnippet.textDisplay,
            textOriginal: commentSnippet.textOriginal,
            likeCount: commentSnippet.likeCount,
            publishedAt: commentSnippet.publishedAt,
            updatedAt: commentSnippet.updatedAt
          });
        }
        
        // Check if there are more comments to fetch
        nextPageToken = response.data.nextPageToken;
        if (!nextPageToken) {
          break;
        }
      }
      
      return comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }
}
