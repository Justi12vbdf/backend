
import type { Request, Response } from "express";
import { storage } from "../services/storage.service";
import { insertOrderSchema } from "@database/schema";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const validatedData = insertOrderSchema.parse(req.body);
    const order = await storage.createOrder({
      ...validatedData,
      status: "pending",
    });

    console.log("\n=== ORDER CONFIRMATION EMAIL ===");
    console.log(`To: ${order.customerEmail}`);
    console.log(`Subject: Potwierdzenie zamówienia #${order.id.slice(0, 8)}`);
    console.log(`\nSzanowny/a ${order.customerName},`);
    console.log(`\nDziękujemy za złożenie zamówienia w BHP Perfect!`);
    console.log(`\nNumer zamówienia: ${order.id}`);
    console.log(`Kwota: ${order.total} zł`);
    console.log(`Adres dostawy: ${order.customerAddress}`);
    console.log(`Status: Oczekuje na realizację`);
    console.log("\nSkontaktujemy się z Tobą wkrótce.");
    console.log("================================\n");

    res.status(201).json(order);
  } catch {
    res.status(400).json({ error: "Invalid order data" });
  }
};

export const getAllOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await storage.getAllOrders();
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await storage.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch {
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const orders = await storage.getAllOrders();
    const order = orders.find((o) => o.id === req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ success: true, status });
  } catch {
    res.status(500).json({ error: "Failed to update order status" });
  }
};
