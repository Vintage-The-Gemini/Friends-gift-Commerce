// frontend/src/pages/admin/AdminProductReview.jsx
import React, { useState, useEffect } from "react";
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
  Clock,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Calendar,
  Info,
  ExternalLink,
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
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showPreviousVersion, setShowPreviousVersion] = useState(false);
  const [previousVersion, setPreviousVersion] = useState(null);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/admin/approvals/products/${id}`);

      if (response.data.success) {
        setProduct(response.data.data);

        // If product was resubmitted and has previous versions, set the most recent one
        if (
          response.data.data.resubmitted &&
          response.data.data.previousVersions &&
          response.data.data.previousVersions.length > 0
        ) {
          setPreviousVersion(
            response.data.data.previousVersions[
              response.data.data.previousVersions.length - 1
            ]
          );
        }
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
          notes: "Product approved by admin",
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
    if (product.images && product.images.length > 0) {
      setActiveImageIndex((prevIndex) =>
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 0) {
      setActiveImageIndex((prevIndex) =>
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Toggle between current and previous version
  const toggleVersionView = () => {
    setShowPreviousVersion(!showPreviousVersion);
  };

  // Render loading spinner
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Render error message
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

  // If product is not found
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

  // Function to render product details (either current or previous version)
  const renderProductDetails = (productData, isPrevious = false) => {
    const images = productData.images || [];

    return (
      <div className="bg-white rounded-lg shadow">
        {isPrevious && (
          <div className="bg-yellow-50 p-3 text-yellow-800 border-b border-yellow-100 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            You're viewing the previous version of this product that was
            rejected.
          </div>
        )}

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left column with image */}
            <div className="md:w-1/2">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden h-80 flex items-center justify-center mb-4">
                {images.length > 0 ? (
                  <img
                    src={
                      !isPrevious
                        ? images[activeImageIndex].url
                        : images[0] && typeof images[0] === "object"
                        ? images[0].url
                        : images[0]
                    }
                    alt={productData.name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <Package className="h-20 w-20 text-gray-400" />
                )}

                {images.length > 1 && !isPrevious && (
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
              {images.length > 1 && !isPrevious && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
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

            {/* Right column with details */}
            <div className="md:w-1/2">
              <h1 className="text-2xl font-bold mb-2">{productData.name}</h1>

              <div className="text-2xl font-bold text-blue-700 mb-4">
                {formatCurrency(productData.price)}
              </div>

              <div className="space-y-4">
                <div className="flex gap-x-8 gap-y-2 flex-wrap">
                  <div className="flex items-center">
                    <ShoppingBag className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-sm">
                      Stock: <strong>{productData.stock}</strong>
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Tag className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-sm">
                      Category:{" "}
                      <strong>{productData.category?.name || "Unknown"}</strong>
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 whitespace-pre-line">
                    {productData.description}
                  </p>
                </div>

                {/* Product characteristics */}
                {productData.characteristics &&
                  Object.keys(productData.characteristics).length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-700 mb-2">
                        Characteristics
                      </h3>
                      <dl className="grid grid-cols-2 gap-3">
                        {Object.entries(productData.characteristics).map(
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
                        {productData.seller?.businessName ||
                          productData.seller?.name ||
                          "Unknown Seller"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {productData.seller?.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submission info */}
                <div className="pt-3 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Submission Information
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                      <span>
                        Submitted:{" "}
                        {new Date(productData.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {isPrevious && productData.rejectedAt && (
                      <div className="flex items-center">
                        <X className="w-4 h-4 text-red-500 mr-2" />
                        <span>
                          Rejected:{" "}
                          {new Date(productData.rejectedAt).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {isPrevious && productData.rejectionReason && (
                      <div className="mt-2 bg-red-50 p-3 rounded text-red-800 text-sm">
                        <p className="font-medium mb-1">Rejection Reason:</p>
                        <p>{productData.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header with back button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link
            to="/admin/approvals"
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Product Review</h1>
        </div>

        <div className="flex items-center space-x-3">
          {product.resubmitted && previousVersion && (
            <button
              onClick={toggleVersionView}
              className={`px-3 py-1 text-sm rounded-md ${
                showPreviousVersion
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {showPreviousVersion
                ? "Show Current Version"
                : "Show Previous Version"}
            </button>
          )}
        </div>
      </div>

      {product.resubmitted && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg flex items-center mb-6">
          <Info className="w-5 h-5 mr-2" />
          <div>
            <p className="font-medium">This is a resubmitted product</p>
            <p className="text-sm mt-1">
              This product has been previously rejected and resubmitted by the
              seller
              {product.resubmissionCount > 1 &&
                ` ${product.resubmissionCount} times`}
              .
            </p>
          </div>
        </div>
      )}

      {/* Product details */}
      {showPreviousVersion && previousVersion
        ? renderProductDetails(previousVersion, true)
        : renderProductDetails(product, false)}

      {/* Approval/Rejection actions */}
      {!showPreviousVersion && (
        <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Review Decision</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleApprove}
              disabled={submitting}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
            >
              {submitting ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Check className="w-5 h-5 mr-2" />
              )}
              Approve Product
            </button>

            <button
              onClick={() => setShowRejectModal(true)}
              disabled={submitting}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
            >
              <X className="w-5 h-5 mr-2" />
              Reject Product
            </button>
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
                Rejection Reason
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
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {submitting && (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                )}
                Reject Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductReview;
