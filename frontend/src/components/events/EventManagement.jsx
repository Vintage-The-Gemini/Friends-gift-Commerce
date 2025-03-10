// src/components/events/EventManagement.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { eventService } from "../../services/api/event";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import EventSummary from "./EventSummary";

const EventManagement = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch events on component mount and when activeTab changes
  useEffect(() => {
    fetchUserEvents();
  }, [activeTab]);

  // Filter events when search term changes
  useEffect(() => {
    filterEvents();
  }, [searchTerm, events]);

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

  const filterEvents = () => {
    if (!searchTerm.trim()) {
      setFilteredEvents(events);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = events.filter(
      (event) =>
        event.title.toLowerCase().includes(term) ||
        (event.description && event.description.toLowerCase().includes(term))
    );

    setFilteredEvents(filtered);
  };

  const handleEventDelete = (eventId) => {
    // Remove the deleted event from the state
    setEvents((prevEvents) =>
      prevEvents.filter((event) => event._id !== eventId)
    );
    setFilteredEvents((prevEvents) =>
      prevEvents.filter((event) => event._id !== eventId)
    );
  };

  return (
    <div className="space-y-6">
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

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "all"
                ? "bg-[#5551FF] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "active"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "completed"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Completed
          </button>

          <button
            onClick={refreshEvents}
            disabled={refreshing}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Loading state */}
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
              className="text-[#5551FF] hover:text-[#4440FF] font-medium inline-flex items-center"
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventSummary
              key={event._id}
              event={event}
              onDelete={handleEventDelete}
              refreshEvents={refreshEvents}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventManagement;
