// src/pages/dashboard/buyer/ContributionsPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  CreditCard,
  Download,
  Phone,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { contributionService } from "../../../services/api/contribution";
import { formatCurrency } from "../../../utils/currency";
import { toast } from "react-toastify";
import ContributionManagement from "../../../components/events/ContributionManagement";

const ContributionsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    contributionCount: 0,
    avgContribution: 0,
    paymentMethods: {},
  });

  useEffect(() => {
    fetchContributionSummary();
  }, []);

  const fetchContributionSummary = async () => {
    try {
      setLoading(true);
      const response = await contributionService.getUserContributions();

      if (response.success) {
        // Calculate summary statistics
        const contributions = response.data;
        const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0);
        const avgContribution =
          contributions.length > 0 ? totalAmount / contributions.length : 0;

        // Count payment methods
        const methodCounts = {};
        contributions.forEach((contribution) => {
          const method = contribution.paymentMethod || "unknown";
          methodCounts[method] = (methodCounts[method] || 0) + 1;
        });

        setSummary({
          totalAmount,
          contributionCount: contributions.length,
          avgContribution,
          paymentMethods: methodCounts,
        });
      }
    } catch (error) {
      console.error("Error fetching contributions summary:", error);
      toast.error("Failed to load contribution summary");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to view your contributions.
          </p>
          <Link
            to="/auth/signin"
            className="bg-[#5551FF] text-white px-6 py-2 rounded-lg hover:bg-[#4440FF]"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center mb-8">
          <Link
            to="/dashboard"
            className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Contributions
            </h1>
            <p className="text-gray-600">
              Track and manage your contributions to events
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Contributed */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Total Contributed
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {formatCurrency(summary.totalAmount)}
                  </h3>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>

            {/* Number of Contributions */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Contributions
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {summary.contributionCount}
                  </h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Average Contribution */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Average Contribution
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {formatCurrency(summary.avgContribution)}
                  </h3>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <BarChart3 className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Preferred Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Preferred Payment
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 capitalize">
                    {Object.entries(summary.paymentMethods).sort(
                      (a, b) => b[1] - a[1]
                    )[0]?.[0] || "N/A"}
                  </h3>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full">
                  {(
                    Object.entries(summary.paymentMethods).sort(
                      (a, b) => b[1] - a[1]
                    )[0]?.[0] || ""
                  ).toLowerCase() === "mpesa" ? (
                    <Phone className="w-6 h-6 text-yellow-500" />
                  ) : (
                    <CreditCard className="w-6 h-6 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <ContributionManagement />
        </div>

        {/* Tips Section */}
        <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
          <h2 className="text-lg font-semibold text-indigo-900 mb-4">
            Tips for Contributors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-indigo-800 mb-2">
                Benefits of Contributing
              </h3>
              <p className="text-indigo-700">
                When you contribute to events, you help friends and family
                achieve their goals. Your support makes special occasions more
                memorable.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-indigo-800 mb-2">
                Payment Security
              </h3>
              <p className="text-indigo-700">
                All payments are processed securely. We support multiple payment
                methods including M-PESA and card payments for your convenience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionsPage;
