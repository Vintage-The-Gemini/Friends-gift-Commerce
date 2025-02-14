// src/pages/events/CreateEvent.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  Gift,
  DollarSign,
  Users,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import ProductSelection from "../../components/events/ProductSelection";

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedProduct = location.state?.selectedProduct;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    eventType: "",
    description: "",
    eventDate: "",
    endDate: "",
    targetAmount: "",
    visibility: "public",
    selectedProducts: selectedProduct
      ? [{ product: selectedProduct, quantity: 1 }]
      : [],
  });

  const [error, setError] = useState("");

  const eventTypes = [
    { value: "birthday", label: "Birthday" },
    { value: "wedding", label: "Wedding" },
    { value: "graduation", label: "Graduation" },
    { value: "babyShower", label: "Baby Shower" },
    { value: "houseWarming", label: "House Warming" },
    { value: "anniversary", label: "Anniversary" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to create an event");
      navigate("/auth/signin");
    }
  }, [user, navigate]);

  const handleProductSelect = (selectedProducts) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts,
      targetAmount: calculateTargetAmount(selectedProducts),
    }));
  };

  const calculateTargetAmount = (products) => {
    return products.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Prepare the data for submission
      const eventData = {
        ...formData,
        products: formData.selectedProducts.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      const data = await response.json();
      toast.success("Event created successfully!");
      navigate(`/events/${data.data._id}`);
    } catch (error) {
      setError(error.message || "Failed to create event");
      toast.error("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <select
                value={formData.eventType}
                onChange={(e) =>
                  setFormData({ ...formData, eventType: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                required
              >
                <option value="">Select Event Type</option>
                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                rows="4"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) =>
                    setFormData({ ...formData, eventDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Visibility
              </label>
              <select
                value={formData.visibility}
                onChange={(e) =>
                  setFormData({ ...formData, visibility: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Select Products
            </h3>
            <ProductSelection
              selectedProducts={formData.selectedProducts}
              onProductSelect={handleProductSelect}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Review Event Details
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Event Title
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formData.title}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Event Type
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {
                      eventTypes.find((t) => t.value === formData.eventType)
                        ?.label
                    }
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Dates</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(formData.eventDate).toLocaleDateString()} -{" "}
                    {new Date(formData.endDate).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Selected Products
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formData.selectedProducts.length} items
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Total Amount
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    $
                    {calculateTargetAmount(formData.selectedProducts).toFixed(
                      2
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Create New Event</h1>

        {/* Progress Steps */}
        <div className="flex justify-between relative mb-8">
          {["Event Details", "Event Settings", "Select Products", "Review"].map(
            (stepLabel, index) => (
              <div key={stepLabel} className="flex flex-col items-center w-1/4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step > index + 1
                      ? "bg-green-500 text-white"
                      : step === index + 1
                      ? "bg-[#5551FF] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="mt-2 text-sm text-gray-600">{stepLabel}</span>
              </div>
            )
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            {renderStep()}
          </div>

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center text-gray-600 px-4 py-2 rounded hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center bg-[#5551FF] text-white px-6 py-2 rounded hover:bg-[#4440FF] ml-auto"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="bg-[#5551FF] text-white px-8 py-2 rounded hover:bg-[#4440FF] ml-auto disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Event"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
