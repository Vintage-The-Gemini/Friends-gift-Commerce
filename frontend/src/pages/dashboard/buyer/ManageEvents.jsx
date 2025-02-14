import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, CalendarDays, Users, DollarSign } from "lucide-react";
import { eventService } from "../../../services/api/event";
import { toast } from "react-toastify";

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (currentAmount, targetAmount) => {
    return (currentAmount / targetAmount) * 100;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
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
          className="flex items-center gap-2 bg-[#5551FF] text-white px-4 py-2 rounded-lg hover:bg-[#4440FF]"
        >
          <PlusCircle className="w-5 h-5" />
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <CalendarDays className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Events Yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first event to start collecting gifts!
          </p>
          <Link
            to="/events/create"
            className="inline-flex items-center text-[#5551FF] hover:text-[#4440FF]"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              {event.image ? (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <CalendarDays className="w-12 h-12 text-gray-400" />
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <div className="flex items-center gap-2 text-gray-500 mb-4">
                  <CalendarDays className="w-4 h-4" />
                  <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                </div>

                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>
                        {calculateProgress(
                          event.currentAmount,
                          event.targetAmount
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#5551FF] h-2 rounded-full"
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
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <p className="text-gray-500 text-sm">Target Amount</p>
                      <p className="font-semibold">
                        KES {event.targetAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Contributions</p>
                      <p className="font-semibold">
                        {event.contributions?.length || 0}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/events/${event._id}`}
                    className="block w-full text-center bg-[#5551FF] text-white py-2 rounded-lg hover:bg-[#4440FF] mt-4"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
