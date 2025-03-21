// frontend/src/services/api/sellerProduct.js
import api from "./axios.config";

// API endpoints
const ENDPOINTS = {
  SELLER_PRODUCTS: "/seller/products",
  PRODUCT: (id) => `/products/${id}`,
  UPLOAD_IMAGE: "/upload",
};

export const sellerProductService = {
  // Get seller products
  getSellerProducts: async (params = {}) => {
    try {
      console.log("Fetching seller products with params:", params);
      const response = await api.get(ENDPOINTS.SELLER_PRODUCTS, { params });
      console.log("Seller products response:", response.data);
      return response.data;
    } catch (error) {
      console.error("[Seller Product Service] Get Products Error:", error);
      throw (
        error.response?.data || new Error("Failed to fetch seller products")
      );
    }
  },

  // Create product
  createProduct: async (productData) => {
    try {
      // Ensure we're using the right content type for FormData
      const response = await api.post(ENDPOINTS.SELLER_PRODUCTS, productData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("[Seller Product Service] Create Product Error:", error);
      throw error.response?.data || new Error("Failed to create product");
    }
  },

  // Update product
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(ENDPOINTS.PRODUCT(id), productData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("[Seller Product Service] Update Product Error:", error);
      throw error.response?.data || new Error("Failed to update product");
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(ENDPOINTS.PRODUCT(id));
      return response.data;
    } catch (error) {
      console.error("[Seller Product Service] Delete Product Error:", error);
      throw error.response?.data || new Error("Failed to delete product");
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await api.get(ENDPOINTS.PRODUCT(id));
      return response.data;
    } catch (error) {
      console.error("[Seller Product Service] Get Product Error:", error);
      throw error.response?.data || new Error("Failed to fetch product");
    }
  },

  // Upload product images
  uploadProductImages: async (imageData) => {
    try {
      const response = await api.post(ENDPOINTS.UPLOAD_IMAGE, imageData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("[Seller Product Service] Upload Images Error:", error);
      throw error.response?.data || new Error("Failed to upload images");
    }
  },

  /**
   * Resubmit a rejected product without changes
   * @param {string} id - Product ID
   * @returns {Promise<Object>} API response
   */
  resubmitProduct: async (id) => {
    try {
      const response = await api.post(
        `${ENDPOINTS.SELLER_PRODUCTS}/${id}/resubmit`
      );
      return response.data;
    } catch (error) {
      console.error("[Seller Product Service] Resubmit Product Error:", error);
      throw error.response?.data || new Error("Failed to resubmit product");
    }
  },

  /**
   * Get product rejection history
   * @param {string} id - Product ID
   * @returns {Promise<Object>} API response with previous versions
   */
  getProductHistory: async (id) => {
    try {
      const response = await api.get(
        `${ENDPOINTS.SELLER_PRODUCTS}/${id}/history`
      );
      return response.data;
    } catch (error) {
      console.error(
        "[Seller Product Service] Get Product History Error:",
        error
      );
      throw (
        error.response?.data || new Error("Failed to fetch product history")
      );
    }
  },

  /**
   * Get product approval status counts
   * @returns {Promise<Object>} API response with product stats by approval status
   */
  getProductStatusStats: async () => {
    try {
      const response = await api.get(
        `${ENDPOINTS.SELLER_PRODUCTS}/stats/approval`
      );
      return response.data;
    } catch (error) {
      console.error("[Seller Product Service] Get Status Stats Error:", error);
      throw (
        error.response?.data ||
        new Error("Failed to fetch product status statistics")
      );
    }
  },
};

export default sellerProductService;
