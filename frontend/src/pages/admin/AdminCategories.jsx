// src/pages/admin/AdminCategories.jsx
import { useState, useEffect } from "react";
import { 
  Plus, FolderPlus, RefreshCw, Upload, Download, AlertCircle
} from "lucide-react";
import api from "../../services/api/axios.config";
import { toast } from "react-toastify";

// Import sub-components
import CategoryTable from "../../components/admin/categories/CategoryTable";
import CategorySearchBar from "../../components/admin/categories/CategorySearchBar";
import AddCategoryModal from "../../components/admin/categories/AddCategoryModal";
import EditCategoryModal from "../../components/admin/categories/EditCategoryModal";
import DeleteCategoryModal from "../../components/admin/categories/DeleteCategoryModal";
import ImportCategoryModal from "../../components/admin/categories/ImportCategoryModal";
import CategorySeedModal from "../../components/admin/categories/CategorySeedModal";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
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

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
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
  const filteredCategories = searchTerm
    ? categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : categories;

  // Create a map of categories to find parent names
  const categoryMap = categories.reduce((map, category) => {
    map[category._id] = category;
    return map;
  }, {});

  // Loading state
  if (loading && categories.length === 0) {
    return (
      <div className="p-4 sm:p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Categories Management</h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center hover:bg-green-700 text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Category
          </button>
          
          <button
            onClick={() => setShowSeedModal(true)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center hover:bg-blue-700 text-sm"
          >
            <FolderPlus className="w-4 h-4 mr-1" />
            Seed
          </button>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-indigo-600 text-white px-3 py-2 rounded-lg flex items-center hover:bg-indigo-700 text-sm"
          >
            <Upload className="w-4 h-4 mr-1" />
            Import
          </button>
          
          <button
            onClick={exportCategories}
            className="bg-purple-600 text-white px-3 py-2 rounded-lg flex items-center hover:bg-purple-700 text-sm"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <CategorySearchBar 
        searchTerm={searchTerm} 
        onSearch={handleSearch} 
        onRefresh={fetchCategories} 
      />

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Categories Table */}
      <CategoryTable 
        categories={filteredCategories}
        categoryMap={categoryMap}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
      />

      {/* Modals */}
      {showAddModal && (
        <AddCategoryModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchCategories}
        />
      )}

      {showEditModal && selectedCategory && (
        <EditCategoryModal
          category={selectedCategory}
          categories={categories.filter(c => c._id !== selectedCategory._id)}
          onClose={() => setShowEditModal(false)}
          onSuccess={fetchCategories}
        />
      )}

      {showDeleteModal && selectedCategory && (
        <DeleteCategoryModal
          category={selectedCategory}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={fetchCategories}
        />
      )}

      {showSeedModal && (
        <CategorySeedModal
          isOpen={true}
          onClose={() => setShowSeedModal(false)}
          onSuccess={fetchCategories}
        />
      )}

      {showImportModal && (
        <ImportCategoryModal
          onClose={() => setShowImportModal(false)}
          onSuccess={fetchCategories}
        />
      )}
    </div>
  );
};

export default AdminCategories;