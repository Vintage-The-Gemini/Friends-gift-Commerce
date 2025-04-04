// src/components/events/EventCheckout.jsx
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
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { eventService } from "../../services/api/event";
import { toast } from "react-toastify";

const EventCheckout = ({ event, onComplete, onCancel }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Start with shipping info step
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completedCheckout, setCompletedCheckout] = useState(false);
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
      }));
    }
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
  };

  const completeCheckout = async () => {
    try {
      setLoading(true);
      setError("");

      // Prevent double-submission
      if (completedCheckout) {
        console.log("Checkout already completed, preventing duplicate submission");
        return;
      }

      console.log("Starting checkout process...");

      // Prepare checkout data
      const checkoutData = {
        eventId: event._id,
        shippingDetails: shippingAddress,
        paymentMethod: "already_paid",
      };

      console.log("Submitting checkout data:", JSON.stringify(checkoutData));

      // Call API to complete event and create order
      const response = await eventService.completeEventCheckout(checkoutData);
      console.log("Checkout response received:", response);

      if (response.success) {
        console.log("Checkout successful!");
        // Mark as completed to prevent duplicate submission
        setCompletedCheckout(true);
        
        toast.success("Checkout completed successfully!");
        
        if (onComplete) {
          console.log("Calling onComplete callback with data:", response.data);
          onComplete(response.data);
        }

        if (response.data && response.data.order && response.data.order._id) {
          navigate(`/orders/${response.data.order._id}`, {
            state: { fromCheckout: true },
          });
        } else {
          // Fallback if order ID is not available
          navigate("/dashboard", { 
            state: { checkoutSuccess: true }
          });
        }
      } else {
        throw new Error(response.message || "Failed to complete checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError(error.message || "Failed to process checkout");
      toast.error(error.message || "Failed to process checkout");
      setLoading(false);
    }
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
            className="px-6 py-2 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF]"
          >
            Continue to Review <ArrowRight className="w-4 h-4 ml-2 inline" />
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

      {error && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-700">Checkout Error</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {orderSummary && (
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
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Back to Shipping
            </button>
            <button
              type="button"
              onClick={completeCheckout}
              disabled={loading || completedCheckout}
              className="px-6 py-2 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF] disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
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
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step > 1 ? "bg-green-500" : "bg-[#5551FF]"
              } text-white`}
            >
              1
            </div>
            <span
              className={`ml-2 ${
                step === 1 ? "text-[#5551FF] font-medium" : "text-gray-500"
              }`}
            >
              Shipping
            </span>
            <div className="flex-1 h-1 mx-2 bg-gray-200">
              <div
                className={`h-full bg-[#5551FF] transition-all duration-300`}
                style={{
                  width: step > 1 ? "100%" : "0%",
                }}
              />
            </div>
          </div>

          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 2 ? "bg-[#5551FF]" : "bg-gray-200"
              } text-white`}
            >
              2
            </div>
            <span
              className={`ml-2 ${
                step === 2 ? "text-[#5551FF] font-medium" : "text-gray-500"
              }`}
            >
              Confirm
            </span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      {step === 1 ? renderShippingStep() : renderConfirmationStep()}
    </div>
  );
};

export default EventCheckout;