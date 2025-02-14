// src/services/api/category.js
import api from "./axios.config";

const ENDPOINTS = {
  BASE: "/categories",
  DETAIL: (id) => `/categories/${id}`,
  CHARACTERISTICS: (id) => `/categories/${id}/characteristics`,
};

export const categoryService = {
  getAllCategories: async () => {
    try {
      const response = await api.get(ENDPOINTS.BASE);
      return response.data;
    } catch (error) {
      console.error("[Category Service] Get All Error:", error);
      throw error.response?.data || error;
    }
  },

  getCategoryById: async (categoryId) => {
    try {
      const response = await api.get(ENDPOINTS.DETAIL(categoryId));
      return response.data;
    } catch (error) {
      console.error("[Category Service] Get By ID Error:", error);
      throw error.response?.data || error;
    }
  },

  getCategoryCharacteristics: async (categoryId) => {
    try {
      const response = await api.get(ENDPOINTS.CHARACTERISTICS(categoryId));
      return response.data;
    } catch (error) {
      console.error("[Category Service] Get Characteristics Error:", error);
      throw error.response?.data || error;
    }
  },
};
