// src/components/admin/categories/DeleteCategoryModal.jsx
import { useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import api from "../../../services/api/axios.config";
import { toast } from "react-toastify";

const DeleteCategoryModal = ({ category, onClose, onSuccess }) => {
  const [actionLoading, setActionLoading] = useState(false);

  const handleDelete = async () => {
    setActionLoading(true);

    try {
      const response = await api.delete(`/admin/categories/${category._id}`);

      if (response.data.success) {
        toast.success("Category deleted successfully");
        onSuccess();
        onClose();
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
        <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete the category "
          {category.name}"? This action cannot be undone.
        </p>
        
        {category.parent && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-700 text-sm">
              <strong>Note:</strong> If this category has subcategories, they will need to be deleted first or reassigned to another parent.
            </p>
          </div>
        )}
        
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
          >
            {actionLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Category
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCategoryModal;