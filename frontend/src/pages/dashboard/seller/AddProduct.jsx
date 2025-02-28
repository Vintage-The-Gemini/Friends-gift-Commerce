// frontend/src/pages/dashboard/seller/AddProduct.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Save, ArrowLeft, Upload } from "lucide-react";
import { sellerProductService } from "../../../services/api/sellerProduct";
import { categoryService } from "../../../services/api/category";
import { toast } from "react-toastify";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);
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
      setCategoryLoading(true);
      const response = await categoryService.getAllCategories();
      if (response.success) {
        setCategories(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
      setError("Failed to load categories. Please try again later.");
    } finally {
      setCategoryLoading(false);
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

        // Initialize characteristics form data with default values
        const defaultCharacteristics = {};
        response.data.forEach((char) => {
          defaultCharacteristics[char.name] =
            char.type === "boolean" ? false : "";
        });

        setFormData((prev) => ({
          ...prev,
          characteristics: defaultCharacteristics,
        }));
      } else {
        throw new Error(
          response.message || "Failed to fetch category characteristics"
        );
      }
    } catch (error) {
      console.error("Error fetching characteristics:", error);
      toast.error("Failed to load category characteristics");
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
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);

    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.name.trim()) {
      setError("Product name is required");
      return false;
    }

    if (!formData.description.trim()) {
      setError("Product description is required");
      return false;
    }

    if (
      !formData.price ||
      isNaN(formData.price) ||
      parseFloat(formData.price) <= 0
    ) {
      setError("Please enter a valid price");
      return false;
    }

    if (
      !formData.stock ||
      isNaN(formData.stock) ||
      parseInt(formData.stock) < 0
    ) {
      setError("Please enter a valid stock quantity");
      return false;
    }

    if (!formData.categoryId) {
      setError("Please select a category");
      return false;
    }

    // Validate required characteristics
    const missingRequiredChars = characteristics
      .filter((char) => char.required)
      .filter((char) => {
        const value = formData.characteristics[char.name];
        return value === undefined || value === null || value === "";
      });

    if (missingRequiredChars.length > 0) {
      setError(
        `Please fill in the required characteristic: ${missingRequiredChars[0].name}`
      );
      return false;
    }

    // Validate image upload
    if (imageFiles.length === 0) {
      setError("Please upload at least one product image");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

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
      setError(error.message || "Failed to create product. Please try again.");
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const renderCharacteristicInput = (characteristic) => {
    const value = formData.characteristics[characteristic.name] || "";

    switch (characteristic.type) {
      case "text":
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) =>
              handleCharacteristicChange(characteristic.name, e.target.value)
            }
            required={characteristic.required}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) =>
              handleCharacteristicChange(characteristic.name, e.target.value)
            }
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

      case "boolean":
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) =>
                handleCharacteristicChange(
                  characteristic.name,
                  e.target.checked
                )
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              {characteristic.name}
            </label>
          </div>
        );

      case "color":
        return (
          <input
            type="color"
            value={value || "#000000"}
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Add New Product</h1>
          <Button
            onClick={() => navigate("/seller/products")}
            variant="ghost"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Products
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4 border-b pb-2">
              <h2 className="text-lg font-semibold">Basic Information</h2>
            </div>

            <div className="space-y-4">
              <Input
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />

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
                <Input
                  label="Price (KES)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />

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
                    disabled={categoryLoading}
                  >
                    <option value="">
                      {categoryLoading
                        ? "Loading categories..."
                        : "Select Category"}
                    </option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Stock Quantity"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Category Characteristics */}
          {characteristics.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4 border-b pb-2">
                <h2 className="text-lg font-semibold">
                  Category Characteristics
                </h2>
              </div>

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
                      <span className="text-sm text-gray-500 mt-1 block">
                        {characteristic.unit}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4 border-b pb-2">
              <h2 className="text-lg font-semibold">Product Images</h2>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Upload up to 5 images. The first image will be used as the main
                product image.
              </p>
            </div>

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

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/seller/products")}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              icon={loading ? null : <Save className="w-4 h-4 mr-2" />}
            >
              {loading ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
