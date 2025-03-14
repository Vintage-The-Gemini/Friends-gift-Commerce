import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  DollarSign,
  Clock,
  Users,
  Edit,
  Trash2,
  Share2,
  Gift,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { toast } from "react-toastify";

const EventSummary = ({
  event,
  onDelete,
  showActions = true,
  compact = false,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!event) return null;

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!event.targetAmount) return 0;
    return Math.min((event.currentAmount / event.targetAmount) * 100, 100);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate days left
  const getDaysLeft = () => {
    if (!event.endDate) return 0;
    const today = new Date();
    const endDate = new Date(event.endDate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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

  // Handle event deletion
  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      setIsDeleting(true);
      if (onDelete) {
        await onDelete(event._id);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(false);
    }
  };

  // Handle share event
  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/events/${event._id}`;

      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Event link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  // Compact version for limited space displays
  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex-shrink-0 flex items-center justify-center mr-4">
              <Gift className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{event.title}</h3>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{formatDate(event.eventDate)}</span>
              </div>
            </div>
          </div>
          <Link
            to={`/events/${event._id}`}
            className="text-[#5551FF] hover:text-[#4440FF]"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="px-4 pb-4">
          <div className="w-full bg-gray-200 h-1.5 rounded-full">
            <div
              className="bg-[#5551FF] h-1.5 rounded-full"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Full card view
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Card Image/Header */}
      <div className="relative">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
            <Gift className="w-16 h-16 text-white opacity-75" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}
          >
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white font-semibold">{event.title}</h3>
        </div>
      </div>

      {/* Card Content */}
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
              {formatCurrency(event.currentAmount || 0)} /{" "}
              {formatCurrency(event.targetAmount)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#5551FF] h-2 rounded-full transition-all duration-500"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-sm mb-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1 text-gray-500" />
            <span>{getDaysLeft()} days left</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1 text-gray-500" />
            <span>{event.contributions?.length || 0} contributors</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
            <span>{calculateProgress().toFixed(0)}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex justify-between mt-4">
            <Link
              to={`/events/${event._id}`}
              className="text-[#5551FF] hover:text-[#4440FF] font-medium"
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
                onClick={handleDelete}
                disabled={isDeleting}
                className={`p-2 rounded-full hover:bg-gray-100 ${
                  deleteConfirm ? "bg-red-50" : ""
                }`}
                title={deleteConfirm ? "Confirm Delete" : "Delete Event"}
              >
                <Trash2
                  className={`w-4 h-4 ${
                    deleteConfirm ? "text-red-600" : "text-gray-600"
                  }`}
                />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100"
                title="Share Event"
              >
                <Share2 className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventSummary;
