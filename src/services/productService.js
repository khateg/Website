import { db } from "./firebase";
import { ref, get, set, update, remove, child } from "firebase/database";

const PRODUCTS_PATH = "products";

const notebookCatalog = {
  options: {
    size: { A6: { price: 80 }, A5: { price: 120 }, A4: { price: 160 } },
    coverType: { soft: { price: 0 }, hard: { price: 40 } },
    pageType: { blank: { price: 0 }, lined: { price: 20 } },
  },
  defaults: {
    size: "A5",
    coverType: "soft",
    pageType: "blank",
  },
};

const wallArtCatalog = {
  options: {
    size: {
      "20x30": { price: 180 },
      "40x50": { price: 260 },
      "30x40": { price: 240 },
      "50x60": { price: 380 },
      "50x70": { price: 460 },
    },
  },
  defaults: {
    size: "30x40",
  },
};

const normalizeCatalog = (productData) => {
  const category = productData?.category;
  if (!category) return productData;

  if (category === "Notebooks") {
    return {
      ...productData,
      options: productData.options || notebookCatalog.options,
      defaults: productData.defaults || notebookCatalog.defaults,
    };
  }

  if (category === "Wall Arts") {
    return {
      ...productData,
      options: productData.options || wallArtCatalog.options,
      defaults: productData.defaults || wallArtCatalog.defaults,
    };
  }

  return productData;
};

const normalizeProductForRead = (product) => {
  if (!product || !product.options || !product.category) {
    return product;
  }

  const normalized = { ...product };
  delete normalized.combinations;
  delete normalized.stock;
  return normalized;
};

const normalizeProductForStorage = (productData) => {
  const normalized = normalizeCatalog(productData);
  const product = {
    ...normalized,
  };

  delete product.price;
  delete product.stock;
  delete product.combinations;

  return product;
};

export const productService = {
  // Get all products
  async getAllProducts() {
    try {
      const productsRef = ref(db, PRODUCTS_PATH);
      const snapshot = await get(productsRef);

      if (!snapshot.exists()) {
        return [];
      }

      const productsData = snapshot.val();
      return Object.keys(productsData).map((id) =>
        normalizeProductForRead({
          id,
          ...productsData[id],
        }),
      );
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Get single product
  async getProduct(productId) {
    try {
      const productRef = ref(db, `${PRODUCTS_PATH}/${productId}`);
      const snapshot = await get(productRef);

      if (!snapshot.exists()) {
        return null;
      }

      return normalizeProductForRead({
        id: productId,
        ...snapshot.val(),
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  // Add new product
  async addProduct(productData) {
    try {
      const newId = Math.random().toString(36).substr(2, 9);
      const productRef = ref(db, `${PRODUCTS_PATH}/${newId}`);

      const normalized = normalizeProductForStorage(productData);

      await set(productRef, {
        ...normalized,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return newId;
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  },

  // Update product
  async updateProduct(productId, productData) {
    try {
      const productRef = ref(db, `${PRODUCTS_PATH}/${productId}`);
      const normalized = normalizeProductForStorage(productData);

      await update(productRef, {
        ...normalized,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  // Delete product
  async deleteProduct(productId) {
    try {
      const productRef = ref(db, `${PRODUCTS_PATH}/${productId}`);
      await remove(productRef);
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  // Get products by category
  async getProductsByCategory(category) {
    try {
      const products = await this.getAllProducts();
      return products.filter((product) => product.category === category);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  },

  // Update product stock
  async updateProductStock(productId, newStock) {
    try {
      const productRef = ref(db, `${PRODUCTS_PATH}/${productId}`);
      await update(productRef, {
        stock: newStock,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating stock:", error);
      throw error;
    }
  },
};
