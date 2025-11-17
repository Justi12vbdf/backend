
import type { Request, Response } from "express";
import { storage } from "../services/storage.service";

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await storage.getProductReviews(req.params.productId);
    res.json(reviews);
  } catch {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const review = await storage.createReview({
      productId: req.params.productId,
      userId: req.body.userId || null,
      customerName: req.body.customerName,
      rating: parseInt(req.body.rating),
      comment: req.body.comment,
    });
    res.status(201).json(review);
  } catch {
    res.status(400).json({ error: "Failed to create review" });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    await storage.deleteReview(req.params.id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete review" });
  }
};
