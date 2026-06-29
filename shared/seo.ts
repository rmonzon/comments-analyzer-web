// Centralized SEO metadata shared by the client <Seo> component and the
// server-side meta-injection middleware so crawlers and AI agents that do not
// execute JavaScript still receive correct per-route metadata.

export const SITE_URL = "https://commentsanalyzer.info";
export const SITE_NAME = "YouTube Comments Analyzer";
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;
export const TWITTER_HANDLE = "@commentsanalyzer";

export const DEFAULT_TITLE =
  "YouTube Comments Analyzer - AI-Powered Comment Analysis Tool";

export const DEFAULT_DESCRIPTION =
  "Comment analysis tool powered by AI to analyze comments from YouTube videos. Get instant sentiment analysis, actionable insights, and identify key themes from any video's comment section. Free analysis tool with Chrome extension.";

export interface RouteSeo {
  /** Canonical path, e.g. "/about". */
  path: string;
  title: string;
  description: string;
  /** When true, emit <meta name="robots" content="noindex,follow">. */
  noindex?: boolean;
}

/**
 * Per-route SEO metadata, keyed by pathname (no query string, no trailing
 * slash except for the root "/").
 */
export const ROUTE_SEO: Record<string, RouteSeo> = {
  "/": {
    path: "/",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  "/analyze": {
    path: "/analyze",
    title: "Analyze YouTube Comments - YouTube Comments Analyzer",
    description:
      "Paste any YouTube video URL to instantly analyze its comments with AI. Get sentiment analysis, key discussion themes, and a clear summary of what viewers are saying.",
  },
  "/pricing": {
    path: "/pricing",
    title: "Pricing - YouTube Comments Analyzer",
    description:
      "Compare YouTube Comments Analyzer plans. Start free with AI-powered comment sentiment analysis, or upgrade for more comments per video and deeper insights.",
  },
  "/about": {
    path: "/about",
    title: "About - YouTube Comments Analyzer",
    description:
      "Learn about YouTube Comments Analyzer, the AI tool that turns YouTube comment sections into actionable sentiment analysis and insights for creators, marketers, and researchers.",
  },
  "/faq": {
    path: "/faq",
    title: "FAQ - YouTube Comments Analyzer",
    description:
      "Answers to common questions about YouTube Comments Analyzer: how AI comment analysis works, sentiment accuracy, pricing, the Chrome extension, and data privacy.",
  },
  "/privacy": {
    path: "/privacy",
    title: "Privacy Policy - YouTube Comments Analyzer",
    description:
      "Read the privacy policy for YouTube Comments Analyzer and learn how we handle data when you analyze YouTube video comments.",
  },
  "/terms": {
    path: "/terms",
    title: "Terms of Service - YouTube Comments Analyzer",
    description:
      "Read the terms of service that govern your use of YouTube Comments Analyzer.",
  },
  // Authenticated / utility routes: serve metadata but keep them out of the index.
  "/history": {
    path: "/history",
    title: "Your Analyzed Videos - YouTube Comments Analyzer",
    description:
      "View the history of YouTube videos you have analyzed with YouTube Comments Analyzer.",
    noindex: true,
  },
  "/extension-auth": {
    path: "/extension-auth",
    title: "Extension Sign-In - YouTube Comments Analyzer",
    description: "Sign in to connect the YouTube Comments Analyzer Chrome extension.",
    noindex: true,
  },
};

/** Normalize a pathname: drop query/hash and trailing slash (except root). */
function normalizePath(pathname: string): string {
  let path = pathname.split("?")[0].split("#")[0];
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  return path;
}

/** Look up route metadata for a pathname, falling back to homepage defaults. */
export function getRouteSeo(pathname: string): RouteSeo {
  const path = normalizePath(pathname);
  return (
    ROUTE_SEO[path] ?? {
      path,
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    }
  );
}

/**
 * Static paths the SPA router knows how to render. Used by the server to return
 * a real 404 for everything else (dynamic /analysis/:id is checked separately).
 * "/shared" is included because it 301-redirects to the canonical analysis URL.
 */
export function isKnownStaticRoute(pathname: string): boolean {
  const path = normalizePath(pathname);
  return path in ROUTE_SEO || path === "/shared";
}

/** Indexable static routes, used to build the sitemap. */
export const SITEMAP_STATIC_ROUTES: { path: string; priority: number; changefreq: string }[] = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/analyze", priority: 0.9, changefreq: "weekly" },
  { path: "/pricing", priority: 0.7, changefreq: "monthly" },
  { path: "/about", priority: 0.6, changefreq: "monthly" },
  { path: "/faq", priority: 0.6, changefreq: "monthly" },
  { path: "/privacy", priority: 0.3, changefreq: "yearly" },
  { path: "/terms", priority: 0.3, changefreq: "yearly" },
];
