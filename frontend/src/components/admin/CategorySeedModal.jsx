// frontend/src/components/admin/CategorySeedModal.jsx
import { useState, useEffect } from "react";
import { X, Check, AlertCircle, RefreshCw } from "lucide-react";
import api from "../../services/api/axios.config";
import { toast } from "react-toastify";

const CategorySeedModal = ({ isOpen, onClose, onSuccess }) => {
  const [seedTemplate, setSeedTemplate] = useState("default");
  const [customSeedData, setCustomSeedData] = useState("");
  const [seedPreview, setSeedPreview] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  // Templates for seeding categories
  const seedTemplates = {
    default: [
      {
        name: "Electronics",
        characteristics: [
          { name: "brand", type: "select", required: true, options: ["Apple", "Samsung", "Sony", "LG", "HP", "Dell", "Lenovo"] },
          { name: "warranty", type: "number", required: true, unit: "months" },
          { name: "condition", type: "select", required: true, options: ["New", "Refurbished", "Used"] }
        ],
        subcategories: [
          { 
            name: "Smartphones", 
            characteristics: [
              { name: "storage", type: "select", required: true, options: ["64GB", "128GB", "256GB", "512GB", "1TB"] },
              { name: "screen_size", type: "number", required: true, unit: "inches" }
            ]
          },
          { 
            name: "Laptops", 
            characteristics: [
              { name: "processor", type: "select", required: true, options: ["Intel i3", "Intel i5", "Intel i7", "AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7"] },
              { name: "ram", type: "select", required: true, options: ["4GB", "8GB", "16GB", "32GB", "64GB"] }
            ] 
          },
          { name: "Televisions" },
          { name: "Audio Equipment" }
        ]
      },
      {
        name: "Clothing",
        characteristics: [
          { name: "size", type: "select", required: true, options: ["XS", "S", "M", "L", "XL", "XXL"] },
          { name: "material", type: "text", required: true },
          { name: "color", type: "color", required: true }
        ],
        subcategories: [
          { name: "Men's Clothing" },
          { name: "Women's Clothing" },
          { name: "Children's Clothing" }
        ]
      },
      {
        name: "Home & Living",
        characteristics: [
          { name: "dimensions", type: "text", required: false },
          { name: "material", type: "text", required: false }
        ],
        subcategories: [
          { name: "Furniture" },
          { name: "Kitchen" },
          { name: "Bathroom" },
          { name: "Decor" }
        ]
      }
    ],
    retail: [
      // More retail-focused categories
      {
        name: "Fashion",
        characteristics: [
          { name: "brand", type: "text", required: true },
          { name: "material", type: "text", required: true },
          { name: "care_instructions", type: "text" }
        ],
        subcategories: [
          { name: "Men's Clothing" },
          { name: "Women's Clothing" },
          { name: "Shoes" },
          { name: "Accessories" },
          { name: "Bags" },
          { name: "Jewelry" },
          { name: "Watches" }
        ]
      },
      {
        name: "Beauty & Personal Care",
        characteristics: [
          { name: "brand", type: "text", required: true },
          { name: "skin_type", type: "select", options: ["All", "Dry", "Oily", "Combination", "Sensitive"] },
          { name: "ingredients", type: "text" }
        ],
        subcategories: [
          { name: "Skincare" },
          { name: "Makeup" },
          { name: "Hair Care" },
          { name: "Fragrance" },
          { name: "Bath & Body" }
        ]
      }
    ],
    events: [
      // Event-focused categories
      {
        name: "Celebrations",
        characteristics: [
          { name: "occasion", type: "select", options: ["Birthday", "Anniversary", "Wedding", "Graduation"] },
          { name: "suitable_for", type: "select", options: ["Children", "Teens", "Adults", "Seniors"] }
        ],
        subcategories: [
          { name: "Birthday Gifts" },
          { name: "Wedding Gifts" },
          { name: "Anniversary Gifts" },
          { name: "Graduation Gifts" }
        ]
      },
      {
        name: "Holiday Gifts",
        characteristics: [
          { name: "holiday", type: "select", options: ["Christmas", "Eid", "Diwali", "Hanukkah", "Easter"] },
          { name: "price_range", type: "select", options: ["Budget", "Mid-range", "Luxury"] }
        ],
        subcategories: [
          { name: "Christmas Gifts" },
          { name: "Eid Gifts" },
          { name: "Valentine's Day" },
          { name: "Mother's & Father's Day" }
        ]
      }
    ]
  };

  // Set initial preview when component mounts
  useEffect(() => {
    if (isOpen) {
      setSeedPreview(seedTemplates.default || []);
    }
  }, [isOpen]);

  // Preview seed template when template changes
  const handleSeedTemplateChange = (template) => {
    setSeedTemplate(template);
    if (template === "custom") {
      try {
        const parsed = customSeedData ? JSON.parse(customSeedData) : [];
        setSeedPreview(parsed);
        validateSeedData(parsed);
      } catch (error) {
        setSeedPreview([]);
        setError("Invalid JSON format in custom template");
      }
    } else {
      setSeedPreview(seedTemplates[template] || []);
      setError(null);
      setValidationErrors([]);
    }
  };

  // Handle custom seed data changes
  const handleCustomSeedDataChange = (data) => {
    setCustomSeedData(data);
    try {
      const parsed = data ? JSON.parse(data) : [];
      setSeedPreview(parsed);
      validateSeedData(parsed);
    } catch (error) {
      setError("Invalid JSON format");
      setValidationErrors([{ message: "Invalid JSON format. Please check your JSON syntax." }]);
    }
  };

  // Validate seed data structure
  const validateSeedData = (data) => {
    const errors = [];
    
    if (!Array.isArray(data)) {
      errors.push({ message: "Seed data must be an array of categories" });
      setValidationErrors(errors);
      return;
    }
    
    // Validate each category
    data.forEach((category, index) => {
      if (!category.name) {
        errors.push({ message: `Category at index ${index} is missing a name` });
      }
      
      // Validate characteristics
      if (category.characteristics && !Array.isArray(category.characteristics)) {
        errors.push({ message: `Category '${category.name}' has invalid characteristics (must be an array)` });
      } else if (category.characteristics) {
        category.characteristics.forEach((char, charIndex) => {
          if (!char.name) {
            errors.push({ message: `Characteristic at index ${charIndex} in category '${category.name}' is missing a name` });
          }
          if (!char.type) {
            errors.push({ message: `Characteristic '${char.name || 'unnamed'}' in category '${category.name}' is missing a type` });
          }
        });
      }
      
      // Validate subcategories recursively
      if (category.subcategories && !Array.isArray(category.subcategories)) {
        errors.push({ message: `Category '${category.name}' has invalid subcategories (must be an array)` });
      }
    });
    
    setValidationErrors(errors);
  };

  // Submit seeding request
  const handleSeedSubmit = async () => {
    if (validationErrors.length > 0) {
      toast.error("Please fix validation errors before seeding");
      return;
    }
    
    setActionLoading(true);
    setError(null);
    
    try {
      // Create a new endpoint in your API for seeding categories
      const response = await api.post("/admin/categories/seed", {
        categories: seedPreview
      });
      
      if (response.data.success) {
        toast.success(`Successfully seeded ${response.data.created || 'multiple'} categories`);
        onSuccess();
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to seed categories");
      }
    } catch (error) {
      console.error("Error seeding categories:", error);
      setError(error.message || "Failed to seed categories");
      toast.error(error.message || "Failed to seed categories");
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Seed Categories</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Template
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleSeedTemplateChange("default")}
                className={`p-4 border rounded-lg text-left ${
                  seedTemplate === "default" 
                    ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50" 
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium mb-1">Default</div>
                <div className="text-sm text-gray-500">
                  Basic categories with electronics, clothing, and home & living
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => handleSeedTemplateChange("retail")}
                className={`p-4 border rounded-lg text-left ${
                  seedTemplate === "retail" 
                    ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50" 
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium mb-1">Retail</div>
                <div className="text-sm text-gray-500">
                  E-commerce focused categories with detailed attributes
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => handleSeedTemplateChange("events")}
                className={`p-4 border rounded-lg text-left ${
                  seedTemplate === "events" 
                    ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50" 
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium mb-1">Events</div>
                <div className="text-sm text-gray-500">
                  Gift-giving categories organized by celebrations and holidays
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => handleSeedTemplateChange("custom")}
                className={`p-4 border rounded-lg text-left ${
                  seedTemplate === "custom" 
                    ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50" 
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium mb-1">Custom</div>
                <div className="text-sm text-gray-500">
                  Define your own category structure using JSON
                </div>
              </button>
            </div>
          </div>
          
          {seedTemplate === "custom" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Template JSON
              </label>
              <textarea
                value={customSeedData}
                onChange={(e) => handleCustomSeedDataChange(e.target.value)}
                className="w-full h-40 px-3 py-2 border rounded-lg font-mono text-sm"
                placeholder='[{"name": "Category 1", "characteristics": [], "subcategories": []}]'
              />
              
              {validationErrors.length > 0 && (
                <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="font-medium text-yellow-800 mb-1">Validation Issues:</div>
                  <ul className="list-disc pl-5 text-sm text-yellow-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-medium mb-2">Preview</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 overflow-x-auto">
                <pre className="text-sm text-gray-800">
                  {JSON.stringify(seedPreview, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              This will create {seedPreview.length} root categories
              and approximately {seedPreview.reduce((count, cat) => 
                count + (cat.subcategories?.length || 0), 0)} subcategories.
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSeedSubmit}
            disabled={actionLoading || validationErrors.length > 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            {actionLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Seed Categories
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySeedModal;