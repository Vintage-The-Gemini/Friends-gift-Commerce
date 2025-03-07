// src/pages/dashboard/buyer/ManageEvents.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Calendar,
  Gift,
  ChevronRight,
  Filter,
  Search,
  Globe,
  Lock,
  Link as LinkIcon,
  Eye,
  EyeOff,
  MoreHorizontal,
  Edit,
  Trash2,
  Share2,
  Copy,
} from "lucide-react";
import { eventService } from "../../../services/api/event";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-toastify";
import EventCard from "../../../components/events/EventCard";

const ManageEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(null);

  // Fetch events on component mount
  useEffect(() => {
    fetchUserEvents();
  }, []);

  // Filter events when tab changes or search term changes
  useEffect(() => {
    filterEvents();
  }, [activeTab, searchTerm, events]);

  const fetchUserEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getUserEvents();

      if (response.success) {
        setEvents(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch your events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events");
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    // Filter based on active tab
    let filtered = [...events];

    if (activeTab !== "all") {
      filtered = filtered.filter((event) => event.status === activeTab);
    }

    // Filter based on search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term)
      );
    }

    setFilteredEvents(filtered);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const response = await eventService.deleteEvent(eventId);
      if (response.success) {
        toast.success(response.message || "Event deleted successfully");
        // Update the local events list
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event._id !== eventId)
        );
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error(error.message || "Failed to delete event");
    }
  };

  const copyEventLink = (eventId) => {
    const baseUrl = window.location.origin;
    const eventUrl = `${baseUrl}/events/${eventId}`;
    
    navigator.clipboard.writeText(eventUrl)
      .then(() => toast.success("Event link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const copyAccessCode = (accessCode) => {
    if (!accessCode) {
      toast.error("No access code available for this event");
      return;
    }
    
    navigator.clipboard.writeText(accessCode)
      .then(() => toast.success("Access code copied to clipboard!"))
      .catch(() => toast.error("Failed to copy access code"));
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case "public":
        return <Globe className="w-4 h-4 text-green-500" />;
      case "private":
        return <Lock className="w-4 h-4 text-red-500" />;
      case "unlisted":
        return <LinkIcon className="w-4 h-4 text-yellow-500" />;
      default:
        return <Globe className="w-4 h-4 text-gray-500" />;
    }
  };

  const getVisibilityText = (visibility) => {
    switch (visibility) {
      case "public":
        return "Public";
      case "private":
        return "Private";
      case "unlisted":
        return "Unlisted";
      default:
        return "Unknown";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date helper function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate progress percentage
  const calculateProgress = (currentAmount, targetAmount) => {
    if (!targetAmount) return 0;
    return Math.min((currentAmount / targetAmount) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5551FF]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Events</h1>
        <Link
          to="/events/create"
          className="bg-[#5551FF] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[#4440FF]"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search your events..."
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
              onClick={() => setActiveTab("cancelled")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "cancelled"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Gift className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Events Found
          </h3>
          <p className="text-gray-500 mb-6">
            {events.length === 0
              ? "Create your first event to start collecting gifts!"
              : "No events match your current filters."}
          </p>
          {events.length === 0 ? (
            <Link
              to="/events/create"
              className="text-[#5551FF] hover:text-[#4440FF] font-medium"
            >
              Create Your First Event →
            </Link>
          ) : (
            <button
              onClick={() => {
                setActiveTab("all");
                setSearchTerm("");
              }}
              className="text-[#5551FF] hover:text-[#4440FF] font-medium"
            >
              Clear Filters
            </button>
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
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(event.status)}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {getVisibilityIcon(event.visibility)}
                    <span className="ml-1">{getVisibilityText(event.visibility)}</span>
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
                      ${event.currentAmount || 0} / ${event.targetAmount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#5551FF] h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${calculateProgress(
                          event.currentAmount || 0,
                          event.targetAmount
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/events/${event._id}`}
                    className="flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md bg-[#5551FF] text-white hover:bg-[#4440FF]"
                  >
                    <Eye className="w-4 h-4 mr-1.5" />
                    View
                  </Link>
                  
                  <Link
                    to={`/events/edit/${event._id}`}
                    className="flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    <Edit className="w-4 h-4 mr-1.5" />
                    Edit
                  </Link>
                  
                  <button
                    onClick={() => copyEventLink(event._id)}
                    className="flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    <Share2 className="w-4 h-4 mr-1.5" />
                    Share
                  </button>
                  
                  {(event.visibility === "private" || event.visibility === "unlisted") && 
                    event.accessCode && (
                    <button
                      onClick={() => copyAccessCode(event.accessCode)}
                      className="flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      <Copy className="w-4 h-4 mr-1.5" />
                      Code
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  export default ManageEvents;