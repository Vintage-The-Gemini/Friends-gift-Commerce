// src/services/api/sellerProduct.js
import api from "./axios.config";

// API endpoints
const ENDPOINTS = {
  BASE: "/products",
  PRODUCT: (id) => `/products/${id}`,
  UPLOAD_IMAGE: "/upload",
};

export const sellerProductService = {
  /**
   * Get all products for the current seller
   * @param {Object} params - Query parameters
   * @returns {Promise} Products data
   */
  getSellerProducts: async (params = {}) => {
    try {
      console.log("Fetching seller products with params:", params);
      const response = await api.get(`${ENDPOINTS.BASE}/seller/products`, {
        params,
      });
      console.log("Seller products response:", response.data);
      return response.data;
    } catch (error) {
      console.error("[Seller Product Service] Get Products Error:", error);
      throw (
        error.response?.data || new Error("Failed to fetch seller products")
      );
    }
  },

  /**
   * Create a new product
   * @param {FormData} productData - Product data as FormData (for file uploads)
   * @returns {Promise} Created product data
   */
  createProduct: async (productData) => {
    try {
      // Changed endpoint to match backend route structure
      const response = await api.post(ENDPOINTS.BASE, productData, {
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

  /**
   * Update an existing product
   * @param {string} id - Product ID
   * @param {FormData} productData - Updated product data as FormData
   * @returns {Promise} Updated product data
   */
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

  /**
   * Delete a product
   * @param {string} id - Product ID
   * @returns {Promise} Success response
   */
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(ENDPOINTS.PRODUCT(id));
      return response.data;
    } catch (error) {
      console.error("[Seller Product Service] Delete Product Error:", error);
      throw error.response?.data || new Error("Failed to delete product");
    }
  },

  /**
   * Get a single product by ID
   * @param {string} id - Product ID
   * @returns {Promise} Product data
   */

  getProductById: async (id) => {
    try {
      const response = await api.get(ENDPOINTS.PRODUCT(id));
      return response.data;
    } catch (error) {
      console.error("[Seller Product Service] Get Product Error:", error);
      throw error.response?.data || new Error("Failed to fetch product");
    }
  },

  /**
   * Upload product images
   * @param {FormData} imageData - Image file(s) as FormData
   * @returns {Promise} Uploaded image URLs
   */
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
   * Helper function to prepare FormData for product submission
   * @param {Object} productData - Raw product data
   * @param {FileList|null} imageFiles - Image files to upload
   * @returns {FormData} Formatted FormData object
   */
  prepareProductFormData: (productData, imageFiles = null) => {
    const formData = new FormData();

    // Add product text data fields
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("price", productData.price);
    formData.append("categoryId", productData.categoryId);
    formData.append("stock", productData.stock);

    // Add characteristics if available
    if (
      productData.characteristics &&
      Object.keys(productData.characteristics).length > 0
    ) {
      formData.append(
        "characteristics",
        JSON.stringify(productData.characteristics)
      );
    }

    // Add images if provided
    if (imageFiles && imageFiles.length) {
      Array.from(imageFiles).forEach((file) => {
        formData.append("images", file);
      });
    }

    return formData;
  },
};

export default sellerProductService;
