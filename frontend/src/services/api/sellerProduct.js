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

  s// Delete product
deleteProduct: async (id) => {
  try {
    console.log(`Deleting product with ID: ${id}`); // Debug log
    const response = await api.delete(ENDPOINTS.PRODUCT(id));
    console.log("Delete response:", response.data); // Debug log
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
};

export default sellerProductService;
