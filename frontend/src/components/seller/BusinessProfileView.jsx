// frontend/src/components/seller/BusinessProfileView.jsx
import React from "react";
import { MapPin, Phone, Mail, Clock, Calendar, Edit } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const BusinessProfileView = ({ profile, stats = null, onEdit = null }) => {
  if (!profile) return null;

  const formatHours = (hours) => {
    if (!hours) return "Not set";
    if (hours.open === "closed" || hours.close === "closed") return "Closed";
    return `${hours.open} - ${hours.close}`;
  };

  const getTodayHours = () => {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const today = days[new Date().getDay()];
    return profile.businessHours
      ? formatHours(profile.businessHours[today])
      : "Not set";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
        {profile.coverImage ? (
          <img
            src={profile.coverImage}
            alt={profile.businessName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute bottom-4 left-4 text-white text-xl font-bold">
            {profile.businessName}
          </div>
        )}

        {/* Edit Button */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
          >
            <Edit className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Logo */}
        <div className="absolute -bottom-12 left-6">
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
            {profile.logo ? (
              <img
                src={profile.logo}
                alt="Business Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold">
                {profile.businessName?.charAt(0) || "B"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="mt-14 p-6">
        {/* Business Name & Today's Hours */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{profile.businessName}</h1>
            {profile.city && (
              <p className="text-gray-600 flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {profile.city}
              </p>
            )}
          </div>

          <div className="mt-2 md:mt-0 flex items-center">
            <Clock className="w-4 h-4 mr-1 text-gray-600" />
            <span className="text-sm">Today: {getTodayHours()}</span>
          </div>
        </div>

        {/* Description */}
        {profile.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-gray-700">{profile.description}</p>
          </div>
        )}

        {/* Contact Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.phone && (
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-600 mr-2" />
                <span>{profile.phone}</span>
              </div>
            )}

            {profile.email && (
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-600 mr-2" />
                <span>{profile.email}</span>
              </div>
            )}

            {profile.address && (
              <div className="flex items-center md:col-span-2">
                <MapPin className="w-5 h-5 text-gray-600 mr-2" />
                <span>
                  {profile.address}, {profile.city}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Business Hours */}
        {profile.businessHours && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Business Hours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {Object.entries(profile.businessHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between">
                  <span className="capitalize text-gray-700">{day}</span>
                  <span className="text-gray-900 font-medium">
                    {formatHours(hours)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Business Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-500 text-sm">Products</p>
                <p className="font-bold text-xl">{stats.totalProducts}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-500 text-sm">Orders</p>
                <p className="font-bold text-xl">{stats.totalOrders}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-500 text-sm">Revenue</p>
                <p className="font-bold text-xl">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-500 text-sm">Rating</p>
                <p className="font-bold text-xl">{stats.rating || "N/A"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessProfileView;
