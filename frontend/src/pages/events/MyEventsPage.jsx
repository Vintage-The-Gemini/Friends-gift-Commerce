import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Calendar,
  Search,
  RefreshCw,
  AlertCircle,
  Eye,
  Edit,
} from "lucide-react";
import { eventService } from "../../services/api/event";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/currency";

const MyEventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

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
      toast.success("Events refreshed");
    } catch (error) {
      // Error is already handled in fetchUserEvents
    } finally {
      setRefreshing(false);
    }
  };

  // Filter events based on search term
  const filteredEvents = events.filter((event) => {
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(term) ||
      (event.description && event.description.toLowerCase().includes(term))
    );
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
        <h1 className="text-2xl font-bold">My Events</h1>
        <Link
          to="/events/create"
          className="bg-[#5551FF] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[#4440FF]"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </Link>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        {/* Tabs */}
        <div className="flex-1 flex overflow-x-auto pb-1">
          <button
            className={`px-4 py-2 mr-2 rounded-lg ${
              activeTab === "all"
                ? "bg-[#5551FF] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
          <button
            className={`px-4 py-2 mr-2 rounded-lg ${
              activeTab === "active"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("active")}
          >
            Active
          </button>
          <button
            className={`px-4 py-2 mr-2 rounded-lg ${
              activeTab === "completed"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </button>
        </div>

        {/* Search and Refresh */}
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search my events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF] w-full md:w-auto"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <button
            onClick={refreshEvents}
            disabled={refreshing}
            className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            title="Refresh events"
          >
            <RefreshCw
              className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
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
              : "No events match your search criteria."}
          </p>
          <Link
            to="/events/create"
            className="bg-[#5551FF] text-white px-4 py-2 rounded-lg inline-flex items-center hover:bg-[#4440FF]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Event
          </Link>
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
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-gray-400" />
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
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(event.eventDate)}</span>
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

                {/* Actions */}
                <div className="flex justify-between mt-4">
                  <Link
                    to={`/events/${event._id}`}
                    className="flex items-center text-[#5551FF] hover:text-[#4440FF]"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                  <Link
                    to={`/events/edit/${event._id}`}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEventsPage;
