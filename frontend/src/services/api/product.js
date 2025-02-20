// src/services/api/product.js
import api from "./axios.config";

const ENDPOINTS = {
  BASE: "/products",
  SELLER: "/seller/products",
  DETAIL: (id) => `/products/${id}`,
  CATEGORY: (id) => `/products/category/${id}`,
  SEARCH: "/products/search",
  FEATURED: "/products/featured",
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
      if (filters.seller) queryParams.append("seller", filters.seller);

      const response = await api.get(`${ENDPOINTS.BASE}?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error("[Product Service] Get All Products Error:", error);
      throw error.response?.data || error;
    }
  },

  getProductById: async (id) => {
    try {
      const response = await api.get(ENDPOINTS.DETAIL(id));
      return response.data;
    } catch (error) {
      console.error("[Product Service] Get Product Error:", error);
      throw error.response?.data || error;
    }
  },

  getProductsByCategory: async (categoryId, options = {}) => {
    try {
      const { page = 1, limit = 12 } = options;
      const response = await api.get(ENDPOINTS.CATEGORY(categoryId), {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("[Product Service] Get By Category Error:", error);
      throw error.response?.data || error;
    }
  },

  getFeaturedProducts: async () => {
    try {
      const response = await api.get(ENDPOINTS.FEATURED);
      return response.data;
    } catch (error) {
      console.error("[Product Service] Get Featured Products Error:", error);
      throw error.response?.data || error;
    }
  },

  searchProducts: async (searchTerm, options = {}) => {
    try {
      const response = await api.get(ENDPOINTS.SEARCH, {
        params: { q: searchTerm, ...options },
      });
      return response.data;
    } catch (error) {
      console.error("[Product Service] Search Products Error:", error);
      throw error.response?.data || error;
    }
  },

  toggleWishlist: async (productId) => {
    try {
      const response = await api.post(`/wishlist/toggle/${productId}`);
      return response.data;
    } catch (error) {
      console.error("[Product Service] Toggle Wishlist Error:", error);
      throw error.response?.data || error;
    }
  },
};
