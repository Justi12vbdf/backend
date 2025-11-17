import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Server } from "http";
import type { Express } from "express";
import express from "express";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  console.log(`${formattedTime} [express] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
    configFile: path.resolve(__dirname, "../../../apps/frontend/vite.config.ts"),
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "../../../apps/frontend/public/index.html"
      );
      let template = fs.readFileSync(clientTemplate, "utf-8");
      template = await vite.transformIndexHtml(url, template);

      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "../../../dist/frontend");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the frontend build directory. Expected: ${distPath}. ` +
        `Please run 'npm run build:frontend' first.`
    );
  }

  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
