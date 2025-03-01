// src/pages/dashboard/seller/SellerEvents.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Calendar,
  Gift,
  ChevronRight,
  Search,
  Eye,
  Edit,
  Users,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { eventService } from "../../../services/api/event";
import { formatCurrency } from "../../../utils/currency";
import { toast } from "react-toastify";
import Button from "../../../components/common/Button";

const SellerEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log("Fetching events with filter:", filter);

      const params = {};
      if (filter !== "all") {
        params.status = filter;
      }

      const response = await eventService.getUserEvents(params);

      if (response.success) {
        console.log("Events fetched successfully:", response.data);
        setEvents(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again later.");
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

  // Calculate days left for an event
  const getDaysLeft = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const eventTypeLabels = {
    birthday: "Birthday",
    wedding: "Wedding",
    graduation: "Graduation",
    babyShower: "Baby Shower",
    houseWarming: "House Warming",
    anniversary: "Anniversary",
  };

  const statusColors = {
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
    draft: "bg-gray-100 text-gray-800",
  };

  const filteredEvents = events.filter((event) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      (event.description &&
        event.description.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Events</h1>
        <Link
          to="/events/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Events</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Gift className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Events Found
          </h3>
          <p className="text-gray-500 mb-6">
            {filter === "all"
              ? "You haven't created any events yet."
              : `No ${filter} events found.`}
          </p>
          <Link
            to="/events/create"
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                <div className="relative md:w-1/3">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover min-h-[160px]"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[160px] bg-gray-100 flex items-center justify-center">
                      <Gift className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[event.status]
                      }`}
                    >
                      {event.status.charAt(0).toUpperCase() +
                        event.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <p className="text-sm text-gray-500">
                      {eventTypeLabels[event.eventType]} •{" "}
                      {formatDate(event.eventDate)}
                    </p>
                  </div>

                  <div className="mt-auto space-y-3">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Raised</span>
                        <span className="font-medium">
                          {formatCurrency(event.currentAmount)} /{" "}
                          {formatCurrency(event.targetAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
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
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                        <span>{getDaysLeft(event.endDate)} days left</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1 text-gray-500" />
                        <span>
                          {event.contributions?.length || 0} contributors
                        </span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                        <span>
                          {calculateProgress(
                            event.currentAmount,
                            event.targetAmount
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between pt-2">
                      <Link
                        to={`/events/${event._id}`}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Link>
                      <Link
                        to={`/events/edit/${event._id}`}
                        className="flex items-center text-gray-600 hover:text-gray-800"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </div>
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

export default SellerEvents;
