import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { injectSeo } from "./seo";
import { matchAnalysisPath, getAnalysisSeo } from "./analysisMeta";

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
      // an unknown video id yields a real 404.
      const videoId = matchAnalysisPath(url.split("?")[0]);
      let status = 200;
      if (videoId) {
        const override = await getAnalysisSeo(videoId);
        if (override) {
          template = injectSeo(template, url, override);
        } else {
          status = 404;
          template = injectSeo(template, url, {
            title: "Analysis Not Found - YouTube Comments Analyzer",
            description: "This analysis could not be found.",
            canonical: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
            noindex: true,
          });
        }
      } else {
        template = injectSeo(template, url);
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
    const videoId = matchAnalysisPath(req.originalUrl.split("?")[0]);
    if (videoId) {
      const override = await getAnalysisSeo(videoId);
      if (override) {
        const page = injectSeo(indexTemplate, req.originalUrl, override);
        return res.status(200).set({ "Content-Type": "text/html" }).end(page);
      }
      const page = injectSeo(indexTemplate, req.originalUrl, {
        title: "Analysis Not Found - YouTube Comments Analyzer",
        description: "This analysis could not be found.",
        canonical: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
        noindex: true,
      });
      return res.status(404).set({ "Content-Type": "text/html" }).end(page);
    }

    const page = injectSeo(indexTemplate, req.originalUrl);
    res.status(200).set({ "Content-Type": "text/html" }).end(page);
  });
}
