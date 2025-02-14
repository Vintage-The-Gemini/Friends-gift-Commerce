// src/pages/events/CreateEvent.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { eventService } from "../../services/api/event";
import { toast } from "react-toastify";
import ProductSelection from "../../components/events/ProductSelection";
import ImageUpload from "../../components/common/ImageUpload";

const eventTypes = [
  { value: "birthday", label: "Birthday" },
  { value: "wedding", label: "Wedding" },
  { value: "graduation", label: "Graduation" },
  { value: "babyShower", label: "Baby Shower" },
  { value: "houseWarming", label: "House Warming" },
  { value: "anniversary", label: "Anniversary" },
  { value: "other", label: "Other" },
];

const CreateEvent = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    eventType: "",
    description: "",
    eventDate: "",
    endDate: "",
    visibility: "public",
    selectedProducts: [],
    image: null,
  });

  // In CreateEvent.jsx
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic validation
      if (!formData.title?.trim()) throw new Error("Event title is required");
      if (!formData.eventType) throw new Error("Event type is required");
      if (!formData.description?.trim())
        throw new Error("Description is required");
      if (!formData.eventDate) throw new Error("Event date is required");
      if (!formData.endDate) throw new Error("End date is required");
      if (!formData.selectedProducts?.length)
        throw new Error("Please select at least one product");

      // Calculate total amount from products
      const targetAmount = formData.selectedProducts.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      // Create event data object
      const eventData = {
        title: formData.title.trim(),
        eventType: formData.eventType,
        description: formData.description.trim(),
        eventDate: formData.eventDate,
        endDate: formData.endDate,
        visibility: formData.visibility || "public",
        targetAmount,
        selectedProducts: formData.selectedProducts,
      };

      console.log("Submitting Event Data:", eventData);

      const response = await eventService.createEvent(eventData);

      if (response.success) {
        toast.success("Event created successfully!");
        navigate(`/events/${response.data._id}`);
      } else {
        throw new Error(response.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (file) => {
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleProductSelect = (products) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: products,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleInputChange}
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
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Image
              </label>
              <ImageUpload
                onUpload={handleImageUpload}
                currentImage={formData.image}
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
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
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
                name="visibility"
                value={formData.visibility}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
              </select>
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
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Summary
                </h3>
                <p className="text-gray-600">
                  Total Amount: KES{" "}
                  {formData.selectedProducts
                    .reduce(
                      (sum, item) => sum + item.product.price * item.quantity,
                      0
                    )
                    .toLocaleString()}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between relative">
          {["Event Details", "Products & Schedule"].map((label, index) => (
            <div key={label} className="flex items-center">
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
              <span
                className={`ml-2 text-sm ${
                  step === index + 1
                    ? "text-[#5551FF] font-medium"
                    : "text-gray-500"
                }`}
              >
                {label}
              </span>
              {index === 0 && <div className="flex-1 h-0.5 mx-4 bg-gray-200" />}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </button>
            )}

            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center ml-auto bg-[#5551FF] text-white px-6 py-2 rounded-lg hover:bg-[#4440FF]"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center ml-auto bg-[#5551FF] text-white px-6 py-2 rounded-lg hover:bg-[#4440FF] disabled:opacity-50"
              >
                {loading ? "Creating Event..." : "Create Event"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
