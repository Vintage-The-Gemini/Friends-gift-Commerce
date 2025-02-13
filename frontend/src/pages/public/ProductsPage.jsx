// src/pages/public/ProductsPage.jsx
import { useState } from 'react';
import { Heart } from 'lucide-react';

const ProductsPage = () => {
  const [products] = useState([
    {
      id: 1,
      name: "Smart Watch",
      price: 199.99,
      category: "Electronics",
      image: "/api/placeholder/200/200"
    },
    {
      id: 2,
      name: "Coffee Maker",
      price: 89.99,
      category: "Home & Kitchen",
      image: "/api/placeholder/200/200"
    }
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Products</h1>
        <div className="flex gap-4">
          <select className="border rounded-lg px-4 py-2">
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="home">Home & Kitchen</option>
          </select>
          <select className="border rounded-lg px-4 py-2">
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow">
                <Heart className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{product.category}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold">${product.price}</span>
                <button className="bg-[#5551FF] text-white px-4 py-2 rounded">
                  Add to Event
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;