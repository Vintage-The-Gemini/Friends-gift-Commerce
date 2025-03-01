// frontend/src/pages/dashboard/seller/SellerSettings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Save,
  Bell,
  Clock,
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
} from "lucide-react";
import {
  getBusinessProfile,
  updateBusinessProfile,
} from "../../../services/api/business";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-toastify";
import ImageUpload from "../../../components/common/ImageUpload";

const SellerSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "profile"
  );
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    profile: {
      name: user?.name || "",
      email: "",
      phoneNumber: user?.phoneNumber || "",
    },
    business: {
      businessName: user?.businessName || "",
      description: "",
      address: "",
      city: "",
      logo: "",
      coverImage: "",
    },
    notifications: {
      email: true,
      sms: true,
      orderUpdates: true,
      marketingEmails: false,
    },
    businessHours: {
      monday: { open: "09:00", close: "17:00" },
      tuesday: { open: "09:00", close: "17:00" },
      wednesday: { open: "09:00", close: "17:00" },
      thursday: { open: "09:00", close: "17:00" },
      friday: { open: "09:00", close: "17:00" },
      saturday: { open: "10:00", close: "15:00" },
      sunday: { open: "closed", close: "closed" },
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsFetching(true);
      const response = await getBusinessProfile();

      if (response.success && response.data) {
        // Update settings with fetched data
        setSettings((prevSettings) => ({
          ...prevSettings,
          business: {
            businessName:
              response.data.businessName || user?.businessName || "",
            description: response.data.description || "",
            address: response.data.address || "",
            city: response.data.city || "",
            logo: response.data.logo || "",
            coverImage: response.data.coverImage || "",
          },
          businessHours:
            response.data.businessHours || prevSettings.businessHours,
          profile: {
            ...prevSettings.profile,
            email: response.data.email || "",
            name: user?.name || "",
            phoneNumber: response.data.phone || user?.phoneNumber || "",
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setError("Failed to load your business profile");
      toast.error("Failed to load your business profile");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Construct the data object based on active tab
      let dataToSubmit = {};

      if (activeTab === "profile") {
        dataToSubmit = {
          name: settings.profile.name,
          email: settings.profile.email,
          phone: settings.profile.phoneNumber,
        };
      } else if (activeTab === "business") {
        dataToSubmit = {
          ...settings.business,
        };
      } else if (activeTab === "hours") {
        dataToSubmit = {
          businessHours: settings.businessHours,
        };
      } else if (activeTab === "notifications") {
        dataToSubmit = {
          notifications: settings.notifications,
        };
      }

      console.log("Submitting data:", dataToSubmit);
      const response = await updateBusinessProfile(dataToSubmit);

      if (response.success) {
        toast.success("Settings updated successfully");

        // If user's name or business name was updated, update local storage
        if (activeTab === "profile" && settings.profile.name !== user.name) {
          // Update local user data - simple approach
          const userData = JSON.parse(localStorage.getItem("user") || "{}");
          userData.name = settings.profile.name;
          localStorage.setItem("user", JSON.stringify(userData));

          // You might want to add a more robust approach with your auth context
          // like a refreshUser() method that pulls from the API
        }

        if (
          activeTab === "business" &&
          settings.business.businessName !== user.businessName
        ) {
          // Update local user data
          const userData = JSON.parse(localStorage.getItem("user") || "{}");
          userData.businessName = settings.business.businessName;
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } else {
        throw new Error(response.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      setError(error.message || "Failed to update settings");
      toast.error(error.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleHoursChange = (day, field, value) => {
    setSettings((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleLogoUpload = (url) => {
    setSettings((prev) => ({
      ...prev,
      business: {
        ...prev.business,
        logo: url,
      },
    }));
  };

  const handleCoverImageUpload = (url) => {
    setSettings((prev) => ({
      ...prev,
      business: {
        ...prev.business,
        coverImage: url,
      },
    }));
  };

  if (isFetching) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {/* Settings Tabs */}
        <div className="flex border-b overflow-x-auto scrollbar-hide">
          <button
            className={`px-4 py-2 flex items-center whitespace-nowrap ${
              activeTab === "profile"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </button>
          <button
            className={`px-4 py-2 flex items-center whitespace-nowrap ${
              activeTab === "business"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("business")}
          >
            <Store className="w-4 h-4 mr-2" />
            Business Information
          </button>
          <button
            className={`px-4 py-2 flex items-center whitespace-nowrap ${
              activeTab === "hours"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("hours")}
          >
            <Clock className="w-4 h-4 mr-2" />
            Business Hours
          </button>
          <button
            className={`px-4 py-2 flex items-center whitespace-nowrap ${
              activeTab === "notifications"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={settings.profile.name}
                    onChange={(e) =>
                      handleChange("profile", "name", e.target.value)
                    }
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This is the name that will be displayed to others.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={settings.profile.phoneNumber}
                    onChange={(e) =>
                      handleChange("profile", "phoneNumber", e.target.value)
                    }
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Use the format: +254XXXXXXXXX
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) =>
                      handleChange("profile", "email", e.target.value)
                    }
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This is where we'll send order notifications.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "business" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Logo
                  </label>
                  <ImageUpload
                    onUpload={handleLogoUpload}
                    currentImage={settings.business.logo}
                    label="Upload Logo"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Recommended size: 400x400px, square format
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Image
                  </label>
                  <ImageUpload
                    onUpload={handleCoverImageUpload}
                    currentImage={settings.business.coverImage}
                    label="Upload Cover Image"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Recommended size: 1200x400px, landscape format
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={settings.business.businessName}
                  onChange={(e) =>
                    handleChange("business", "businessName", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Description
                </label>
                <textarea
                  value={settings.business.description}
                  onChange={(e) =>
                    handleChange("business", "description", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={settings.business.address}
                    onChange={(e) =>
                      handleChange("business", "address", e.target.value)
                    }
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={settings.business.city}
                    onChange={(e) =>
                      handleChange("business", "city", e.target.value)
                    }
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "hours" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Set your business hours. Use the "closed" option if you're not
                operating on a specific day.
              </p>
              {Object.entries(settings.businessHours).map(([day, hours]) => (
                <div key={day} className="grid grid-cols-3 gap-4 items-center">
                  <div className="text-sm font-medium text-gray-700 capitalize">
                    {day}
                  </div>
                  <div>
                    <select
                      value={hours.open}
                      onChange={(e) =>
                        handleHoursChange(day, "open", e.target.value)
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="closed">Closed</option>
                      {Array.from({ length: 24 }).map((_, i) => {
                        const hour = i.toString().padStart(2, "0");
                        return (
                          <option key={hour} value={`${hour}:00`}>
                            {`${hour}:00`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <select
                      value={hours.close}
                      onChange={(e) =>
                        handleHoursChange(day, "close", e.target.value)
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={hours.open === "closed"}
                    >
                      <option value="closed">Closed</option>
                      {Array.from({ length: 24 }).map((_, i) => {
                        const hour = i.toString().padStart(2, "0");
                        return (
                          <option key={hour} value={`${hour}:00`}>
                            {`${hour}:00`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) =>
                      handleChange("notifications", "email", e.target.checked)
                    }
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Email Notifications
                </label>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  Receive order updates and important announcements via email
                </p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms}
                    onChange={(e) =>
                      handleChange("notifications", "sms", e.target.checked)
                    }
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  SMS Notifications
                </label>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  Receive order updates via SMS
                </p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.orderUpdates}
                    onChange={(e) =>
                      handleChange(
                        "notifications",
                        "orderUpdates",
                        e.target.checked
                      )
                    }
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Order Updates
                </label>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  Get notified when order status changes
                </p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.marketingEmails}
                    onChange={(e) =>
                      handleChange(
                        "notifications",
                        "marketingEmails",
                        e.target.checked
                      )
                    }
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Marketing Emails
                </label>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  Receive news about promotions and special offers
                </p>
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerSettings;
