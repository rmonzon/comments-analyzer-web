import { storage } from "./storage";
import { SITE_URL, SITEMAP_STATIC_ROUTES } from "../shared/seo";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toW3CDate(value: string | Date | undefined): string {
  const d = value ? new Date(value) : new Date();
  return Number.isNaN(d.getTime())
    ? new Date().toISOString()
    : d.toISOString();
}

interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

function renderUrl({ loc, lastmod, changefreq, priority }: UrlEntry): string {
  const parts = [`    <loc>${escapeXml(loc)}</loc>`];
  if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`);
  if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority !== undefined)
    parts.push(`    <priority>${priority.toFixed(1)}</priority>`);
  return `  <url>\n${parts.join("\n")}\n  </url>`;
}

/**
 * Build the sitemap from the indexable static routes plus one entry per
 * analyzed video (/analysis/:videoId). Failures fetching analyzed videos are
 * non-fatal — the static routes are always emitted.
 */
export async function generateSitemap(): Promise<string> {
  const now = new Date().toISOString();
  const entries: UrlEntry[] = SITEMAP_STATIC_ROUTES.map((r) => ({
    loc: `${SITE_URL}${r.path === "/" ? "/" : r.path}`,
    lastmod: now,
    changefreq: r.changefreq,
    priority: r.priority,
  }));

  try {
    const videos = await storage.getAllAnalyzedVideos();
    for (const v of videos) {
      if (!v.videoId) continue;
      entries.push({
        loc: `${SITE_URL}/analysis/${v.videoId}`,
        lastmod: toW3CDate(v.analysisDate),
        changefreq: "monthly",
        priority: 0.8,
      });
    }
  } catch (err) {
    console.error("generateSitemap: failed to load analyzed videos", err);
  }

  const body = entries.map(renderUrl).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
