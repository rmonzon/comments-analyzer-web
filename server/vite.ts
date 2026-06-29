import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { injectSeo } from "./seo";
import { matchAnalysisPath, getAnalysisSeo } from "./analysisMeta";
import { isKnownStaticRoute } from "../shared/seo";

const NOT_FOUND_SEO = {
  title: "Page Not Found - YouTube Comments Analyzer",
  description: "The page you are looking for could not be found.",
  noindex: true,
};

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );

      // Dynamic /analysis/:videoId pages get metadata derived from stored data;
      // unknown video ids and unknown routes yield a real 404 (no soft-404s).
      const pathname = url.split("?")[0];
      const videoId = matchAnalysisPath(pathname);
      const selfUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      let status = 200;
      if (videoId) {
        const override = await getAnalysisSeo(videoId);
        if (override) {
          template = injectSeo(template, url, override);
        } else {
          status = 404;
          template = injectSeo(template, url, {
            ...NOT_FOUND_SEO,
            title: "Analysis Not Found - YouTube Comments Analyzer",
            description: "This analysis could not be found.",
            canonical: selfUrl,
          });
        }
      } else if (isKnownStaticRoute(pathname)) {
        template = injectSeo(template, url);
      } else {
        status = 404;
        template = injectSeo(template, url, {
          ...NOT_FOUND_SEO,
          canonical: selfUrl,
        });
      }

      const page = await vite.transformIndexHtml(url, template);
      res.status(status).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Read the built index.html once and inject per-route SEO metadata on each
  // navigation request so non-JS crawlers receive correct tags.
  const indexPath = path.resolve(distPath, "index.html");
  const indexTemplate = fs.readFileSync(indexPath, "utf-8");

  // fall through to index.html if the file doesn't exist
  app.use("*", async (req, res) => {
    const url = req.originalUrl;
    const pathname = url.split("?")[0];
    const selfUrl = `${req.protocol}://${req.get("host")}${url}`;
    const videoId = matchAnalysisPath(pathname);

    if (videoId) {
      const override = await getAnalysisSeo(videoId);
      if (override) {
        const page = injectSeo(indexTemplate, url, override);
        return res.status(200).set({ "Content-Type": "text/html" }).end(page);
      }
      const page = injectSeo(indexTemplate, url, {
        ...NOT_FOUND_SEO,
        title: "Analysis Not Found - YouTube Comments Analyzer",
        description: "This analysis could not be found.",
        canonical: selfUrl,
      });
      return res.status(404).set({ "Content-Type": "text/html" }).end(page);
    }

    if (isKnownStaticRoute(pathname)) {
      const page = injectSeo(indexTemplate, url);
      return res.status(200).set({ "Content-Type": "text/html" }).end(page);
    }

    const page = injectSeo(indexTemplate, url, {
      ...NOT_FOUND_SEO,
      canonical: selfUrl,
    });
    res.status(404).set({ "Content-Type": "text/html" }).end(page);
  });
}
