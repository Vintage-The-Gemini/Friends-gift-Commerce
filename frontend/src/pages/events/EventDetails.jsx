// src/pages/events/EventDetails.jsx
import React, { useState, useEffect } from "react";
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
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
  Lock,
  Globe,
  Link as LinkIcon,
  Copy,
  Check,
} from "lucide-react";
import { eventService } from "../../services/api/event";
import { contributionService } from "../../services/api/contribution";
import ContributionModal from "../../components/events/ContributionModal";
import EventCheckoutModal from "../../components/events/EventCheckoutModal";
import { formatCurrency } from "../../utils/currency";
import { toast } from "react-toastify";

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessCode = searchParams.get("accessCode");

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [contributions, setContributions] = useState([]);
  const [accessInput, setAccessInput] = useState("");
  const [verifyingAccess, setVerifyingAccess] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ==== READ OPERATION ====
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError("");
      setErrorType("");

      console.log("Fetching event details for ID:", id);

      // Build params for the API call
      const params = accessCode ? { accessCode } : {};

      // Fetch event
      const response = await eventService.getEvent(id, params);
      console.log("Event response:", response);

      if (response.success) {
        setEvent(response.data);

        // Fetch contributions
        try {
          const contributionsResponse =
            await contributionService.getEventContributions(id);
          console.log("Contributions response:", contributionsResponse);

          if (contributionsResponse.success) {
            setContributions(contributionsResponse.data);
          }
        } catch (err) {
          console.warn("Failed to fetch contributions:", err);
        }
      } else {
        throw new Error(response.message || "Failed to load event details");
      }
    } catch (error) {
      console.error("Error fetching event:", error);

      if (error.status === 403) {
        setError("You don't have permission to view this event.");
        setErrorType("accessDenied");
      } else if (error.status === 404) {
        setError("The requested event could not be found.");
        setErrorType("notFound");
      } else {
        setError("Failed to load event details");
        setErrorType("general");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id, accessCode]);

  // ==== UPDATE OPERATION ====
  // We'll navigate to edit page, but include direct update capability
  const handleUpdateStatus = async (newStatus) => {
    try {
      const response = await eventService.updateEventStatus(id, newStatus);

      if (response.success) {
        toast.success(`Event status updated to ${newStatus}`);
        fetchEventDetails(); // Refresh data
      } else {
        throw new Error(response.message || "Failed to update event");
      }
    } catch (error) {
      console.error("Error updating event status:", error);
      toast.error(error.message || "Failed to update event status");
    }
  };

  // ==== DELETE OPERATION ====
  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      setDeleteLoading(true);
      console.log("Deleting event with ID:", id);

      const response = await eventService.deleteEvent(id);
      console.log("Delete response:", response);

      if (response.success) {
        toast.success("Event deleted successfully");
        navigate("/events");
      } else {
        throw new Error(response.message || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error(error.message || "Failed to delete event");
      setDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle checkout completion
  const handleCheckoutComplete = (data) => {
    toast.success("Event checkout completed successfully!");
    // Navigate to the created order page if there's an order
    if (data && data.order && data.order._id) {
      navigate(`/orders/${data.order._id}`);
    }
    setShowCheckoutModal(false);
    fetchEventDetails(); // Refresh event data
  };

  // Handle contribution
  const handleContribute = async (contributionData) => {
    try {
      const response = await contributionService.createContribution(
        contributionData
      );

      if (response.success) {
        toast.success("Contribution processed successfully!");
        setTimeout(() => {
          fetchEventDetails();
        }, 2000);
      }

      setShowContributeModal(false);
      setSelectedProduct(null);
    } catch (error) {
      toast.error(error.message || "Failed to process contribution");
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/events/${id}`;

      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Event link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const handleCopyAccessCode = () => {
    if (event?.accessCode) {
      navigator.clipboard.writeText(event.accessCode);
      toast.success("Access code copied to clipboard!");
    }
  };

  const handleAccessCodeSubmit = (e) => {
    e.preventDefault();
    if (!accessInput.trim()) {
      toast.error("Please enter an access code");
      return;
    }

    navigate(`/events/${id}?accessCode=${accessInput.trim()}`);
  };

  const handleProductContribution = (product) => {
    setSelectedProduct(product);
    setShowContributeModal(true);
  };

  const calculateProgress = () => {
    if (!event?.targetAmount) return 0;
    return Math.min((event.currentAmount / event.targetAmount) * 100, 100);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysLeft = () => {
    if (!event || !event.endDate) return 0;
    const today = new Date();
    const end = new Date(event.endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Check if user is the event creator
  const isOwner =
    user &&
    event?.creator &&
    (typeof event.creator === "string"
      ? event.creator === user._id
      : event.creator._id === user._id);

  // Debug information for troubleshooting
  console.log("Event owner check:", {
    isLoggedIn: !!user,
    eventCreatorId: event?.creator?._id || event?.creator,
    currentUserId: user?._id,
    isOwner,
    eventStatus: event?.status,
  });

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5551FF]"></div>
      </div>
    );
  }

  // Render access code form for private events
  if (errorType === "accessDenied") {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <Lock className="mx-auto h-16 w-16 text-[#5551FF] mb-4" />
            <h2 className="text-2xl font-bold mb-2">Private Event</h2>
            <p className="text-gray-600">
              This event is private and requires an access code to view.
            </p>
          </div>

          <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Code
              </label>
              <input
                type="text"
                value={accessInput}
                onChange={(e) => setAccessInput(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                placeholder="Enter the access code"
                required
              />
            </div>
            <button
              type="submit"
              disabled={verifyingAccess}
              className="w-full bg-[#5551FF] text-white py-2 px-4 rounded-lg hover:bg-[#4440FF] disabled:opacity-50"
            >
              {verifyingAccess ? "Verifying..." : "Access Event"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/events" className="text-[#5551FF] hover:underline">
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render not found state
  if (errorType === "notFound") {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center max-w-2xl mx-auto">
          <AlertCircle className="mx-auto h-12 w-12 mb-4" />
          <h2 className="text-xl font-medium mb-2">Event Not Found</h2>
          <p className="mb-6">
            {error || "The requested event could not be found."}
          </p>
          <Link
            to="/events"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (!event) return null;

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
              <div className="w-full h-64 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <Gift className="w-16 h-16 text-white opacity-75" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                {event.title}
              </h1>
              <div className="flex items-center text-white/90">
                <Users className="w-4 h-4 mr-1" />
                <span>Created by {event.creator?.name || "Anonymous"}</span>
              </div>
            </div>

            {/* Event type badge */}
            <div className="absolute top-4 left-4">
              <div className="flex items-center space-x-2">
                <span className="bg-white/80 backdrop-blur-sm text-gray-800 text-xs px-2 py-1 rounded-full capitalize">
                  {event.eventType === "other" && event.customEventType
                    ? event.customEventType
                    : event.eventType}
                </span>

                <span className="bg-white/80 backdrop-blur-sm flex items-center text-xs px-2 py-1 rounded-full">
                  {event.visibility === "public" && (
                    <>
                      <Globe className="h-3 w-3 mr-1 text-green-600" />
                      Public
                    </>
                  )}
                  {event.visibility === "private" && (
                    <>
                      <Lock className="h-3 w-3 mr-1 text-red-600" />
                      Private
                    </>
                  )}
                  {event.visibility === "unlisted" && (
                    <>
                      <LinkIcon className="h-3 w-3 mr-1 text-yellow-600" />
                      Unlisted
                    </>
                  )}
                </span>
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
                  <div className="text-sm font-medium">Days Left</div>
                  <div>{getDaysLeft()} days</div>
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

            {/* Access Code Section (for event creator) */}
            {isOwner && event.visibility !== "public" && event.accessCode && (
              <div className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-indigo-900 mb-1">
                      Access Code
                    </h3>
                    <p className="text-sm text-indigo-700">
                      Share this code with people you want to invite:
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-indigo-900 bg-indigo-100 px-3 py-1 rounded">
                      {event.accessCode}
                    </span>
                    <button
                      onClick={handleCopyAccessCode}
                      className="p-1.5 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

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

            {/* Event Status (UPDATE OPERATION) */}
            {isOwner && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Event Status</h3>
                <div className="flex flex-wrap gap-2">
                  {["active", "completed", "cancelled"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(status)}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center ${
                        event.status === status
                          ? "bg-green-100 text-green-800 font-medium"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {event.status === status && (
                        <Check className="w-4 h-4 mr-1" />
                      )}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 flex-wrap">
              {user ? (
                isOwner ? (
                  <div className="flex gap-2 flex-wrap">
                    {/* Checkout button for owner when event is active */}
                    {event.status === "active" && (
                      <button
                        onClick={() => setShowCheckoutModal(true)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Checkout Event
                      </button>
                    )}

                    <Link
                      to={`/events/edit/${event._id}`}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Event
                    </Link>
                    <button
                      onClick={handleDelete}
                      disabled={deleteLoading}
                      className={`flex items-center px-4 py-2 ${
                        deleteConfirm
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-gray-600 hover:bg-gray-700"
                      } text-white rounded-lg`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deleteLoading
                        ? "Deleting..."
                        : deleteConfirm
                        ? "Confirm Delete"
                        : "Delete Event"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowContributeModal(true)}
                    className="flex-1 bg-[#5551FF] text-white px-6 py-2.5 rounded-lg hover:bg-[#4440FF] transition-colors flex items-center justify-center"
                    disabled={event.status !== "active"}
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    Contribute
                  </button>
                )
              ) : (
                <Link
                  to={`/auth/signin?redirect=/events/${event._id}`}
                  className="flex-1 bg-[#5551FF] text-white px-6 py-2.5 rounded-lg hover:bg-[#4440FF] transition-colors flex items-center justify-center"
                >
                  Sign in to Contribute
                </Link>
              )}
              <button
                onClick={handleShare}
                className="px-4 py-2.5 border rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Test Button for Debugging */}
            <button
              onClick={() => setShowCheckoutModal(true)}
              className="mt-4 bg-red-600 text-white px-6 py-3 rounded-lg font-bold"
            >
              TEST CHECKOUT BUTTON
            </button>
          </div>
        </div>

        {/* Products Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Gift Registry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {event.products?.map((item) => (
              <div
                key={item.product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={
                      item.product.images?.[0]?.url ||
                      "/api/placeholder/400/400"
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
                    <div className="flex gap-2">
                      <Link
                        to={`/products/${item.product._id}`}
                        className="text-[#5551FF] hover:text-[#4440FF] text-sm font-medium"
                      >
                        View Details
                      </Link>
                      {item.status !== "completed" && user && !isOwner && (
                        <button
                          onClick={() => handleProductContribution(item)}
                          className="text-[#5551FF] hover:text-[#4440FF] text-sm font-medium"
                        >
                          Contribute
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contributions Section */}
        {contributions && contributions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Recent Contributions
            </h2>
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
                        : contribution.contributor?.name || "Anonymous"}
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
            selectedProduct={selectedProduct}
            onClose={() => {
              setShowContributeModal(false);
              setSelectedProduct(null);
            }}
            onContribute={handleContribute}
          />
        )}

        {/* Checkout Modal */}
        {showCheckoutModal && (
          <EventCheckoutModal
            event={event}
            isOpen={showCheckoutModal}
            onClose={() => setShowCheckoutModal(false)}
            onCheckoutComplete={handleCheckoutComplete}
          />
        )}
      </div>
    </div>
  );
};

export default EventDetails;
