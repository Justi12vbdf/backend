
import type { Express } from "express";
import * as sizesController from "../controllers/sizes.controller";

export function registerSizesRoutes(app: Express) {
  app.get("/api/sizes", sizesController.getAllSizes);
  app.post("/api/sizes", sizesController.createSize);
  app.delete("/api/sizes/:id", sizesController.deleteSize);
}
