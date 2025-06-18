import { google } from "googleapis";
import { YouTubeVideoItem, Comment } from "@shared/types";

// Ensure required environment variables are set
const API_KEY = process.env.YOUTUBE_API_KEY || "";

export class YouTubeService {
  private youtube;

  constructor() {
    this.youtube = google.youtube({
      version: "v3",
      auth: API_KEY,
    });
  }

  /**
   * Get video information by ID
   */
  async getVideoInfo(videoId: string) {
    try {
      const response = await this.youtube.videos.list({
        part: ["snippet", "statistics"],
        id: [videoId],
      });

      if (!response.data.items || response.data.items.length === 0) {
        return null;
      }

      const videoItem = response.data.items[0] as YouTubeVideoItem;

      // Extract the best available thumbnail
      let thumbnail = "";
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
        commentCount: parseInt(videoItem.statistics.commentCount, 10) || 0,
      };
    } catch (error) {
      console.error("Error fetching video info:", error);
      throw error;
    }
  }

  /**
   * Get all comments for a video including reply threads
   */
  async getAllVideoComments(
    videoId: string,
    maxComments: number = 100,
  ): Promise<Comment[]> {
    try {
      console.log(
        `Fetching all comments (including replies) for video ${videoId}, max comments: ${maxComments}`,
      );

      // For videos with no comments or disabled comments, YouTube API throws an error
      // Let's try to handle it gracefully by catching the error and returning an empty array
      try {
        const comments: Comment[] = [];
        let nextPageToken: string | undefined = undefined;

        // We'll fetch in pages until we have enough comments or there are no more
        while (comments.length < maxComments) {
          console.log(
            `Fetching comment threads batch, current count: ${comments.length}, target: ${maxComments}`,
          );
          const response = await this.youtube.commentThreads.list({
            part: ["snippet", "replies"],
            videoId,
            maxResults: Math.min(100, maxComments - comments.length), // YouTube API limit is 100 per request
            pageToken: nextPageToken || undefined,
            order: "relevance", // Get most relevant comments first
          });

          console.log(
            `API response received, items: ${response.data.items?.length || 0}`,
          );

          if (!response.data.items || response.data.items.length === 0) {
            console.log("No comment threads returned from API");
            break;
          }

          for (const item of response.data.items) {
            if (
              !item.snippet ||
              !item.snippet.topLevelComment ||
              !item.snippet.topLevelComment.snippet
            ) {
              console.log("Skipping comment thread with missing data");
              continue;
            }

            // Add the top-level comment
            const topLevelSnippet = item.snippet.topLevelComment.snippet;
            comments.push({
              id: item.snippet.topLevelComment.id || `comment-${comments.length}`,
              videoId,
              authorDisplayName:
                topLevelSnippet.authorDisplayName || "Anonymous",
              authorProfileImageUrl: topLevelSnippet.authorProfileImageUrl || "",
              authorChannelId: topLevelSnippet.authorChannelId?.value,
              textDisplay: topLevelSnippet.textDisplay || "",
              textOriginal: topLevelSnippet.textOriginal || "",
              likeCount: topLevelSnippet.likeCount || 0,
              publishedAt:
                topLevelSnippet.publishedAt || new Date().toISOString(),
              updatedAt: topLevelSnippet.updatedAt || new Date().toISOString(),
            });

            // Add reply comments if they exist and we haven't reached the limit
            if (item.replies && item.replies.comments && comments.length < maxComments) {
              for (const reply of item.replies.comments) {
                if (comments.length >= maxComments) break;
                
                if (!reply.snippet) {
                  console.log("Skipping reply with missing data");
                  continue;
                }

                comments.push({
                  id: reply.id || `reply-${comments.length}`,
                  videoId,
                  authorDisplayName:
                    reply.snippet.authorDisplayName || "Anonymous",
                  authorProfileImageUrl: reply.snippet.authorProfileImageUrl || "",
                  authorChannelId: reply.snippet.authorChannelId?.value,
                  textDisplay: reply.snippet.textDisplay || "",
                  textOriginal: reply.snippet.textOriginal || "",
                  likeCount: reply.snippet.likeCount || 0,
                  publishedAt:
                    reply.snippet.publishedAt || new Date().toISOString(),
                  updatedAt: reply.snippet.updatedAt || new Date().toISOString(),
                });
              }
            }

            // Break if we've reached the comment limit
            if (comments.length >= maxComments) {
              break;
            }
          }

          // Check if there are more comments to fetch
          nextPageToken = response.data.nextPageToken || undefined;
          console.log(`Next page token: ${nextPageToken ? 'exists' : 'none'}, comments so far: ${comments.length}`);
          if (!nextPageToken || comments.length >= maxComments) {
            console.log('Stopping pagination - no more pages or reached comment limit');
            break;
          }
        }

        console.log(
          `Successfully fetched ${comments.length} comments (including replies) for video ${videoId}`,
        );
        return comments.slice(0, maxComments); // Ensure we don't exceed the requested limit
      } catch (commentError: any) {
        // If we get a specific error about comments being disabled, we log it but don't throw
        if (
          commentError.message &&
          (commentError.message.includes("commentsDisabled") ||
            commentError.message.includes("disabled comments"))
        ) {
          console.log("Comments are disabled for this video.");
          return [];
        }
        // Otherwise, we rethrow the error
        throw commentError;
      }
    } catch (error: any) {
      console.error("Error fetching all comments:", error.message);
      return []; // Return empty array on error for graceful degradation
    }
  }

  /**
   * Get comments for a video
   */
  async getVideoComments(
    videoId: string,
    maxComments: number = 100,
  ): Promise<Comment[]> {
    try {
      console.log(
        `Fetching comments for video ${videoId}, max comments: ${maxComments}`,
      );

      // For videos with no comments or disabled comments, YouTube API throws an error
      // Let's try to handle it gracefully by catching the error and returning an empty array
      try {
        const comments: Comment[] = [];
        let nextPageToken: string | undefined = undefined;

        // We'll fetch in pages until we have enough comments or there are no more
        while (comments.length < maxComments) {
          console.log(
            `Fetching comments batch, current count: ${comments.length}, target: ${maxComments}`,
          );
          const response = await this.youtube.commentThreads.list({
            part: ["snippet"],
            videoId,
            maxResults: Math.min(100, maxComments - comments.length), // YouTube API limit is 100 per request
            pageToken: nextPageToken || undefined,
            order: "relevance", // Get most relevant comments first
          });

          console.log(
            `API response received, items: ${response.data.items?.length || 0}`,
          );

          if (!response.data.items || response.data.items.length === 0) {
            console.log("No comments returned from API");
            break;
          }

          for (const item of response.data.items) {
            if (
              !item.snippet ||
              !item.snippet.topLevelComment ||
              !item.snippet.topLevelComment.snippet
            ) {
              console.log("Skipping comment with missing data");
              continue;
            }

            const commentSnippet = item.snippet.topLevelComment.snippet;

            comments.push({
              id: item.id || `comment-${comments.length}`,
              videoId,
              authorDisplayName:
                commentSnippet.authorDisplayName || "Anonymous",
              authorProfileImageUrl: commentSnippet.authorProfileImageUrl || "",
              authorChannelId: commentSnippet.authorChannelId?.value,
              textDisplay: commentSnippet.textDisplay || "",
              textOriginal: commentSnippet.textOriginal || "",
              likeCount: commentSnippet.likeCount || 0,
              publishedAt:
                commentSnippet.publishedAt || new Date().toISOString(),
              updatedAt: commentSnippet.updatedAt || new Date().toISOString(),
            });
          }

          // Check if there are more comments to fetch
          nextPageToken = response.data.nextPageToken || undefined;
          console.log(`Next page token: ${nextPageToken ? 'exists' : 'none'}, comments so far: ${comments.length}`);
          if (!nextPageToken) {
            console.log('No more pages available, stopping pagination');
            break;
          }
        }

        console.log(
          `Successfully fetched ${comments.length} comments for video ${videoId}`,
        );
        return comments;
      } catch (commentError: any) {
        // If we get a specific error about comments being disabled, we log it but don't throw
        if (
          commentError.message &&
          (commentError.message.includes("commentsDisabled") ||
            commentError.message.includes("disabled comments"))
        ) {
          console.log("Comments are disabled for this video.");
          return [];
        }
        // Otherwise, we rethrow the error
        throw commentError;
      }
    } catch (error: any) {
      console.error("Error fetching comments:", error.message);
      return []; // Return empty array on error for graceful degradation
    }
  }
}
