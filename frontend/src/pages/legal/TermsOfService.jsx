// frontend/src/pages/legal/TermsOfService.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";

const TermsOfService = () => {
  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Last updated date
  const lastUpdated = "April 11, 2025";
  const effectiveDate = "April 11, 2025";
  const version = "1.0";

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8">
        <Link to="/" className="flex items-center text-indigo-600 mb-4 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
        <div className="text-gray-500">
          <p>Version: {version}</p>
          <p>Last Updated: {lastUpdated}</p>
          <p>Effective Date: {effectiveDate}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <div className="prose prose-indigo max-w-none">
          <p className="lead mb-6">
            Friendsgift.co.ke is an ecommerce business legally established in the Republic of Kenya,
            with a registered postal address of P.O. Box 903, Postal Code 30100. Our physical offices are
            located at Ngumo Phase 1, House No. 30A, Nairobi, Kenya.
          </p>
          
          <p className="text-red-600 font-medium mb-6">
            No cash refunds, refunds shall be facilitated using redeemable supermarket vouchers.
          </p>

          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold" id="introduction">1. Introduction</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Friendsgift.co.ke operates an e-commerce platform (website &amp; mobile app) for
                buying/selling products.</li>
                <li>By using Friendsgift.co.ke, you agree to these terms. Business users must have
                authority to bind their organization.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold" id="registration">2. Registration &amp; Account</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Users must be ≥18 years old.</li>
                <li>Accounts are personal; password confidentiality is required.</li>
                <li>Friendsgift.co.ke may suspend/cancel accounts without notice but will refund for
                unfulfilled orders if no breach occurs.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold" id="sales">3. Sales Terms</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Friendsgift.co.ke facilitates transactions but is not a party to buyer-seller contracts
                (unless Friendsgift.co.ke is the seller).</li>
                <li>Sellers must provide accurate product details, including pricing, taxes, and warranties.</li>
                <li>No cash refunds – any refunds shall be issued as specified in our refund policy.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold" id="returns">4. Returns &amp; Refunds</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Managed per Friendsgift.co.ke's returns/refunds policies, subject to local laws.</li>
                <li>Refunds may be issued as store credit, bank transfers, etc.</li>
                <li>Digital products are refunded only for delivery failures.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold" id="payments">5. Payments</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Payments must follow Friendsgift.co.ke's payment guidelines.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold" id="store-credit">6. Store Credit</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Governed by Friendsgift.co.ke's Store Credit Terms; may be canceled for fraud.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold" id="promotions">7. Promotions</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Subject to separate Promotions Terms.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold" id="user-content">8. User Content Rules</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Content must be legal, non-offensive, and not infringe rights (e.g., copyright,
                privacy).</li>
                <li>Prohibited: Fake reviews, transaction interference, or sharing personal payment
                details.</li>
                <li>Friendsgift.co.ke may remove content and has a global license to use submitted
                content.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold" id="website-use">9. Website/App Use</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Allowed: Personal/business use for buying/selling.</li>
                <li>Prohibited: Hacking, scraping, spamming, or disrupting services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold" id="intellectual-property">10. Intellectual Property</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Friendsgift.co.ke owns all platform IP; trademarks may not be used without
                permission.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold" id="data-privacy">11. Data Privacy</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Personal data processed per Friendsgift.co.ke's <Link to="/privacy-policy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.</li>
                <li>Sellers are liable for buyer data misuse.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold" id="compliance">12. Compliance &amp; Audits</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Friendsgift.co.ke may conduct anti-fraud checks and request user information for
                legal compliance.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold" id="roles">13. Friendsgift.co.ke's Role</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Acts as a marketplace; sellers are liable for products.</li>
                <li>No guarantees on platform uptime or commercial results.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold" id="liability">15. Liability Limits</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Friendsgift.co.ke is not liable for:</li>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Force majeure (natural disasters, cyberattacks).</li>
                  <li>Business losses, data corruption, or third-party websites.</li>
                </ul>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold" id="indemnification">16. Indemnification</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Users indemnify Friendsgift.co.ke for losses from breaches or tax non-compliance.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold" id="breach">17. Breach Consequences</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Friendsgift.co.ke may suspend accounts, block access, or take legal action for
                violations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold" id="legal">18. Legal &amp; Miscellaneous</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Governing Law:</strong> Kenyan law applies.</li>
                <li><strong>Updates:</strong> Revised terms apply upon publication.</li>
                <li><strong>Disputes:</strong> Resolved in Kenyan courts.</li>
                <li><strong>Contact:</strong> Via details provided on Friendsgift.co.ke.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-lg mb-2">Have more questions?</h3>
        <p className="mb-4">
          If you have any questions about our terms or need clarification, please don't hesitate to contact us.
        </p>
        <Link to="/contact" className="inline-flex items-center text-indigo-600 font-medium">
          Contact Us <ExternalLink className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="text-sm text-gray-500 text-center">
        © {new Date().getFullYear()} Friends Gift Ltd. All Rights Reserved.
      </div>
    </div>
  );
};

export default TermsOfService;