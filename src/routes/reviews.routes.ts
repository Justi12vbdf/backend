
import type { Express } from "express";
import * as reviewsController from "../controllers/reviews.controller";

export function registerReviewsRoutes(app: Express) {
  app.get("/api/products/:productId/reviews", reviewsController.getProductReviews);
  app.post("/api/products/:productId/reviews", reviewsController.createReview);
  app.delete("/api/reviews/:id", reviewsController.deleteReview);
}
