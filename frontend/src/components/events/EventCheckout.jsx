import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Check,
  ArrowRight,
  Calendar,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { eventService } from '../../services/api/event';
import { toast } from 'react-toastify';
import CheckoutProgressBar from './CheckoutProgressBar';
import CheckoutStatusIndicator from './CheckoutStatusIndicator';

const EventCheckout = ({ event, onComplete, onCancel }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [checkoutStep, setCheckoutStep] = useState(2); // 1: Eligibility, 2: Shipping, 3: Confirmation, 4: Processing, 5: Complete
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
  const [processingTimer, setProcessingTimer] = useState(null);

  useEffect(() => {
    // Pre-fill shipping details if available
    if (event?.creator?.name) {
      setShippingAddress((prev) => ({
        ...prev,
        name: event.creator.name,
        phone: event.creator.phoneNumber || "",
      }));
    }
    
    // Cleanup function to clear any interval on unmount
    return () => {
      if (processingTimer) {
        clearInterval(processingTimer);
      }
    };
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
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setProcessingTime(elapsed);
      }, 1000);
      setProcessingTimer(timer);
  
      console.log("Starting checkout process...");
  
      // Prepare checkout data
      const checkoutData = {
        eventId: event._id,
        shippingDetails: shippingAddress,
        paymentMethod: "already_paid",
      };
  
      // Call the actual API
      const response = await eventService.completeEventCheckout(checkoutData);
  
      // Clear the timer
      clearInterval(timer);
      setProcessingTimer(null);
      
      // Mark as completed to prevent duplicate submission
      setCompletedCheckout(true);
      setCheckoutStep(5); // Move to Complete step
      setCheckoutStatus("success");
      
      // Wait a moment for the UI to show success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call the onComplete callback with proper navigation data
      if (onComplete) {
        // Instead of using the response data which might contain an invalid order ID
        // We'll indicate that checkout was successful and let the parent handle navigation
        onComplete({ success: true });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError(error.message || "Failed to process checkout");
      setCheckoutStatus("error");
      
      // Clear timer if it exists
      if (processingTimer) {
        clearInterval(processingTimer);
        setProcessingTimer(null);
      }
    } finally {
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

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

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
      {/* Checkout Status Indicator */}
      {checkoutStatus === "processing" && (
        <CheckoutStatusIndicator 
          status="processing" 
          processingTime={processingTime}
        />
      )}

      {checkoutStatus === "error" && (
        <CheckoutStatusIndicator 
          status="error" 
          error={error}
          onRetry={handleRetry}
        />
      )}

      {checkoutStatus === "success" && (
        <CheckoutStatusIndicator status="success" />
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
                  {orderSummary.shippingAddress.city}
                  {orderSummary.shippingAddress.state && `, ${orderSummary.shippingAddress.state}`}
                  {orderSummary.shippingAddress.postalCode && ` ${orderSummary.shippingAddress.postalCode}`}
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
                  <Check className="w-5 h-5 mr-2 text-green-600" />
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
    <div className="bg-white rounded-lg shadow-sm p-6">
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