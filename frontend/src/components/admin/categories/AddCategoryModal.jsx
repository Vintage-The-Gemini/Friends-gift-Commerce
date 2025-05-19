// src/components/admin/categories/AddCategoryModal.jsx
import { useState } from "react";
import { X, Plus, RefreshCw, Trash2 } from "lucide-react";
import api from "../../../services/api/axios.config";
import { toast } from "react-toastify";
import CharacteristicForm from "./CharacteristicForm";

const AddCategoryModal = ({ categories, onClose, onSuccess }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent: "",
    characteristics: [],
    isActive: true
  });

  // Generate a slug from the name
  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      // Create a copy of the form data for submission
      const submissionData = { ...formData };
      
      // Generate slug from name
      submissionData.slug = generateSlug(submissionData.name);
      
      // Convert empty parent to null
      if (!submissionData.parent) {
        submissionData.parent = null;
      }
      
      // Add characteristics as empty array if not provided
      submissionData.characteristics = submissionData.characteristics || [];

      const response = await api.post("/admin/categories", submissionData);

      if (response.data.success) {
        toast.success("Category created successfully");
        onSuccess();
        onClose();
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-lg w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Add Category</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Slug will be auto-generated from the name
              </p>
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                  <Plus className="w-3 h-3 inline mr-1" />
                  Add Characteristic
                </button>
              </div>
              
              <CharacteristicForm
                characteristics={formData.characteristics}
                onUpdate={updateCharacteristic}
                onRemove={removeCharacteristic}
                onAddOption={addOption}
                onUpdateOption={updateOption}
                onRemoveOption={removeOption}
              />
            </div>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end mt-6 gap-2 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;