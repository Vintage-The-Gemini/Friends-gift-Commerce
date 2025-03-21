// frontend/src/components/seller/ProductRejectionDetails.jsx

import React from "react";
import { AlertCircle, Calendar, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Component to display product rejection details to sellers
 */
const ProductRejectionDetails = ({ product, onResubmit }) => {
  // If product is not rejected, don't show this component
  if (!product || product.approvalStatus !== "rejected") {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-red-800">Product Rejected</h3>

          <div className="mt-3 text-red-700">
            <div className="font-medium mb-2">Reason for rejection:</div>
            <div className="p-3 bg-white bg-opacity-50 rounded border border-red-200 text-red-800">
              {product.reviewNotes || "No specific reason provided"}
            </div>
          </div>

          <div className="mt-3 text-sm text-red-700 space-y-1">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                Rejected on: {new Date(product.reviewedAt).toLocaleDateString()}{" "}
                at {new Date(product.reviewedAt).toLocaleTimeString()}
              </span>
            </div>

            {product.resubmissionCount > 0 && (
              <div className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                <span>
                  You've resubmitted this product {product.resubmissionCount}{" "}
                  {product.resubmissionCount === 1 ? "time" : "times"}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to={`/seller/products/edit/${product._id}?resubmit=true`}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Edit & Resubmit
            </Link>

            {onResubmit && (
              <button
                onClick={() => onResubmit(product._id)}
                className="px-4 py-2 border border-red-600 text-red-700 rounded-lg hover:bg-red-50"
              >
                Resubmit Without Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductRejectionDetails;
