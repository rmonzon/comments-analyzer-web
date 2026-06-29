import {
  SITE_URL,
  OG_IMAGE,
  getRouteSeo,
  type RouteSeo,
} from "../shared/seo";

/** Escape a string for safe use inside an HTML double-quoted attribute. */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Escape text content for inside <title>. */
function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Replace the first match of `regex` in `html` with `replacement`. If the tag
 * is not present, `html` is returned unchanged (so the template stays the source
 * of truth for which tags exist).
 */
function replaceTag(html: string, regex: RegExp, replacement: string): string {
  return regex.test(html) ? html.replace(regex, replacement) : html;
}

/**
 * Inject per-route SEO metadata (title, description, canonical, Open Graph and
 * Twitter tags, robots) into the index.html template. Mirrors the client
 * <Seo> component so non-JS crawlers and social/AI scrapers see correct tags.
 */
export function injectSeo(template: string, url: string): string {
  // Build a pathname from the request URL; tolerate absolute or relative URLs.
  let pathname = "/";
  try {
    pathname = new URL(url, SITE_URL).pathname;
  } catch {
    pathname = url.split("?")[0] || "/";
  }

  const seo: RouteSeo = getRouteSeo(pathname);
  const canonical = `${SITE_URL}${seo.path === "/" ? "/" : seo.path}`;
  const title = escapeText(seo.title);
  const titleAttr = escapeAttr(seo.title);
  const desc = escapeAttr(seo.description);
  const robots = seo.noindex ? "noindex, follow" : "index, follow";

  // react-helmet-async marks the tags it manages with data-rh="true". Emitting
  // the same attribute here lets the client-side Helmet adopt these tags on
  // hydration and update them on SPA navigation instead of leaving stale
  // duplicates behind.
  const rh = `data-rh="true"`;

  let html = template;

  html = replaceTag(
    html,
    /<title>[\s\S]*?<\/title>/,
    `<title ${rh}>${title}</title>`,
  );
  html = replaceTag(
    html,
    /<meta\s+name="title"[\s\S]*?\/>/,
    `<meta ${rh} name="title" content="${titleAttr}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta ${rh} name="description" content="${desc}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+name="robots"[\s\S]*?\/>/,
    `<meta ${rh} name="robots" content="${robots}" />`,
  );
  html = replaceTag(
    html,
    /<link\s+rel="canonical"[\s\S]*?\/>/,
    `<link ${rh} rel="canonical" href="${canonical}" />`,
  );

  // Open Graph
  html = replaceTag(
    html,
    /<meta\s+property="og:url"[\s\S]*?\/>/,
    `<meta ${rh} property="og:url" content="${canonical}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:title"[\s\S]*?\/>/,
    `<meta ${rh} property="og:title" content="${titleAttr}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:description"[\s\S]*?\/>/,
    `<meta ${rh} property="og:description" content="${desc}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:image"[\s\S]*?\/>/,
    `<meta ${rh} property="og:image" content="${OG_IMAGE}" />`,
  );

  // Twitter
  html = replaceTag(
    html,
    /<meta\s+property="twitter:url"[\s\S]*?\/>/,
    `<meta ${rh} property="twitter:url" content="${canonical}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+property="twitter:title"[\s\S]*?\/>/,
    `<meta ${rh} property="twitter:title" content="${titleAttr}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+property="twitter:description"[\s\S]*?\/>/,
    `<meta ${rh} property="twitter:description" content="${desc}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+property="twitter:image"[\s\S]*?\/>/,
    `<meta ${rh} property="twitter:image" content="${OG_IMAGE}" />`,
  );

  return html;
}
