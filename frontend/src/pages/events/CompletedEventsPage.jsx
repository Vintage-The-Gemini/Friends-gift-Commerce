import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { 
  ShoppingBag, 
  CheckCircle, 
  Calendar, 
  Clock, 
  Box, 
  ChevronRight,
  Truck,
  RefreshCw
} from "lucide-react";
import { eventService } from "../../services/api/event";
import { formatCurrency } from "../../utils/currency";
import { toast } from "react-toastify";

const CompletedEventsPage = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [completedEvents, setCompletedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user came from a successful checkout
  const checkoutSuccess = location.state?.checkoutSuccess || false;

  useEffect(() => {
    if (checkoutSuccess) {
      toast.success("Event checkout completed successfully!");
    }
    
    fetchCompletedEvents();
  }, []);

  const fetchCompletedEvents = async () => {
    try {
      setLoading(true);
      
      // Get only completed events
      const response = await eventService.getUserEvents({ status: "completed" });
      
      if (response.success) {
        setCompletedEvents(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch completed events");
      }
    } catch (error) {
      console.error("Error fetching completed events:", error);
      setError(error.message || "Failed to load completed events");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5551FF]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Completed Events</h1>
          <button
            onClick={fetchCompletedEvents}
            className="flex items-center text-gray-700 px-3 py-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Success message after checkout */}
        {checkoutSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h2 className="font-medium text-green-800">Checkout Completed</h2>
              <p className="text-green-700">
                Your event checkout has been successfully processed. You can view the order details below.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {completedEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-16 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              No Completed Events
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have any completed events yet. Events will appear here after checkout.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center px-4 py-2 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF]"
            >
              View Your Events
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {completedEvents.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Completed
                  </span>
                </div>

                <div className="p-4">
                  <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Event Date:</span>
                      <div className="font-medium">{formatDate(event.eventDate)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Completion Date:</span>
                      <div className="font-medium">{formatDate(event.updatedAt)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Amount Raised:</span>
                      <div className="font-medium">{formatCurrency(event.currentAmount || 0)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Products:</span>
                      <div className="font-medium">{event.products?.length || 0} items</div>
                    </div>
                  </div>

                  {/* Order information if available */}
                  {event.orders && event.orders.length > 0 ? (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="font-medium mb-2 flex items-center">
                        <ShoppingBag className="w-4 h-4 mr-2 text-indigo-600" />
                        Orders Created
                      </h4>
                      
                      <div className="space-y-2">
                        {event.orders.map((orderId, index) => (
                          <Link 
                            key={index}
                            to={`/orders/${orderId}`}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                          >
                            <div className="flex items-center">
                              <Truck className="w-4 h-4 mr-2 text-gray-500" />
                              <span>Order #{orderId.substring(orderId.length - 6)}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-gray-100 text-gray-500 text-sm">
                      No orders information available
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <Link
                      to={`/events/${event._id}`}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedEventsPage;