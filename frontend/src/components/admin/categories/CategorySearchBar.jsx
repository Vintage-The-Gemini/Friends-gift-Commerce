// src/components/admin/categories/CategorySearchBar.jsx
import { Search, RefreshCw } from "lucide-react";

const CategorySearchBar = ({ searchTerm, onSearch, onRefresh }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 min-w-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
      </div>
      
      <button
        onClick={onRefresh}
        className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center whitespace-nowrap"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh
      </button>
    </div>
  );
};

export default CategorySearchBar;