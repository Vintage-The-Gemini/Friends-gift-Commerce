// src/services/api/product.js
import api from "./axios.config";

// Constants for endpoint paths (without /api prefix since it's in baseURL)
const ENDPOINTS = {
  BASE: "/products",
  SELLER: "/seller/products",
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
  getAllProducts: async (filters = {}, options = {}) => {
    try {
      const { page = 1, limit = 12, sort = "-createdAt" } = options;
      const queryParams = new URLSearchParams();

      // Add pagination and sorting
      queryParams.append("page", page);
      queryParams.append("limit", limit);
      queryParams.append("sort", sort);

      // Add filters
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
      if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
      if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);

      const response = await api.get(`${ENDPOINTS.BASE}?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error("[Product Service] Get All Products Error:", error);
      throw error.response?.data || error;
    }
  },

  getSellerProducts: async (options = {}) => {
    try {
      const { page = 1, limit = 10, sort = "-createdAt" } = options;
      const response = await api.get(ENDPOINTS.SELLER, {
        params: { page, limit, sort },
      });
      return response.data;
    } catch (error) {
      console.error("[Product Service] Get Seller Products Error:", error);
      throw error.response?.data || error;
    }
  },

  getProduct: async (id) => {
    try {
      const response = await api.get(ENDPOINTS.DETAIL(id));
      return response.data;
    } catch (error) {
      console.error("[Product Service] Get Single Product Error:", error);
      throw error.response?.data || error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await api.delete(ENDPOINTS.DETAIL(id));
      return response.data;
    } catch (error) {
      console.error("[Product Service] Delete Error:", error);
      throw error.response?.data || error;
    }
  },
};
