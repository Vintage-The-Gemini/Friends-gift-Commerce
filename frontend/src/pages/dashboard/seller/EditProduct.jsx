// src/pages/dashboard/seller/EditProduct.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X } from "lucide-react";
import { productService } from "../../../services/api/product";
import { categoryService } from "../../../services/api/category";
import ImageUpload from "../../../components/common/ImageUpload";
import { toast } from "react-toastify";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [characteristics, setCharacteristics] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stock: "",
    characteristics: {},
    images: [],
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([fetchCategories(), fetchProduct()]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response?.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await productService.getProduct(id);
      if (response?.data) {
        const product = response.data;

        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price || "",
          categoryId: product.category?._id || "",
          stock: product.stock || "",
          characteristics: product.characteristics || {},
          images: product.images || [],
        });

        if (product.category?._id) {
          fetchCategoryCharacteristics(product.category._id);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to load product");
      toast.error("Failed to load product details");
    }
  };

  const fetchCategoryCharacteristics = async (categoryId) => {
    try {
      const response = await categoryService.getCategoryCharacteristics(
        categoryId
      );
      if (response?.data) {
        setCharacteristics(response.data);
      }
    } catch (error) {
      console.error("Error fetching characteristics:", error);
    }
  };

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      categoryId,
      characteristics: {}, // Reset characteristics when category changes
    }));

    if (categoryId) {
      await fetchCategoryCharacteristics(categoryId);
    } else {
      setCharacteristics([]);
    }
  };

  const handleImageUpload = (url) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, { url, isPrimary: prev.images.length === 0 }],
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleCharacteristicChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      characteristics: {
        ...prev.characteristics,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...formData,
        // Convert price to number
        price: parseFloat(formData.price),
        // Convert stock to number
        stock: parseInt(formData.stock),
      };

      await productService.updateProduct(id, payload);
      toast.success("Product updated successfully");
      navigate("/seller/products");
    } catch (error) {
      console.error("Error updating product:", error);
      setError(error.message || "Failed to update product");
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={handleCategoryChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Category Characteristics */}
              {characteristics.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Category Characteristics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {characteristics.map((characteristic) => (
                      <div key={characteristic.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {characteristic.name}
                          {characteristic.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        {renderCharacteristicInput(characteristic)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-100 rounded-full p-1 hover:bg-red-200"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                  {formData.images.length < 4 && (
                    <ImageUpload
                      onUpload={handleImageUpload}
                      className="w-full h-32"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/seller/products")}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
