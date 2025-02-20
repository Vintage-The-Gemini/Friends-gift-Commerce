import React, { useState, useEffect } from "react";
import {
  Calendar,
  DollarSign,
  Users,
  Share2,
  Gift,
  Edit,
  Trash2,
  ChevronLeft,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const EventDetails = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Mock Data - Replace with actual API call
  useEffect(() => {
    // Simulating API fetch
    const mockEvent = {
      _id: "1",
      title: "Birthday Celebration",
      creator: { _id: "user1", name: "John Doe" },
      description: "Join us for a special celebration!",
      eventDate: new Date(),
      endDate: new Date(Date.now() + 864000000), // 10 days from now
      currentAmount: 25000,
      targetAmount: 50000,
      status: "active",
      image: "/api/placeholder/400/200",
      products: [
        {
          product: {
            _id: "prod1",
            name: "Wireless Headphones",
            price: 15000,
            images: ["/api/placeholder/200/200"],
            description: "High-quality wireless headphones",
          },
          quantity: 1,
          status: "pending",
        },
      ],
      contributions: [
        { _id: "c1", amount: 5000, contributor: { name: "Alice" } },
        { _id: "c2", amount: 20000, contributor: { name: "Bob" } },
      ],
    };

    setEvent(mockEvent);
    setLoading(false);
  }, []);

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      // API call would go here
      setDeleteConfirm(false);
      // Navigate to events list
    } catch (error) {
      setError("Failed to delete event");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } else {
        setShowShareModal(true);
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = () => {
    if (!event?.targetAmount) return 0;
    return Math.min((event.currentAmount / event.targetAmount) * 100, 100);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Main Event Card */}
      <Card className="overflow-hidden">
        {/* Event Image */}
        <div className="relative">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
            <div className="absolute bottom-0 p-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                {event.title}
              </h1>
              <div className="flex items-center text-white/90">
                <Users className="w-4 h-4 mr-1" />
                <span>Created by {event.creator?.name}</span>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Event Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              <div>
                <div className="text-sm font-medium">Event Date</div>
                <div>{formatDate(event.eventDate)}</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2" />
              <div>
                <div className="text-sm font-medium">End Date</div>
                <div>{formatDate(event.endDate)}</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Gift className="w-5 h-5 mr-2" />
              <div>
                <div className="text-sm font-medium">Products</div>
                <div>{event.products?.length || 0} items</div>
              </div>
            </div>
          </div>

          {/* Event Description */}
          <p className="text-gray-700 mb-6">{event.description}</p>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Progress</span>
              <span>{calculateProgress().toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-600">
                Raised: {formatCurrency(event.currentAmount || 0)}
              </span>
              <span className="text-sm text-gray-600">
                Goal: {formatCurrency(event.targetAmount)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                /* Handle edit */
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Event
            </button>
            <button
              onClick={handleDelete}
              className={`flex items-center px-4 py-2 ${
                deleteConfirm
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-600 hover:bg-gray-700"
              } text-white rounded-lg`}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteConfirm ? "Confirm Delete" : "Delete Event"}
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2.5 border rounded-lg hover:bg-gray-50 transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Products Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Gift Registry</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {event.products?.map((item) => (
            <Card key={item.product._id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={item.product.images?.[0] || "/api/placeholder/200/200"}
                  alt={item.product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "contributed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{item.product.name}</h3>
                <p className="text-gray-600 mb-2">
                  {formatCurrency(item.product.price)}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </span>
                  <button
                    onClick={() => {
                      /* Handle product details view */
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details →
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Share Event</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col space-y-4">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setShowShareModal(false);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Copy Link
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
