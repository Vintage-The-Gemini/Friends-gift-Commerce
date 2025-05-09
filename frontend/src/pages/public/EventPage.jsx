import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Gift,
  Calendar,
  Heart,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import { eventService } from "../../services/api/event";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventService.getEvents();
      if (response.success) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events");
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

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

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || event.eventType === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5551FF]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Latest Events</h1>
        {user && (
          <Link
            to="/events/create"
            className="bg-[#5551FF] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[#4440FF]"
          >
            <Gift className="w-5 h-5 mr-2" />
            Create Event
          </Link>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
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
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
        >
          <option value="all">All Events</option>
          <option value="birthday">Birthdays</option>
          <option value="wedding">Weddings</option>
          <option value="graduation">Graduations</option>
          <option value="babyShower">Baby Showers</option>
          <option value="houseWarming">House Warming</option>
          <option value="anniversary">Anniversaries</option>
        </select>
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
            {user
              ? "Create your first event to start collecting gifts!"
              : "Sign in to create your own event!"}
          </p>
          {user ? (
            <Link
              to="/events/create"
              className="text-[#5551FF] hover:text-[#4440FF] font-medium"
            >
              Create Your First Event →
            </Link>
          ) : (
            <Link
              to="/auth/signin"
              className="text-[#5551FF] hover:text-[#4440FF] font-medium"
            >
              Sign In to Get Started →
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
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <Gift className="w-12 h-12 text-gray-400" />
                  </div>
                )}
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
                      ${event.currentAmount} / ${event.targetAmount}
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
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p
                      className={`font-medium ${
                        event.status === "active"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {event.status.charAt(0).toUpperCase() +
                        event.status.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Contributors</p>
                    <p className="font-medium">
                      {event.contributions?.length || 0}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/events/${event._id}`}
                  className="flex items-center justify-between w-full text-[#5551FF] hover:text-[#4440FF] font-medium"
                >
                  View Details
                  <ChevronRight className="w-5 h-5" />
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
