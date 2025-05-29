// frontend/src/pages/public/EventsPage.jsx - OPTIMIZED VERSION
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Plus,
} from "lucide-react";
import { eventService } from "../../services/api/event";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/currency";

// Debounce utility for search
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Memoized Event Card Component
const EventCard = React.memo(({ event, index }) => {
  const formatDate = useCallback((date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const calculateProgress = useCallback((currentAmount, targetAmount) => {
    if (!targetAmount) return 0;
    return Math.min((currentAmount / targetAmount) * 100, 100);
  }, []);

  const getDaysLeft = useCallback((endDate) => {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-48 object-cover"
            loading={index < 6 ? "eager" : "lazy"} // Prioritize first 6 images
            decoding="async"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-full h-48 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center"
          style={{ display: event.image ? 'none' : 'flex' }}
        >
          <Gift className="w-16 h-16 text-white opacity-75" />
        </div>
        
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
            {event.eventType}
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
              className="bg-[#5551FF] h-2 rounded-full transition-all duration-300"
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
  );
}, (prevProps, nextProps) => {
  // Only re-render if event data actually changed
  return (
    prevProps.event._id === nextProps.event._id &&
    prevProps.event.currentAmount === nextProps.event.currentAmount &&
    prevProps.event.status === nextProps.event.status
  );
});

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
  const [page, setPage] = useState(1);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const eventTypes = useMemo(() => [
    { value: "birthday", label: "Birthday" },
    { value: "wedding", label: "Wedding" },
    { value: "graduation", label: "Graduation" },
    { value: "babyShower", label: "Baby Shower" },
    { value: "houseWarming", label: "House Warming" },
    { value: "anniversary", label: "Anniversary" },
    { value: "other", label: "Other" },
  ], []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setPage(1);
      setEvents([]); // Clear events for fresh search
      fetchPublicEvents(true, value);
    }, 300),
    []
  );

  const fetchPublicEvents = useCallback(async (reset = false, searchValue = searchTerm) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const currentPage = reset ? 1 : page;
      
      const filters = {
        visibility: "public",
        status: "active",
      };

      if (searchValue) {
        filters.search = searchValue;
      }

      if (selectedEventTypes.length > 0) {
        filters.eventType = selectedEventTypes[0]; // API limitation
      }

      const response = await eventService.getEvents({
        ...filters,
        page: currentPage,
        limit: 12,
        sortBy: `${sortConfig.direction === "desc" ? "-" : ""}${sortConfig.key}`,
      });

      if (response.success) {
        if (reset) {
          setEvents(response.data);
        } else {
          setEvents(prev => [...prev, ...response.data]);
        }
        
        setHasMoreEvents(
          response.pagination && 
          currentPage < response.pagination.totalPages
        );
        
        if (!reset) {
          setPage(currentPage + 1);
        }
      } else {
        throw new Error(response.message || "Failed to load events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events");
      if (reset) {
        toast.error("Failed to load events");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [searchTerm, selectedEventTypes, sortConfig, page]);

  useEffect(() => {
    fetchPublicEvents(true);
  }, [selectedEventTypes, sortConfig]);

  const refreshEvents = useCallback(async () => {
    setRefreshing(true);
    await fetchPublicEvents(true);
    toast.success("Events refreshed");
  }, [fetchPublicEvents]);

  const toggleEventTypeFilter = useCallback((eventType) => {
    setSelectedEventTypes(prev => {
      const newTypes = prev.includes(eventType)
        ? prev.filter(type => type !== eventType)
        : [...prev, eventType];
      return newTypes;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedEventTypes([]);
    setSortConfig({ key: "createdAt", direction: "desc" });
    setPage(1);
  }, []);

  const handleSort = useCallback((key) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  }, []);

  // Memoized filtered events (client-side filtering for better UX)
  const displayedEvents = useMemo(() => {
    return events;
  }, [events]);

  // Intersection Observer for infinite scroll
  const loadMoreRef = useCallback(node => {
    if (loadingMore) return;
    if (!hasMoreEvents) return;
    
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        fetchPublicEvents(false);
      }
    });
    
    if (node) observer.observe(node);
    
    return () => {
      if (node) observer.unobserve(node);
    };
  }, [loadingMore, hasMoreEvents, fetchPublicEvents]);

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5551FF]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
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

      {/* Info banner */}
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
                onChange={(e) => debouncedSearch(e.target.value)}
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
      {displayedEvents.length === 0 && !loading ? (
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedEvents.map((event, index) => (
              <EventCard key={event._id} event={event} index={index} />
            ))}
          </div>

          {/* Load More Trigger */}
          {hasMoreEvents && (
            <div 
              ref={loadMoreRef}
              className="flex justify-center mt-8 py-4"
            >
              {loadingMore && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5551FF]"></div>
              )}
            </div>
          )}

          {/* End of results message */}
          {!hasMoreEvents && displayedEvents.length > 0 && (
            <div className="text-center mt-8 py-4 text-gray-500">
              <p>You've reached the end of the events list</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventsPage;