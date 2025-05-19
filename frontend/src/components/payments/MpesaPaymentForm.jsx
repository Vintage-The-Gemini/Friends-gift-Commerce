// src/components/payments/MpesaPaymentForm.jsx
import React, { useState, useEffect } from "react";
import { Phone, AlertCircle, Check, X, Clock } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { contributionService } from "../../services/api/contribution";
import { toast } from "react-toastify";

const MpesaPaymentForm = ({
  amount,
  eventId,
  onSuccess,
  onCancel,
  message = "",
  anonymous = false,
  productId = null,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState("input"); // input, processing, success, failed
  const [contribution, setContribution] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes for payment processing

  // Format the phone number as the user types
  const handlePhoneInput = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    
    // Always start with +254
    if (!input.startsWith("254")) {
      // Remove leading 0 if present
      if (input.startsWith("0")) {
        input = input.substring(1);
      }
      input = "254" + input;
    }
    
    setPhoneNumber("+" + input);
  };

  // Check if phone number is valid
  const isValidPhone = (phone) => {
    return phone.match(/^\+254[0-9]{9}$/);
  };
  
  // Start countdown timer when processing
  useEffect(() => {
    let interval;
    
    if (stage === "processing" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && stage === "processing") {
      // Time expired but allow user to keep checking
      setStage("expired");
    }
    
    return () => clearInterval(interval);
  }, [stage, timeLeft]);
  
  // Format the time remaining
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle submission of payment form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!isValidPhone(phoneNumber)) {
      setError("Please enter a valid Kenyan phone number (+254...)");
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare contribution data
      const contributionData = {
        eventId,
        amount: parseFloat(amount),
        paymentMethod: "mpesa",
        phoneNumber,
        message,
        anonymous,
      };
      
      // Add product ID if available
      if (productId) {
        contributionData.productId = productId;
      }
      
      // Make the API call
      const response = await contributionService.createContribution(contributionData);
      
      if (response.success) {
        setContribution(response.data.contribution);
        setStage("processing");
        
        // If using real M-PESA, show different message
        if (response.data.payment.usingRealMpesa) {
          toast.info("M-PESA payment request sent to your phone. Please check your phone to complete the payment.");
        } else {
          toast.info("Processing payment simulation. This will take a few seconds.");
        }
        
        // Start polling for payment status
        pollPaymentStatus(response.data.contribution._id);
      } else {
        throw new Error(response.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("M-PESA payment error:", error);
      setError(error.message || "Failed to process payment request");
      setStage("failed");
    } finally {
      setLoading(false);
    }
  };
  
  // Poll for payment status updates
  const pollPaymentStatus = async (contributionId) => {
    if (!contributionId) return;
    
    try {
      // Set up polling interval (every 3 seconds)
      const pollInterval = setInterval(async () => {
        try {
          // Stop polling if no longer in processing stage
          if (stage !== "processing" && stage !== "expired") {
            clearInterval(pollInterval);
            return;
          }
          
          // Check contribution status
          const response = await contributionService.getContribution(contributionId);
          
          if (response.success) {
            const status = response.data.paymentStatus;
            
            if (status === "completed") {
              // Payment success
              clearInterval(pollInterval);
              setStage("success");
              if (onSuccess) onSuccess(response.data);
            } else if (status === "failed") {
              // Payment failed
              clearInterval(pollInterval);
              setStage("failed");
              setError("Payment failed. Please try again.");
            }
          }
        } catch (error) {
          console.error("Error polling payment status:", error);
        }
      }, 3000);
      
      // Clear interval after 2 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 120000);
    } catch (error) {
      console.error("Error setting up polling:", error);
    }
  };
  
  // Manual check for payment status
  const checkPaymentStatus = async () => {
    if (!contribution) return;
    
    setLoading(true);
    try {
      const response = await contributionService.getContribution(contribution._id);
      
      if (response.success) {
        const status = response.data.paymentStatus;
        
        if (status === "completed") {
          setStage("success");
          if (onSuccess) onSuccess(response.data);
          toast.success("Payment confirmed!");
        } else if (status === "failed") {
          setStage("failed");
          setError("Payment failed. Please try again.");
        } else {
          // Still processing
          toast.info("Payment is still processing. Please wait or check again later.");
        }
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      toast.error("Failed to check payment status");
    } finally {
      setLoading(false);
    }
  };

  // Render different stages
  const renderContent = () => {
    switch (stage) {
      case "success":
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-6">
              Your contribution of {formatCurrency(amount)} has been received.
            </p>
            <button 
              onClick={() => onSuccess && onSuccess(contribution)}
              className="bg-[#5551FF] text-white py-2 px-4 rounded-lg hover:bg-[#4440FF]"
            >
              Continue
            </button>
          </div>
        );
        
      case "processing":
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Processing Payment</h3>
            <p className="text-gray-600 mb-4">
              Please complete the payment on your phone.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                <span className="font-medium">Time remaining: {formatTime(timeLeft)}</span>
              </div>
              <p className="text-sm text-blue-700">
                If you've already completed the payment, you can check the status below.
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={checkPaymentStatus}
                disabled={loading}
                className="bg-[#5551FF] text-white py-2 px-4 rounded-lg hover:bg-[#4440FF] disabled:opacity-50"
              >
                {loading ? "Checking..." : "Check Status"}
              </button>
              <button
                onClick={onCancel}
                className="border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        );
        
      case "expired":
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Payment Status Unknown</h3>
            <p className="text-gray-600 mb-4">
              We haven't received confirmation of your payment yet.
            </p>
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-700">
                If you've completed the payment, please check the status below.
                If you haven't made the payment yet, please try again.
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={checkPaymentStatus}
                disabled={loading}
                className="bg-[#5551FF] text-white py-2 px-4 rounded-lg hover:bg-[#4440FF] disabled:opacity-50"
              >
                {loading ? "Checking..." : "Check Status"}
              </button>
              <button
                onClick={() => setStage("input")}
                className="border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Try Again
              </button>
            </div>
          </div>
        );
        
      case "failed":
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Payment Failed</h3>
            <p className="text-red-600 mb-6">
              {error || "There was an error processing your payment"}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setStage("input")}
                className="bg-[#5551FF] text-white py-2 px-4 rounded-lg hover:bg-[#4440FF]"
              >
                Try Again
              </button>
              <button
                onClick={onCancel}
                className="border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        );
        
      case "input":
      default:
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                M-PESA Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneInput}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF] ${
                    error ? "border-red-500" : ""
                  }`}
                  placeholder="+254..."
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter phone number in format: +254XXXXXXXXX
              </p>
            </div>
            
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium">{formatCurrency(amount)}</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isValidPhone(phoneNumber)}
                className="flex-1 bg-[#5551FF] text-white py-2 px-4 rounded-lg hover:bg-[#4440FF] disabled:opacity-50"
              >
                {loading ? "Processing..." : "Pay with M-PESA"}
              </button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">M-PESA Payment</h3>
      {renderContent()}
    </div>
  );
};

export default MpesaPaymentForm;