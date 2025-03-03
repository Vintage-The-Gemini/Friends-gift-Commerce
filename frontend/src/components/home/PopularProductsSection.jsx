// src/components/home/PopularProductsSection.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Package } from "lucide-react";
import { productService } from "../../services/api/product";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import CompactProductCard from "../products/CompactProductCard";

const PopularProductsSection = () => {
  const { user } = useAuth();
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      const response = await productService.getAllProducts(
        {}, // No filters
        { limit: 12, sort: "-createdAt" } // Options - get more products for the compact grid
      );

      if (response.success) {
        setTrendingProducts(response.data.slice(0, 12)); // Use up to 12 products
      }
    } catch (error) {
      console.error("Error fetching trending products:", error);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToEvent = (product) => {
    if (!user) {
      toast.info("Please sign in to add products to your event");
      return;
    }

    toast.success(`${product.name} added to your event`);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Popular Products
            </h2>
            <p className="text-gray-600 mt-1">
              Discover top picks for your next event
            </p>
          </div>
          <Link
            to="/products"
            className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
          >
            Browse All
            <ChevronRight className="w-5 h-5 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : trendingProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No Products Found
            </h3>
            <p className="text-gray-600">
              Check back soon for exciting product offerings!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trendingProducts.map((product) => (
              <CompactProductCard
                key={product._id}
                product={product}
                onAddToEvent={handleAddToEvent}
              />
            ))}
          </div>
        )}

        {/* Category Quick Links */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {[
            "Electronics",
            "Home & Kitchen",
            "Fashion",
            "Beauty",
            "Sports",
            "Toys",
          ].map((category) => (
            <Link
              key={category}
              to={`/products?category=${category.toLowerCase()}`}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularProductsSection;
