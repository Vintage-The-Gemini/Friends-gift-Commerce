// src/pages/events/EventDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  Calendar,
  DollarSign,
  Users,
  Share2,
  Gift,
  ShoppingBag,
  Clock,
  AlertCircle,
} from "lucide-react";

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/events/${id}`);
      if (!response.ok) throw new Error("Failed to fetch event details");
      const data = await response.json();
      setEvent(data.data);
    } catch (error) {
      setError("Failed to load event details");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/contributions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          eventId: id,
          amount: parseFloat(contributionAmount),
          paymentMethod: "mpesa",
        }),
      });

      if (!response.ok) throw new Error("Failed to process contribution");

      await fetchEventDetails();
      setShowContributeModal(false);
      setContributionAmount("");
    } catch (error) {
      setError("Failed to process contribution");
      console.error("Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } catch (error) {
      // Handle share error or fallback
      console.error("Share failed:", error);
    }
  };

  const calculateProgress = () => {
    if (!event?.targetAmount) return 0;
    return Math.min((event.currentAmount / event.targetAmount) * 100, 100);
  };

  const calculateTimeLeft = () => {
    if (!event?.endDate) return null;
    const now = new Date();
    const end = new Date(event.endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative">
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                <Gift className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                {event.title}
              </h1>
              <div className="flex items-center text-white/90">
                <Users className="w-4 h-4 mr-1" />
                <span>Created by {event.creator?.name}</span>
              </div>
            </div>
          </div>

          {/* Event Info */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-2" />
                <div>
                  <div className="text-sm font-medium">Event Date</div>
                  <div>{new Date(event.eventDate).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-2" />
                <div>
                  <div className="text-sm font-medium">Time Left</div>
                  <div>{calculateTimeLeft()} days</div>
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <ShoppingBag className="w-5 h-5 mr-2" />
                <div>
                  <div className="text-sm font-medium">Products</div>
                  <div>{event.products?.length || 0} items</div>
                </div>
              </div>
            </div>

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
                  Raised: ${event.currentAmount?.toFixed(2) || 0}
                </span>
                <span className="text-sm text-gray-600">
                  Goal: ${event.targetAmount?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {user ? (
                <button
                  onClick={() => setShowContributeModal(true)}
                  className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Contribute
                </button>
              ) : (
                <button
                  onClick={() => navigate("/auth/signin")}
                  className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  Sign in to Contribute
                </button>
              )}
              <button
                onClick={handleShare}
                className="px-4 py-2.5 border rounded-lg hover:bg-gray-50 transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Gift Registry</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {event.products?.map((item) => (
              <div
                key={item.product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={item.product.images[0]}
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
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{item.product.name}</h3>
                  <p className="text-gray-600 mb-2">
                    ${item.product.price.toFixed(2)}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </span>
                    <Link
                      to={`/products/${item.product._id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contribute Modal */}
        {showContributeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Make a Contribution</h3>
              <form onSubmit={handleContribute}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="1"
                    step="0.01"
                    disabled={submitting}
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowContributeModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? "Processing..." : "Contribute"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
