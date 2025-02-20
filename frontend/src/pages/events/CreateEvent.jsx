import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { eventService } from "../../services/api/event";
import { productService } from "../../services/api/product";
import ProductSelection from "../../components/events/ProductSelection";
import { formatCurrency } from "../../utils/currency";
import { toast } from "react-toastify";

const CreateEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedProduct = location.state?.selectedProduct || null;
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get("product");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    eventType: "",
    description: "",
    eventDate: "",
    endDate: "",
    visibility: "public",
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

  const validateProducts = () => {
    if (!formData.selectedProducts?.length) {
      throw new Error("Please select at least one product");
    }

    formData.selectedProducts.forEach((item) => {
      if (!item.product?._id) {
        throw new Error("Invalid product selection");
      }
      if (!item.quantity || item.quantity < 1) {
        throw new Error("Product quantity must be at least 1");
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.title?.trim()) throw new Error("Event title is required");
      if (!formData.eventType) throw new Error("Event type is required");
      if (!formData.description?.trim())
        throw new Error("Description is required");
      if (!formData.eventDate) throw new Error("Event date is required");
      if (!formData.endDate) throw new Error("End date is required");

      // Validate dates and products
      validateDates();
      validateProducts();

      // Calculate target amount
      const targetAmount = calculateTargetAmount();
      if (targetAmount <= 0) {
        throw new Error("Invalid product prices or quantities");
      }

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
      };

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

  const handleProductSelect = (products) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: products,
    }));
  };

  const eventTypes = [
    { value: "birthday", label: "Birthday" },
    { value: "wedding", label: "Wedding" },
    { value: "graduation", label: "Graduation" },
    { value: "babyShower", label: "Baby Shower" },
    { value: "houseWarming", label: "House Warming" },
    { value: "anniversary", label: "Anniversary" },
  ];

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
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
                  className={`ml-2 ${
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
                      className="h-full bg-[#5551FF]"
                      style={{ width: step > 1 ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
              {error}
            </div>
          )}

          {step === 1 && (
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
          )}

          {step === 2 && (
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
                      formData.eventDate ||
                      new Date().toISOString().split("T")[0]
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
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {formData.visibility === "public" &&
                    "Anyone can view this event"}
                  {formData.visibility === "private" &&
                    "Only you and invited people can view this event"}
                  {formData.visibility === "unlisted" &&
                    "Only people with the link can view this event"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Select Products <span className="text-red-500">*</span>
                </label>
                <ProductSelection
                  selectedProducts={formData.selectedProducts}
                  onProductSelect={handleProductSelect}
                />

                {formData.selectedProducts.length > 0 && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Contribution Summary
                    </h3>
                    <div className="space-y-2">
                      {formData.selectedProducts.map((item, index) => (
                        <div
                          key={index}
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
                className="ml-auto bg-[#5551FF] text-white px-6 py-2 rounded-lg hover:bg-[#4440FF] disabled:opacity-50 disabled:cursor-not-allowed"
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
