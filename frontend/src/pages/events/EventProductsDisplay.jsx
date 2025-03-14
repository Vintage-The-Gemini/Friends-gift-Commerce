// src/components/events/EventProductsDisplay.jsx
import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/currency";
import { ShoppingBag, Gift, Check, Clock } from "lucide-react";

const EventProductsDisplay = ({ products, onContributeToProduct }) => {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Products Added
        </h3>
        <p className="text-gray-500">
          This event doesn't have any products yet.
        </p>
      </div>
    );
  }

  // Determine the product status
  const getProductStatus = (product) => {
    if (product.status === "completed") return "completed";
    if (product.status === "contributed") return "in-progress";
    return "pending";
  };

  // Get the product status style
  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          icon: <Check className="w-4 h-4 mr-1" />,
          label: "Completed",
        };
      case "in-progress":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          icon: <Clock className="w-4 h-4 mr-1" />,
          label: "In Progress",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          icon: <Gift className="w-4 h-4 mr-1" />,
          label: "Available",
        };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Gift Registry</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((item) => {
          const status = getProductStatus(item);
          const statusStyle = getStatusStyle(status);

          return (
            <div
              key={item.product._id}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="relative">
                <img
                  src={
                    item.product.images?.[0]?.url || "/api/placeholder/400/400"
                  }
                  alt={item.product.name}
                  className="w-full h-48 object-cover"
                />

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    {statusStyle.icon}
                    {statusStyle.label}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">
                  {item.product.name}
                </h3>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-500 text-sm">
                    Quantity: {item.quantity}
                  </span>
                  <span className="font-bold">
                    {formatCurrency(item.product.price)}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {item.product.description}
                </p>

                <div className="flex justify-between items-center">
                  <Link
                    to={`/products/${item.product._id}`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    View Details
                  </Link>

                  {status !== "completed" && (
                    <button
                      onClick={() => onContributeToProduct(item)}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                    >
                      Contribute
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventProductsDisplay;
//testing
