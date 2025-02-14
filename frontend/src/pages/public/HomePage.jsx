// src/pages/public/HomePage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gift, ChevronRight, ShoppingBag } from "lucide-react";
import { categoryService } from "../../services/api/category";
import { productService } from "../../services/api/product";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response?.data) {
        const mainCategories = response.data.filter((cat) => !cat.parent);
        setCategories(mainCategories);
        // Fetch products for each category
        mainCategories.forEach((category) => {
          fetchCategoryProducts(category._id);
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryProducts = async (categoryId) => {
    try {
      const response = await productService.getProductsByCategory(categoryId, {
        limit: 4,
      });
      if (response?.data) {
        setCategoryProducts((prev) => ({
          ...prev,
          [categoryId]: response.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching category products:", error);
    }
  };

  const handleCreateEvent = (product) => {
    if (!user) {
      toast.info("Please sign in to create an event");
      navigate("/auth/signin");
      return;
    }
    navigate("/events/create", { state: { selectedProduct: product } });
  };

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={product.images?.[0]?.url || "https://placehold.co/300x200"}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
          <button
            onClick={() => handleCreateEvent(product)}
            className="bg-[#5551FF] text-white px-4 py-2 rounded-lg hover:bg-[#4440FF] transition-colors"
          >
            Create Event
          </button>
        </div>
      </div>
    </div>
  );

  const CategorySection = ({ category }) => (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
        <Link
          to={`/category/${category._id}`}
          className="text-[#5551FF] hover:text-[#4440FF] flex items-center"
        >
          View All <ChevronRight className="w-5 h-5 ml-1" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categoryProducts[category._id]?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5551FF]"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-[#5551FF] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Create Your Perfect Gift Registry
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Start your special event registry and let your friends and family
              contribute to your dreams.
            </p>
            <Link
              to={user ? "/events/create" : "/auth/signin"}
              className="bg-white text-[#5551FF] px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all inline-flex items-center"
            >
              <Gift className="w-5 h-5 mr-2" />
              {user ? "Create Event" : "Get Started"}
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Categories Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8">
          {categories.map((category) => (
            <CategorySection key={category._id} category={category} />
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#5551FF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Event</h3>
              <p className="text-gray-600">
                Choose your special occasion and start adding gifts you'd love
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#5551FF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Share with Friends</h3>
              <p className="text-gray-600">
                Share your event with friends and family
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#5551FF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Receive Your Gifts</h3>
              <p className="text-gray-600">
                Get the gifts you really want for your special occasion
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
