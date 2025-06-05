// frontend/src/components/events/CreateEventForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Users,
  Globe,
  Lock,
  Link,
} from "lucide-react";
import ImageUpload from "../common/ImageUpload";
import ProductSelection from "./ProductSelection";
import { eventService } from "../../services/api/event";
import { formatCurrency } from "../../utils/currency";
import { toast } from "react-toastify";

const CreateEventForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    eventType: "",
    customEventType: "",
    description: "",
    eventDate: "",
    endDate: "",
    visibility: "private",
    selectedProducts: [],
    image: "",
  });

  // Expanded event types organized by categories
  const eventTypeCategories = {
    personal: [
      { value: "birthday", label: "Birthday" },
      { value: "wedding", label: "Wedding" },
      { value: "graduation", label: "Graduation" },
      { value: "babyShower", label: "Baby Shower" },
      { value: "houseWarming", label: "House Warming" },
      { value: "anniversary", label: "Anniversary" },
      { value: "retirement", label: "Retirement" },
      { value: "engagement", label: "Engagement" },
      { value: "achievement", label: "Achievement" },
      { value: "milestone", label: "Milestone" },
      { value: "recovery", label: "Recovery" },
    ],
    religious: [
      { value: "christening", label: "Christening" },
      { value: "baptism", label: "Baptism" },
      { value: "communion", label: "First Communion" },
      { value: "confirmation", label: "Confirmation" },
      { value: "houseblessing", label: "House Blessing" },
    ],
    holiday: [
      { value: "christmas", label: "Christmas" },
      { value: "newyear", label: "New Year" },
      { value: "valentines", label: "Valentine's Day" },
      { value: "mothers-day", label: "Mother's Day" },
      { value: "fathers-day", label: "Father's Day" },
      { value: "easter", label: "Easter" },
      { value: "thanksgiving", label: "Thanksgiving" },
      { value: "holiday", label: "Other Holiday" },
    ],
    professional: [
      { value: "promotion", label: "Promotion" },
      { value: "teambuilding", label: "Team Building" },
      { value: "business-launch", label: "Business Launch" },
      { value: "opening", label: "Grand Opening" },
    ],
    social: [
      { value: "reunion", label: "Reunion" },
      { value: "celebration", label: "Celebration" },
      { value: "farewell", label: "Farewell" },
    ],
    community: [
      { value: "charity", label: "Charity Event" },
      { value: "fundraiser", label: "Fundraiser" },
    ],
    memorial: [
      { value: "funeral", label: "Funeral" },
      { value: "memorial", label: "Memorial Service" },
    ],
    custom: [
      { value: "other", label: "Custom Event" },
    ],
  };

  // Validation logic for different steps
  const isStepOneValid = () => {
    // Require customEventType if eventType is 'other'
    if (formData.eventType === "other" && !formData.customEventType?.trim()) {
      return false;
    }

    return (
      formData.title?.trim() &&
      formData.eventType &&
      formData.description?.trim()
    );
  };

  const isStepTwoValid = () => {
    return (
      formData.eventDate &&
      formData.endDate &&
      formData.selectedProducts?.length > 0
    );
  };

  // Calculate target amount based on selected products
  const calculateTargetAmount = () => {
    return formData.selectedProducts.reduce((total, item) => {
      const price = parseFloat(item.product.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + price * quantity;
    }, 0);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Calculate target amount
      const targetAmount = calculateTargetAmount();

      // Format products data
      const formattedProducts = formData.selectedProducts.map((item) => ({
        product: item.product._id,
        quantity: parseInt(item.quantity) || 1,
      }));

      // Create event data object
      const eventData = {
        title: formData.title.trim(),
        eventType: formData.eventType,
        description: formData.description.trim(),
        eventDate: formData.eventDate,
        endDate: formData.endDate,
        visibility: formData.visibility,
        targetAmount: targetAmount,
        products: JSON.stringify(formattedProducts),
        image: formData.image,
      };

      // Add customEventType if using "other" event type
      if (formData.eventType === "other" && formData.customEventType) {
        eventData.customEventType = formData.customEventType.trim();
      }

      console.log("Creating event with data:", eventData);

      const response = await eventService.createEvent(eventData);

      if (response.success) {
        toast.success("Event created successfully!");
        navigate(`/events/${response.data._id}`);
      } else {
        throw new Error(response.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Failed to create event");
      toast.error(error.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (url) => {
    setFormData((prev) => ({
      ...prev,
      image: url,
    }));
  };

  // Handle product selection
  const handleProductSelect = (products) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: products,
    }));
  };

  // Render event type selection with categories
  const renderEventTypeSelection = () => (
    <div className="space-y-6">
      {Object.entries(eventTypeCategories).map(([category, types]) => (
        <div key={category} className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 capitalize">
            {category === "custom" ? "Custom Events" : `${category} Events`}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {types.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    eventType: type.value,
                    // Reset customEventType if not selecting 'other'
                    customEventType:
                      type.value === "other"
                        ? formData.customEventType
                        : "",
                  });
                }}
                className={`p-3 text-left border rounded-lg hover:border-[#5551FF] transition-colors ${
                  formData.eventType === type.value
                    ? "border-[#5551FF] bg-[#5551FF]/5"
                    : "border-gray-200"
                }`}
              >
                <div className="font-medium text-sm">{type.label}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Event Type <span className="text-red-500">*</span>
              </label>
              {renderEventTypeSelection()}
            </div>

            {/* Custom Event Type field - shows only when "other" is selected */}
            {formData.eventType === "other" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Event Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customEventType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customEventType: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                  placeholder="Enter your custom event type (e.g., Housewarming, Farewell Party)"
                  maxLength={50}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum 50 characters. Be specific about your event type.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                required
                placeholder="Enter a meaningful title for your event"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                rows="4"
                required
                placeholder="Describe your event and why you're creating it"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Cover Image
              </label>
              <ImageUpload
                onUpload={handleImageUpload}
                currentImage={formData.image}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) =>
                    setFormData({ ...formData, eventDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                  required
                  min={
                    formData.eventDate || new Date().toISOString().split("T")[0]
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Visibility
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div
                  className={`border rounded-lg p-4 cursor-pointer hover:border-[#5551FF] transition-colors ${
                    formData.visibility === "public"
                      ? "border-[#5551FF] bg-[#5551FF]/5"
                      : "border-gray-200"
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, visibility: "public" })
                  }
                >
                  <div className="flex items-center mb-2">
                    <Globe
                      className={`w-5 h-5 mr-2 ${
                        formData.visibility === "public"
                          ? "text-[#5551FF]"
                          : "text-gray-500"
                      }`}
                    />
                    <span className="font-medium">Public</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Anyone can discover and view this event
                  </p>
                </div>

                <div
                  className={`border rounded-lg p-4 cursor-pointer hover:border-[#5551FF] transition-colors ${
                    formData.visibility === "private"
                      ? "border-[#5551FF] bg-[#5551FF]/5"
                      : "border-gray-200"
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, visibility: "private" })
                  }
                >
                  <div className="flex items-center mb-2">
                    <Lock
                      className={`w-5 h-5 mr-2 ${
                        formData.visibility === "private"
                          ? "text-[#5551FF]"
                          : "text-gray-500"
                      }`}
                    />
                    <span className="font-medium">Private</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Only you and invited people can view this event
                  </p>
                </div>

                <div
                  className={`border rounded-lg p-4 cursor-pointer hover:border-[#5551FF] transition-colors ${
                    formData.visibility === "unlisted"
                      ? "border-[#5551FF] bg-[#5551FF]/5"
                      : "border-gray-200"
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, visibility: "unlisted" })
                  }
                >
                  <div className="flex items-center mb-2">
                    <Link
                      className={`w-5 h-5 mr-2 ${
                        formData.visibility === "unlisted"
                          ? "text-[#5551FF]"
                          : "text-gray-500"
                      }`}
                    />
                    <span className="font-medium">Unlisted</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Only people with the direct link can view this event
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Select Products <span className="text-red-500">*</span>
              </label>
              <ProductSelection
                selectedProducts={formData.selectedProducts}
                onProductSelect={handleProductSelect}
              />
            </div>

            {formData.selectedProducts.length > 0 && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Selected Products Summary
                </h3>
                <ul className="space-y-2">
                  {formData.selectedProducts.map((item, index) => (
                    <li key={index} className="flex justify-between text-sm">
                      <span>
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="border-t mt-2 pt-2 flex justify-between font-medium">
                  <span>Total Target Amount:</span>
                  <span>{formatCurrency(calculateTargetAmount())}</span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between">
            {["Event Details", "Additional Info"].map((label, index) => (
              <div key={label} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center
                  ${
                    step > index + 1
                      ? "bg-green-500"
                      : step === index + 1
                      ? "bg-[#5551FF]"
                      : "bg-gray-200"
                  } text-white`}
                >
                  {index + 1}
                </div>
                <span
                  className={`ml-2 text-sm ${
                    step === index + 1
                      ? "text-[#5551FF] font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {label}
                </span>
                {index < 1 && (
                  <div className="w-full h-1 mx-4 bg-gray-200">
                    <div
                      className={`h-full bg-[#5551FF] transition-all duration-300`}
                      style={{
                        width: step > index + 1 ? "100%" : "0%",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {renderStepContent()}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </button>
          )}

          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!isStepOneValid()}
              className="ml-auto flex items-center bg-[#5551FF] text-white px-6 py-2 rounded-lg hover:bg-[#4440FF] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !isStepTwoValid()}
              className="ml-auto bg-[#5551FF] text-white px-6 py-2 rounded-lg hover:bg-[#4440FF] disabled:opacity-50"
            >
              {loading ? "Creating Event..." : "Create Event"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default CreateEventForm;