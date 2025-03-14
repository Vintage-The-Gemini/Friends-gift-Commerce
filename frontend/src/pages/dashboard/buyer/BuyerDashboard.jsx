// frontend/src/pages/dashboard/buyer/BuyerDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, Edit, Trash2, AlertCircle } from "lucide-react";
import { eventService } from "../../../services/api/event";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-toastify";
import EventCard from "../../../components/events/EventCard";

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchUserEvents();
  }, [activeTab]); // Added activeTab as dependency

  const fetchUserEvents = async () => {
    try {
      setLoading(true);
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
      setError("Failed to load your events");
      toast.error("Failed to load your events");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

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

  return (
    <div className="container mx-auto px-4 py-8">
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

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-6">
          <button
            className={`pb-4 px-2 ${
              activeTab === "all"
                ? "border-b-2 border-[#5551FF] text-[#5551FF]"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Events
          </button>
          <button
            className={`pb-4 px-2 ${
              activeTab === "active"
                ? "border-b-2 border-[#5551FF] text-[#5551FF]"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("active")}
          >
            Active
          </button>
          <button
            className={`pb-4 px-2 ${
              activeTab === "completed"
                ? "border-b-2 border-[#5551FF] text-[#5551FF]"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </button>
          <button
            className={`pb-4 px-2 ${
              activeTab === "cancelled"
                ? "border-b-2 border-[#5551FF] text-[#5551FF]"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("cancelled")}
          >
            Cancelled
          </button>
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5551FF]"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No Events Found</h3>
          <p className="text-gray-500 mb-6">
            {activeTab === "all"
              ? "You haven't created any events yet."
              : `You don't have any ${activeTab} events.`}
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
          {events.map((event) => (
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
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-white font-semibold">{event.title}</h3>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
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
                  <span className="text-sm text-gray-500">
                    {new Date(event.eventDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span>
                      {Math.min(
                        (event.currentAmount / event.targetAmount) * 100,
                        100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#5551FF] h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (event.currentAmount / event.targetAmount) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <Link
                    to={`/events/${event._id}`}
                    className="text-[#5551FF] hover:text-[#4440FF]"
                  >
                    View Details
                  </Link>
                  <div className="flex gap-2">
                    <Link
                      to={`/events/edit/${event._id}`}
                      className="p-2 rounded-full hover:bg-gray-100"
                      title="Edit Event"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </Link>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="p-2 rounded-full hover:bg-gray-100"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
