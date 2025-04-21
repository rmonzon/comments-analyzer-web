import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Validate YouTube URL format
export function validateYouTubeUrl(url: string): boolean {
  // Support different YouTube URL formats:
  // - Standard: https://www.youtube.com/watch?v=VIDEO_ID
  // - Short: https://youtu.be/VIDEO_ID
  // - Embedded: https://www.youtube.com/embed/VIDEO_ID
  // - Mobile: https://m.youtube.com/watch?v=VIDEO_ID
  // - Shorts: https://www.youtube.com/shorts/VIDEO_ID
  const standardPattern = /^(https?:\/\/)?(www\.|m\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})($|&.*)/;
  const shortPattern = /^(https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})($|&.*|\?.*)/;
  const embedPattern = /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})($|&.*|\?.*)/;
  const shortsPattern = /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})($|&.*|\?.*)/;
  
  return standardPattern.test(url) || shortPattern.test(url) || embedPattern.test(url) || shortsPattern.test(url);
}

// Extract video ID from YouTube URL
export function extractVideoId(url: string): string | null {
  // Handle standard YouTube URLs
  let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  
  if (match && match[1]) {
    return match[1];
  }
  
  // Handle URLs with v parameter
  match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})(&|$)/);
  
  return match && match[1] ? match[1] : null;
}

// Format view count
export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

// Format date to relative time
export function formatPublishDate(dateString: string): string {
  const publishDate = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - publishDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 1) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours < 1) {
      return "Just now";
    }
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  } else if (diffInDays < 30) {
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
  } else if (diffInDays < 365) {
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
  } else {
    return publishDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard) {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error("Fallback: Could not copy text: ", err);
      return false;
    }
  }
  
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Clipboard API: Could not copy text: ", err);
    return false;
  }
}
