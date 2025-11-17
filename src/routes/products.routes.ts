import { Router, type Request, Response } from "express";
import * as ProductController from "../controllers/products.controller";

const router = Router();

// GET endpoints
router.get("/", ProductController.getProducts);
router.get("/:id", ProductController.getProductById);

// POST endpoint - создание нового товара
router.post("/", ProductController.createProduct);

// PUT endpoint - обновление товара
router.put("/:id", ProductController.updateProduct);

// DELETE endpoint - удаление товара
router.delete("/:id", ProductController.deleteProduct);

export default router;
