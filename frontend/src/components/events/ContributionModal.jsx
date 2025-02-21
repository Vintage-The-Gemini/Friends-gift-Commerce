import React, { useState } from "react";
import { DollarSign, X, CreditCard, Phone } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const ContributionModal = ({ event, onClose, onContribute }) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      await onContribute({
        amount: parseFloat(amount),
        paymentMethod,
        message,
        eventId: event._id,
      });

      onClose();
    } catch (err) {
      setError(err.message || "Failed to process contribution");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Make a Contribution</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                placeholder="Enter amount"
                required
              />
            </div>
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

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5551FF] text-white py-3 rounded-lg hover:bg-[#4440FF] disabled:opacity-50"
          >
            {loading ? "Processing..." : "Contribute"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContributionModal;
