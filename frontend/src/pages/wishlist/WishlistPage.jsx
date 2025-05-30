// frontend/src/pages/wishlist/WishlistPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Trash2,
  Plus,
  ShoppingBag,
  Edit3,
  X,
  Check,
  AlertCircle,
  ArrowRight,
  Gift,
  Package,
  DollarSign,
  Clock,
} from "lucide-react";
import { wishlistService } from "../../services/api/wishlist";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/currency";

const WishlistPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ notes: "", priority: "medium" });
  const [showMoveModal, setShowMoveModal] = useState(false);

  // Fetch wishlist data
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await wishlistService.getWishlist();

      if (response.success) {
        setWishlistItems(response.data);
        setStats(response.stats);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user, fetchWishlist]);

  // Remove item from wishlist
  const handleRemoveItem = async (productId) => {
    try {
      const response = await wishlistService.removeFromWishlist(productId);

      if (response.success) {
        setWishlistItems((prev) =>
          prev.filter((item) => item.product._id !== productId)
        );
        setSelectedItems((prev) => prev.filter((id) => id !== productId));
        toast.success("Item removed from wishlist");

        // Update stats
        setStats((prev) => ({
          ...prev,
          totalItems: prev.totalItems - 1,
        }));
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  // Update wishlist item
  const handleUpdateItem = async (productId, updates) => {
    try {
      const response = await wishlistService.updateWishlistItem(
        productId,
        updates
      );

      if (response.success) {
        setWishlistItems((prev) =>
          prev.map((item) =>
            item.product._id === productId ? response.data : item
          )
        );
        toast.success("Item updated");
        setEditingItem(null);
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  // Clear entire wishlist
  const handleClearWishlist = async () => {
    if (
      !window.confirm("Are you sure you want to clear your entire wishlist?")
    ) {
      return;
    }

    try {
      const response = await wishlistService.clearWishlist();

      if (response.success) {
        setWishlistItems([]);
        setSelectedItems([]);
        setStats({ totalItems: 0, availableItems: 0, totalValue: 0 });
        toast.success("Wishlist cleared");
      }
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast.error("Failed to clear wishlist");
    }
  };

  // Select/deselect items
  const handleSelectItem = (productId) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Select all items
  const handleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map((item) => item.product._id));
    }
  };

  // Start editing item
  const startEditingItem = (item) => {
    setEditingItem(item.product._id);
    setEditForm({
      notes: item.notes || "",
      priority: item.priority || "medium",
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingItem(null);
    setEditForm({ notes: "", priority: "medium" });
  };

  // Save edit
  const saveEdit = () => {
    handleUpdateItem(editingItem, editForm);
  };

  // Navigate to create event with selected items
  const handleCreateEventWithItems = () => {
    if (selectedItems.length === 0) {
      toast.warning("Please select items to add to your event");
      return;
    }

    const selectedProducts = wishlistItems
      .filter((item) => selectedItems.includes(item.product._id))
      .map((item) => item.product);

    navigate("/events/create", {
      state: {
        selectedProducts: selectedProducts.map((product) => ({
          product,
          quantity: 1,
        })),
      },
    });
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format relative time
  const formatRelativeTime = (date) => {
    const now = new Date();
    const added = new Date(date);
    const diffInDays = Math.floor((now - added) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return added.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to view your wishlist.
          </p>
          <Link
            to="/auth/signin?redirect=/wishlist"
            className="bg-[#5551FF] text-white px-6 py-2 rounded-lg hover:bg-[#4440FF]"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5551FF]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Heart className="w-8 h-8 mr-3 text-red-500" />
              My Wishlist
            </h1>
            <p className="text-gray-600 mt-2">
              Keep track of products you'd like to receive as gifts
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleClearWishlist}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                Clear All
              </button>
              <Link
                to="/products"
                className="px-4 py-2 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF] transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add More Items
              </Link>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {wishlistItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-green-50 rounded-full">
                  <Check className="w-6 h-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Available</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.availableItems || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-purple-50 rounded-full">
                  <DollarSign className="w-6 h-6 text-purple-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Value
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalValue || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {wishlistItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.length === wishlistItems.length &&
                      wishlistItems.length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-[#5551FF] focus:ring-[#5551FF] border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Select All ({selectedItems.length} selected)
                  </span>
                </label>
              </div>

              {selectedItems.length > 0 && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCreateEventWithItems}
                    className="px-4 py-2 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF] transition-colors flex items-center"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Create Event with Selected
                  </button>
                  <button
                    onClick={() => {
                      selectedItems.forEach((productId) =>
                        handleRemoveItem(productId)
                      );
                    }}
                    className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Remove Selected
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start adding products you'd like to receive as gifts. Browse our
              collection and save your favorites!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="px-6 py-3 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF] transition-colors flex items-center justify-center"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Browse Products
              </Link>
              <Link
                to="/events"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Gift className="w-5 h-5 mr-2" />
                Explore Events
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100"
              >
                {/* Product Image */}
                <div className="relative">
                  <img
                    src={
                      item.product.images?.[0]?.url ||
                      "/api/placeholder/400/300"
                    }
                    alt={item.product.name}
                    className="w-full h-48 object-cover"
                  />

                  {/* Stock Status */}
                  {item.product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium px-3 py-1 bg-red-500 rounded-md">
                        Out of Stock
                      </span>
                    </div>
                  )}

                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.product._id)}
                        onChange={() => handleSelectItem(item.product._id)}
                        className="h-4 w-4 text-[#5551FF] focus:ring-[#5551FF] border-gray-300 rounded bg-white"
                      />
                    </label>
                  </div>

                  {/* Priority Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}
                    >
                      {item.priority}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Link
                      to={`/products/${item.product._id}`}
                      className="font-medium text-gray-900 hover:text-[#5551FF] transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-[#5551FF]">
                      {formatCurrency(item.product.price)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {item.product.stock}
                    </span>
                  </div>

                  {/* Seller Info */}
                  <div className="text-sm text-gray-500 mb-3">
                    by{" "}
                    {item.product.seller?.businessName ||
                      item.product.seller?.name ||
                      "Unknown Seller"}
                  </div>

                  {/* Notes */}
                  {editingItem === item.product._id ? (
                    <div className="mb-3 space-y-2">
                      <textarea
                        value={editForm.notes}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Add notes about this item..."
                        className="w-full p-2 text-sm border rounded-lg resize-none"
                        rows="2"
                      />
                      <select
                        value={editForm.priority}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            priority: e.target.value,
                          }))
                        }
                        className="w-full p-2 text-sm border rounded-lg"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>
                  ) : (
                    item.notes && (
                      <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{item.notes}</p>
                      </div>
                    )
                  )}

                  {/* Added Date */}
                  <div className="flex items-center text-xs text-gray-400 mb-4">
                    <Clock className="w-3 h-3 mr-1" />
                    Added {formatRelativeTime(item.addedAt)}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    {editingItem === item.product._id ? (
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={saveEdit}
                          className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex-1 px-3 py-1.5 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition-colors flex items-center justify-center"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditingItem(item)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Edit item"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.product._id)}
                            className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <Link
                          to={`/products/${item.product._id}`}
                          className="px-3 py-1.5 bg-[#5551FF] text-white rounded-lg text-sm hover:bg-[#4440FF] transition-colors flex items-center"
                        >
                          View Details
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action for Empty States */}
        {wishlistItems.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 text-center text-white">
            <Gift className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-xl font-semibold mb-2">
              Ready to create an event?
            </h3>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              Turn your wishlist into a gift event and let your friends and
              family know exactly what you'd love to receive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCreateEventWithItems}
                disabled={selectedItems.length === 0}
                className="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Event with Selected Items
              </button>
              <Link
                to="/events/create"
                className="px-6 py-3 border border-white text-white rounded-lg hover:bg-white hover:text-indigo-600 transition-colors font-medium"
              >
                Create New Event
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
