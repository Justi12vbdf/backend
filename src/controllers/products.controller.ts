
import type { Request, Response } from 'express';
import { storage } from '../services/storage.service';

export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await storage.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await storage.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    const uploadedImages = files?.map(file => `/uploads/${file.filename}`) || [];

    // Normalize product payload to match DB schema
    const productData: any = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      image: req.body.image || uploadedImages[0] || "",
      additionalImages: uploadedImages.length > 0 ? uploadedImages : undefined,
      category: req.body.category,
      stock: req.body.stock ? parseInt(req.body.stock) : 0,
      available: req.body.available === undefined ? true : req.body.available === 'true' || req.body.available === true,
      shipping: req.body.shipping || 'standard',
      hasSizes: req.body.hasSizes === 'true' || req.body.hasSizes === true,
      popularity: req.body.popularity ? parseInt(req.body.popularity) : 0,
    };

    const newProduct = await storage.createProduct(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    const newImages = files?.map(file => `/uploads/${file.filename}`) || [];

    const productData: any = {};
    if (req.body.name !== undefined) productData.name = req.body.name;
    if (req.body.description !== undefined) productData.description = req.body.description;
    if (req.body.price !== undefined) productData.price = parseFloat(req.body.price);
    if (req.body.image !== undefined) productData.image = req.body.image;
    if (newImages.length > 0) productData.additionalImages = newImages;
    if (req.body.category !== undefined) productData.category = req.body.category;
    if (req.body.stock !== undefined) productData.stock = parseInt(req.body.stock);
    if (req.body.available !== undefined) productData.available = req.body.available === 'true' || req.body.available === true;
    if (req.body.shipping !== undefined) productData.shipping = req.body.shipping;
    if (req.body.hasSizes !== undefined) productData.hasSizes = req.body.hasSizes === 'true' || req.body.hasSizes === true;

    const updated = await storage.updateProduct(req.params.id, productData);
    res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await storage.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
