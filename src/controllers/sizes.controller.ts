
import type { Request, Response } from "express";
import { storage } from "../services/storage.service";

export const getAllSizes = async (_req: Request, res: Response) => {
  try {
    const sizes = await storage.getAllSizes();
    res.json(sizes);
  } catch {
    res.status(500).json({ error: "Failed to fetch sizes" });
  }
};

export const createSize = async (req: Request, res: Response) => {
  try {
    const size = await storage.createSize(req.body);
    res.status(201).json(size);
  } catch {
    res.status(400).json({ error: "Failed to create size" });
  }
};

export const deleteSize = async (req: Request, res: Response) => {
  try {
    await storage.deleteSize(req.params.id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete size" });
  }
};
