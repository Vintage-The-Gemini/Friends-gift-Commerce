import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

const ProductSelection = ({ selectedProducts = [], onProductSelect }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (product) => {
    const isSelected = selectedProducts.find((p) => p._id === product._id);
    if (isSelected) {
      onProductSelect(selectedProducts.filter((p) => p._id !== product._id));
    } else {
      onProductSelect([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className={`border rounded-lg p-4 cursor-pointer ${
              selectedProducts.find((p) => p._id === product._id)
                ? "border-blue-500 bg-blue-50"
                : "hover:border-gray-300"
            }`}
            onClick={() => handleProductSelect(product)}
          >
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="font-semibold mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="font-bold">${product.price}</span>
              {selectedProducts.find((p) => p._id === product._id) && (
                <span className="text-blue-600">Selected</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSelection;
