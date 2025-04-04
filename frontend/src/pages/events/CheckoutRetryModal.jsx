// File: frontend/src/components/events/CheckoutRetryModal.jsx
import React, { useState } from "react";
import { X, AlertCircle, RefreshCw } from "lucide-react";
import { eventService } from "../../services/api/event";
import { toast } from "react-toastify";

const CheckoutRetryModal = ({ event, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRetryCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check eligibility first
      const eligibilityResponse = await eventService.getEventCheckoutEligibility(event._id);
      
      if (!eligibilityResponse.success || !eligibilityResponse.data.isEligible) {
        throw new Error(
          eligibilityResponse.message || 
          "This event is not eligible for checkout at this time."
        );
      }

      // Use the existing shipping details if available in the event
      const shippingDetails = event.shippingDetails || {
        name: event.creator?.name || "",
        address: "",
        city: "",
        postalCode: "",
        country: "Kenya",
        phone: event.creator?.phoneNumber || "",
      };

      // Attempt checkout
      const response = await eventService.completeEventCheckout({
        eventId: event._id,
        shippingDetails,
        paymentMethod: "already_paid"
      });

      if (response.success) {
        toast.success("Checkout completed successfully!");
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        throw new Error(response.message || "Failed to complete checkout");
      }
    } catch (error) {
      console.error("Retry checkout error:", error);
      setError(error.message || "Failed to process checkout");
      toast.error(error.message || "Failed to process checkout");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">Retry Event Checkout</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          <p className="mb-4">
            You are about to retry the checkout process for <span className="font-medium">{event.title}</span>. 
            This will attempt to complete the event and create orders for all selected products.
          </p>
          
          <div className="bg-yellow-50 p-3 rounded-lg mb-4">
            <p className="text-yellow-700 text-sm">
              Note: If the event has already been checked out, this may create duplicate orders. 
              Please check your orders page before proceeding.
            </p>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRetryCheckout}
              disabled={loading}
              className="px-6 py-2 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF] disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Checkout
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutRetryModal;