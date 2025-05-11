// frontend/src/pages/legal/HelpSupportPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Gift } from "lucide-react";

const HelpSupportPage = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8">
        <Link
          to="/"
          className="flex items-center text-indigo-600 mb-4 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-3">Help & Support</h1>
        <p className="text-gray-600">
          Find answers to common questions about Friends Gift. If you can't find
          what you're looking for, feel free to contact our support team.
        </p>
      </div>

      {/* Basic FAQ Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {/* Events & Gifting */}
          <div>
            <h3 className="font-medium text-lg mb-2">Events & Gifting</h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium">How do I create a gift event?</p>
                <p className="text-gray-600 mt-1">
                  Sign in to your account, go to "Events" section, click "Create
                  Event", fill in the event details, select products for your
                  wishlist, and set your target amount.
                </p>
              </div>
              <div>
                <p className="font-medium">How do contributions work?</p>
                <p className="text-gray-600 mt-1">
                  Friends and family can contribute specific amounts towards
                  your gift fund or purchase specific items from your wishlist.
                  All contributions are tracked in your event dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Payments & Contributions */}
          <div>
            <h3 className="font-medium text-lg mb-2">
              Payments & Contributions
            </h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium">
                  What payment methods can contributors use?
                </p>
                <p className="text-gray-600 mt-1">
                  Contributors can use M-PESA, credit/debit cards, and bank
                  transfers to contribute to your events.
                </p>
              </div>
              <div>
                <p className="font-medium">
                  How do I receive my gifts after the event?
                </p>
                <p className="text-gray-600 mt-1">
                  Once your event reaches its target amount or end date, you can
                  complete the event in your dashboard. This converts
                  contributions into orders for the products in your wishlist.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-indigo-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-indigo-600 mr-3" />
            <p>support@friendsgift.co.ke</p>
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-indigo-600 mr-3" />
            <p>+254 724 827 887</p>
          </div>
        </div>
        <div className="mt-6">
          <Link
            to="/contact"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Gift className="w-4 h-4 mr-2 inline-block" />
            Get Help With Your Event
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;
