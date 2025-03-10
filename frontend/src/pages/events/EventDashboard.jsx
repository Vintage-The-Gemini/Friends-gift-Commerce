// src/pages/events/EventDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  Calendar,
  DollarSign,
  Users,
  Gift,
  ChevronRight,
  Clock,
  Zap,
  PieChart,
  TrendingUp,
  Plus,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { eventService } from "../../services/api/event";
import { contributionService } from "../../services/api/contribution";
import { formatCurrency } from "../../utils/currency";
import { toast } from "react-toastify";
import EnhancedEventManagement from "../../components/events/EnhancedEventManagement";

const EventDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    activeEvents: 0,
    totalContributions: 0,
    totalAmount: 0,
    upcomingEvents: [],
    recentContributions: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user events summary
      const eventsResponse = await eventService.getUserEvents();

      // Process events data
      let activeCount = 0;
      let totalAmount = 0;
      let upcomingEvents = [];

      if (eventsResponse.success) {
        const events = eventsResponse.data;

        // Count active events and calculate total amounts
        activeCount = events.filter(
          (event) => event.status === "active"
        ).length;
        totalAmount = events.reduce(
          (sum, event) => sum + (event.currentAmount || 0),
          0
        );

        // Get upcoming events (active events sorted by end date)
        upcomingEvents = events
          .filter((event) => event.status === "active")
          .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
          .slice(0, 3);
      }

      // Fetch recent contributions
      let recentContributions = [];
      let totalContributions = 0;

      try {
        const contributionsResponse =
          await contributionService.getUserContributions();
        if (contributionsResponse.success) {
          recentContributions = contributionsResponse.data.slice(0, 5);
          totalContributions = contributionsResponse.data.length;
        }
      } catch (contribError) {
        console.error("Error fetching contributions:", contribError);
        // Continue with dashboard - don't block on contribution error
      }

      // Update dashboard data
      setDashboardData({
        activeEvents: activeCount,
        totalContributions: totalContributions,
        totalAmount: totalAmount,
        upcomingEvents: upcomingEvents,
        recentContributions: recentContributions,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    try {
      setRefreshing(true);
      await fetchDashboardData();
      toast.success("Dashboard refreshed");
    } catch (error) {
      // Error already handled in fetchDashboardData
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate days left until end date
  const getDaysLeft = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateProgress = (event) => {
    if (!event.targetAmount) return 0;
    return Math.min((event.currentAmount / event.targetAmount) * 100, 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5551FF]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Event Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your events and track contributions
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={refreshDashboard}
              disabled={refreshing}
              className="flex items-center px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <Link
              to="/events/create"
              className="flex items-center px-4 py-2 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF]"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Active Events */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Active Events
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {dashboardData.activeEvents}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/events"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                View Events <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Total Contributions */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Total Contributions
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {dashboardData.totalContributions}
                </h3>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Users className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/dashboard/contributions"
                className="text-green-600 hover:text-green-800 text-sm flex items-center"
              >
                View Contributions <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Total Amount Raised
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {formatCurrency(dashboardData.totalAmount)}
                </h3>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/dashboard/statistics"
                className="text-purple-600 hover:text-purple-800 text-sm flex items-center"
              >
                View Statistics <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left: Upcoming Events */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold">Upcoming Events</h2>
              </div>

              {dashboardData.upcomingEvents.length === 0 ? (
                <div className="p-6 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No upcoming events</p>
                  <Link
                    to="/events/create"
                    className="mt-3 inline-flex items-center text-[#5551FF] hover:text-[#4440FF]"
                  >
                    Create an event <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {dashboardData.upcomingEvents.map((event) => (
                    <div key={event._id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start">
                            <div className="mr-4 flex-shrink-0">
                              {event.image ? (
                                <img
                                  src={event.image}
                                  alt={event.title}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
                                  <Gift className="w-8 h-8 text-indigo-600" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {event.title}
                              </h3>
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>{formatDate(event.eventDate)}</span>
                              </div>
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>
                                  {getDaysLeft(event.endDate)} days left
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>
                                {formatCurrency(event.currentAmount || 0)}{" "}
                                raised
                              </span>
                              <span>
                                {calculateProgress(event).toFixed(0)}% of{" "}
                                {formatCurrency(event.targetAmount)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-[#5551FF] h-1.5 rounded-full"
                                style={{
                                  width: `${calculateProgress(event)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <Link
                          to={`/events/${event._id}`}
                          className="ml-4 text-[#5551FF] hover:text-[#4440FF]"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {dashboardData.upcomingEvents.length > 0 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                  <Link
                    to="/events"
                    className="text-[#5551FF] hover:text-[#4440FF] text-sm"
                  >
                    View all events
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right: Recent Contributions */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold">Recent Contributions</h2>
              </div>

              {dashboardData.recentContributions.length === 0 ? (
                <div className="p-6 text-center">
                  <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No recent contributions</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {dashboardData.recentContributions.map((contribution) => (
                    <div
                      key={contribution._id}
                      className="p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(contribution.amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {contribution.event?.title || "Unknown Event"}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(contribution.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {dashboardData.recentContributions.length > 0 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                  <Link
                    to="/dashboard/contributions"
                    className="text-[#5551FF] hover:text-[#4440FF] text-sm"
                  >
                    View all contributions
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Management Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6">Manage Your Events</h2>
          <EnhancedEventManagement />
        </div>
      </div>
    </div>
  );
};

export default EventDashboard;
