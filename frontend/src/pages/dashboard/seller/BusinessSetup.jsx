// src/pages/dashboard/seller/BusinessSetup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import ImageUpload from "../../../components/common/ImageUpload";
import { createBusinessProfile } from "../../../services/api/business";

const BusinessSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    businessName: user?.businessName || "",
    description: "",
    email: "",
    phone: user?.phoneNumber || "",
    whatsapp: "",
    address: "",
    city: "",
    logo: "",
    coverImage: "",
    categories: [],
    businessHours: {
      monday: { open: "09:00", close: "17:00" },
      tuesday: { open: "09:00", close: "17:00" },
      wednesday: { open: "09:00", close: "17:00" },
      thursday: { open: "09:00", close: "17:00" },
      friday: { open: "09:00", close: "17:00" },
      saturday: { open: "09:00", close: "17:00" },
      sunday: { open: "09:00", close: "17:00" },
    },
  });

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await createBusinessProfile(formData);
      console.log("Business profile created:", response);
      setSuccess(true);
      setTimeout(() => {
        navigate("/seller/dashboard");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to create business profile");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (url) => {
    setFormData((prev) => ({
      ...prev,
      logo: url,
    }));
  };

  const handleCoverImageUpload = (url) => {
    setFormData((prev) => ({
      ...prev,
      coverImage: url,
    }));
  };

  const updateBusinessHours = (day, field, value) => {
    setFormData((prev) => ({
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Business Profile Created Successfully!
          </h2>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {["Business Details", "Contact Info", "Working Hours"].map(
              (label, index) => (
                <div key={label} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      step > index + 1
                        ? "bg-green-500"
                        : step === index + 1
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    } text-white font-semibold`}
                  >
                    {step > index + 1 ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm ${
                      step === index + 1
                        ? "text-blue-600 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {label}
                  </span>
                  {index < 2 && <div className="w-24 h-0.5 mx-4 bg-gray-300" />}
                </div>
              )
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <h2 className="text-xl font-semibold mb-6">Business Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          businessName: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUpload
                      label="Business Logo"
                      onUpload={handleLogoUpload}
                      currentImage={formData.logo}
                      className="col-span-1"
                    />

                    <ImageUpload
                      label="Cover Image"
                      onUpload={handleCoverImageUpload}
                      currentImage={formData.coverImage}
                      className="col-span-1"
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-xl font-semibold mb-6">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-xl font-semibold mb-6">Business Hours</h2>
                <div className="space-y-4">
                  {days.map((day) => (
                    <div
                      key={day}
                      className="grid grid-cols-3 gap-4 items-center"
                    >
                      <div className="text-sm font-medium text-gray-700 capitalize">
                        {day}
                      </div>
                      <div>
                        <input
                          type="time"
                          value={formData.businessHours[day].open}
                          onChange={(e) =>
                            updateBusinessHours(day, "open", e.target.value)
                          }
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <input
                          type="time"
                          value={formData.businessHours[day].close}
                          onChange={(e) =>
                            updateBusinessHours(day, "close", e.target.value)
                          }
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center text-blue-600 px-4 py-2 rounded hover:bg-blue-50"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="flex items-center bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 ml-auto"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700 ml-auto flex items-center"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Creating...
                    </>
                  ) : (
                    "Create Business"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessSetup;
