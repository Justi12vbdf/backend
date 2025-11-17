
import type { Request, Response } from "express";
import { storage } from "../services/storage.service";

export const getAllGalleryImages = async (_req: Request, res: Response) => {
  try {
    const images = await storage.getAllGalleryImages();
    res.json(images);
  } catch {
    res.status(500).json({ error: "Failed to fetch gallery images" });
  }
};

export const uploadGalleryImage = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const galleryImage = await storage.createGalleryImage({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
    });
    res.status(201).json(galleryImage);
  } catch {
    res.status(400).json({ error: "Failed to upload image" });
  }
};

export const deleteGalleryImage = async (req: Request, res: Response) => {
  try {
    await storage.deleteGalleryImage(req.params.id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete gallery image" });
  }
};
