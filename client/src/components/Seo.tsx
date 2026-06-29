import { Helmet } from "react-helmet-async";
import {
  SITE_URL,
  SITE_NAME,
  OG_IMAGE,
  DEFAULT_DESCRIPTION,
} from "@shared/seo";

interface SeoProps {
  title: string;
  description?: string;
  /** Canonical path beginning with "/", e.g. "/about". Defaults to current path. */
  path?: string;
  image?: string;
  /** og:type, defaults to "website". */
  type?: string;
  noindex?: boolean;
  /** One or more JSON-LD objects to embed as <script type="application/ld+json">. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Per-page SEO tags rendered into <head> via react-helmet-async. Keeps client
 * navigation metadata in sync; the server middleware in server/seo.ts mirrors
 * this for crawlers that do not execute JavaScript.
 */
export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = OG_IMAGE,
  type = "website",
  noindex = false,
  jsonLd,
}: SeoProps) {
  const resolvedPath =
    path ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const canonical = `${SITE_URL}${resolvedPath === "/" ? "/" : resolvedPath}`;
  const jsonLdArray = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex ? (
        <meta name="robots" content="noindex, follow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonical} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {jsonLdArray.map((obj, i) => (
        <script type="application/ld+json" key={i}>
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
}
