// src/components/events/EnhancedEventManagement.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  AlertCircle,
  EyeOff,
  Users,
  DollarSign,
  Clock,
  Gift,
  Edit,
  Trash2,
  Share2,
  CopyCheck,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";
import { eventService } from "../../services/api/event";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/currency";
import Button from "../common/Button";

const EnhancedEventManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'table'

  // Fetch events on component mount and when activeTab changes
  useEffect(() => {
    fetchUserEvents();
  }, [activeTab]);

  // Filter events when search term changes
  useEffect(() => {
    filterEvents();
  }, [searchTerm, events, sortOrder]);

  const fetchUserEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (activeTab !== "all") {
        params.status = activeTab;
      }

      const response = await eventService.getUserEvents(params);

      if (response.success) {
        setEvents(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch your events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again.");
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const refreshEvents = async () => {
    try {
      setRefreshing(true);
      await fetchUserEvents();
      toast.success("Events refreshed successfully");
    } catch (error) {
      // Error is already handled in fetchUserEvents
    } finally {
      setRefreshing(false);
    }
  };

  const filterEvents = useCallback(() => {
    if (!events.length) return;

    let filtered = [...events];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(term) ||
          (event.description && event.description.toLowerCase().includes(term))
      );
    }

    // Apply sorting
    switch (sortOrder) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "target-high":
        filtered.sort((a, b) => b.targetAmount - a.targetAmount);
        break;
      case "target-low":
        filtered.sort((a, b) => a.targetAmount - b.targetAmount);
        break;
      case "progress-high":
        filtered.sort(
          (a, b) =>
            b.currentAmount / b.targetAmount - a.currentAmount / a.targetAmount
        );
        break;
      case "end-date":
        filtered.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
        break;
      default:
        break;
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, sortOrder]);

  const handleEventDelete = async (eventId) => {
    try {
      setDeleteLoading(true);

      const response = await eventService.deleteEvent(eventId);

      if (response.success) {
        toast.success(response.message || "Event deleted successfully");
        // Remove the deleted event from the state
        setEvents((prev) => prev.filter((event) => event._id !== eventId));
        setFilteredEvents((prev) =>
          prev.filter((event) => event._id !== eventId)
        );
        setShowDeleteModal(false);
        setSelectedEvent(null);
      } else {
        throw new Error(response.message || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error(error.message || "Failed to delete event");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteModal = (event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const openShareModal = (event) => {
    setSelectedEvent(event);
    setShowShareModal(true);
  };

  const handleShare = async () => {
    if (!selectedEvent) return;

    try {
      const shareUrl = `${window.location.origin}/events/${selectedEvent._id}`;

      if (navigator.share) {
        await navigator.share({
          title: selectedEvent.title,
          text: selectedEvent.description,
          url: shareUrl,
        });
        toast.success("Event shared successfully");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Event link copied to clipboard!");
      }
      setShowShareModal(false);
    } catch (error) {
      console.error("Share failed:", error);
      toast.error("Failed to share event");
    }
  };

  const handleCopyAccessCode = () => {
    if (!selectedEvent?.accessCode) return;

    navigator.clipboard.writeText(selectedEvent.accessCode);
    toast.success("Access code copied to clipboard!");
  };

  const calculateProgress = (event) => {
    if (!event.targetAmount) return 0;
    return Math.min((event.currentAmount / event.targetAmount) * 100, 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate days left until end date
  const getDaysLeft = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredEvents.map((event) => (
        <div
          key={event._id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Event Image/Header */}
          <div className="relative">
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <Gift className="w-16 h-16 text-white opacity-75" />
              </div>
            )}

            {/* Event Status Badge */}
            <div className="absolute top-2 right-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.status === "active"
                    ? "bg-green-100 text-green-800"
                    : event.status === "completed"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </div>

            {/* Event Title */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <h3 className="text-white font-semibold">{event.title}</h3>

              {/* Event Date */}
              <div className="flex items-center text-white/80 text-sm mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{formatDate(event.eventDate)}</span>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Raised</span>
                <span className="font-medium">
                  {formatCurrency(event.currentAmount || 0)} /{" "}
                  {formatCurrency(event.targetAmount)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#5551FF] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${calculateProgress(event)}%` }}
                />
              </div>
            </div>

            {/* Event Stats */}
            <div className="grid grid-cols-3 gap-2 text-sm mb-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-gray-500" />
                <span>{getDaysLeft(event.endDate)} days left</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1 text-gray-500" />
                <span>{event.contributions?.length || 0} contributors</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                <span>{calculateProgress(event).toFixed(0)}%</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/events/${event._id}`}
                className="flex-1 bg-[#5551FF] text-white px-2 py-1.5 rounded text-sm font-medium hover:bg-[#4440FF] flex items-center justify-center"
              >
                View Details
              </Link>

              <div className="flex gap-1">
                <Link
                  to={`/events/edit/${event._id}`}
                  className="p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  <Edit className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => openDeleteModal(event)}
                  className="p-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => openShareModal(event)}
                  className="p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Event
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dates
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progress
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredEvents.map((event) => (
            <tr key={event._id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="h-10 w-10 object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-indigo-100 flex items-center justify-center">
                        <Gift className="h-5 w-5 text-indigo-600" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-gray-900">
                      {event.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {event.products?.length || 0} products
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatDate(event.eventDate)}
                </div>
                <div className="text-sm text-gray-500">
                  {getDaysLeft(event.endDate)} days left
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="w-36">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{formatCurrency(event.currentAmount || 0)}</span>
                    <span>{calculateProgress(event).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-[#5551FF] h-1.5 rounded-full"
                      style={{ width: `${calculateProgress(event)}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    event.status === "active"
                      ? "bg-green-100 text-green-800"
                      : event.status === "completed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/events/${event._id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View
                  </Link>
                  <Link
                    to={`/events/edit/${event._id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => openShareModal(event)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => openDeleteModal(event)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Events</h2>
        <Link
          to="/events/create"
          className="bg-[#5551FF] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[#4440FF]"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Input (4 columns) */}
          <div className="md:col-span-4 relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Status Filter (3 columns) */}
          <div className="md:col-span-3 flex space-x-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-2 rounded-lg text-sm flex-1 ${
                activeTab === "all"
                  ? "bg-[#5551FF] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`px-3 py-2 rounded-lg text-sm flex-1 ${
                activeTab === "active"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-3 py-2 rounded-lg text-sm flex-1 ${
                activeTab === "completed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Completed
            </button>
          </div>

          {/* Sort Options (3 columns) */}
          <div className="md:col-span-3">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="target-high">Highest Target</option>
              <option value="target-low">Lowest Target</option>
              <option value="progress-high">Most Progress</option>
              <option value="end-date">Ending Soon</option>
            </select>
          </div>

          {/* View Mode and Refresh (2 columns) */}
          <div className="md:col-span-2 flex justify-end gap-2">
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid" ? "bg-gray-100" : "bg-white"
                }`}
                title="Grid View"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 ${
                  viewMode === "table" ? "bg-gray-100" : "bg-white"
                }`}
                title="Table View"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
            <button
              onClick={refreshEvents}
              disabled={refreshing}
              className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Events Display */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5551FF]"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Events Found
          </h3>
          <p className="text-gray-500 mb-6">
            {events.length === 0
              ? "You haven't created any events yet."
              : "No events match your search."}
          </p>
          {events.length === 0 ? (
            <Link
              to="/events/create"
              className="bg-[#5551FF] text-white px-4 py-2 rounded-lg inline-flex items-center hover:bg-[#4440FF]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Event
            </Link>
          ) : (
            <button
              onClick={() => setSearchTerm("")}
              className="text-[#5551FF] hover:text-[#4440FF] font-medium"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        renderGridView()
      ) : (
        renderTableView()
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Event
            </h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete "{selectedEvent.title}"? This
              action cannot be undone.
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEventDelete(selectedEvent._id)}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {deleteLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Share Event
            </h3>
            <p className="text-gray-500 mb-4">
              Share "{selectedEvent.title}" with friends and family
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/events/${selectedEvent._id}`}
                    className="flex-1 px-3 py-2 border rounded-l-lg bg-gray-50"
                  />
                  <button
                    onClick={handleShare}
                    className="px-4 py-2 bg-gray-100 border-y border-r rounded-r-lg hover:bg-gray-200"
                  >
                    <CopyCheck className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {selectedEvent.visibility !== "public" &&
                selectedEvent.accessCode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Access Code
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        readOnly
                        value={selectedEvent.accessCode}
                        className="flex-1 px-3 py-2 border rounded-l-lg bg-gray-50"
                      />
                      <button
                        onClick={handleCopyAccessCode}
                        className="px-4 py-2 bg-gray-100 border-y border-r rounded-r-lg hover:bg-gray-200"
                      >
                        <CopyCheck className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Share this code with invited users
                    </p>
                  </div>
                )}

              <div className="border-t pt-4 flex justify-center">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedEventManagement;
