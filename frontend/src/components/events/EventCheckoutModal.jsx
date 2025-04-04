// src/components/events/EventCheckoutModal.jsx
import React, { useState, useEffect } from "react";
import { X, ArrowRight, AlertCircle, Check, ShoppingBag } from "lucide-react";
import { eventService } from "../../services/api/event";
import EventCheckout from "./EventCheckout";
import { formatCurrency } from "../../utils/currency";

const EventCheckoutModal = ({ event, isOpen, onClose, onCheckoutComplete }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [eligibility, setEligibility] = useState(null);

  useEffect(() => {
    // Reset state when modal is opened/closed
    if (isOpen && event) {
      setLoading(true);
      setError(null);
      setShowCheckout(false);
      checkEligibility();
    }
  }, [isOpen, event]);

  const checkEligibility = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Checking eligibility for event:", event?._id);

      const response = await eventService.getEventCheckoutEligibility(event._id);
      console.log("Eligibility response:", response);

      if (response.success) {
        setEligibility(response.data);
      } else {
        throw new Error(response.message || "Failed to check eligibility");
      }
    } catch (error) {
      console.error("Eligibility check error:", error);
      setError(error.message || "Failed to check eligibility");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    setShowCheckout(true);
  };

  const handleCheckoutComplete = (data) => {
    // This function passes the checkout data to the parent component
    if (onCheckoutComplete) {
      onCheckoutComplete(data);
    }
  };

  const handleClose = () => {
    // Proper cleanup before closing
    setShowCheckout(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold flex items-center">
            {showCheckout ? (
              <>
                <ShoppingBag className="w-6 h-6 mr-2 text-[#5551FF]" />
                Complete Event Checkout
              </>
            ) : (
              <>
                <ShoppingBag className="w-6 h-6 mr-2 text-[#5551FF]" />
                Event Checkout
              </>
            )}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5551FF]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Could not process checkout</p>
                <p>{error}</p>
              </div>
            </div>
          ) : showCheckout ? (
            <EventCheckout
              event={event}
              onComplete={handleCheckoutComplete}
              onCancel={() => setShowCheckout(false)}
            />
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-2">{event.title}</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Event Status: </span>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      event.status === "active"
                        ? "bg-green-100 text-green-800"
                        : event.status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {event.status.charAt(0).toUpperCase() +
                      event.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Eligibility Details */}
              {eligibility && (
                <div className="space-y-4">
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Funding Progress</span>
                      <span className="font-medium">
                        {Math.round(eligibility.progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          eligibility.funding === "complete"
                            ? "bg-green-600"
                            : eligibility.funding === "partial"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.min(eligibility.progress, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-600">
                      <span>
                        Raised: {formatCurrency(eligibility.currentAmount)}
                      </span>
                      <span>
                        Goal: {formatCurrency(eligibility.targetAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout eligibility status */}
                  <div
                    className={`p-4 rounded-lg ${
                      eligibility.isEligible
                        ? "bg-green-50 border border-green-100"
                        : "bg-yellow-50 border border-yellow-100"
                    }`}
                  >
                    <div className="flex items-start">
                      {eligibility.isEligible ? (
                        <Check className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">
                          {eligibility.isEligible
                            ? "This event is ready for checkout!"
                            : "This event is not yet eligible for checkout."}
                        </p>
                        <p className="text-sm mt-1">
                          {eligibility.isEligible
                            ? "You can now proceed to checkout and place orders for all products selected for this event."
                            : eligibility.funding === "insufficient"
                            ? "The event needs to reach at least 80% of its funding goal or the end date to be eligible for checkout."
                            : !eligibility.hasContributions
                            ? "The event needs to have at least one contribution to proceed to checkout."
                            : !eligibility.productsAvailable
                            ? "Some products are no longer available in the requested quantity."
                            : "You can't checkout this event at the moment."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Unavailable products warning */}
                  {eligibility.unavailableProducts &&
                    eligibility.unavailableProducts.length > 0 && (
                      <div className="bg-red-50 p-4 border border-red-100 rounded-lg">
                        <p className="font-medium text-red-800 mb-2">
                          The following products are unavailable or out of
                          stock:
                        </p>
                        <ul className="text-sm text-red-700 space-y-1">
                          {eligibility.unavailableProducts.map(
                            (product, index) => (
                              <li key={index} className="flex justify-between">
                                <span>{product.name}</span>
                                <span>
                                  Requested: {product.requested}, Available:{" "}
                                  {product.available}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                    
                  {/* Force checkout for testing */}
                  {!eligibility.isEligible && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <p className="font-medium text-blue-700 mb-1">Developer Testing Mode</p>
                      <p className="text-sm text-blue-600 mb-2">
                        This event doesn't meet regular checkout criteria, but you can force checkout for testing purposes.
                      </p>
                      <button
                        onClick={() => {
                          // Override eligibility for testing
                          setEligibility({...eligibility, isEligible: true});
                        }}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Force Eligibility For Testing
                      </button>
                    </div>
                  )}

                  {/* Checkout summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Checkout Summary</h4>
                    <ul className="space-y-2">
                      <li className="flex justify-between text-sm">
                        <span>Funding Status:</span>
                        <span
                          className={`font-medium ${
                            eligibility.funding === "complete"
                              ? "text-green-600"
                              : eligibility.funding === "partial"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {eligibility.funding === "complete"
                            ? "Fully Funded"
                            : eligibility.funding === "partial"
                            ? "Partially Funded (≥80%)"
                            : "Insufficient Funds"}
                        </span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Total Amount Collected:</span>
                        <span className="font-medium">
                          {formatCurrency(eligibility.currentAmount)}
                        </span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Sellers involved:</span>
                        <span className="font-medium">
                          {eligibility.sellers}
                        </span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Products available:</span>
                        <span
                          className={`font-medium ${
                            eligibility.productsAvailable
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {eligibility.productsAvailable ? "Yes" : "No"}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-between pt-4">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProceedToCheckout}
                      disabled={!eligibility.isEligible}
                      className={`px-6 py-2 rounded-lg flex items-center ${
                        eligibility.isEligible
                          ? "bg-[#5551FF] text-white hover:bg-[#4440FF]"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Proceed to Checkout{" "}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCheckoutModal;