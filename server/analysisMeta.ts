import { storage } from "./storage";
import { SITE_URL } from "../shared/seo";
import {
  videoObjectSchema,
  analysisBreadcrumbSchema,
} from "../shared/structuredData";
import type { SeoOverride } from "./seo";

/** Path pattern for a shared analysis page: /analysis/:videoId */
const ANALYSIS_PATH = /^\/analysis\/([A-Za-z0-9_-]{1,64})\/?$/;

/** Returns the videoId if the pathname is a /analysis/:videoId route. */
export function matchAnalysisPath(pathname: string): string | null {
  const m = pathname.match(ANALYSIS_PATH);
  return m ? m[1] : null;
}

/** Truncate to a clean length for meta descriptions, breaking on a word. */
function truncate(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 40 ? lastSpace : slice.length)}…`;
}

/**
 * Build dynamic SEO metadata for a shared analysis page from cached data.
 * Returns null when the video has never been analyzed (caller should 404).
 */
export async function getAnalysisSeo(
  videoId: string,
): Promise<SeoOverride | null> {
  let video;
  try {
    video = await storage.getVideo(videoId);
  } catch (err) {
    console.error("getAnalysisSeo: getVideo failed", err);
    return null;
  }
  if (!video) return null;

  let analysis;
  try {
    analysis = await storage.getAnalysis(videoId);
  } catch (err) {
    // A missing analysis is non-fatal; render the page without summary text.
    console.error("getAnalysisSeo: getAnalysis failed", err);
  }

  const canonical = `${SITE_URL}/analysis/${videoId}`;
  const title = `${video.title} — YouTube Comment Analysis`;

  let description: string;
  if (analysis?.comprehensive) {
    description = truncate(analysis.comprehensive);
  } else if (analysis?.sentimentStats) {
    const { positive, neutral, negative } = analysis.sentimentStats;
    description = truncate(
      `AI analysis of comments on "${video.title}" by ${video.channelTitle}: ${positive}% positive, ${neutral}% neutral, ${negative}% negative, with key themes and a summary of viewer reactions.`,
    );
  } else {
    description = truncate(
      `AI-powered analysis of YouTube comments on "${video.title}" by ${video.channelTitle} — sentiment breakdown, key discussion themes, and a clear summary of what viewers are saying.`,
    );
  }

  const jsonLd = [
    videoObjectSchema({
      videoId,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      channelTitle: video.channelTitle,
      publishedAt: video.publishedAt,
      viewCount: video.viewCount,
    }),
    analysisBreadcrumbSchema(video.title, `/analysis/${videoId}`),
  ];

  return {
    title,
    description,
    canonical,
    image: video.thumbnail || undefined,
    type: "article",
    noindex: false,
    jsonLd,
  };
}
