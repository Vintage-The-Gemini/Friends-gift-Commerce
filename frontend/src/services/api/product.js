// services/api/product.js
import api from "./axios.config";

// Constants for endpoint paths
const ENDPOINTS = {
  BASE: "/products",
  SELLER: "/products/seller/products",
  DETAIL: (id) => `/products/${id}`,
};

// Constants for error messages
const ERROR_MESSAGES = {
  CREATE: "Failed to create product",
  FETCH: "Failed to fetch products",
  UPDATE: "Failed to update product",
  DELETE: "Failed to delete product",
  FETCH_SINGLE: "Failed to fetch product details",
};

export const productService = {
  /**
   * Create a new product
   * @param {FormData} formData - Form data containing product information and images
   * @returns {Promise} Response from API
   */
  createProduct: async (formData) => {
    try {
      const response = await api.post(ENDPOINTS.BASE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("[Product Service] Create Error:", error);
      throw new Error(error.message || ERROR_MESSAGES.CREATE);
    }
  },

  /**
   * Get seller's products with optional filters
   * @param {Object} options - Optional parameters like page, limit, sort
   * @returns {Promise} List of seller's products
   */
  getSellerProducts: async (options = {}) => {
    try {
      const { page = 1, limit = 10, sort = "-createdAt" } = options;
      const response = await api.get(ENDPOINTS.SELLER, {
        params: { page, limit, sort },
      });
      return response.data;
    } catch (error) {
      console.error("[Product Service] Get Seller Products Error:", error);
      throw new Error(error.message || ERROR_MESSAGES.FETCH);
    }
  },

  /**
   * Get single product by ID
   * @param {string} id - Product ID
   * @returns {Promise} Product details
   */
  getProduct: async (id) => {
    try {
      const response = await api.get(ENDPOINTS.DETAIL(id));
      return response.data;
    } catch (error) {
      console.error("[Product Service] Get Single Product Error:", error);
      throw new Error(error.message || ERROR_MESSAGES.FETCH_SINGLE);
    }
  },

  /**
   * Update product
   * @param {string} id - Product ID
   * @param {FormData} formData - Updated product data
   * @returns {Promise} Updated product details
   */
  updateProduct: async (id, formData) => {
    try {
      const response = await api.put(ENDPOINTS.DETAIL(id), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("[Product Service] Update Error:", error);
      throw new Error(error.message || ERROR_MESSAGES.UPDATE);
    }
  },

  /**
   * Delete product
   * @param {string} id - Product ID
   * @returns {Promise} Delete confirmation
   */
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(ENDPOINTS.DETAIL(id));
      return response.data;
    } catch (error) {
      console.error("[Product Service] Delete Error:", error);
      throw new Error(error.message || ERROR_MESSAGES.DELETE);
    }
  },

  /**
   * Get all products with filters
   * @param {Object} filters - Filter parameters
   * @param {Object} options - Optional parameters like page, limit, sort
   * @returns {Promise} List of products
   */
  getAllProducts: async (filters = {}, options = {}) => {
    try {
      const { page = 1, limit = 10, sort = "-createdAt" } = options;
      const params = { ...filters, page, limit, sort };
      const response = await api.get(ENDPOINTS.BASE, { params });
      return response.data;
    } catch (error) {
      console.error("[Product Service] Get All Products Error:", error);
      throw new Error(error.message || ERROR_MESSAGES.FETCH);
    }
  },

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} options - Optional parameters like page, limit
   * @returns {Promise} Search results
   */
  searchProducts: async (query, options = {}) => {
    try {
      const { page = 1, limit = 10 } = options;
      const response = await api.get(ENDPOINTS.BASE, {
        params: { search: query, page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("[Product Service] Search Error:", error);
      throw new Error(error.message || ERROR_MESSAGES.FETCH);
    }
  },

  /**
   * Get products by category
   * @param {string} categoryId - Category ID
   * @param {Object} options - Optional parameters like page, limit, sort
   * @returns {Promise} Products in category
   */
  getProductsByCategory: async (categoryId, options = {}) => {
    try {
      const { page = 1, limit = 10, sort = "-createdAt" } = options;
      const response = await api.get(ENDPOINTS.BASE, {
        params: { category: categoryId, page, limit, sort },
      });
      return response.data;
    } catch (error) {
      console.error("[Product Service] Get By Category Error:", error);
      throw new Error(error.message || ERROR_MESSAGES.FETCH);
    }
  },
};
