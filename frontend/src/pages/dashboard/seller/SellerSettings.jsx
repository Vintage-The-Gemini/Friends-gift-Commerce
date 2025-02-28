// frontend/src/pages/dashboard/seller/SellerSettings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  Bell,
  Clock,
  Store,
  User,
  Mail,
  Phone,
  MapPin,
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
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
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
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load your business profile");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Construct the data object based on active tab
      let dataToSubmit = {};

      if (activeTab === "profile") {
        dataToSubmit = {
          ...settings.business,
          email: settings.profile.email,
          phone: settings.profile.phoneNumber,
        };
      } else if (activeTab === "business") {
        dataToSubmit = {
          ...settings.business,
          businessHours: settings.businessHours,
        };
      } else if (activeTab === "notifications") {
        dataToSubmit = {
          notifications: settings.notifications,
        };
      }

      const response = await updateBusinessProfile(dataToSubmit);

      if (response.success) {
        toast.success("Settings updated successfully");
      } else {
        throw new Error(response.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
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

      <div className="bg-white rounded-lg shadow">
        {/* Settings Tabs */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 flex items-center ${
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
            className={`px-4 py-2 flex items-center ${
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
            className={`px-4 py-2 flex items-center ${
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
            className={`px-4 py-2 flex items-center ${
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
                    disabled={true} // Name should be changed through account settings
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Name cannot be changed here. Please contact support.
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
                    disabled={true} // Phone should be changed through account settings
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Phone cannot be changed here. Please contact support.
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
                </div>
              </div>
            </div>
          )}

          {activeTab === "business" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Logo
                </label>
                <ImageUpload
                  onUpload={handleLogoUpload}
                  currentImage={settings.business.logo}
                  label="Upload Logo"
                />
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
              {Object.entries(settings.businessHours).map(([day, hours]) => (
                <div key={day} className="grid grid-cols-3 gap-4 items-center">
                  <div className="text-sm font-medium text-gray-700 capitalize">
                    {day}
                  </div>
                  <div>
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) =>
                        handleHoursChange(day, "open", e.target.value)
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) =>
                        handleHoursChange(day, "close", e.target.value)
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
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
