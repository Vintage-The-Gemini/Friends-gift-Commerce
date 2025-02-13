// src/components/layout/SearchBar.jsx
import { Search } from 'lucide-react';

const SearchBar = () => {
  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search essentials, groceries and more..."
        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[#5551FF]"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
    </div>
  );
};

export default SearchBar;