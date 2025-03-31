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
  const [step, setStep] = useState(1);
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
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
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

  const handleShippingSubmit = (e) => {
    e.preventDefault();

    // Validate shipping details
    if (!shippingAddress.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!shippingAddress.address.trim()) {
      setError("Address is required");
      return;
    }
    if (!shippingAddress.city.trim()) {
      setError("City is required");
      return;
    }
    if (!shippingAddress.phone.trim()) {
      setError("Phone number is required");
      return;
    }

    // Clear errors and proceed to payment step
    setError("");
    setStep(2);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();

    // Validate payment details
    if (paymentMethod === "mpesa" && !phoneNumber.match(/^\+254[0-9]{9}$/)) {
      setError("Please enter a valid Kenyan phone number (+254XXXXXXXXX)");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the terms and conditions");
      return;
    }

    // Clear errors and proceed to confirmation step
    setError("");
    setStep(3);

    // Generate order summary
    const summary = {
      eventId: event._id,
      title: event.title,
      totalAmount: event.currentAmount,
      shippingAddress,
      paymentMethod,
      phoneNumber: paymentMethod === "mpesa" ? phoneNumber : "",
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
  };

  const completeCheckout = async () => {
    try {
      setLoading(true);

      // Prepare checkout data
      const checkoutData = {
        eventId: event._id,
        shippingDetails: shippingAddress,
        paymentMethod,
        phoneNumber: paymentMethod === "mpesa" ? phoneNumber : null,
      };

      // Call API to complete event and create order
      const response = await eventService.completeEventCheckout(checkoutData);

      if (response.success) {
        toast.success("Event completed successfully!");

        // Update event status to completed if not already
        if (event.status !== "completed") {
          await eventService.updateEventStatus(event._id, "completed");
        }

        // Call onComplete callback if provided
        if (onComplete) {
          onComplete(response.data);
        }

        // Navigate to order confirmation page
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
      setStep(2); // Go back to payment step on error
    } finally {
      setLoading(false);
    }
  };

  const renderShippingStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Shipping Details</h3>

      <form onSubmit={handleShippingSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
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
            Address
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
              City
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
              Country
            </label>
            <input
              type="text"
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  country: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
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
            Continue to Payment <ArrowRight className="w-4 h-4 ml-2 inline" />
          </button>
        </div>
      </form>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Payment Details</h3>

      <form onSubmit={handlePaymentSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod("mpesa")}
              className={`flex items-center justify-center p-3 border rounded-lg ${
                paymentMethod === "mpesa"
                  ? "border-[#5551FF] bg-[#5551FF]/10 text-[#5551FF]"
                  : "hover:border-gray-300"
              }`}
            >
              <Phone className="w-5 h-5 mr-2" />
              M-PESA
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`flex items-center justify-center p-3 border rounded-lg ${
                paymentMethod === "card"
                  ? "border-[#5551FF] bg-[#5551FF]/10 text-[#5551FF]"
                  : "hover:border-gray-300"
              }`}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Card
            </button>
          </div>
        </div>

        {paymentMethod === "mpesa" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              M-PESA Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
              placeholder="+254..."
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter phone number in format: +254XXXXXXXXX
            </p>
          </div>
        )}

        {paymentMethod === "card" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                placeholder="XXXX XXXX XXXX XXXX"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVC
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                  placeholder="123"
                  required
                />
              </div>
            </div>
          </div>
        )}

        <div className="pt-4">
          <div className="flex items-center mb-4">
            <input
              id="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="h-4 w-4 text-[#5551FF] focus:ring-[#5551FF] border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              I accept the{" "}
              <a href="/terms" className="text-[#5551FF] hover:text-[#4440FF]">
                terms and conditions
              </a>
            </label>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF]"
          >
            Review Order <ArrowRight className="w-4 h-4 ml-2 inline" />
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
                <p className="font-medium">
                  {orderSummary.shippingAddress.name}
                </p>
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
              <h4 className="font-medium mb-2">Payment Method</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  {orderSummary.paymentMethod === "mpesa" ? (
                    <>
                      <Phone className="w-5 h-5 mr-2 text-green-600" />
                      <div>
                        <p className="font-medium">M-PESA</p>
                        <p className="text-sm">{orderSummary.phoneNumber}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                      <div>
                        <p className="font-medium">Card Payment</p>
                        <p className="text-sm">**** **** **** 1234</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back
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

          <div className="flex items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step > 2
                  ? "bg-green-500"
                  : step === 2
                  ? "bg-[#5551FF]"
                  : "bg-gray-200"
              } text-white`}
            >
              2
            </div>
            <span
              className={`ml-2 ${
                step === 2 ? "text-[#5551FF] font-medium" : "text-gray-500"
              }`}
            >
              Payment
            </span>
            <div className="flex-1 h-1 mx-2 bg-gray-200">
              <div
                className={`h-full bg-[#5551FF] transition-all duration-300`}
                style={{
                  width: step > 2 ? "100%" : "0%",
                }}
              />
            </div>
          </div>

          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 3 ? "bg-[#5551FF]" : "bg-gray-200"
              } text-white`}
            >
              3
            </div>
            <span
              className={`ml-2 ${
                step === 3 ? "text-[#5551FF] font-medium" : "text-gray-500"
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
      {step === 1 && renderShippingStep()}
      {step === 2 && renderPaymentStep()}
      {step === 3 && renderConfirmationStep()}
    </div>
  );
};

export default EventCheckout;
