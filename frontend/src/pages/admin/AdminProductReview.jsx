// frontend/src/pages/admin/AdminProductReview.jsx

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  Check,
  X,
  User,
  Store,
  Tag,
  DollarSign,
  Package,
  AlertCircle,
  Calendar,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import api from "../../services/api/axios.config";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/currency";

const AdminProductReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [marginPercentage, setMarginPercentage] = useState(0);
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  // Calculate price with margin when margin percentage changes
  useEffect(() => {
    if (product && marginPercentage) {
      setCalculatedPrice(calculatePriceWithMargin(product.price, marginPercentage));
    } else {
      setCalculatedPrice(null);
    }
  }, [marginPercentage, product]);

  const calculatePriceWithMargin = (basePrice, margin) => {
    const marginAmount = (basePrice * margin) / 100;
    return basePrice + marginAmount;
  };

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/admin/approvals/products/${id}`);

      if (response.data.success) {
        setProduct(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch product details"
        );
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      setError("Failed to load product details. Please try again.");
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setSubmitting(true);

      const response = await api.put(
        `/admin/approvals/products/${id}/approve`,
        {
          notes: approvalNotes || "Product approved by admin",
          marginPercentage: marginPercentage
        }
      );

      if (response.data.success) {
        toast.success("Product approved successfully");
        navigate("/admin/approvals");
      } else {
        throw new Error(response.data.message || "Failed to approve product");
      }
    } catch (error) {
      console.error("Error approving product:", error);
      toast.error(error.message || "Failed to approve product");
    } finally {
      setSubmitting(false);
      setShowApproveModal(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.put(`/admin/approvals/products/${id}/reject`, {
        reason: rejectionReason,
      });

      if (response.data.success) {
        toast.success("Product rejected successfully");
        navigate("/admin/approvals");
      } else {
        throw new Error(response.data.message || "Failed to reject product");
      }
    } catch (error) {
      console.error("Error rejecting product:", error);
      toast.error(error.message || "Failed to reject product");
    } finally {
      setSubmitting(false);
      setShowRejectModal(false);
    }
  };

  const nextImage = () => {
    if (product?.images && product.images.length > 0) {
      setActiveImageIndex((prevIndex) =>
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 0) {
      setActiveImageIndex((prevIndex) =>
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>

        <div className="mt-4">
          <Link
            to="/admin/approvals"
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Approval List
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Product not found or may have been already reviewed.</span>
        </div>

        <div className="mt-4">
          <Link
            to="/admin/approvals"
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Approval List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link
          to="/admin/approvals"
          className="text-gray-600 hover:text-gray-900 mr-4"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Product Review</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Product images */}
            <div className="md:w-1/2">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden h-80 flex items-center justify-center mb-4">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[activeImageIndex].url}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <Package className="h-20 w-20 text-gray-400" />
                )}

                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail navigation */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`cursor-pointer border-2 rounded w-16 h-16 flex-shrink-0 overflow-hidden ${
                        activeImageIndex === index
                          ? "border-blue-500"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product details */}
            <div className="md:w-1/2">
              <div className="flex flex-col space-y-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                  <div className="text-2xl font-bold text-blue-700 mb-4">
                    {formatCurrency(product.price)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                    <span>
                      Stock: <strong>{product.stock}</strong>
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Tag className="w-4 h-4 text-gray-500 mr-2" />
                    <span>
                      Category:{" "}
                      <strong>{product.category?.name || "Unknown"}</strong>
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <span>
                      Submitted:{" "}
                      <strong>
                        {new Date(product.createdAt).toLocaleDateString()}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 whitespace-pre-line">
                    {product.description}
                  </p>
                </div>

                {/* Product characteristics */}
                {product.characteristics &&
                  Object.keys(product.characteristics).length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-700 mb-2">
                        Characteristics
                      </h3>
                      <dl className="grid grid-cols-2 gap-3">
                        {Object.entries(product.characteristics).map(
                          ([key, value]) => (
                            <div key={key} className="col-span-1">
                              <dt className="text-sm font-medium text-gray-500">
                                {key.charAt(0).toUpperCase() +
                                  key.slice(1).replace(/_/g, " ")}
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {value.toString()}
                              </dd>
                            </div>
                          )
                        )}
                      </dl>
                    </div>
                  )}

                {/* Seller info */}
                <div className="pt-3 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Seller Information
                  </h3>
                  <div className="flex items-start">
                    <Store className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {product.seller?.businessName ||
                          product.seller?.name ||
                          "Unknown Seller"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.seller?.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approval/Rejection actions */}
        <div className="mt-6 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Review Decision</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowApproveModal(true)}
              disabled={submitting}
              className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center font-medium"
            >
              <Check className="w-5 h-5 mr-2" />
              Approve Product
            </button>

            <button
              onClick={() => setShowRejectModal(true)}
              disabled={submitting}
              className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center font-medium"
            >
              <X className="w-5 h-5 mr-2" />
              Reject Product
            </button>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Approve Product</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to approve "{product.name}"? This will make
              the product visible to all users.
            </p>

            {/* Margin Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margin Percentage (%)
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marginPercentage}
                  onChange={(e) => setMarginPercentage(parseFloat(e.target.value) || 0)}
                  className="w-1/3 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <span className="ml-2 text-gray-500">%</span>
              </div>
              
              {calculatedPrice !== null && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-600">Original Price: </span>
                  <span className="font-medium">{formatCurrency(product.price)}</span>
                  <span className="mx-2">→</span>
                  <span className="text-gray-600">Selling Price: </span>
                  <span className="font-medium text-green-600">{formatCurrency(calculatedPrice)}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    (+{formatCurrency(calculatedPrice - product.price)})
                  </span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approval Notes (Optional)
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows="3"
                placeholder="Add any notes for the seller (optional)"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Approve Product"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Reject Product</h2>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting "{product.name}". This will
              be shared with the seller.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="4"
                placeholder="Explain why this product is being rejected..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Reject Product"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductReview;