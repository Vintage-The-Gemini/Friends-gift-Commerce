// frontend/src/pages/legal/HelpSupportPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Package,
  CreditCard,
  TruckIcon,
  Gift,
  User,
  MessageCircle,
  Shield,
  ExternalLink,
} from "lucide-react";

const HelpSupportPage = () => {
  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // State for search input
  const [searchQuery, setSearchQuery] = useState("");
  // State to track which FAQ categories are expanded
  const [expandedCategories, setExpandedCategories] = useState({
    orders: true,
    payments: false,
    shipping: false,
    returns: false,
    account: false,
    events: false,
  });

  // Toggle expanded category
  const toggleCategory = (category) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category],
    });
  };

  // FAQ data structure
  const faqCategories = [
    {
      id: "orders",
      title: "Orders & Products",
      icon: <ShoppingBag className="w-5 h-5" />,
      questions: [
        {
          question: "How do I place an order on Friends Gift?",
          answer:
            "You can place an order by browsing our product catalog, selecting the items you want, adding them to your cart, and proceeding to checkout. You'll need to be signed in to complete your purchase. Follow the checkout process to provide shipping information and payment details.",
        },
        {
          question: "Can I modify or cancel my order after placing it?",
          answer:
            "You can modify or cancel your order within 1 hour of placing it, provided it hasn't been processed yet. To do this, go to your Orders in your account dashboard and select the order you wish to modify or cancel. If the order has already been processed, please contact our customer support team for assistance.",
        },
        {
          question: "How can I track my order?",
          answer:
            "Once your order is shipped, you'll receive a tracking number via email and SMS. You can use this number to track your package on our website by going to 'My Orders' in your account dashboard or through the courier's tracking system.",
        },
        {
          question: "What do I do if I receive damaged or incorrect items?",
          answer:
            "If you receive damaged or incorrect items, please contact our customer support within 48 hours of delivery. Include your order number and photos of the damaged/incorrect items. We'll arrange for a return and replacement as soon as possible.",
        },
      ],
    },
    {
      id: "payments",
      title: "Payments & Pricing",
      icon: <CreditCard className="w-5 h-5" />,
      questions: [
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept various payment methods including M-PESA, credit/debit cards (Visa, MasterCard), and bank transfers. All payment information is securely processed and encrypted.",
        },
        {
          question: "Is it safe to use my credit card on your website?",
          answer:
            "Yes, our website uses industry-standard SSL encryption to protect your payment information. We do not store your full credit card details on our servers. All transactions are processed through secure payment gateways that comply with PCI DSS standards.",
        },
        {
          question: "When will my card be charged?",
          answer:
            "Your card will be charged immediately when you place your order. If for any reason we cannot fulfill your order, we will issue a full refund to your original payment method.",
        },
        {
          question: "Do you offer any discounts or promotional codes?",
          answer:
            "Yes, we regularly offer discounts and promotional codes. You can find these on our homepage, through our newsletter, or on our social media channels. To use a promotional code, enter it in the designated field during checkout.",
        },
      ],
    },
    {
      id: "shipping",
      title: "Shipping & Delivery",
      icon: <TruckIcon className="w-5 h-5" />,
      questions: [
        {
          question: "What are your delivery options?",
          answer:
            "We offer standard delivery (3-5 business days), express delivery (1-2 business days), and pick-up options from our location in Nairobi. Delivery fees vary based on location and order size.",
        },
        {
          question: "Do you ship internationally?",
          answer:
            "Currently, we only ship within Kenya. We're working on expanding our shipping options to include other countries in East Africa in the near future.",
        },
        {
          question: "How much does shipping cost?",
          answer:
            "Shipping costs vary depending on your location and the size of your order. Standard delivery within Nairobi costs Ksh 200-400, while delivery to other regions in Kenya ranges from Ksh 400-800. Exact shipping costs will be calculated at checkout.",
        },
        {
          question: "What happens if I'm not available to receive my delivery?",
          answer:
            "If you're not available to receive your delivery, our courier will leave a notice and attempt delivery again the next business day. After two failed delivery attempts, your package will be held at the nearest courier service center for collection. You can also contact us to arrange an alternative delivery date or location.",
        },
      ],
    },
    {
      id: "returns",
      title: "Returns & Refunds",
      icon: <Package className="w-5 h-5" />,
      questions: [
        {
          question: "What is your return policy?",
          answer:
            "We accept returns within 7 days of delivery. Products must be unused and in their original packaging. Please note that certain items like perishable goods, personalized items, and digital products cannot be returned unless they are defective.",
        },
        {
          question: "How do I return an item?",
          answer:
            "To return an item, go to 'My Orders' in your account dashboard, select the order containing the item you wish to return, and click on 'Return Item'. Follow the instructions to generate a return label. Package the item securely and send it back using the provided return label.",
        },
        {
          question: "How will I be refunded?",
          answer:
            "Please note that refunds are provided as redeemable supermarket vouchers, not cash. Once we receive and inspect your return, we'll issue the voucher within 5-7 business days. The voucher will be sent to your registered email address.",
        },
        {
          question: "Do I have to pay for return shipping?",
          answer:
            "Yes, return shipping costs are typically the responsibility of the customer unless the return is due to a defective product or our error. In such cases, we'll provide a free return shipping label or arrange for pickup at our expense.",
        },
      ],
    },
    {
      id: "account",
      title: "Account & Security",
      icon: <User className="w-5 h-5" />,
      questions: [
        {
          question: "How do I create an account?",
          answer:
            "You can create an account by clicking on the 'Sign Up' button at the top of the page. You'll need to provide your name, email address or phone number, and create a password. You can also sign up using your Google or Facebook account for quicker registration.",
        },
        {
          question: "How can I reset my password?",
          answer:
            "If you've forgotten your password, click on the 'Sign In' button, then select 'Forgot Password'. Enter your email address or phone number, and we'll send you a link to reset your password. For security reasons, this link will expire after 24 hours.",
        },
        {
          question: "How can I update my account information?",
          answer:
            "You can update your account information by signing in to your account, clicking on your profile icon, and selecting 'Account Settings'. From there, you can edit your personal information, change your password, update your shipping addresses, and manage your payment methods.",
        },
        {
          question: "How is my personal information protected?",
          answer:
            "We take data security seriously. Your personal information is protected using industry-standard encryption, and we never share your data with unauthorized third parties. For more details, please refer to our Privacy Policy.",
        },
      ],
    },
    {
      id: "events",
      title: "Events & Gifting",
      icon: <Gift className="w-5 h-5" />,
      questions: [
        {
          question: "How do I create a gift event?",
          answer:
            "To create a gift event, sign in to your account, go to the 'Events' section, and click 'Create Event'. Fill in the details about your event (type, date, etc.), select products you'd like to receive as gifts, and set your target amount. Once created, you can share the event with friends and family.",
        },
        {
          question: "How do contributions work?",
          answer:
            "When someone contributes to your event, they can choose to contribute a specific amount towards your gift fund or purchase specific items from your wishlist. All contributions are tracked in your event dashboard, where you can see who contributed and how much.",
        },
        {
          question: "Can I edit my event after creating it?",
          answer:
            "Yes, you can edit most aspects of your event after creating it, including the description, date, and products. However, you cannot reduce the target amount if contributions have already been made. To edit your event, go to 'My Events' in your account dashboard and select the event you wish to modify.",
        },
        {
          question: "How do I receive my gifts after the event?",
          answer:
            "Once your event reaches its target amount or end date, you'll have the option to 'Complete Event' in your dashboard. This will convert the contributions into orders for the products in your wishlist. If the amount raised doesn't cover all items, you can choose which items to order or contribute the remaining amount yourself.",
        },
      ],
    },
  ];

  // Filter FAQs based on search query
  const filteredFAQs = searchQuery
    ? faqCategories.map((category) => ({
        ...category,
        questions: category.questions.filter(
          (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((category) => category.questions.length > 0)
    : faqCategories;

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-8">
        <Link
          to="/"
          className="flex items-center text-indigo-600 mb-4 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-3">Help & Support</h1>
        <p className="text-gray-600 max-w-3xl">
          Find answers to common questions about Friends Gift. If you can't find
          what you're looking for, feel free to contact our support team.
        </p>
      </div>

      {/* Search Box */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-12 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Link
          to="/contact"
          className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <MessageCircle className="w-8 h-8 text-indigo-600 mb-2" />
          <span className="text-sm font-medium text-center">Contact Us</span>
        </Link>
        <Link
          to="/orders/track"
          className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <Package className="w-8 h-8 text-indigo-600 mb-2" />
          <span className="text-sm font-medium text-center">Track Order</span>
        </Link>
        <Link
          to="/returns"
          className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <TruckIcon className="w-8 h-8 text-indigo-600 mb-2" />
          <span className="text-sm font-medium text-center">Returns</span>
        </Link>
        <Link
          to="/privacy-policy"
          className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <Shield className="w-8 h-8 text-indigo-600 mb-2" />
          <span className="text-sm font-medium text-center">Privacy</span>
        </Link>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-6 mb-12">
        <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>

        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-5 text-left border-b border-gray-100 focus:outline-none"
              >
                <div className="flex items-center">
                  <span className="bg-indigo-100 p-2 rounded-full mr-3 text-indigo-600">
                    {category.icon}
                  </span>
                  <span className="font-medium text-lg">{category.title}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({category.questions.length})
                  </span>
                </div>
                {expandedCategories[category.id] ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedCategories[category.id] && (
                <div className="p-5">
                  <div className="space-y-4">
                    {category.questions.map((faq, index) => (
                      <div
                        key={index}
                        className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <h3 className="font-medium text-gray-900 mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No results found
            </h3>
            <p className="text-gray-500 mb-4">
              Sorry, we couldn't find any answers that match your search.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-indigo-600 font-medium hover:underline"
            >
              Clear search and show all FAQs
            </button>
          </div>
        )}
      </div>

      {/* Contact Section */}
      <div className="bg-indigo-50 rounded-lg p-8 mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">Still Need Help?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our support team is ready to assist you. Feel free to reach out
            through any of the following channels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <MessageCircle className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-medium text-lg mb-2">Chat With Us</h3>
            <p className="text-gray-600 mb-4">
              Our support team is available Monday to Friday, 8am to 6pm.
            </p>
            <Link
              to="/contact"
              className="text-indigo-600 font-medium hover:underline inline-flex items-center"
            >
              Start a Chat <ExternalLink className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <Mail className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-medium text-lg mb-2">Email Us</h3>
            <p className="text-gray-600 mb-4">
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <a
              href="mailto:support@friendsgift.co.ke"
              className="text-indigo-600 font-medium hover:underline inline-flex items-center"
            >
              support@friendsgift.co.ke <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <ShoppingBag className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-medium text-lg mb-2">Request a Callback</h3>
            <p className="text-gray-600 mb-4">
              Leave your number and we'll call you back as soon as possible.
            </p>
            <Link
              to="/contact?callback=true"
              className="text-indigo-600 font-medium hover:underline inline-flex items-center"
            >
              Request Callback <ExternalLink className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Popular Resources */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Popular Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6">
            <h3 className="font-medium text-lg mb-3">Shipping Guidelines</h3>
            <p className="text-gray-600 mb-4">
              Learn about our shipping zones, delivery times, and shipping fees.
            </p>
            <Link
              to="/shipping-guidelines"
              className="text-indigo-600 font-medium hover:underline inline-flex items-center"
            >
              Read More <ChevronDown className="w-4 h-4 ml-1 rotate-270" />
            </Link>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="font-medium text-lg mb-3">Return Process</h3>
            <p className="text-gray-600 mb-4">
              Step-by-step guide on how to return products and get refunds.
            </p>
            <Link
              to="/return-process"
              className="text-indigo-600 font-medium hover:underline inline-flex items-center"
            >
              Read More <ChevronDown className="w-4 h-4 ml-1 rotate-270" />
            </Link>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="font-medium text-lg mb-3">Gift Event Guide</h3>
            <p className="text-gray-600 mb-4">
              Learn how to create and manage gift events for special occasions.
            </p>
            <Link
              to="/gift-event-guide"
              className="text-indigo-600 font-medium hover:underline inline-flex items-center"
            >
              Read More <ChevronDown className="w-4 h-4 ml-1 rotate-270" />
            </Link>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="font-medium text-lg mb-3">Seller Guidelines</h3>
            <p className="text-gray-600 mb-4">
              Instructions and policies for selling products on Friends Gift.
            </p>
            <Link
              to="/seller-guidelines"
              className="text-indigo-600 font-medium hover:underline inline-flex items-center"
            >
              Read More <ChevronDown className="w-4 h-4 ml-1 rotate-270" />
            </Link>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500 text-center">
        © {new Date().getFullYear()} Friends Gift Ltd. All Rights Reserved.
      </div>
    </div>
  );
};

export default HelpSupportPage;