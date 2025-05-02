// src/components/events/EventCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Clock,
  Gift,
  ChevronRight,
  Heart,
} from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const EventCard = ({ event, compact = false }) => {
  if (!event) return null;

  // Calculate progress percentage
  const progressPercentage =
    event.targetAmount > 0
      ? Math.min(
          Math.round((event.currentAmount / event.targetAmount) * 100),
          100
        )
      : 0;

  // Calculate days left
  const daysLeft = event.endDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(event.endDate) - new Date()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Status badge styling
  const getStatusStyles = () => {
    switch (event.status) {
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

  // Compact version for small displays
  if (compact) {
    return (
      <Link to={`/events/${event._id}`} className="block">
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-4 flex gap-4">
          <div className="w-16 h-16 rounded-lg bg-indigo-100 flex-shrink-0 flex items-center justify-center">
            <Gift className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {event.title}
            </h3>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formatDate(event.eventDate)}</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
              <div
                className="bg-indigo-600 h-1.5 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Full event card
  return (
    <div className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Card Header / Image */}
      <div className="relative">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
            <Gift className="w-16 h-16 text-white opacity-75" />
          </div>
        )}

        {/* Event Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/80 backdrop-blur-sm text-indigo-800">
            {event.eventType &&
              event.eventType.charAt(0).toUpperCase() +
                event.eventType.slice(1)}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}
          >
            {event.status &&
              event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-semibold text-lg truncate">
            {event.title}
          </h3>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Event Meta */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1 text-indigo-600" />
            <span>{formatDate(event.eventDate)}</span>
          </div>

          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1 text-indigo-600" />
            <span>
              {daysLeft} {daysLeft === 1 ? "day" : "days"} left
            </span>
          </div>

          {event.contributions && (
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1 text-indigo-600" />
              <span>{event.contributions.length} contributors</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Progress</span>
            <span className="text-indigo-700 font-semibold">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-gray-600">
            <span>Raised: {formatCurrency(event.currentAmount || 0)}</span>
            <span>Goal: {formatCurrency(event.targetAmount)}</span>
          </div>
        </div>

        {/* Description - Fixed height with ellipsis */}
        <div className="flex-grow mb-4">
          {event.description && (
            <p className="text-gray-600 text-sm line-clamp-2 overflow-hidden">
              {event.description}
            </p>
          )}
        </div>

        {/* Action Button - Now at the bottom of the flex column */}
        <Link
          to={`/events/${event._id}`}
          className="inline-flex items-center justify-center w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mt-auto"
        >
          <Gift className="w-4 h-4 mr-2" />
          <span>View Event</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default EventCard;