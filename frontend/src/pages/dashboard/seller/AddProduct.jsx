import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Plus, X } from "lucide-react";
import api from "../../../services/api/axios.config";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
    }
  };

  const fetchCategoryCharacteristics = async (categoryId) => {
    try {
      const response = await api.get(
        `/categories/${categoryId}/characteristics`
      );
      if (response.data.success) {
        setCharacteristics(response.data.data);

        // Initialize characteristics form data with default values
        const defaultCharacteristics = {};
        response.data.data.forEach((char) => {
          defaultCharacteristics[char.name] =
            char.type === "boolean" ? false : "";
        });
        setFormData((prev) => ({
          ...prev,
          characteristics: defaultCharacteristics,
        }));
      }
    } catch (error) {
      console.error("Error fetching characteristics:", error);
      setError("Failed to load category characteristics");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleCharacteristicChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      characteristics: {
        ...prev.characteristics,
        [name]: value,
      },
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setImageFiles((prev) => [...prev, ...files]);

    // Create preview URLs
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => {
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Update the handleSubmit function in the AddProduct component
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("description", formData.description);
      formPayload.append("price", formData.price);
      formPayload.append("categoryId", formData.categoryId);
      formPayload.append("stock", formData.stock);

      // Append characteristics as JSON string
      if (Object.keys(formData.characteristics).length > 0) {
        formPayload.append(
          "characteristics",
          JSON.stringify(formData.characteristics)
        );
      }

      // Append each image file
      imageFiles.forEach((file, index) => {
        formPayload.append("images", file);
      });

      const response = await api.post("/products", formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        navigate("/seller/products");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      setError(error.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };
  const renderCharacteristicInput = (characteristic) => {
    switch (characteristic.type) {
      case "text":
        return (
          <input
            type="text"
            value={formData.characteristics[characteristic.name] || ""}
            onChange={(e) =>
              handleCharacteristicChange(characteristic.name, e.target.value)
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required={characteristic.required}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={formData.characteristics[characteristic.name] || ""}
            onChange={(e) =>
              handleCharacteristicChange(characteristic.name, e.target.value)
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required={characteristic.required}
            min={characteristic.validation?.min}
            max={characteristic.validation?.max}
          />
        );

      case "select":
        return (
          <select
            value={formData.characteristics[characteristic.name] || ""}
            onChange={(e) =>
              handleCharacteristicChange(characteristic.name, e.target.value)
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required={characteristic.required}
          >
            <option value="">Select {characteristic.name}</option>
            {characteristic.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "boolean":
        return (
          <input
            type="checkbox"
            checked={formData.characteristics[characteristic.name] || false}
            onChange={(e) =>
              handleCharacteristicChange(characteristic.name, e.target.checked)
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        );

      case "color":
        return (
          <input
            type="color"
            value={formData.characteristics[characteristic.name] || "#000000"}
            onChange={(e) =>
              handleCharacteristicChange(characteristic.name, e.target.value)
            }
            className="w-full h-10 p-1 rounded-lg"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

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
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (KES)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
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
                    name="categoryId"
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
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
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
                        {characteristic.unit && (
                          <span className="text-sm text-gray-500 mt-1">
                            {characteristic.unit}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images (Max 5)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
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
                  {imagePreviewUrls.length < 5 && (
                    <label className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Add Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        multiple
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
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
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
