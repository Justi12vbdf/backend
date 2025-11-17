import {
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
} from '../../../../packages/shared/types/index';
import { fileStorage } from './file.storage';
import { dbStorage } from '../../../../packages/database';
import { randomUUID } from 'crypto';

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Products
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getAllOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;

  // Gallery
  getAllGalleryImages(): Promise<Gallery[]>;
  createGalleryImage(image: InsertGallery): Promise<Gallery>;
  deleteGalleryImage(id: string): Promise<void>;

  // Settings
  getSetting(key: string): Promise<Settings | undefined>;
  setSetting(key: string, value: string): Promise<Settings>;
  getAllSettings(): Promise<Settings[]>;

  // Reviews
  createReview(data: any): Promise<any>;
  getProductReviews(productId: string): Promise<any[]>;
  deleteReview(id: string): Promise<void>;

  // Wishlist
  addToWishlist(userId: string, productId: string): Promise<any>;
  getUserWishlist(userId: string): Promise<any[]>;
  removeFromWishlist(userId: string, productId: string): Promise<void>;

  // Sizes
  getAllSizes(): Promise<Size[]>;
  createSize(size: InsertSize): Promise<Size>;
  deleteSize(id: string): Promise<void>;

  // Product Sizes
  getProductSizes(productId: string): Promise<(ProductSize & { size: Size })[]>;
  getProductWithSizes(productId: string): Promise<ProductWithSizes | undefined>;
  addProductSize(productId: string, sizeId: string, stock: number): Promise<ProductSize>;
  updateProductSizeStock(
    productId: string,
    sizeId: string,
    stock: number
  ): Promise<ProductSize | undefined>;
  deleteProductSize(productId: string, sizeId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private gallery: Map<string, Gallery>;
  private settings: Map<string, Settings>;
  private reviews: Map<string, any>;
  private wishlist: Map<string, any>;
  private sizes: Map<string, Size>;
  private productSizes: Map<string, ProductSize>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.gallery = new Map();
    this.settings = new Map();
    this.reviews = new Map();
    this.wishlist = new Map();
    this.sizes = new Map();
    this.productSizes = new Map();
    this.seedData();
    this.seedSettings();
    this.seedGallery();
    this.seedSizes();
    this.seedProductSizes();
  }

  private seedData() {
    // По одному продукту для каждой категории
    const sampleProducts: InsertProduct[] = [
      {
        name: 'Bluza robocza BHP Perfect',
        description:
          'Wytrzymała bluza robocza z wysokiej jakości materiału. Idealna do pracy w różnych warunkach.',
        price: '89.99',
        image: '/attached_assets/Bluza robocza BHP_1763265481399.jpg',
        category: 'odziez-robocza',
        stock: 50,
        available: true,
        shipping: 'standard',
        hasSizes: true,
        popularity: 85,
      },
      {
        name: 'Buty robocze S3 Premium',
        description:
          'Bezpieczne buty robocze z podnoskiem stalowym i podeszwą antyprzebiciową. Klasa ochrony S3.',
        price: '159.99',
        image: '/attached_assets/Buty robocze S3 Premium_1763265481403.jpg',
        category: 'obuwie',
        stock: 40,
        available: true,
        shipping: 'standard',
        hasSizes: true,
        popularity: 92,
      },
      {
        name: 'Rękawice ochronne Nitrilon',
        description:
          'Rękawice robocze powlekane nitrylem. Doskonała przyczepność i odporność na przebicie.',
        price: '12.99',
        image: '/attached_assets/Rękawice ochronne Nitrilon_1763265481405.jpg',
        category: 'rekawice',
        stock: 200,
        available: true,
        shipping: 'standard',
        hasSizes: true,
        popularity: 78,
      },
      {
        name: 'Kask ochronny SafeGuard',
        description:
          'Profesjonalny kask budowlany z regulacją. Spełnia najwyższe normy bezpieczeństwa.',
        price: '45.99',
        image: '/attached_assets/Kask ochronny SafeGuard_1763265481405.jpg',
        category: 'ochrona-glowy',
        stock: 75,
        available: true,
        shipping: 'standard',
        hasSizes: false,
        popularity: 88,
      },
    ];

    sampleProducts.forEach((product) => {
      const id = randomUUID();
      const createdAt = new Date().toISOString();
      this.products.set(id, {
        ...product,
        id,
        stock: product.stock ?? 0,
        images: [],
        available: true,
        shipping: 'standard',
        hasSizes: false,
        popularity: product.popularity ?? 0,
        createdAt,
      });
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    // ensure required fields on User type (insertUser.isAdmin may be optional)
    const user: User = {
      ...insertUser,
      id,
      isAdmin: insertUser.isAdmin ?? false,
    };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    // ensure stock is present (InsertProduct.stock can be optional)
    const product: Product = {
      ...insertProduct,
      id,
      stock: insertProduct.stock ?? 0,
      images: insertProduct.images ?? [],
      available: insertProduct.available ?? true,
      shipping: insertProduct.shipping ?? 'standard',
      hasSizes: insertProduct.hasSizes ?? false,
      popularity: insertProduct.popularity ?? 0,
      createdAt,
    };
    this.products.set(id, product);
    return product;
  }

  // Order methods
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    // ensure required Order fields (status/userId) have defaults matching DB defaults
    const order: Order = {
      ...insertOrder,
      id,
      createdAt,
      status: insertOrder.status ?? 'pending',
      userId: insertOrder.userId ?? null,
    };
    this.orders.set(id, order);
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  // Product update/delete methods
  async updateProduct(
    id: string,
    productUpdate: Partial<InsertProduct>
  ): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;

    const updated: Product = {
      ...existing,
      ...productUpdate,
      images: productUpdate.images ?? existing.images,
      available: productUpdate.available ?? existing.available,
      shipping: productUpdate.shipping ?? existing.shipping,
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    this.products.delete(id);

    // Clean up related product-size entries
    const productSizesToDelete = Array.from(this.productSizes.values()).filter(
      (ps) => ps.productId === id
    );

    productSizesToDelete.forEach((ps) => {
      this.productSizes.delete(ps.id);
    });
  }

  // Gallery methods
  async getAllGalleryImages(): Promise<Gallery[]> {
    return Array.from(this.gallery.values());
  }

  async createGalleryImage(insertGallery: InsertGallery): Promise<Gallery> {
    const id = randomUUID();
    const uploadedAt = new Date().toISOString();
    const galleryImage: Gallery = {
      ...insertGallery,
      id,
      uploadedAt,
    };
    this.gallery.set(id, galleryImage);
    return galleryImage;
  }

  async deleteGalleryImage(id: string): Promise<void> {
    this.gallery.delete(id);
  }

  // Settings methods
  async getSetting(key: string): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find((s) => s.key === key);
  }

  async setSetting(key: string, value: string): Promise<Settings> {
    const existing = await this.getSetting(key);
    if (existing) {
      existing.value = value;
      this.settings.set(existing.id, existing);
      return existing;
    }

    const id = randomUUID();
    const setting: Settings = { id, key, value };
    this.settings.set(id, setting);
    return setting;
  }

  async getAllSettings(): Promise<Settings[]> {
    return Array.from(this.settings.values());
  }

  private seedSettings() {
    // Seed default settings
    const defaultSettings = [
      { key: 'siteName', value: 'Sklep BHP Perfekt' },
      { key: 'bannerShow', value: 'true' },
      { key: 'bannerText', value: 'Promocja! -20% na całą odzież roboczą!' },
      { key: 'bannerLink', value: '/products' },
    ];

    defaultSettings.forEach((setting) => {
      const id = randomUUID();
      this.settings.set(id, { id, ...setting });
    });
  }

  private seedGallery() {
    // Seed gallery with actual store photos
    const sampleImages = [
      {
        filename: 'store-exterior.jpg',
        path: '/attached_assets/ChIJkU9DeF-7HkcR2F-99SdJk7I-Sklep-BHP-Pogotowie-BHP-1_1760716833435.jpg',
      },
      {
        filename: 'category-workwear.jpg',
        path: '/attached_assets/category-odziez-robocza.jpg',
      },
      {
        filename: 'category-footwear.jpg',
        path: '/attached_assets/category-obuwie.jpg',
      },
      {
        filename: 'category-head-protection.jpg',
        path: '/attached_assets/category-ochrona-glowy.jpg',
      },
      {
        filename: 'category-gloves.jpg',
        path: '/attached_assets/category-rekawice.jpg',
      },
      {
        filename: 'bhp-hero-banner.jpg',
        path: '/attached_assets/bhp-hero.jpg',
      },
    ];

    sampleImages.forEach((image) => {
      const id = randomUUID();
      const uploadedAt = new Date().toISOString();
      this.gallery.set(id, { id, ...image, uploadedAt });
    });
  }

  // Reviews
  async createReview(data: any) {
    const review = {
      id: randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.reviews.set(review.id, review);
    return review;
  }

  async getProductReviews(productId: string) {
    return Array.from(this.reviews.values()).filter((review) => review.productId === productId);
  }

  async deleteReview(id: string) {
    this.reviews.delete(id);
  }

  // Wishlist
  async addToWishlist(userId: string, productId: string) {
    const item = {
      id: randomUUID(),
      userId,
      productId,
      createdAt: new Date().toISOString(),
    };
    this.wishlist.set(item.id, item);
    return item;
  }

  async getUserWishlist(userId: string) {
    return Array.from(this.wishlist.values()).filter((item) => item.userId === userId);
  }

  async removeFromWishlist(userId: string, productId: string) {
    const item = Array.from(this.wishlist.values()).find(
      (w) => w.userId === userId && w.productId === productId
    );
    if (item) {
      this.wishlist.delete(item.id);
    }
  }

  // Sizes
  private seedSizes() {
    const standardSizes = [
      { name: 'XS', displayOrder: 1 },
      { name: 'S', displayOrder: 2 },
      { name: 'M', displayOrder: 3 },
      { name: 'L', displayOrder: 4 },
      { name: 'XL', displayOrder: 5 },
      { name: 'XXL', displayOrder: 6 },
      { name: 'XXXL', displayOrder: 7 },
      { name: '36', displayOrder: 8 },
      { name: '37', displayOrder: 9 },
      { name: '38', displayOrder: 10 },
      { name: '39', displayOrder: 11 },
      { name: '40', displayOrder: 12 },
      { name: '41', displayOrder: 13 },
      { name: '42', displayOrder: 14 },
      { name: '43', displayOrder: 15 },
      { name: '44', displayOrder: 16 },
      { name: '45', displayOrder: 17 },
      { name: '46', displayOrder: 18 },
      { name: '47', displayOrder: 19 },
      { name: '48', displayOrder: 20 },
    ];

    standardSizes.forEach((size) => {
      const id = randomUUID();
      const createdAt = new Date().toISOString();
      this.sizes.set(id, { id, ...size, createdAt });
    });
  }

  private seedProductSizes() {
    // Товары удалены, поэтому связи размеров не создаются
    return;
  }

  async getAllSizes(): Promise<Size[]> {
    return Array.from(this.sizes.values()).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async createSize(insertSize: InsertSize): Promise<Size> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const size: Size = {
      ...insertSize,
      id,
      displayOrder: insertSize.displayOrder ?? 0,
      createdAt,
    };
    this.sizes.set(id, size);
    return size;
  }

  async deleteSize(id: string): Promise<void> {
    this.sizes.delete(id);
    // Also delete associated product sizes
    Array.from(this.productSizes.values())
      .filter((ps) => ps.sizeId === id)
      .forEach((ps) => this.productSizes.delete(ps.id));
  }

  async getProductSizes(productId: string): Promise<(ProductSize & { size: Size })[]> {
    const productSizesList = Array.from(this.productSizes.values()).filter(
      (ps) => ps.productId === productId
    );

    return productSizesList
      .map((ps) => {
        const size = this.sizes.get(ps.sizeId);
        return {
          ...ps,
          size: size!,
        };
      })
      .filter((ps) => ps.size !== undefined);
  }

  async getProductWithSizes(productId: string): Promise<ProductWithSizes | undefined> {
    const product = await this.getProduct(productId);
    if (!product) return undefined;

    // Get sizes for the product (empty array if no sizes)
    const sizes = await this.getProductSizes(productId);

    // Always return the product, with empty sizes array if no sizes exist
    return {
      ...product,
      sizes: sizes.length > 0 ? sizes : undefined,
    };
  }

  async addProductSize(productId: string, sizeId: string, stock: number): Promise<ProductSize> {
    // Validate that size exists
    const size = this.sizes.get(sizeId);
    if (!size) {
      throw new Error(`Size with id ${sizeId} not found`);
    }

    // Validate that product exists
    const product = this.products.get(productId);
    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }

    // Check for duplicates
    const existingProductSize = Array.from(this.productSizes.values()).find(
      (ps) => ps.productId === productId && ps.sizeId === sizeId
    );
    if (existingProductSize) {
      throw new Error(`Size ${size.name} already added to this product`);
    }

    // Validate stock is non-negative
    if (stock < 0) {
      throw new Error('Stock cannot be negative');
    }

    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const productSize: ProductSize = {
      id,
      productId,
      sizeId,
      stock,
      createdAt,
    };
    this.productSizes.set(id, productSize);

    // Update product.hasSizes to true if this is the first size
    if (!product.hasSizes) {
      product.hasSizes = true;
      this.products.set(productId, product);
    }

    return productSize;
  }

  async updateProductSizeStock(
    productId: string,
    sizeId: string,
    stock: number
  ): Promise<ProductSize | undefined> {
    // Validate stock is non-negative
    if (stock < 0) {
      throw new Error('Stock cannot be negative');
    }

    // Validate that size exists
    const size = this.sizes.get(sizeId);
    if (!size) {
      throw new Error(`Size with id ${sizeId} not found`);
    }

    const productSize = Array.from(this.productSizes.values()).find(
      (ps) => ps.productId === productId && ps.sizeId === sizeId
    );
    if (!productSize) return undefined;

    productSize.stock = stock;
    this.productSizes.set(productSize.id, productSize);
    return productSize;
  }

  async deleteProductSize(productId: string, sizeId: string): Promise<boolean> {
    const productSize = Array.from(this.productSizes.values()).find(
      (ps) => ps.productId === productId && ps.sizeId === sizeId
    );
    if (!productSize) {
      return false; // Not found
    }

    this.productSizes.delete(productSize.id);

    // Check if this was the last size for this product
    const remainingSizes = Array.from(this.productSizes.values()).filter(
      (ps) => ps.productId === productId
    );

    // If no sizes remain, update product.hasSizes to false
    if (remainingSizes.length === 0) {
      const product = this.products.get(productId);
      if (product && product.hasSizes) {
        product.hasSizes = false;
        this.products.set(productId, product);
      }
    }

    return true; // Successfully deleted
  }
}

// Use dbStorage from packages/database - это уже использует DATABASE_URL из .env
// Use PostgreSQL database storage
export const storage = dbStorage;
