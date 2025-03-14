import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, AlertCircle, RefreshCw, Filter } from "lucide-react";
import { eventService } from "../../../services/api/event";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-toastify";
import EventSummary from "../../../components/events/EventSummary";

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUserEvents();
  }, [activeTab]);

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
      const response = await eventService.deleteEvent(eventId);

      if (response.success) {
        toast.success("Event deleted successfully");
        // Remove the deleted event from the state
        setEvents(events.filter((event) => event._id !== eventId));
      } else {
        throw new Error(response.message || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error(error.message || "Failed to delete event");
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

      {/* Tabs and Search/Filter */}
      <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 mb-6">
        {/* Tabs */}
        <div className="flex overflow-x-auto pb-1">
          <button
            className={`px-4 py-2 mr-2 rounded-lg ${
              activeTab === "all"
                ? "bg-[#5551FF] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Events
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
          <button
            className={`px-4 py-2 mr-2 rounded-lg ${
              activeTab === "cancelled"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("cancelled")}
          >
            Cancelled
          </button>
        </div>

        {/* Search and Refresh */}
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF] w-full md:w-auto"
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
            className="text-[#5551FF] hover:text-[#4440FF] font-medium inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventSummary
              key={event._id}
              event={event}
              onDelete={handleDeleteEvent}
            />
          ))}
        </div>
      )}

      {/* Quick Stats Summary (Optional) */}
      {events.length > 0 && (
        <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium mb-2">Events Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Total Events</div>
              <div className="text-2xl font-bold">{events.length}</div>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Active Events</div>
              <div className="text-2xl font-bold text-green-600">
                {events.filter((e) => e.status === "active").length}
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Completed Events</div>
              <div className="text-2xl font-bold text-blue-600">
                {events.filter((e) => e.status === "completed").length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
