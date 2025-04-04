// src/components/events/ContributionModal.jsx
import React, { useState, useEffect } from "react";
import { DollarSign, X, CreditCard, Phone, Gift, Info, AlertCircle } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const ContributionModal = ({
  event,
  selectedProduct,
  onClose,
  onContribute,
}) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [showAmountWarning, setShowAmountWarning] = useState(false);

  useEffect(() => {
    // Calculate remaining amount needed for this event
    const remainingTotal = event.targetAmount - (event.currentAmount || 0);
    setRemainingAmount(Math.max(0, remainingTotal));

    // If it's a product-specific contribution, set a default amount
    if (selectedProduct) {
      // Calculate how much is needed for this specific product
      const productTotal = selectedProduct.product.price * selectedProduct.quantity;
      const suggestedAmount = Math.min(productTotal, remainingTotal);
      setAmount(suggestedAmount > 0 ? suggestedAmount : productTotal);
    } else {
      // For general event contribution, suggest the remaining amount if it's positive
      setAmount(remainingTotal > 0 ? remainingTotal : "");
    }
  }, [selectedProduct, event]);

  // Handle amount change with validation
  const handleAmountChange = (e) => {
    const newAmount = e.target.value;
    
    // Allow empty value for user to type
    if (newAmount === "") {
      setAmount("");
      setShowAmountWarning(false);
      return;
    }
    
    // Validate that it's a number
    if (isNaN(newAmount) || parseFloat(newAmount) <= 0) {
      return;
    }
    
    const numericAmount = parseFloat(newAmount);
    
    // Check if contribution would exceed target
    if (numericAmount > remainingAmount) {
      setShowAmountWarning(true);
      // Optionally limit to remaining amount
      setAmount(remainingAmount);
    } else {
      setShowAmountWarning(false);
      setAmount(numericAmount);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      // Warn if exceeding remaining amount needed
      if (parseFloat(amount) > remainingAmount) {
        const confirmOverpay = window.confirm(
          `The event only needs ${formatCurrency(remainingAmount)} more to reach its target. Do you want to contribute ${formatCurrency(amount)} anyway?`
        );
        
        if (!confirmOverpay) {
          setAmount(remainingAmount);
          setLoading(false);
          return;
        }
      }

      if (paymentMethod === "mpesa" && !phoneNumber.match(/^\+254[0-9]{9}$/)) {
        throw new Error("Please enter a valid Kenyan phone number (+254...)");
      }

      // Create the contribution data object
      const contributionData = {
        eventId: event._id,
        amount: parseFloat(amount),
        paymentMethod,
        phoneNumber,
        message,
        anonymous,
      };

      // If it's for a specific product, add the product info
      if (selectedProduct) {
        contributionData.productId = selectedProduct.product._id;
        contributionData.productQuantity = selectedProduct.quantity;
      }

      await onContribute(contributionData);
    } catch (err) {
      setError(err.message || "Failed to process contribution");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="p-6 pb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {selectedProduct
                ? `Contribute to ${selectedProduct.product.name}`
                : "Make a Contribution"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-6 flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Event Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">{event.title}</h3>
              {selectedProduct ? (
                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded bg-gray-200 overflow-hidden mr-2">
                      {selectedProduct.product.images &&
                      selectedProduct.product.images[0] ? (
                        <img
                          src={selectedProduct.product.images[0].url}
                          alt={selectedProduct.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Gift className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedProduct.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(selectedProduct.product.price)} ×{" "}
                        {selectedProduct.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Target: {formatCurrency(event.targetAmount)}</span>
                  <span>Raised: {formatCurrency(event.currentAmount || 0)}</span>
                </div>
              )}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-[#5551FF] h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      ((event.currentAmount || 0) / event.targetAmount) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Remaining Balance Info */}
            <div className={`p-3 rounded-lg ${remainingAmount > 0 ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
              <div className="flex items-start">
                <Info className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  {remainingAmount > 0 ? (
                    <>
                      <p className="font-medium">Balance Remaining</p>
                      <p className="text-sm">
                        This event needs {formatCurrency(remainingAmount)} more to reach its target.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">Target Reached</p>
                      <p className="text-sm">
                        This event has reached its funding target. Any additional contributions will help the event organizer.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contribution Amount (KES)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                  placeholder="Enter amount"
                  required
                />
              </div>
              {showAmountWarning && (
                <div className="mt-1 text-amber-600 flex items-center text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Only {formatCurrency(remainingAmount)} more is needed to reach the target.
                </div>
              )}
            </div>

            {/* Payment Method */}
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

            {/* Phone Number (for M-PESA) */}
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

            {/* Card Payment Fields (simple implementation) */}
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

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                rows="3"
                placeholder="Add a message..."
              />
            </div>

            {/* Anonymous Contribution */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="h-4 w-4 text-[#5551FF] focus:ring-[#5551FF] border-gray-300 rounded"
              />
              <label
                htmlFor="anonymous"
                className="ml-2 block text-sm text-gray-700"
              >
                Make my contribution anonymous
              </label>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="p-6 pt-4 border-t">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#5551FF] text-white py-3 rounded-lg hover:bg-[#4440FF] disabled:opacity-50"
          >
            {loading ? "Processing..." : "Contribute"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContributionModal;