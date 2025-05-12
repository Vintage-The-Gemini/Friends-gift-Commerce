// frontend/src/pages/admin/AdminCategories.jsx
import { useState, useEffect, useRef } from "react";
import { 
  Plus, Edit, Trash2, Search, AlertCircle, FolderPlus, 
  ChevronRight, RefreshCw, Upload, Download, Filter
} from "lucide-react";
import api from "../../services/api/axios.config";
import { toast } from "react-toastify";
import CategorySeedModal from "../../components/admin/CategorySeedModal";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent: "",
    characteristics: [],
  });

  // For file import/export
  const fileInputRef = useRef(null);
  const [importData, setImportData] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use /admin/categories endpoint
      const response = await api.get("/admin/categories");

      if (response.data.success) {
        setCategories(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories. Please try again.");
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      // Add characteristics as empty array if not provided
      const formattedData = {
        ...formData,
        characteristics: formData.characteristics || [],
      };

      // Use /admin/categories endpoint
      const response = await api.post("/admin/categories", formattedData);

      if (response.data.success) {
        toast.success("Category created successfully");
        setShowAddModal(false);
        setFormData({
          name: "",
          description: "",
          parent: "",
          characteristics: [],
        });
        fetchCategories();
      } else {
        throw new Error(response.data.message || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error(error.message || "Failed to create category");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      // Use /admin/categories/:id endpoint
      const response = await api.put(
        `/admin/categories/${selectedCategory._id}`,
        formData
      );

      if (response.data.success) {
        toast.success("Category updated successfully");
        setShowEditModal(false);
        setSelectedCategory(null);
        fetchCategories();
      } else {
        throw new Error(response.data.message || "Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(error.message || "Failed to update category");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);

    try {
      // Use /admin/categories/:id endpoint
      const response = await api.delete(
        `/admin/categories/${selectedCategory._id}`
      );

      if (response.data.success) {
        toast.success("Category deleted successfully");
        setShowDeleteModal(false);
        setSelectedCategory(null);
        fetchCategories();
      } else {
        throw new Error(response.data.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.message || "Failed to delete category");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      parent: category.parent?._id || "",
      characteristics: category.characteristics || [],
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  // Add characteristic to form
  const addCharacteristic = () => {
    setFormData({
      ...formData,
      characteristics: [
        ...formData.characteristics,
        { name: "", type: "text", required: false, options: [] }
      ]
    });
  };

  // Update characteristic at specific index
  const updateCharacteristic = (index, field, value) => {
    const updatedCharacteristics = [...formData.characteristics];
    updatedCharacteristics[index] = {
      ...updatedCharacteristics[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      characteristics: updatedCharacteristics
    });
  };

  // Remove characteristic at specific index
  const removeCharacteristic = (index) => {
    setFormData({
      ...formData,
      characteristics: formData.characteristics.filter((_, i) => i !== index)
    });
  };

  // Add option to a select characteristic
  const addOption = (characteristicIndex) => {
    const updatedCharacteristics = [...formData.characteristics];
    if (!updatedCharacteristics[characteristicIndex].options) {
      updatedCharacteristics[characteristicIndex].options = [];
    }
    updatedCharacteristics[characteristicIndex].options.push("");
    
    setFormData({
      ...formData,
      characteristics: updatedCharacteristics
    });
  };

  // Update option in a characteristic
  const updateOption = (characteristicIndex, optionIndex, value) => {
    const updatedCharacteristics = [...formData.characteristics];
    updatedCharacteristics[characteristicIndex].options[optionIndex] = value;
    
    setFormData({
      ...formData,
      characteristics: updatedCharacteristics
    });
  };

  // Remove option from a characteristic
  const removeOption = (characteristicIndex, optionIndex) => {
    const updatedCharacteristics = [...formData.characteristics];
    updatedCharacteristics[characteristicIndex].options = 
      updatedCharacteristics[characteristicIndex].options.filter((_, i) => i !== optionIndex);
    
    setFormData({
      ...formData,
      characteristics: updatedCharacteristics
    });
  };

  // Handle file upload for import
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setImportData(event.target.result);
      } catch (error) {
        console.error("Error parsing file:", error);
        toast.error("Error parsing file");
      }
    };
    reader.readAsText(file);
  };

  // Import categories
  const handleImport = async () => {
    if (!importData) {
      toast.error("No import data provided");
      return;
    }

    try {
      setActionLoading(true);
      let parsedData;
      
      try {
        parsedData = JSON.parse(importData);
      } catch (error) {
        toast.error("Invalid JSON format");
        return;
      }
      
      const response = await api.post("/admin/categories/import", {
        categories: parsedData
      });
      
      if (response.data.success) {
        toast.success(`Successfully imported ${response.data.created} categories`);
        setShowImportModal(false);
        setImportData("");
        fetchCategories();
      } else {
        throw new Error(response.data.message || "Failed to import categories");
      }
    } catch (error) {
      console.error("Error importing categories:", error);
      toast.error(error.message || "Failed to import categories");
    } finally {
      setActionLoading(false);
    }
  };

  // Export categories
  const exportCategories = () => {
    const categoriesJson = JSON.stringify(categories, null, 2);
    const blob = new Blob([categoriesJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "categories-export.json";
    a.click();
    
    URL.revokeObjectURL(url);
    toast.success("Categories exported successfully");
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create a map of categories to find parent names
  const categoryMap = categories.reduce((map, category) => {
    map[category._id] = category;
    return map;
  }, {});

  if (loading && categories.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
          
          <button
            onClick={() => setShowSeedModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Seed Categories
          </button>
          
          <div className="relative group">
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </button>
          </div>
          
          <button
            onClick={exportCategories}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>
        
        <button
          onClick={fetchCategories}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <tr key={category._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate">
                    {category.description || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.parent
                      ? categoryMap[category.parent]?.name ||
                        category.parent.name ||
                        "-"
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {category.level}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.isActive !== false
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {category.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => openEditModal(category)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(category)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Category</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
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
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Category
                  </label>
                  <select
                    value={formData.parent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parent: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">None (Root Category)</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Characteristics Section */}
                <div className="border-t border-gray-200 pt-4 mt-2">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-medium">Characteristics</h3>
                    <button
                      type="button"
                      onClick={addCharacteristic}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    >
                      + Add Characteristic
                    </button>
                  </div>
                  
                  {formData.characteristics.length > 0 ? (
                    <div className="space-y-4">
                      {formData.characteristics.map((char, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex justify-between mb-2">
                            <h4 className="text-sm font-medium">Characteristic #{index+1}</h4>
                            <button
                              type="button"
                              onClick={() => removeCharacteristic(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Name
                              </label>
                              <input
                                type="text"
                                value={char.name}
                                onChange={(e) => updateCharacteristic(index, 'name', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border rounded"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Type
                              </label>
                              <select
                                value={char.type}
                                onChange={(e) => updateCharacteristic(index, 'type', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border rounded"
                              >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="select">Select (Single)</option>
                                <option value="multiselect">Select (Multiple)</option>
                                <option value="color">Color</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              id={`required-${index}`}
                              checked={char.required}
                              onChange={(e) => updateCharacteristic(index, 'required', e.target.checked)}
                              className="h-4 w-4"
                            />
                            <label
                              htmlFor={`required-${index}`}
                              className="ml-2 block text-xs text-gray-700"
                            >
                              Required Field
                            </label>
                          </div>
                          
                          {/* Options for select types */}
                          {(char.type === 'select' || char.type === 'multiselect') && (
                            <div className="mt-2">
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-medium text-gray-700">
                                  Options
                                </label>
                                <button
                                  type="button"
                                  onClick={() => addOption(index)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  + Add Option
                                </button>
                              </div>
                              
                              {char.options && char.options.length > 0 ? (
                                <div className="space-y-2">
                                  {char.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center">
                                      <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                        className="flex-1 px-2 py-1 text-sm border rounded"
                                        placeholder={`Option ${optionIndex+1}`}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeOption(index, optionIndex)}
                                        className="ml-2 text-red-600 hover:text-red-800"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500 italic">No options defined</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No characteristics defined</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? "Adding..." : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal - Similar to Add with pre-filled data */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Edit Category</h2>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
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
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Category
                  </label>
                  <select
                    value={formData.parent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parent: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">None (Root Category)</option>
                    {categories
                      .filter((cat) => cat._id !== selectedCategory._id) // Prevent category being its own parent
                      .map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}</option>
                      ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive !== false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Active Category
                  </label>
                </div>
                
                {/* Characteristics Section - Similar to Add */}
                <div className="border-t border-gray-200 pt-4 mt-2">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-medium">Characteristics</h3>
                    <button
                      type="button"
                      onClick={addCharacteristic}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    >
                      + Add Characteristic
                    </button>
                  </div>
                  
                  {formData.characteristics && formData.characteristics.length > 0 ? (
                    <div className="space-y-4">
                      {formData.characteristics.map((char, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex justify-between mb-2">
                            <h4 className="text-sm font-medium">Characteristic #{index+1}</h4>
                            <button
                              type="button"
                              onClick={() => removeCharacteristic(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Name
                              </label>
                              <input
                                type="text"
                                value={char.name}
                                onChange={(e) => updateCharacteristic(index, 'name', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border rounded"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Type
                              </label>
                              <select
                                value={char.type}
                                onChange={(e) => updateCharacteristic(index, 'type', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border rounded"
                              >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="select">Select (Single)</option>
                                <option value="multiselect">Select (Multiple)</option>
                                <option value="color">Color</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              id={`edit-required-${index}`}
                              checked={char.required}
                              onChange={(e) => updateCharacteristic(index, 'required', e.target.checked)}
                              className="h-4 w-4"
                            />
                            <label
                              htmlFor={`edit-required-${index}`}
                              className="ml-2 block text-xs text-gray-700"
                            >
                              Required Field
                            </label>
                          </div>
                          
                          {/* Options for select types */}
                          {(char.type === 'select' || char.type === 'multiselect') && (
                            <div className="mt-2">
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-medium text-gray-700">
                                  Options
                                </label>
                                <button
                                  type="button"
                                  onClick={() => addOption(index)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  + Add Option
                                </button>
                              </div>
                              
                              {char.options && char.options.length > 0 ? (
                                <div className="space-y-2">
                                  {char.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center">
                                      <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                        className="flex-1 px-2 py-1 text-sm border rounded"
                                        placeholder={`Option ${optionIndex+1}`}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeOption(index, optionIndex)}
                                        className="ml-2 text-red-600 hover:text-red-800"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500 italic">No options defined</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No characteristics defined</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the category "
              {selectedCategory?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Delete Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Import Categories</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Import JSON
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Select File
                  </button>
                  <span className="ml-3 text-sm text-gray-500">
                    {importData ? "File loaded" : "No file selected"}
                  </span>
                </div>
              </div>
              
              {importData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preview
                  </label>
                  <div className="border rounded-lg p-3 h-40 overflow-auto bg-gray-50">
                    <pre className="text-xs text-gray-700">{importData}</pre>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importData || actionLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {actionLoading ? "Importing..." : "Import Categories"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seed Categories Modal */}
      <CategorySeedModal 
        isOpen={showSeedModal}
        onClose={() => setShowSeedModal(false)}
        onSuccess={fetchCategories}
      />
    </div>
  );
};

export default AdminCategories;