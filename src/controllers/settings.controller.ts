
import type { Request, Response } from "express";
import { storage } from "../services/storage.service";

export const getAllSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await storage.getAllSettings();
    res.json(settings);
  } catch {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

export const getSetting = async (req: Request, res: Response) => {
  try {
    const setting = await storage.getSetting(req.params.key);
    if (!setting) {
      return res.status(404).json({ error: "Setting not found" });
    }
    res.json(setting);
  } catch {
    res.status(500).json({ error: "Failed to fetch setting" });
  }
};

export const updateSetting = async (req: Request, res: Response) => {
  try {
    const setting = await storage.setSetting(req.params.key, req.body.value);
    res.json(setting);
  } catch {
    res.status(500).json({ error: "Failed to update setting" });
  }
};
