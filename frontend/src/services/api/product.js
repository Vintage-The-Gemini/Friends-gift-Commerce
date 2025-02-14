// src/services/api/product.js
import axios from "axios";

const API_URL = "/api";

export const productService = {
  createProduct: async (productData) => {
    try {
      const response = await axios.post(`${API_URL}/products`, productData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getSellerProducts: async () => {
    try {
      const response = await axios.get(`${API_URL}/seller/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteProduct: async (productId) => {
    try {
      const response = await axios.delete(`${API_URL}/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getProduct: async (productId) => {
    try {
      const response = await axios.get(`${API_URL}/products/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateProduct: async (productId, productData) => {
    try {
      const response = await axios.put(
        `${API_URL}/products/${productId}`,
        productData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default productService;
