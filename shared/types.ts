export interface Comment {
  id: string;
  videoId: string;
  authorDisplayName: string;
  authorProfileImageUrl?: string;
  authorChannelId?: string;
  textDisplay: string;
  textOriginal: string;
  likeCount: number;
  publishedAt: string;
  updatedAt: string;
}

export interface VideoData {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  comments: Comment[];
}

export interface KeyPoint {
  title: string;
  content: string;
}

export interface SentimentStats {
  positive: number;
  neutral: number;
  negative: number;
}

export interface VideoAnalysis {
  videoId: string;
  sentimentStats: SentimentStats;
  keyPoints: KeyPoint[];
  comprehensive: string;
  commentsAnalyzed: number;
  createdAt: string;
  fromCache?: boolean;
}

export interface YouTubeVideoResponse {
  kind: string;
  etag: string;
  items: YouTubeVideoItem[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface YouTubeVideoItem {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: YouTubeThumbnail;
      medium: YouTubeThumbnail;
      high: YouTubeThumbnail;
      standard?: YouTubeThumbnail;
      maxres?: YouTubeThumbnail;
    };
    channelTitle: string;
    tags?: string[];
    categoryId: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
}

export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeCommentResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeCommentItem[];
}

export interface YouTubeCommentItem {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    authorDisplayName: string;
    authorProfileImageUrl: string;
    authorChannelUrl: string;
    authorChannelId: {
      value: string;
    };
    videoId: string;
    textDisplay: string;
    textOriginal: string;
    canRate: boolean;
    viewerRating: string;
    likeCount: number;
    publishedAt: string;
    updatedAt: string;
  };
}
