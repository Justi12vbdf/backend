
import type { Express } from "express";
import * as settingsController from "../controllers/settings.controller";

export function registerSettingsRoutes(app: Express) {
  app.get("/api/settings", settingsController.getAllSettings);
  app.get("/api/settings/:key", settingsController.getSetting);
  app.put("/api/settings/:key", settingsController.updateSetting);
}
