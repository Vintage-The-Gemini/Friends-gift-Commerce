// File: frontend/src/components/events/EventCheckout.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ShoppingBag,
  Truck,
  CreditCard,
  Phone,
  CheckCircle,
  X,
  ArrowRight,
  Calendar,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { eventService } from "../../services/api/event";
import { toast } from "react-toastify";
import CheckoutProgressBar from "./CheckoutProgressBar";
import CheckoutStatusIndicator from "./CheckoutStatusIndicator";

const EventCheckout = ({ event, onComplete, onCancel }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Confirmation
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Eligibility, 2: Shipping, 3: Confirmation, 4: Processing, 5: Complete
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completedCheckout, setCompletedCheckout] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const [checkoutStatus, setCheckoutStatus] = useState("initial"); // initial, processing, success, error
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Kenya",
    phone: "",
    notes: "",
  });
  const [orderSummary, setOrderSummary] = useState(null);

  useEffect(() => {
    // Pre-fill shipping details if available
    if (event?.creator?.name) {
      setShippingAddress((prev) => ({
        ...prev,
        name: event.creator.name,
        phone: event.creator.phoneNumber || "",
      }));
    }
    
    setCheckoutStep(2); // Start at Shipping step (after eligibility check)
  }, [event]);

  const validateShippingDetails = () => {
    if (!shippingAddress.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!shippingAddress.address.trim()) {
      setError("Address is required");
      return false;
    }
    if (!shippingAddress.city.trim()) {
      setError("City is required");
      return false;
    }
    if (!shippingAddress.phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    
    // Basic Kenyan phone validation
    if (!shippingAddress.phone.startsWith('+254') && !shippingAddress.phone.match(/^\+254[0-9]{9}$/)) {
      setError("Please enter a valid Kenyan phone number (+254XXXXXXXXX)");
      return false;
    }
    
    return true;
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!validateShippingDetails()) {
      return;
    }

    // Prepare order summary with shipping details
    const summary = {
      eventId: event._id,
      title: event.title,
      totalAmount: event.currentAmount,
      shippingAddress,
      paymentMethod: "already_paid", // For completed events
      products: event.products.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.product.price * item.quantity,
      })),
      estimatedDelivery: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
    };

    setOrderSummary(summary);
    setStep(2); // Move to confirmation step
    setCheckoutStep(3); // Update progress bar to Confirmation
  };

  const completeCheckout = async () => {
    try {
      setLoading(true);
      setError("");
      setCheckoutStep(4); // Move to Processing step
      setCheckoutStatus("processing");
      
      // Prevent double-submission
      if (completedCheckout) {
        console.log("Checkout already completed, preventing duplicate submission");
        return;
      }

      // Start timing the processing
      const startTime = Date.now();
      let processingTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setProcessingTime(elapsed);
      }, 1000);

      // Set a timeout to prevent infinite loading
      const checkoutTimeout = setTimeout(() => {
        if (loading) {
          setError("Checkout is taking longer than expected. Please check your orders page to verify completion.");
          setLoading(false);
          setCheckoutStatus("error");
          clearInterval(processingTimer);
        }
      }, 30000); // 30 second timeout

      console.log("Starting checkout process...");

      // Prepare checkout data
      const checkoutData = {
        eventId: event._id,
        shippingDetails: shippingAddress,
        paymentMethod: "already_paid",
      };

      // Call API to complete event and create order
      const response = await eventService.completeEventCheckout(checkoutData);

      // Clear the timeout and timer since we got a response
      clearTimeout(checkoutTimeout);
      clearInterval(processingTimer);

      if (response.success) {
        // Mark as completed to prevent duplicate submission
        setCompletedCheckout(true);
        setCheckoutStep(5); // Move to Complete step
        setCheckoutStatus("success");
        
        toast.success("Checkout completed successfully!");
        
        if (onComplete) {
          onComplete(response.data);
        }

        // Navigate to the appropriate page based on response - with a delay to show success state
        setTimeout(() => {
          if (response.data && response.data.order && response.data.order._id) {
            navigate(`/orders/${response.data.order._id}`, {
              state: { fromCheckout: true },
            });
          } else {
            navigate("/events/completed", { 
              state: { checkoutSuccess: true }
            });
          }
        }, 2000); // 2 second delay to show success state
      } else {
        throw new Error(response.message || "Failed to complete checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to process checkout";
      if (error.response?.status === 500) {
        errorMessage = "Server error during checkout. The process might still be completing in the background. Please check your completed events page.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setCheckoutStatus("error");
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setCheckoutStatus("initial");
    setError("");
    setProcessingTime(0);
  };

  const renderShippingStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Shipping & Contact Information</h3>
      <p className="text-sm text-gray-600">
        Please provide your shipping details where the products will be delivered.
      </p>

      <form onSubmit={handleShippingSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={shippingAddress.name}
            onChange={(e) =>
              setShippingAddress({ ...shippingAddress, name: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={shippingAddress.address}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                address: e.target.value,
              })
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={shippingAddress.city}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, city: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              County/State
            </label>
            <input
              type="text"
              value={shippingAddress.state}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  state: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              value={shippingAddress.postalCode}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  postalCode: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  country: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
              required
            >
              <option value="Kenya">Kenya</option>
              <option value="Uganda">Uganda</option>
              <option value="Tanzania">Tanzania</option>
              <option value="Rwanda">Rwanda</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={shippingAddress.phone}
            onChange={(e) =>
              setShippingAddress({ ...shippingAddress, phone: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
            placeholder="+254..."
            required
          />
          <p className="mt-1 text-xs text-gray-500">Format: +254XXXXXXXXX</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Notes (Optional)
          </label>
          <textarea
            value={shippingAddress.notes}
            onChange={(e) =>
              setShippingAddress({ ...shippingAddress, notes: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
            rows="3"
            placeholder="Special delivery instructions, landmarks, etc."
          />
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF] flex items-center"
          >
            Continue to Review <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </form>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-4">
        <div className="bg-green-100 rounded-full p-2">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-medium ml-3">Order Summary</h3>
      </div>

      {/* Show status indicator when processing or error */}
      {(checkoutStatus === "processing" || checkoutStatus === "error" || checkoutStatus === "success") && (
        <CheckoutStatusIndicator 
          status={checkoutStatus}
          processingTime={processingTime}
          error={error}
          onRetry={handleRetry}
        />
      )}

      {orderSummary && checkoutStatus === "initial" && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">{orderSummary.title}</h4>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Calendar className="w-4 h-4 mr-1 text-gray-500" />
              <span>Estimated Delivery: {orderSummary.estimatedDelivery}</span>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Products</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderSummary.products.map((product, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        {product.quantity}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                        {formatCurrency(product.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right"
                    >
                      Total
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-base font-bold text-right">
                      {formatCurrency(orderSummary.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Shipping Address</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{orderSummary.shippingAddress.name}</p>
                <p>{orderSummary.shippingAddress.address}</p>
                <p>
                  {orderSummary.shippingAddress.city}{orderSummary.shippingAddress.state ? `, ${orderSummary.shippingAddress.state}` : ''} 
                  {orderSummary.shippingAddress.postalCode ? ` ${orderSummary.shippingAddress.postalCode}` : ''}
                </p>
                <p>{orderSummary.shippingAddress.country}</p>
                <p>{orderSummary.shippingAddress.phone}</p>
                {orderSummary.shippingAddress.notes && (
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Notes:</span>{" "}
                    {orderSummary.shippingAddress.notes}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Payment Information</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  <div>
                    <p className="font-medium">Payment Already Completed</p>
                    <p className="text-sm text-gray-600">
                      All contributions have been collected for this event.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={loading || checkoutStatus !== "initial"}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Back to Shipping
            </button>
            <button
              type="button"
              onClick={completeCheckout}
              disabled={loading || completedCheckout || checkoutStatus !== "initial"}
              className="px-6 py-2 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF] disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <RefreshCw className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Processing...
                </span>
              ) : completedCheckout ? (
                <span className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Completed
                </span>
              ) : (
                <span className="flex items-center">
                  Complete Checkout <Check className="w-4 h-4 ml-2" />
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Steps Progress */}
      <div className="mb-8">
        <CheckoutProgressBar currentStep={checkoutStep} />
      </div>

      {/* Step Content */}
      {step === 1 ? renderShippingStep() : renderConfirmationStep()}
    </div>
  );
};

export default EventCheckout;