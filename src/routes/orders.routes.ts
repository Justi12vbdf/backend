
import type { Express } from "express";
import * as ordersController from "../controllers/orders.controller";

export function registerOrdersRoutes(app: Express) {
  app.post("/api/orders", ordersController.createOrder);
  app.get("/api/orders", ordersController.getAllOrders);
  app.get("/api/orders/:id", ordersController.getOrderById);
  app.patch("/api/orders/:id/status", ordersController.updateOrderStatus);
}
