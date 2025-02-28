import React, { useState, useEffect } from "react";
import { Search, Filter, Plus, Minus, X } from "lucide-react";
import { productService } from "../../services/api/product";
import { categoryService } from "../../services/api/category";
import { formatCurrency } from "../../utils/currency";
import { toast } from "react-toastify";

const ProductSelection = ({ selectedProducts = [], onProductSelect }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Fetch categories on mount
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  // Fetch products with debounced search and filter
  useEffect(() => {
    const debounceId = setTimeout(() => {
      fetchProducts(true);
    }, 500);

    return () => clearTimeout(debounceId);
  }, [searchTerm, selectedCategory]);

  // Fetch products, with optional reset for new search/filter
  const fetchProducts = async (reset = false) => {
    try {
      if (reset) {
        setPage(1);
        setProducts([]);
      }

      setLoading(true);

      const currentPage = reset ? 1 : page;

      const params = {
        page: currentPage,
        limit: 12,
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
      };

      const response = await productService.getAllProducts(params);

      if (response.success) {
        if (reset) {
          setProducts(response.data);
        } else {
          setProducts((prev) => [...prev, ...response.data]);
        }

        // Check if there are more pages
        setHasMore(currentPage < (response.pagination?.totalPages || 1));
      } else {
        throw new Error(response.message || "Failed to load products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Check if a product is already selected
  const isProductSelected = (productId) => {
    return selectedProducts.some((item) => item.product._id === productId);
  };

  // Get the quantity for a selected product
  const getSelectedQuantity = (productId) => {
    const item = selectedProducts.find(
      (item) => item.product._id === productId
    );
    return item ? item.quantity : 0;
  };

  // Handle adding/removing a product from selection
  const handleProductClick = (product) => {
    if (isProductSelected(product._id)) {
      onProductSelect(
        selectedProducts.filter((item) => item.product._id !== product._id)
      );
    } else {
      onProductSelect([...selectedProducts, { product, quantity: 1 }]);
    }
  };

  // Update the quantity for a selected product
  const updateQuantity = (productId, change) => {
    const updatedProducts = selectedProducts.map((item) => {
      if (item.product._id === productId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    onProductSelect(updatedProducts);
  };

  // Remove a product from selection
  const removeProduct = (productId) => {
    onProductSelect(
      selectedProducts.filter((item) => item.product._id !== productId)
    );
  };

  // Handle load more products
  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
    fetchProducts(false);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Products */}
      {selectedProducts.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-medium">Selected Products</h3>
          {selectedProducts.map((item) => (
            <div
              key={item.product._id}
              className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
            >
              <div className="flex items-center">
                <img
                  src={
                    item.product.images?.[0]?.url || "/placeholder-image.jpg"
                  }
                  alt={item.product.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <p className="text-gray-500 text-sm">
                    {formatCurrency(item.product.price)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product._id, -1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, 1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => removeProduct(item.product._id)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Remove product"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {loading && products.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5551FF]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product._id}
              className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                isProductSelected(product._id)
                  ? "border-[#5551FF] ring-2 ring-[#5551FF]"
                  : "hover:border-[#5551FF]"
              }`}
              onClick={() => handleProductClick(product)}
            >
              <div className="aspect-square relative">
                <img
                  src={product.images?.[0]?.url || "/placeholder-image.jpg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-medium px-3 py-1 bg-red-500 rounded-md">
                      Out of Stock
                    </span>
                  </div>
                )}
                {isProductSelected(product._id) && (
                  <div className="absolute top-2 right-2 bg-[#5551FF] text-white w-6 h-6 rounded-full flex items-center justify-center">
                    <span>{getSelectedQuantity(product._id)}</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">
                    {formatCurrency(product.price)}
                  </span>
                  {isProductSelected(product._id) ? (
                    <span className="text-[#5551FF] text-sm font-medium">
                      Selected
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {product.stock} in stock
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {products.length > 0 && hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5551FF]"
          >
            {loading ? "Loading..." : "Load More Products"}
          </button>
        </div>
      )}

      {products.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No products found. Try adjusting your search.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductSelection;
