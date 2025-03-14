// frontend/src/pages/public/EventsPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Gift,
  Calendar,
  ChevronRight,
  Search,
  Filter,
  Globe,
  AlertCircle,
  Clock,
  DollarSign,
  Users,
  RefreshCw,
  ArrowDownAZ,
  ArrowUpAZ,
  Check,
  X,
} from "lucide-react";
import { eventService } from "../../services/api/event";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/currency";

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEventTypes, setSelectedEventTypes] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

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
    fetchPublicEvents();
  }, []);

  const fetchPublicEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Make sure we're only getting public events
      const response = await eventService.getEvents({
        visibility: "public",
        status: "active", // Only show active events
      });

      if (response.success) {
        setEvents(response.data);
      } else {
        throw new Error(response.message || "Failed to load events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events");
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const refreshEvents = async () => {
    try {
      setRefreshing(true);
      await fetchPublicEvents();
      toast.success("Events refreshed");
    } catch (error) {
      // Error is already handled in fetchPublicEvents
    } finally {
      setRefreshing(false);
    }
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
    setSelectedEventTypes([]);
    setSortConfig({ key: "createdAt", direction: "desc" });
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

    return matchesSearch && matchesEventType;
  });

  const calculateProgress = (currentAmount, targetAmount) => {
    if (!targetAmount) return 0;
    return Math.min((currentAmount / targetAmount) * 100, 100);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysLeft = (endDate) => {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5551FF]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Public Events</h1>
          <p className="text-gray-600 mt-1">
            Browse and discover events you can contribute to
          </p>
        </div>
        {user && (
          <Link
            to="/events/create"
            className="bg-[#5551FF] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[#4440FF] shadow"
          >
            <Gift className="w-5 h-5 mr-2" />
            Create Event
          </Link>
        )}
      </div>

      {/* Public events info banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start shadow-sm">
        <Globe className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-blue-700">Browsing Public Events</h3>
          <p className="text-blue-600 text-sm">
            You are viewing events that have been made public by their creators.
            {user ? (
              <>
                {" "}
                To see your own events, visit{" "}
                <Link to="/events/my-events" className="underline font-medium">
                  My Events
                </Link>
                .
              </>
            ) : (
              <> Sign in to create and manage your own events.</>
            )}
          </p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search public events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Filter and Refresh Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg ${
                  showFilters || selectedEventTypes.length > 0
                    ? "bg-[#5551FF] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } transition`}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
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
                    Newest
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
                    Name
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
            {selectedEventTypes.length > 0 && (
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
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center shadow-sm">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Events Display */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Gift className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Public Events Found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedEventTypes.length > 0
              ? "No events match your current filters."
              : "There are no public events available at the moment."}
          </p>
          {user ? (
            <Link
              to="/events/create"
              className="bg-[#5551FF] text-white px-4 py-2 rounded-lg inline-flex items-center hover:bg-[#4440FF] shadow"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your Own Event
            </Link>
          ) : (
            <Link
              to="/auth/signin"
              className="bg-[#5551FF] text-white px-4 py-2 rounded-lg inline-flex items-center hover:bg-[#4440FF] shadow"
            >
              Sign In to Create Events
            </Link>
          )}
        </div>
      ) : (
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
                    <Gift className="w-16 h-16 text-white opacity-75" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <Globe className="w-3 h-3 mr-1" />
                    Public
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
                {/* Event Type */}
                <div className="mb-2">
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                    {eventTypes.find((t) => t.value === event.eventType)
                      ?.label || event.eventType}
                  </span>
                </div>

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

                {/* Action Button */}
                <Link
                  to={`/events/${event._id}`}
                  className="flex items-center justify-center w-full px-4 py-2 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF] shadow-sm transition-colors"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  <span>View Event</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
