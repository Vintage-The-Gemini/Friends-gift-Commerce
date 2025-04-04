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
} from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { eventService } from "../../services/api/event";
import { toast } from "react-toastify";

const EventCheckout = ({ event, onComplete, onCancel }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Start with shipping info step
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

      // Prepare checkout data
      const checkoutData = {
        eventId: event._id,
        shippingDetails: shippingAddress,
        paymentMethod: "already_paid",
      };

      // Call API to complete event and create order
      const response = await eventService.completeEventCheckout(checkoutData);

      if (response.success) {
        toast.success("Checkout completed successfully!");
        
        if (onComplete) {
          onComplete(response.data);
        }

        navigate(`/orders/${response.data.order._id}`, {
          state: { fromCheckout: true },
        });
      } else {
        throw new Error(response.message || "Failed to complete checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError(error.message || "Failed to process checkout");
      toast.error(error.message || "Failed to process checkout");
    } finally {
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
                  {orderSummary.shippingAddress.city},{" "}
                  {orderSummary.shippingAddress.state}{" "}
                  {orderSummary.shippingAddress.postalCode}
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
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back to Shipping
            </button>
            <button
              type="button"
              onClick={completeCheckout}
              disabled={loading}
              className="px-6 py-2 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF] disabled:opacity-50 flex items-center"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  Complete Checkout <Check className="w-4 h-4 ml-2" />
                </>
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

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
          <X className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Step Content */}
      {step === 1 ? renderShippingStep() : renderConfirmationStep()}
    </div>
  );
};

export default EventCheckout;