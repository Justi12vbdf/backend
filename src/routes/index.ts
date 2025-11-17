import type { Express } from "express";
import { createServer, type Server } from "http";
import * as productsController from "../controllers/products.controller";
import { upload } from "../middleware";
import { registerOrdersRoutes } from "./orders.routes";
import { registerGalleryRoutes } from "./gallery.routes";
import { registerSettingsRoutes } from "./settings.routes";
import { registerReviewsRoutes } from "./reviews.routes";
import { registerSizesRoutes } from "./sizes.routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Product routes
  app.get("/api/products", productsController.getProducts);
  app.get("/api/products/:id", productsController.getProductById);
  app.post("/api/products", upload.array('images', 5), productsController.createProduct);
  app.put("/api/products/:id", upload.array('images', 5), productsController.updateProduct);
  app.delete("/api/products/:id", productsController.deleteProduct);

  // Register other route modules
  registerSizesRoutes(app);
  registerOrdersRoutes(app);
  registerGalleryRoutes(app);
  registerSettingsRoutes(app);
  registerReviewsRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}