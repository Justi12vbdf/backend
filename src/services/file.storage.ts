import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { Product, InsertProduct } from '../../../../packages/shared/types/index';

const DATA_DIR = path.resolve(process.cwd(), 'apps', 'backend', 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PRODUCTS_FILE)) fs.writeFileSync(PRODUCTS_FILE, '[]');
}

function readProducts(): Product[] {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function writeProducts(products: Product[]) {
  ensureDataDir();
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

export class FileStorage {
  async getAllProducts(): Promise<Product[]> {
    return readProducts();
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return readProducts().find((p) => p.id === id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const products = readProducts();
    const newProduct: any = {
      id: randomUUID(),
      name: product.name,
      description: product.description,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      image: (product as any).image || '',
      additionalImages: (product as any).additionalImages || null,
      category: (product as any).category || '',
      stock: (product as any).stock ?? 0,
      available: (product as any).available ?? true,
      shipping: (product as any).shipping ?? 'standard',
      hasSizes: (product as any).hasSizes ?? false,
      popularity: (product as any).popularity ?? 0,
      createdAt: new Date().toISOString(),
    };
    products.push(newProduct);
    writeProducts(products);
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const products = readProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    const updated = { ...products[idx], ...product } as any;
    products[idx] = updated;
    writeProducts(products);
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    const products = readProducts();
    const filtered = products.filter((p) => p.id !== id);
    writeProducts(filtered);
  }
}

export const fileStorage = new FileStorage();
