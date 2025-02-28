// src/pages/public/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, ChevronRight, Heart, PartyPopper } from "lucide-react";
import Card from "../../components/ui/card"; // Fixed import
import { productService } from "../../services/api/product";
import { useAuth } from "../../hooks/useAuth";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      const response = await productService.getAllProducts({
        limit: 8,
        sort: "popularity",
      });
      if (response.success) {
        setTrendingProducts(response.data);
      }
    } catch (error) {
      console.error("Error fetching trending products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    if (!user) {
      navigate("/auth/signin");
    } else {
      navigate("/events/create");
    }
  };

  const handleAddToEvent = (productId) => {
    if (!user) {
      navigate("/auth/signin");
    } else {
      navigate(`/events/create?product=${productId}`);
    }
  };

  const handleExploreGifts = () => {
    navigate("/products");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#5551FF]">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#4440FF] rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute top-40 -left-20 w-72 h-72 bg-[#6661FF] rounded-full opacity-50 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative py-16 lg:py-24">
            {/* Hero content */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <PartyPopper className="h-5 w-5 mr-2" />
                  <span>Start Gifting Together</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Celebrate Friendships
                  <span className="block mt-2">With Meaningful Gifts</span>
                </h1>
                <p className="mt-6 text-lg text-white/90 max-w-lg">
                  Create events and let friends contribute to gifts that matter.
                  Make every celebration a shared experience to remember.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={handleCreateEvent}
                    className="px-8 py-3 bg-white text-[#5551FF] rounded-full hover:bg-gray-100 font-medium flex items-center group"
                  >
                    Create Event
                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={handleExploreGifts}
                    className="px-8 py-3 bg-[#4440FF] text-white rounded-full hover:bg-[#3330FF] font-medium"
                  >
                    Explore Gifts
                  </button>
                </div>
              </div>

              {/* Interactive Features Section */}
              <div className="relative lg:pl-10">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 transform hover:-translate-y-1 transition-transform">
                      <Gift className="h-8 w-8 text-white mb-3" />
                      <h3 className="text-white font-medium mb-2">
                        Create Events
                      </h3>
                      <p className="text-white/70 text-sm">
                        Share special moments
                      </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 transform hover:-translate-y-1 transition-transform">
                      <Heart className="h-8 w-8 text-white mb-3" />
                      <h3 className="text-white font-medium mb-2">
                        Choose Gifts
                      </h3>
                      <p className="text-white/70 text-sm">
                        Pick meaningful gifts
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6 pt-12">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 transform hover:-translate-y-1 transition-transform">
                      <Gift className="h-8 w-8 text-white mb-3" />
                      <h3 className="text-white font-medium mb-2">
                        Group Gifting
                      </h3>
                      <p className="text-white/70 text-sm">
                        Contribute together
                      </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 transform hover:-translate-y-1 transition-transform">
                      <PartyPopper className="h-8 w-8 text-white mb-3" />
                      <h3 className="text-white font-medium mb-2">Celebrate</h3>
                      <p className="text-white/70 text-sm">Make memories</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Trending Gifts
              </h2>
              <p className="mt-2 text-gray-600">
                Discover perfect gifts for your friends
              </p>
            </div>
            <button
              onClick={handleExploreGifts}
              className="flex items-center text-[#5551FF] hover:text-[#4440FF] font-medium"
            >
              View All
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5551FF]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <div
                  key={product._id}
                  className="group hover:shadow-lg transition-shadow bg-white rounded-lg overflow-hidden"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={
                        product.images?.[0]?.url || "/api/placeholder/400/400"
                      }
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#5551FF] hover:text-white">
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {product.name}
                      </h3>
                      {product.inStock ? (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          In Stock
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                          Out of Stock
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        KES {product.price?.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleAddToEvent(product._id)}
                        className="px-4 py-2 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF] transform hover:scale-105 transition-all"
                        disabled={!product.inStock}
                      >
                        Add to Event
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
