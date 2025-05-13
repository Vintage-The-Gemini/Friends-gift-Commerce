// src/components/admin/categories/ImportCategoryModal.jsx
import { useState, useRef } from "react";
import { X, RefreshCw, Upload } from "lucide-react";
import api from "../../../services/api/axios.config";
import { toast } from "react-toastify";

const ImportCategoryModal = ({ onClose, onSuccess }) => {
  const [importData, setImportData] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setImportData(event.target.result);
        setError(null);
      } catch (error) {
        console.error("Error parsing file:", error);
        setError("Error reading file");
        toast.error("Error reading file");
      }
    };
    reader.readAsText(file);
  };

  // Validate JSON content
  const validateJson = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      
      if (!Array.isArray(parsed)) {
        return { valid: false, message: "JSON must contain an array of categories" };
      }
      
      // Validate each category has at least a name
      for (let i = 0; i < parsed.length; i++) {
        const category = parsed[i];
        if (!category.name) {
          return { valid: false, message: `Category at index ${i} is missing a name property` };
        }
      }
      
      return { valid: true, data: parsed };
    } catch (e) {
      return { valid: false, message: "Invalid JSON format: " + e.message };
    }
  };

  // Handle import submission
  const handleImport = async () => {
    if (!importData) {
      setError("No import data provided");
      return;
    }

    const validation = validateJson(importData);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      
      const response = await api.post("/admin/categories/import", {
        categories: validation.data
      });
      
      if (response.data.success) {
        toast.success(`Successfully imported ${response.data.created || 'multiple'} categories`);
        onSuccess();
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to import categories");
      }
    } catch (error) {
      console.error("Error importing categories:", error);
      setError(error.message || "Failed to import categories");
      toast.error(error.message || "Failed to import categories");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Import Categories</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
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
            <p className="mt-1 text-xs text-gray-500">
              File must be a valid JSON array of category objects
            </p>
          </div>
          
          {importData && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preview
              </label>
              <div className="border rounded-lg p-3 h-40 overflow-auto bg-gray-50">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">{importData}</pre>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end mt-6 gap-2 sm:space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!importData || actionLoading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
          >
            {actionLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import Categories
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportCategoryModal;