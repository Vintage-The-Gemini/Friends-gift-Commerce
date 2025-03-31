// frontend/src/pages/events/CreateEvent.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { eventService } from "../../services/api/event";
import { contributionService } from "../../services/api/contribution";
import { productService } from "../../services/api/product";
import ProductSelection from "../../components/events/ProductSelection";
import InitialContribution from "../../components/events/InitialContribution";
import { formatCurrency } from "../../utils/currency";
import { toast } from "react-toastify";

const CreateEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedProduct = location.state?.selectedProduct || null;
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get("product");

  const [step, setStep] = useState(1); // Now we have 3 steps: 1-Event Details, 2-Additional Info, 3-Initial Contribution
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdEventId, setCreatedEventId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    eventType: "",
    description: "",
    eventDate: "",
    endDate: "",
    visibility: "private", // Default to private
    selectedProducts: selectedProduct
      ? [{ product: selectedProduct, quantity: 1 }]
      : [],
  });

  // Fetch product details if productId is provided in URL
  useEffect(() => {
    const fetchProduct = async () => {
      if (productId && formData.selectedProducts.length === 0) {
        try {
          const response = await productService.getProductById(productId);
          if (response.success) {
            setFormData((prev) => ({
              ...prev,
              selectedProducts: [{ product: response.data, quantity: 1 }],
            }));
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          toast.error("Failed to fetch product details");
        }
      }
    };
    fetchProduct();
  }, [productId]);

  const calculateTargetAmount = () => {
    return formData.selectedProducts.reduce((total, item) => {
      const price = parseFloat(item.product.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + price * quantity;
    }, 0);
  };

  const validateDates = () => {
    const eventDate = new Date(formData.eventDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      throw new Error("Event date cannot be in the past");
    }
    if (endDate < eventDate) {
      throw new Error("End date must be after event date");
    }
  };

  // Enhanced product validation
  const validateProducts = () => {
    if (!formData.selectedProducts?.length) {
      throw new Error("Please select at least one product");
    }

    formData.selectedProducts.forEach((item, index) => {
      if (!item.product?._id) {
        throw new Error(
          `Invalid product at position ${index + 1}. Missing product ID`
        );
      }

      if (!item.quantity || item.quantity < 1) {
        throw new Error(
          `Product ${item.product.name} must have a quantity of at least 1`
        );
      }

      if (!item.product.price || isNaN(parseFloat(item.product.price))) {
        throw new Error(`Product ${item.product.name} has an invalid price`);
      }
    });
  };

  // Split handleSubmit into two functions - one for event creation and one for contribution
  const handleEventCreation = async () => {
    try {
      setLoading(true);
      setError("");

      // Basic validation
      if (!formData.title?.trim()) throw new Error("Event title is required");
      if (!formData.eventType) throw new Error("Event type is required");
      if (!formData.description?.trim())
        throw new Error("Description is required");
      if (!formData.eventDate) throw new Error("Event date is required");
      if (!formData.endDate) throw new Error("End date is required");

      validateDates();
      validateProducts();

      // Calculate target amount from selected products
      const calculatedTargetAmount = calculateTargetAmount();

      // Prepare the simplified products array
      const simplifiedProducts = formData.selectedProducts.map((item) => ({
        product: item.product._id,
        quantity: parseInt(item.quantity) || 1,
      }));

      // Create event data object with proper formatted products array
      const eventData = {
        title: formData.title.trim(),
        eventType: formData.eventType,
        description: formData.description.trim(),
        eventDate: formData.eventDate,
        endDate: formData.endDate,
        visibility: formData.visibility,
        targetAmount: calculatedTargetAmount,
        // Important: Set the status to "pending" - will be activated after contribution
        status: "pending",
        // Explicitly set the formats needed
        products: JSON.stringify(simplifiedProducts),
      };

      // Debug logs
      console.log("Creating event with data:", eventData);
      console.log("Products as JSON string:", eventData.products);

      const response = await eventService.createEvent(eventData);

      if (response.success) {
        const eventId = response.data._id || response.data.event._id;
        setCreatedEventId(eventId);
        // Move to contribution step
        setStep(3);
        return eventId;
      } else {
        throw new Error(response.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Failed to create event");
      toast.error(error.message || "Failed to create event");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleInitialContribution = async (contributionData) => {
    try {
      setLoading(true);
      setError("");

      // Create contribution data
      const payload = {
        eventId: createdEventId,
        amount: contributionData.amount,
        paymentMethod: contributionData.paymentMethod,
        phoneNumber: contributionData.phoneNumber,
        message: "Initial contribution to activate event",
        isInitialContribution: true, // Mark this as the initial contribution
      };

      // Submit contribution
      const response = await contributionService.createContribution(payload);

      if (response.success) {
        // Update event status to active
        try {
          console.log("Attempting to update event status:", createdEventId);
          const statusResult = await eventService.updateEventStatus(
            createdEventId,
            "active"
          );
          console.log("Status update result:", statusResult);
        } catch (statusError) {
          console.error("Error updating status:", statusError);
          // Continue anyway since the event was created
        }

        toast.success("Event created and activated successfully!");
        navigate(`/events/${createdEventId}`);
      } else {
        throw new Error(response.message || "Failed to process contribution");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Failed to process contribution");
      toast.error(error.message || "Failed to process contribution");
    } finally {
      setLoading(false);
    }
  };
  // Handle navigation between steps
  const handleNextStep = async () => {
    if (step === 1) {
      if (isStepOneValid()) {
        setStep(2);
      } else {
        toast.error("Please fill in all required fields");
      }
    } else if (step === 2) {
      if (isStepTwoValid()) {
        // Create the event before proceeding to contribution
        const eventId = await handleEventCreation();
        if (eventId) {
          setStep(3);
        }
      } else {
        toast.error("Please select at least one product");
      }
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCancelContribution = async () => {
    try {
      // Delete the created event since user cancelled the contribution
      if (createdEventId) {
        await eventService.deleteEvent(createdEventId);
      }
      // Go back to step 2
      setStep(2);
      setCreatedEventId(null);
    } catch (error) {
      console.error("Error cancelling contribution:", error);
    }
  };

  const isStepOneValid = () => {
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

  const eventTypes = [
    { value: "birthday", label: "Birthday" },
    { value: "wedding", label: "Wedding" },
    { value: "graduation", label: "Graduation" },
    { value: "babyShower", label: "Baby Shower" },
    { value: "houseWarming", label: "House Warming" },
    { value: "anniversary", label: "Anniversary" },
  ];

  // Render different steps
  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type <span className="text-red-500">*</span>
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
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
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
                <option value="private">
                  Private - Only invited people can see this event
                </option>
                <option value="unlisted">
                  Unlisted - Only people with the link can see this event
                </option>
                <option value="public">
                  Public - Anyone can see this event
                </option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                By default, events are private for your security and privacy.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Select Products <span className="text-red-500">*</span>
              </label>
              <ProductSelection
                selectedProducts={formData.selectedProducts}
                onProductSelect={(products) =>
                  setFormData({ ...formData, selectedProducts: products })
                }
              />
            </div>

            {formData.selectedProducts.length > 0 && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Contribution Summary
                </h3>
                <div className="space-y-2">
                  {formData.selectedProducts.map((item, index) => (
                    <div
                      key={`summary-${item.product._id}-${index}`}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.product.name} × {item.quantity}
                      </span>
                      <span>
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total Target Amount:</span>
                    <span>{formatCurrency(calculateTargetAmount())}</span>
                  </div>
                  <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    Note: You'll need to make an initial contribution of 10% (
                    {formatCurrency(calculateTargetAmount() * 0.1)}) to activate
                    this event.
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        // Initial contribution step
        return (
          <InitialContribution
            eventData={{
              title: formData.title,
              targetAmount: calculateTargetAmount(),
            }}
            onContributionComplete={handleInitialContribution}
            onCancel={handleCancelContribution}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {["Event Details", "Additional Info", "Activation"].map(
              (label, index) => (
                <div
                  key={label}
                  className={`flex items-center ${
                    index === 2 ? "flex-1" : "flex-1"
                  }`}
                >
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
                    className={`ml-2 ${
                      step === index + 1
                        ? "text-[#5551FF] font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {label}
                  </span>
                  {index < 2 && (
                    <div className="w-full h-1 mx-4 bg-gray-200">
                      <div
                        className="h-full bg-[#5551FF]"
                        style={{ width: step > index + 1 ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {renderCurrentStep()}

        <div className="flex justify-between mt-8">
          {step > 1 && step < 3 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </button>
          )}

          {step < 2 && (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!isStepOneValid()}
              className="ml-auto flex items-center bg-[#5551FF] text-white px-6 py-2 rounded-lg hover:bg-[#4440FF] disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!isStepTwoValid() || loading}
              className="ml-auto flex items-center bg-[#5551FF] text-white px-6 py-2 rounded-lg hover:bg-[#4440FF] disabled:opacity-50"
            >
              {loading ? "Creating Event..." : "Create & Continue"}
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
