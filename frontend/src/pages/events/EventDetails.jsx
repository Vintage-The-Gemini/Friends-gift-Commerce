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
  Edit,
  Trash2,
  ChevronLeft,
  Phone,
  CreditCard,
  X,
} from "lucide-react";
import { eventService } from "../../services/api/event";
import { contributionService } from "../../services/api/contribution";
import { formatCurrency } from "../../utils/currency";
import { toast } from "react-toastify";

const ContributionModal = ({ event, onClose, onContribute }) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!amount || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      if (paymentMethod === "mpesa" && !phoneNumber.match(/^\+254[0-9]{9}$/)) {
        throw new Error("Please enter a valid Kenyan phone number (+254...)");
      }

      await onContribute({
        eventId: event._id,
        amount: parseFloat(amount),
        paymentMethod,
        phoneNumber,
        message,
      });

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Make a Contribution</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">{event.title}</h3>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Target: {formatCurrency(event.targetAmount)}</span>
              <span>Raised: {formatCurrency(event.currentAmount)}</span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contribution Amount (KES)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                placeholder="Enter amount"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("mpesa")}
                className={`flex items-center justify-center p-3 border rounded-lg ${
                  paymentMethod === "mpesa"
                    ? "border-[#5551FF] bg-[#5551FF]/10 text-[#5551FF]"
                    : "hover:border-gray-300"
                }`}
              >
                <Phone className="w-5 h-5 mr-2" />
                M-PESA
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex items-center justify-center p-3 border rounded-lg ${
                  paymentMethod === "card"
                    ? "border-[#5551FF] bg-[#5551FF]/10 text-[#5551FF]"
                    : "hover:border-gray-300"
                }`}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Card
              </button>
            </div>
          </div>

          {/* Phone Number (for M-PESA) */}
          {paymentMethod === "mpesa" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                M-PESA Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                placeholder="+254..."
                required
              />
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
              rows="3"
              placeholder="Add a message..."
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5551FF] text-white py-3 rounded-lg hover:bg-[#4440FF] disabled:opacity-50"
          >
            {loading ? "Processing..." : "Contribute"}
          </button>
        </form>
      </div>
    </div>
  );
};

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributions, setContributions] = useState([]);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const [eventResponse, contributionsResponse] = await Promise.all([
        eventService.getEvent(id),
        contributionService.getEventContributions(id),
      ]);

      if (eventResponse.success) {
        setEvent(eventResponse.data);
      }

      if (contributionsResponse.success) {
        setContributions(contributionsResponse.data);
      }
    } catch (error) {
      setError(error.message);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (contributionData) => {
    try {
      const response = await contributionService.createContribution(
        contributionData
      );

      if (response.success) {
        toast.success("Contribution processed successfully!");
        toast.info("Processing payment...", { autoClose: 5000 });

        // Refresh after simulated payment completes
        setTimeout(() => {
          fetchEventDetails();
          toast.success("Payment completed successfully!");
        }, 6000);
      }
    } catch (error) {
      toast.error(error.message || "Failed to process contribution");
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      if (!deleteConfirm) {
        setDeleteConfirm(true);
        return;
      }

      const response = await eventService.deleteEvent(id);
      if (response.success) {
        toast.success("Event deleted successfully");
        navigate("/events");
      }
    } catch (error) {
      toast.error(error.message);
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
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Event link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5551FF]"></div>
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

  const isOwner = user && event.creator?._id === user._id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/events"
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Events
        </Link>

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
                  className="bg-[#5551FF] h-2.5 rounded-full transition-all duration-500"
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
            <div className="flex gap-4">
              {user ? (
                isOwner ? (
                  <div className="flex gap-2">
                    <Link
                      to={`/events/edit/${event._id}`}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Event
                    </Link>
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
                  </div>
                ) : (
                  <button
                    onClick={() => setShowContributeModal(true)}
                    className="flex-1 bg-[#5551FF] text-white px-6 py-2.5 rounded-lg hover:bg-[#4440FF] transition-colors flex items-center justify-center"
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    Contribute
                  </button>
                )
              ) : (
                <Link
                  to="/auth/signin"
                  className="flex-1 bg-[#5551FF] text-white px-6 py-2.5 rounded-lg hover:bg-[#4440FF] transition-colors flex items-center justify-center"
                >
                  Sign in to Contribute
                </Link>
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
                    src={
                      item.product.images?.[0]?.url || "/placeholder-image.jpg"
                    }
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
                    {formatCurrency(item.product.price)}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </span>
                    <Link
                      to={`/products/${item.product._id}`}
                      className="text-[#5551FF] hover:text-[#4440FF] text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contributions Section */}
        {contributions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Recent Contributions</h2>
            <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
              {contributions.map((contribution) => (
                <div
                  key={contribution._id}
                  className="flex justify-between items-center border-b pb-4 last:border-b-0"
                >
                  <div>
                    <p className="font-medium">
                      {contribution.anonymous
                        ? "Anonymous"
                        : contribution.contributor.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {contribution.message || "No message"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatCurrency(contribution.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(contribution.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contribution Modal */}
        {showContributeModal && (
          <ContributionModal
            event={event}
            onClose={() => setShowContributeModal(false)}
            onContribute={handleContribute}
          />
        )}
      </div>
    </div>
  );
};

export default EventDetails;
