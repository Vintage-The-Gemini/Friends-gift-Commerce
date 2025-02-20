import React from "react";
import { ChevronRight } from "lucide-react";

const CategoryGrid = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <button
          key={category._id}
          onClick={() => onSelectCategory(category._id)}
          className={`relative overflow-hidden rounded-xl aspect-square group cursor-pointer ${
            selectedCategory === category._id
              ? "ring-2 ring-[#FF4500]"
              : "hover:ring-2 hover:ring-[#5551FF]"
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={category.image || "/api/placeholder/400/400"}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-[#5551FF]/60 transition-colors"></div>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
            <p className="text-sm text-white/80 line-clamp-2 mb-2">
              {category.description}
            </p>

            {/* Browse Link */}
            <div className="flex items-center text-[#FF4500] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Browse Category
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Selected Indicator */}
          {selectedCategory === category._id && (
            <div className="absolute top-2 right-2 bg-[#FF4500] text-white text-xs px-2 py-1 rounded-full">
              Selected
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default CategoryGrid;
