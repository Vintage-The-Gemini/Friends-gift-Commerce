// frontend/src/components/seller/BusinessProfileView.jsx
import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  Edit,
  Globe,
  User,
  DollarSign,
  Package,
  ShoppingBag,
} from "lucide-react";
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
      <div className="h-56 bg-gradient-to-r from-[#5551FF] to-[#4440FF] relative overflow-hidden">
        {profile.coverImage ? (
          <img
            src={profile.coverImage}
            alt={profile.businessName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-xl font-bold px-6 py-3 bg-black/30 rounded-lg backdrop-blur-sm">
              {profile.businessName}
            </div>
          </div>
        )}

        {/* Logo */}
        <div className="absolute -bottom-16 left-6 md:left-10">
          <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
            {profile.logo ? (
              <img
                src={profile.logo}
                alt="Business Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#5551FF] to-[#4440FF] flex items-center justify-center text-white text-2xl font-bold">
                {profile.businessName?.charAt(0) || "B"}
              </div>
            )}
          </div>
        </div>

        {/* Edit Button */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="absolute top-4 right-4 bg-white/90 rounded-full p-2.5 shadow-lg hover:bg-white transition-colors"
            aria-label="Edit profile"
          >
            <Edit className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>

      {/* Profile Content */}
      <div className="mt-20 px-6 py-4">
        {/* Business Name & Today's Hours */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {profile.businessName}
            </h1>
            {profile.city && (
              <p className="text-gray-600 flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1.5 text-gray-500" />
                {profile.city}
              </p>
            )}
          </div>

          <div className="mt-2 md:mt-0 flex items-center">
            <div className="px-4 py-1.5 bg-blue-50 rounded-full flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-blue-600" />
              <span className="text-sm text-blue-800 font-medium">
                Today: {getTodayHours()}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {profile.description && (
          <div className="mb-6">
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">
                About Our Business
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {profile.description}
              </p>
            </div>
          </div>
        )}

        {/* Contact Info Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.phone && (
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                    <p className="font-medium text-gray-800">{profile.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {profile.email && (
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <Mail className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="font-medium text-gray-800">{profile.email}</p>
                  </div>
                </div>
              </div>
            )}

            {profile.address && (
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Address</p>
                    <p className="font-medium text-gray-800">
                      {profile.address}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Business Hours */}
        {profile.businessHours && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Business Hours
            </h2>
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {Object.entries(profile.businessHours).map(([day, hours]) => (
                  <div
                    key={day}
                    className="flex justify-between py-2 border-b border-gray-100"
                  >
                    <span className="capitalize text-gray-700 font-medium">
                      {day}
                    </span>
                    <span className="text-gray-900">{formatHours(hours)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Business Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                    <Package className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Products
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalProducts || 0}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Orders
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOrders || 0}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Revenue
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue || 0)}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                    <User className="w-4 h-4 text-yellow-600" />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Rating
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.rating || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessProfileView;
