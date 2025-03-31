import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Phone,
  CreditCard,
  AlertCircle,
  Check,
} from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const InitialContribution = ({
  eventData,
  onContributionComplete,
  onCancel,
}) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Calculate minimum required contribution (10% of target amount)
  const minimumAmount = eventData.targetAmount * 0.1;

  useEffect(() => {
    // Set initial amount to minimum required
    setAmount(minimumAmount.toFixed(0));
  }, [minimumAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!amount || isNaN(amount) || parseFloat(amount) < minimumAmount) {
        throw new Error(
          `Minimum contribution must be ${formatCurrency(minimumAmount)}`
        );
      }

      if (paymentMethod === "mpesa" && !phoneNumber.match(/^\+254[0-9]{9}$/)) {
        throw new Error("Please enter a valid Kenyan phone number (+254...)");
      }

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success message before continuing
      setShowSuccessMessage(true);

      // Wait a moment to show the success message
      setTimeout(() => {
        // Call the parent component callback with contribution data
        onContributionComplete({
          amount: parseFloat(amount),
          paymentMethod,
          phoneNumber,
        });
      }, 1500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (showSuccessMessage) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">
          Your contribution of {formatCurrency(parseFloat(amount))} has been
          received.
        </p>
        <p className="text-gray-600">Creating your event...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">
          Initial Contribution Required
        </h2>
        <div className="bg-blue-50 p-4 rounded-lg mb-4 text-blue-800">
          <div className="flex">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">
                Events require an initial contribution
              </p>
              <p className="text-sm mt-1">
                To activate your event, a minimum contribution of 10% (
                {formatCurrency(minimumAmount)}) is required. This helps ensure
                genuine events and shows your commitment.
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Event Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">{eventData.title}</h3>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Target Amount: {formatCurrency(eventData.targetAmount)}</span>
            <span>Min. Contribution: {formatCurrency(minimumAmount)}</span>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Contribution (KES)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
              placeholder="Enter amount"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Minimum contribution: {formatCurrency(minimumAmount)}
          </p>
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

        {/* Card Payment Fields */}
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

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#5551FF] text-white py-2 px-4 rounded-lg hover:bg-[#4440FF] disabled:opacity-50"
          >
            {loading ? "Processing..." : "Pay & Activate Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InitialContribution;
