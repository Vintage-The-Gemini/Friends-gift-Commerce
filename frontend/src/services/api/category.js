// src/services/api/category.js
import api from "./axios.config";

export const categoryService = {
  getAllCategories: async () => {
    try {
      const response = await api.get("/categories");
      return response.data.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      throw new Error("Failed to fetch categories");
    }
  },

  getCategoryById: async (categoryId) => {
    try {
      const response = await api.get(`/categories/${categoryId}`);
      return response.data.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      throw new Error("Failed to fetch category");
    }
  },

  getCategoryCharacteristics: async (categoryId) => {
    try {
      const response = await api.get(
        `/categories/${categoryId}/characteristics`
      );
      return response.data.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      throw new Error("Failed to fetch category characteristics");
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await api.post("/categories", categoryData);
      return response.data.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      throw new Error("Failed to create category");
    }
  },

  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await api.put(`/categories/${categoryId}`, categoryData);
      return response.data.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      throw new Error("Failed to update category");
    }
  },

  deleteCategory: async (categoryId) => {
    try {
      const response = await api.delete(`/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      throw new Error("Failed to delete category");
    }
  },
};
