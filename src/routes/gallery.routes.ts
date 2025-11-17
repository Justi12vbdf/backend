
import type { Express } from "express";
import { upload } from "../middleware";
import * as galleryController from "../controllers/gallery.controller";

export function registerGalleryRoutes(app: Express) {
  app.get("/api/gallery", galleryController.getAllGalleryImages);
  app.post("/api/gallery", upload.single("image"), galleryController.uploadGalleryImage);
  app.delete("/api/gallery/:id", galleryController.deleteGalleryImage);
}
