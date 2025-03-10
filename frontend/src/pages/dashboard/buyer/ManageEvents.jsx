// src/pages/dashboard/buyer/ManageEventsPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  LayoutGrid,
  Calendar,
  Clock,
  Gift,
  Plus,
  List,
  Settings,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import EventManagement from "../../../components/events/EventManagement";
import { eventService } from "../../../services/api/event";
import { toast } from "react-toastify";

const ManageEventsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserEvents();
    }
  }, [user]);

  const fetchUserEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getUserEvents();
      if (response.success) {
        setEvents(response.data);
      } else {
        setError("Failed to load your events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events");
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    navigate("/events/create");
  };

  const handleEditEvent = (eventId) => {
    navigate(`/events/edit/${eventId}`);
  };

  const handleViewEvent = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Please sign in</h2>
          <p className="mb-4">You need to be signed in to manage events.</p>
          <Link
            to="/auth/signin"
            className="bg-[#5551FF] text-white px-4 py-2 rounded-lg inline-block"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Link
              to="/dashboard"
              className="text-gray-500 hover:text-gray-700 flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Manage Your Events</h1>
          <p className="text-gray-600 mt-2">
            Create, edit, and manage all your events in one place.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/events/create"
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
          >
            <div className="w-12 h-12 rounded-full bg-[#5551FF]/10 flex items-center justify-center mr-4">
              <Plus className="w-6 h-6 text-[#5551FF]" />
            </div>
            <div>
              <h3 className="font-medium">Create New Event</h3>
              <p className="text-sm text-gray-500">
                Start a new gift collection
              </p>
            </div>
          </Link>

          <Link
            to="/events"
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <Gift className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium">Browse Events</h3>
              <p className="text-sm text-gray-500">Discover other events</p>
            </div>
          </Link>

          <Link
            to="/dashboard/contributions"
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Manage Contributions</h3>
              <p className="text-sm text-gray-500">Track your contributions</p>
            </div>
          </Link>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold">Your Events</h2>
            <button
              onClick={handleCreateEvent}
              className="bg-[#5551FF] text-white px-6 py-3 rounded-lg flex items-center hover:bg-[#4440FF] shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Event
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5551FF]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
              {error}
              <button onClick={fetchUserEvents} className="ml-4 underline">
                Try Again
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100">
              <Gift className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">No Events Found</h3>
              <p className="text-gray-600 mb-6">
                You haven't created any events yet.
              </p>
              <button
                onClick={handleCreateEvent}
                className="bg-[#5551FF] text-white px-6 py-3 rounded-lg inline-flex items-center hover:bg-[#4440FF]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Event
              </button>
            </div>
          ) : (
            <div>
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
                          <Gift className="w-12 h-12 text-gray-400" />
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
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {event.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {new Date(event.eventDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium">
                            {Math.round(
                              (event.currentAmount / event.targetAmount) * 100
                            ) || 0}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#5551FF] h-2 rounded-full"
                            style={{
                              width: `${
                                Math.min(
                                  (event.currentAmount / event.targetAmount) *
                                    100,
                                  100
                                ) || 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewEvent(event._id)}
                          className="flex-1 bg-[#5551FF] text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-[#4440FF]"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleEditEvent(event._id)}
                          className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
                        >
                          Edit Event
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {events.length > 0 && (
            <div className="mt-6 text-center">
              <Link
                to="/events"
                className="text-[#5551FF] hover:text-[#4440FF] font-medium"
              >
                View All Events
              </Link>
            </div>
          )}
        </div>

        {/* Help section */}
        <div className="mt-8 bg-[#5551FF]/5 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Creating an Event</h3>
              <p className="text-gray-600 mb-2">
                Start by clicking "Create Event" and follow the simple
                step-by-step process. You'll need to provide event details and
                select products for your wishlist.
              </p>
              <Link
                to="/help/creating-events"
                className="text-[#5551FF] hover:underline"
              >
                Learn more about creating events
              </Link>
            </div>
            <div>
              <h3 className="font-medium mb-2">Managing Your Events</h3>
              <p className="text-gray-600 mb-2">
                You can edit, share, or delete your events at any time. Track
                contributions and see who's participating in your special
                occasions.
              </p>
              <Link
                to="/help/managing-events"
                className="text-[#5551FF] hover:underline"
              >
                View event management tips
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageEventsPage;
