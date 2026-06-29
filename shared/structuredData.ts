// JSON-LD structured data builders, shared by the server-side injector
// (server/seo.ts) and available to the client. Keeping these in one place means
// the markup stays consistent with the per-route metadata in shared/seo.ts.

import { SITE_URL, SITE_NAME } from "./seo";
import { faqData } from "./faqData";

const LOGO_URL = `${SITE_URL}/favicon.svg`;

const SAME_AS = [
  "https://chromewebstore.google.com/detail/youtube-comments-analyzer/jojpopolngligeffhficnhlhliebahep",
  "https://www.producthunt.com/products/youtube-comments-summarizer",
  "https://www.linkedin.com/in/rriverom",
];

export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    sameAs: SAME_AS,
  };
}

export function websiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
  };
}

export function faqPageSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbSchema(
  items: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === "/" ? "/" : item.path}`,
    })),
  };
}

const HOME_CRUMB = { name: "Home", path: "/" };

/**
 * Returns the JSON-LD objects for a given route. The homepage carries the
 * site-wide Organization and WebSite entities; interior pages carry a
 * BreadcrumbList, and the FAQ page additionally carries FAQPage markup.
 */
export function getRouteJsonLd(pathname: string): Record<string, unknown>[] {
  let path = pathname.split("?")[0].split("#")[0];
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  switch (path) {
    case "/":
      return [organizationSchema(), websiteSchema()];
    case "/faq":
      return [
        faqPageSchema(),
        breadcrumbSchema([HOME_CRUMB, { name: "FAQ", path: "/faq" }]),
      ];
    case "/about":
      return [breadcrumbSchema([HOME_CRUMB, { name: "About", path: "/about" }])];
    case "/pricing":
      return [
        breadcrumbSchema([HOME_CRUMB, { name: "Pricing", path: "/pricing" }]),
      ];
    case "/privacy":
      return [
        breadcrumbSchema([
          HOME_CRUMB,
          { name: "Privacy Policy", path: "/privacy" },
        ]),
      ];
    case "/terms":
      return [
        breadcrumbSchema([
          HOME_CRUMB,
          { name: "Terms of Service", path: "/terms" },
        ]),
      ];
    default:
      return [];
  }
}
