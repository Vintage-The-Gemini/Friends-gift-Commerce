import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Upload } from "lucide-react";
import { categoryService } from "../../../services/api/category";
import { sellerProductService } from "../../../services/api/sellerProduct";
import { toast } from "react-toastify";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [characteristics, setCharacteristics] = useState([]);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stock: "",
    characteristics: {},
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
    }
  };

  const fetchCategoryCharacteristics = async (categoryId) => {
    if (!categoryId) return;

    try {
      const response = await categoryService.getCategoryCharacteristics(
        categoryId
      );
      if (response.success) {
        setCharacteristics(response.data);
      }
    } catch (error) {
      console.error("Error fetching characteristics:", error);
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

    // Validate file limit
    if (files.length + imageFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Add new files to state
    setImageFiles((prev) => [...prev, ...files]);

    // Create and add new preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create FormData object for multipart/form-data
      const productFormData = new FormData();

      // Add basic product details
      productFormData.append("name", formData.name.trim());
      productFormData.append("description", formData.description.trim());
      productFormData.append("price", formData.price);
      productFormData.append("categoryId", formData.categoryId);
      productFormData.append("stock", formData.stock);

      // Add characteristics as JSON string
      if (Object.keys(formData.characteristics).length > 0) {
        productFormData.append(
          "characteristics",
          JSON.stringify(formData.characteristics)
        );
      }

      // Add all image files
      imageFiles.forEach((file) => {
        productFormData.append("images", file);
      });

      // Submit to API
      const response = await sellerProductService.createProduct(
        productFormData
      );

      if (response.success) {
        toast.success("Product created successfully");
        navigate("/seller/products");
      } else {
        throw new Error(response.message || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      setError(error.message || "Failed to create product");
      toast.error(error.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const renderCharacteristicInput = (characteristic) => {
    const value = formData.characteristics[characteristic.name] || "";

    switch (characteristic.type) {
      case "text":
        return (
          <input
            type="text"
            value={value}
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
            value={value}
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
            value={value}
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
                    Price ($)
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
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
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
                {imagePreviewUrls.length < 4 && (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Add Image</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleImageChange}
                      accept="image/*"
                      multiple
                    />
                  </label>
                )}
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
