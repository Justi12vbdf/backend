
import { eq, and } from "drizzle-orm";
import { db } from "@repo/database";
import {
  users,
  products,
  orders,
  gallery,
  settings,
  reviews,
  wishlist,
  sizes,
  productSizes,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type Gallery,
  type InsertGallery,
  type Settings,
  type InsertSettings,
  type Size,
  type InsertSize,
  type ProductSize,
  type InsertProductSize,
  type ProductWithSizes,
} from "@repo/database/schema";
import type { IStorage } from "./storage.service";

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, productUpdate: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products)
      .set(productUpdate)
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(productSizes).where(eq(productSizes.productId, id));
    await db.delete(products).where(eq(products.id, id));
  }

  // Orders
  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  // Gallery
  async getAllGalleryImages(): Promise<Gallery[]> {
    return await db.select().from(gallery);
  }

  async createGalleryImage(image: InsertGallery): Promise<Gallery> {
    const result = await db.insert(gallery).values(image).returning();
    return result[0];
  }

  async deleteGalleryImage(id: string): Promise<void> {
    await db.delete(gallery).where(eq(gallery.id, id));
  }

  // Settings
  async getSetting(key: string): Promise<Settings | undefined> {
    const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    return result[0];
  }

  async setSetting(key: string, value: string): Promise<Settings> {
    const existing = await this.getSetting(key);
    if (existing) {
      const result = await db.update(settings)
        .set({ value })
        .where(eq(settings.key, key))
        .returning();
      return result[0];
    }
    const result = await db.insert(settings).values({ key, value }).returning();
    return result[0];
  }

  async getAllSettings(): Promise<Settings[]> {
    return await db.select().from(settings);
  }

  // Reviews
  async createReview(data: any): Promise<any> {
    const result = await db.insert(reviews).values(data).returning();
    return result[0];
  }

  async getProductReviews(productId: string): Promise<any[]> {
    return await db.select().from(reviews).where(eq(reviews.productId, productId));
  }

  async deleteReview(id: string): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  // Wishlist
  async addToWishlist(userId: string, productId: string): Promise<any> {
    const result = await db.insert(wishlist).values({ userId, productId }).returning();
    return result[0];
  }

  async getUserWishlist(userId: string): Promise<any[]> {
    return await db.select().from(wishlist).where(eq(wishlist.userId, userId));
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    await db.delete(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));
  }

  // Sizes
  async getAllSizes(): Promise<Size[]> {
    const result = await db.select().from(sizes).orderBy(sizes.displayOrder);
    return result;
  }

  async createSize(size: InsertSize): Promise<Size> {
    const result = await db.insert(sizes).values(size).returning();
    return result[0];
  }

  async deleteSize(id: string): Promise<void> {
    await db.delete(productSizes).where(eq(productSizes.sizeId, id));
    await db.delete(sizes).where(eq(sizes.id, id));
  }

  // Product Sizes
  async getProductSizes(productId: string): Promise<(ProductSize & { size: Size })[]> {
    const result = await db
      .select()
      .from(productSizes)
      .leftJoin(sizes, eq(productSizes.sizeId, sizes.id))
      .where(eq(productSizes.productId, productId));

    return result.map(row => ({
      ...row.product_sizes,
      size: row.sizes!
    }));
  }

  async getProductWithSizes(productId: string): Promise<ProductWithSizes | undefined> {
    const product = await this.getProduct(productId);
    if (!product) return undefined;

    const productSizesList = await this.getProductSizes(productId);

    return {
      ...product,
      sizes: productSizesList.length > 0 ? productSizesList : undefined,
    };
  }

  async addProductSize(productId: string, sizeId: string, stock: number): Promise<ProductSize> {
    const size = await db.select().from(sizes).where(eq(sizes.id, sizeId)).limit(1);
    if (!size[0]) {
      throw new Error(`Size with id ${sizeId} not found`);
    }

    const product = await this.getProduct(productId);
    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }

    const existing = await db.select()
      .from(productSizes)
      .where(and(eq(productSizes.productId, productId), eq(productSizes.sizeId, sizeId)))
      .limit(1);

    if (existing[0]) {
      throw new Error(`Size ${size[0].name} already added to this product`);
    }

    if (stock < 0) {
      throw new Error("Stock cannot be negative");
    }

    const result = await db.insert(productSizes)
      .values({ productId, sizeId, stock })
      .returning();

    if (!product.hasSizes) {
      await db.update(products)
        .set({ hasSizes: true })
        .where(eq(products.id, productId));
    }

    return result[0];
  }

  async updateProductSizeStock(productId: string, sizeId: string, stock: number): Promise<ProductSize | undefined> {
    if (stock < 0) {
      throw new Error("Stock cannot be negative");
    }

    const size = await db.select().from(sizes).where(eq(sizes.id, sizeId)).limit(1);
    if (!size[0]) {
      throw new Error(`Size with id ${sizeId} not found`);
    }

    const result = await db.update(productSizes)
      .set({ stock })
      .where(and(eq(productSizes.productId, productId), eq(productSizes.sizeId, sizeId)))
      .returning();

    return result[0];
  }

  async deleteProductSize(productId: string, sizeId: string): Promise<boolean> {
    const result = await db.delete(productSizes)
      .where(and(eq(productSizes.productId, productId), eq(productSizes.sizeId, sizeId)))
      .returning();

    if (!result[0]) {
      return false;
    }

    const remaining = await db.select()
      .from(productSizes)
      .where(eq(productSizes.productId, productId));

    if (remaining.length === 0) {
      await db.update(products)
        .set({ hasSizes: false })
        .where(eq(products.id, productId));
    }

    return true;
  }
}
