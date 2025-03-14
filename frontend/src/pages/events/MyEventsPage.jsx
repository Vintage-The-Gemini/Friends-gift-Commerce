// frontend/src/pages/events/MyEventsPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Calendar,
  Search,
  RefreshCw,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Share2,
  Filter,
  Check,
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarDays,
  DollarSign,
  ChevronDown,
  X,
  Users,
  Clock,
  ChevronRight,
  Grid,
  List,
} from "lucide-react";
import { eventService } from "../../services/api/event";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/currency";

const MyEventsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    eventId: null,
    deleting: false,
  });
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEventTypes, setSelectedEventTypes] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const eventTypes = [
    { value: "birthday", label: "Birthday" },
    { value: "wedding", label: "Wedding" },
    { value: "graduation", label: "Graduation" },
    { value: "babyShower", label: "Baby Shower" },
    { value: "houseWarming", label: "House Warming" },
    { value: "anniversary", label: "Anniversary" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    if (user) {
      fetchUserEvents();
    }
  }, [user, activeTab]);

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
      setError("Failed to load your events. Please try again.");
      toast.error("Failed to load your events");
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

  const handleDeleteEvent = async (eventId) => {
    try {
      setDeleteConfirmation({ ...deleteConfirmation, deleting: true });
      const response = await eventService.deleteEvent(eventId);

      if (response.success) {
        toast.success(response.message || "Event deleted successfully");
        // Remove the deleted event from the state
        setEvents(events.filter((event) => event._id !== eventId));
        setDeleteConfirmation({ show: false, eventId: null, deleting: false });
      } else {
        throw new Error(response.message || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error(error.message || "Failed to delete event");
      setDeleteConfirmation({ show: false, eventId: null, deleting: false });
    }
  };

  const handleShareEvent = async (eventId) => {
    try {
      const shareUrl = `${window.location.origin}/events/${eventId}`;

      if (navigator.share) {
        await navigator.share({
          title: "Check out my event!",
          url: shareUrl,
        });
        toast.success("Event shared successfully");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Event link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing event:", error);
      toast.error("Failed to share event");
    }
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const toggleEventTypeFilter = (eventType) => {
    setSelectedEventTypes((prev) => {
      if (prev.includes(eventType)) {
        return prev.filter((type) => type !== eventType);
      } else {
        return [...prev, eventType];
      }
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setDateRangeFilter({ startDate: "", endDate: "" });
    setSelectedEventTypes([]);
    setActiveTab("all");
    setSortConfig({ key: "createdAt", direction: "desc" });
  };

  const getSortedEvents = () => {
    const { key, direction } = sortConfig;
    return [...events].sort((a, b) => {
      if (key === "title") {
        return direction === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (key === "eventDate") {
        const dateA = new Date(a.eventDate);
        const dateB = new Date(b.eventDate);
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      } else if (key === "targetAmount") {
        return direction === "asc"
          ? a.targetAmount - b.targetAmount
          : b.targetAmount - a.targetAmount;
      } else if (key === "progress") {
        const progressA = a.targetAmount
          ? (a.currentAmount / a.targetAmount) * 100
          : 0;
        const progressB = b.targetAmount
          ? (b.currentAmount / b.targetAmount) * 100
          : 0;
        return direction === "asc"
          ? progressA - progressB
          : progressB - progressA;
      } else if (key === "createdAt") {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
  };

  // Filter events based on all filters
  const filteredEvents = getSortedEvents().filter((event) => {
    // Search term filter
    const matchesSearch = searchTerm
      ? event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description &&
          event.description.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    // Event type filter
    const matchesEventType =
      selectedEventTypes.length === 0 ||
      selectedEventTypes.includes(event.eventType);

    // Date range filter
    let matchesDateRange = true;
    if (dateRangeFilter.startDate) {
      const eventDate = new Date(event.eventDate);
      const startDate = new Date(dateRangeFilter.startDate);
      if (eventDate < startDate) {
        matchesDateRange = false;
      }
    }
    if (dateRangeFilter.endDate) {
      const eventDate = new Date(event.eventDate);
      const endDate = new Date(dateRangeFilter.endDate);
      if (eventDate > endDate) {
        matchesDateRange = false;
      }
    }

    return matchesSearch && matchesEventType && matchesDateRange;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateProgress = (currentAmount, targetAmount) => {
    if (!targetAmount) return 0;
    return Math.min((currentAmount / targetAmount) * 100, 100);
  };

  const getDaysLeft = (endDate) => {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to view your events.
          </p>
          <Link
            to="/auth/signin?redirect=/events/my-events"
            className="bg-[#5551FF] text-white px-6 py-2 rounded-lg hover:bg-[#4440FF]"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Events</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all your events in one place
          </p>
        </div>
        <Link
          to="/events/create"
          className="bg-[#5551FF] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[#4440FF] shadow"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </Link>
      </div>

      {/* Tabs and Search/Filter */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-100">
          {/* Tabs */}
          <div className="flex overflow-x-auto mb-4 gap-2">
            <button
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === "all"
                  ? "bg-[#5551FF] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All Events
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === "active"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("active")}
            >
              Active
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === "completed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("completed")}
            >
              Completed
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === "cancelled"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("cancelled")}
            >
              Cancelled
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Search and Buttons */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF] w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition ${
                  showFilters ||
                  selectedEventTypes.length > 0 ||
                  dateRangeFilter.startDate ||
                  dateRangeFilter.endDate
                    ? "bg-[#5551FF] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title="Filter events"
              >
                <Filter className="w-5 h-5" />
              </button>
              <button
                onClick={refreshEvents}
                disabled={refreshing}
                className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"
                title="Refresh events"
              >
                <RefreshCw
                  className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              <div className="flex rounded-lg overflow-hidden border">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition ${
                    viewMode === "grid" ? "bg-gray-200" : "bg-white"
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition ${
                    viewMode === "list" ? "bg-gray-200" : "bg-white"
                  }`}
                  title="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Advanced Filters</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-[#5551FF] hover:text-[#4440FF]"
              >
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              {/* Event Type Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {eventTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => toggleEventTypeFilter(type.value)}
                      className={`px-3 py-1 rounded-full text-xs flex items-center transition ${
                        selectedEventTypes.includes(type.value)
                          ? "bg-[#5551FF] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {selectedEventTypes.includes(type.value) && (
                        <Check className="w-3 h-3 mr-1" />
                      )}
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRangeFilter.startDate}
                      onChange={(e) =>
                        setDateRangeFilter({
                          ...dateRangeFilter,
                          startDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-1 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRangeFilter.endDate}
                      onChange={(e) =>
                        setDateRangeFilter({
                          ...dateRangeFilter,
                          endDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-1 border rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSort("createdAt")}
                    className={`px-3 py-1 rounded-full text-xs flex items-center transition ${
                      sortConfig.key === "createdAt"
                        ? "bg-[#5551FF] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Date Created
                    {sortConfig.key === "createdAt" && (
                      <>
                        {sortConfig.direction === "asc" ? (
                          <ArrowUpAZ className="w-3 h-3 ml-1" />
                        ) : (
                          <ArrowDownAZ className="w-3 h-3 ml-1" />
                        )}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleSort("eventDate")}
                    className={`px-3 py-1 rounded-full text-xs flex items-center transition ${
                      sortConfig.key === "eventDate"
                        ? "bg-[#5551FF] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Event Date
                    {sortConfig.key === "eventDate" && (
                      <>
                        {sortConfig.direction === "asc" ? (
                          <ArrowUpAZ className="w-3 h-3 ml-1" />
                        ) : (
                          <ArrowDownAZ className="w-3 h-3 ml-1" />
                        )}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleSort("title")}
                    className={`px-3 py-1 rounded-full text-xs flex items-center transition ${
                      sortConfig.key === "title"
                        ? "bg-[#5551FF] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Title
                    {sortConfig.key === "title" && (
                      <>
                        {sortConfig.direction === "asc" ? (
                          <ArrowUpAZ className="w-3 h-3 ml-1" />
                        ) : (
                          <ArrowDownAZ className="w-3 h-3 ml-1" />
                        )}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleSort("progress")}
                    className={`px-3 py-1 rounded-full text-xs flex items-center transition ${
                      sortConfig.key === "progress"
                        ? "bg-[#5551FF] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Progress
                    {sortConfig.key === "progress" && (
                      <>
                        {sortConfig.direction === "asc" ? (
                          <ArrowUpAZ className="w-3 h-3 ml-1" />
                        ) : (
                          <ArrowDownAZ className="w-3 h-3 ml-1" />
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(selectedEventTypes.length > 0 ||
              dateRangeFilter.startDate ||
              dateRangeFilter.endDate) && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <h4 className="text-xs text-gray-500 mb-1">Active Filters:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEventTypes.map((type) => (
                    <div
                      key={type}
                      className="bg-[#5551FF]/10 text-[#5551FF] px-2 py-1 rounded-full text-xs flex items-center"
                    >
                      {eventTypes.find((t) => t.value === type)?.label || type}
                      <button
                        onClick={() => toggleEventTypeFilter(type)}
                        className="ml-1 hover:text-[#4440FF]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {dateRangeFilter.startDate && (
                    <div className="bg-[#5551FF]/10 text-[#5551FF] px-2 py-1 rounded-full text-xs flex items-center">
                      From: {formatDate(dateRangeFilter.startDate)}
                      <button
                        onClick={() =>
                          setDateRangeFilter({
                            ...dateRangeFilter,
                            startDate: "",
                          })
                        }
                        className="ml-1 hover:text-[#4440FF]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {dateRangeFilter.endDate && (
                    <div className="bg-[#5551FF]/10 text-[#5551FF] px-2 py-1 rounded-full text-xs flex items-center">
                      To: {formatDate(dateRangeFilter.endDate)}
                      <button
                        onClick={() =>
                          setDateRangeFilter({
                            ...dateRangeFilter,
                            endDate: "",
                          })
                        }
                        className="ml-1 hover:text-[#4440FF]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center shadow">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Events Display */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5551FF]"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No Events Found</h3>
          <p className="text-gray-500 mb-6">
            {events.length === 0
              ? "You haven't created any events yet."
              : "No events match your current filters."}
          </p>
          {events.length === 0 ? (
            <Link
              to="/events/create"
              className="bg-[#5551FF] text-white px-4 py-2 rounded-lg inline-flex items-center hover:bg-[#4440FF] shadow"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Event
            </Link>
          ) : (
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Calendar className="w-16 h-16 text-white opacity-75" />
                  </div>
                )}
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
                    {event.status.charAt(0).toUpperCase() +
                      event.status.slice(1)}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-white font-semibold">{event.title}</h3>
                  <div className="flex items-center text-white/80 text-xs mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{formatDate(event.eventDate)}</span>
                  </div>
                </div>
              </div>

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
                      style={{
                        width: `${calculateProgress(
                          event.currentAmount,
                          event.targetAmount
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-gray-600">
                      {getDaysLeft(event.endDate)} days left
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-gray-600">
                      {event.contributions?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-gray-600">
                      {calculateProgress(
                        event.currentAmount,
                        event.targetAmount
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between mt-4">
                  <Link
                    to={`/events/${event._id}`}
                    className="flex items-center text-[#5551FF] hover:text-[#4440FF] font-medium"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                  <div className="flex gap-2">
                    <Link
                      to={`/events/edit/${event._id}`}
                      className="p-2 rounded-full hover:bg-gray-100 transition"
                      title="Edit Event"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </Link>
                    <button
                      onClick={() =>
                        setDeleteConfirmation({
                          show: true,
                          eventId: event._id,
                          deleting: false,
                        })
                      }
                      className="p-2 rounded-full hover:bg-gray-100 transition"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleShareEvent(event._id)}
                      className="p-2 rounded-full hover:bg-gray-100 transition"
                      title="Share Event"
                    >
                      <Share2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden">
                        {event.image ? (
                          <img
                            src={event.image}
                            alt=""
                            className="h-10 w-10 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-[#5551FF]/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-[#5551FF]" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {event.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {eventTypes.find((t) => t.value === event.eventType)
                            ?.label || event.eventType}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(event.eventDate)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getDaysLeft(event.endDate)} days left
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">
                          {formatCurrency(event.currentAmount || 0)}/
                          {formatCurrency(event.targetAmount)}
                        </span>
                        <span className="font-medium">
                          {calculateProgress(
                            event.currentAmount,
                            event.targetAmount
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                      <div className="w-36 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-[#5551FF] h-1.5 rounded-full"
                          style={{
                            width: `${calculateProgress(
                              event.currentAmount,
                              event.targetAmount
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                        event.status === "active"
                          ? "bg-green-100 text-green-800"
                          : event.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {event.status.charAt(0).toUpperCase() +
                        event.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <Link
                        to={`/events/${event._id}`}
                        className="text-[#5551FF] hover:text-[#4440FF]"
                        title="View Event"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/events/edit/${event._id}`}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit Event"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleShareEvent(event._id)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Share Event"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirmation({
                            show: true,
                            eventId: event._id,
                            deleting: false,
                          })
                        }
                        className="text-red-500 hover:text-red-700"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Event Stats Summary */}
      {events.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Events Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="text-sm text-gray-500">Total Events</div>
              <div className="text-2xl font-bold">{events.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-sm text-green-700">Active Events</div>
              <div className="text-2xl font-bold text-green-600">
                {events.filter((e) => e.status === "active").length}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-sm text-blue-700">Completed Events</div>
              <div className="text-2xl font-bold text-blue-600">
                {events.filter((e) => e.status === "completed").length}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <div className="text-sm text-red-700">Cancelled Events</div>
              <div className="text-2xl font-bold text-red-600">
                {events.filter((e) => e.status === "cancelled").length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Event
            </h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete this event? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() =>
                  setDeleteConfirmation({
                    show: false,
                    eventId: null,
                    deleting: false,
                  })
                }
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEvent(deleteConfirmation.eventId)}
                disabled={deleteConfirmation.deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center transition"
              >
                {deleteConfirmation.deleting ? (
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
    </div>
  );
};

export default MyEventsPage;
