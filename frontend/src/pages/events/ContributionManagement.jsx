// src/components/events/ContributionManagement.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Calendar,
  Search,
  RefreshCw,
  Filter,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ThumbsUp,
  Gift,
  User,
  FileText,
  Eye,
} from "lucide-react";
import { contributionService } from "../../services/api/contribution";
import { eventService } from "../../services/api/event";
import { formatCurrency } from "../../utils/currency";
import { toast } from "react-toastify";

const ContributionManagement = () => {
  const [contributions, setContributions] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEvent, setFilterEvent] = useState("all");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user contributions
      const contributionsResponse =
        await contributionService.getUserContributions();

      // Fetch user events (for filtering)
      const eventsResponse = await eventService.getUserEvents();

      if (contributionsResponse.success && eventsResponse.success) {
        setContributions(contributionsResponse.data);
        setEvents(eventsResponse.data);
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching contributions data:", error);
      setError("Failed to load contribution data. Please try again.");
      toast.error("Failed to load contribution data");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await fetchData();
      toast.success("Data refreshed successfully");
    } catch (error) {
      // Error already handled in fetchData
    } finally {
      setRefreshing(false);
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;

    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  const handleViewReceipt = (contribution) => {
    setSelectedContribution(contribution);
    setShowReceiptModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter and sort contributions
  const filteredContributions = contributions
    .filter((contribution) => {
      // Apply event filter
      if (filterEvent !== "all" && contribution.event?._id !== filterEvent) {
        return false;
      }

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          contribution.event?.title?.toLowerCase().includes(term) ||
          contribution.paymentMethod?.toLowerCase().includes(term) ||
          (contribution.transactionId &&
            contribution.transactionId.toLowerCase().includes(term))
        );
      }

      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      let comparison = 0;

      switch (sortField) {
        case "date":
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "event":
          comparison = (a.event?.title || "").localeCompare(
            b.event?.title || ""
          );
          break;
        case "status":
          comparison = (a.paymentStatus || "").localeCompare(
            b.paymentStatus || ""
          );
          break;
        default:
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

  const PaymentStatusBadge = ({ status }) => {
    const styles = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title and Refresh */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Contributions</h2>
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Input (5 columns) */}
          <div className="md:col-span-5 relative">
            <input
              type="text"
              placeholder="Search by event or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Event Filter (5 columns) */}
          <div className="md:col-span-5">
            <select
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
            >
              <option value="all">All Events</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter (2 columns) */}
          <div className="md:col-span-2">
            <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]">
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Contributions Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5551FF]"></div>
        </div>
      ) : filteredContributions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Contributions Found
          </h3>
          <p className="text-gray-500 mb-6">
            {contributions.length === 0
              ? "You haven't made any contributions yet."
              : "No contributions match your search."}
          </p>
          <Link
            to="/events"
            className="text-[#5551FF] hover:text-[#4440FF] font-medium"
          >
            Find events to contribute
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort("date")}
                  >
                    <div className="flex items-center">
                      <span>Date</span>
                      {getSortIcon("date")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort("event")}
                  >
                    <div className="flex items-center">
                      <span>Event</span>
                      {getSortIcon("event")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort("amount")}
                  >
                    <div className="flex items-center">
                      <span>Amount</span>
                      {getSortIcon("amount")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span>Payment Method</span>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort("status")}
                  >
                    <div className="flex items-center">
                      <span>Status</span>
                      {getSortIcon("status")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContributions.map((contribution) => (
                  <tr key={contribution._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(contribution.createdAt)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(contribution.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contribution.event ? (
                        <Link
                          to={`/events/${contribution.event._id}`}
                          className="text-sm font-medium text-[#5551FF] hover:text-[#4440FF]"
                        >
                          {contribution.event.title}
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Unknown Event
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(contribution.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {contribution.paymentMethod || "N/A"}
                      </div>
                      {contribution.transactionId && (
                        <div className="text-xs text-gray-500">
                          {contribution.transactionId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PaymentStatusBadge
                        status={contribution.paymentStatus || "pending"}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewReceipt(contribution)}
                        className="text-[#5551FF] hover:text-[#4440FF] mr-3"
                        title="View Receipt"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <Link
                        to={
                          contribution.event
                            ? `/events/${contribution.event._id}`
                            : "#"
                        }
                        className={
                          contribution.event
                            ? "text-gray-600 hover:text-gray-900"
                            : "text-gray-400 cursor-not-allowed"
                        }
                        title="View Event"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedContribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Contribution Receipt
              </h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="border-t border-b border-gray-200 py-4 my-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {formatDate(selectedContribution.createdAt)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">
                  {formatTime(selectedContribution.createdAt)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Event:</span>
                <span className="font-medium">
                  {selectedContribution.event?.title || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">
                  {formatCurrency(selectedContribution.amount)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium capitalize">
                  {selectedContribution.paymentMethod || "N/A"}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Status:</span>
                <PaymentStatusBadge
                  status={selectedContribution.paymentStatus || "pending"}
                />
              </div>
              {selectedContribution.transactionId && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium">
                    {selectedContribution.transactionId}
                  </span>
                </div>
              )}
              {selectedContribution.message && (
                <div className="mt-4">
                  <span className="text-gray-600">Message:</span>
                  <p className="mt-1 text-gray-800 italic">
                    {selectedContribution.message}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="bg-[#5551FF] text-white px-6 py-2 rounded-lg hover:bg-[#4440FF]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributionManagement;
