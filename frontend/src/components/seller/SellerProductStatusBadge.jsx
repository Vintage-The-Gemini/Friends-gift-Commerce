// frontend/src/components/seller/SellerProductStatusBadge.jsx

import React from "react";
import { Clock, CheckCircle, X, AlertTriangle } from "lucide-react";

/**
 * Component to display product approval status with appropriate styling
 */
const SellerProductStatusBadge = ({ product, showTooltip = false }) => {
  // Determine the approval status
  const { approvalStatus, isActive } = product;

  // Handle different status cases
  let statusConfig = {
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    icon: <AlertTriangle className="w-3.5 h-3.5 mr-1" />,
    label: "Unknown",
    tooltipText: "",
  };

  if (approvalStatus === "pending") {
    statusConfig = {
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      icon: <Clock className="w-3.5 h-3.5 mr-1" />,
      label: "Pending Approval",
      tooltipText: "Your product is waiting for admin approval.",
    };
  } else if (approvalStatus === "approved" && isActive) {
    statusConfig = {
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      icon: <CheckCircle className="w-3.5 h-3.5 mr-1" />,
      label: "Active",
      tooltipText: "Your product is approved and visible to customers.",
    };
  } else if (approvalStatus === "approved" && !isActive) {
    statusConfig = {
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      icon: <AlertTriangle className="w-3.5 h-3.5 mr-1" />,
      label: "Inactive",
      tooltipText:
        "Your product is approved but currently not visible to customers.",
    };
  } else if (approvalStatus === "rejected") {
    statusConfig = {
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      icon: <X className="w-3.5 h-3.5 mr-1" />,
      label: "Rejected",
      tooltipText:
        product.reviewNotes ||
        "Your product was rejected. You can edit and resubmit it.",
    };
  }

  // Resubmitted badge
  if (product.resubmitted) {
    statusConfig.label += " (Resubmitted)";
  }

  return (
    <div className="relative inline-block group">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
      >
        {statusConfig.icon}
        {statusConfig.label}
      </span>

      {/* Tooltip */}
      {showTooltip && statusConfig.tooltipText && (
        <div className="absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition bg-gray-800 text-white text-xs rounded py-1 px-2 -bottom-8 left-0 w-56">
          {statusConfig.tooltipText}
        </div>
      )}
    </div>
  );
};

export default SellerProductStatusBadge;
