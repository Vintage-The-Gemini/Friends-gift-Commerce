// frontend/src/pages/legal/PrivacyPolicy.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";

const PrivacyPolicy = () => {
  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Last updated date
  const lastUpdated = "April 1, 2025";

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8">
        <Link to="/" className="flex items-center text-indigo-600 mb-4 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-500">Effective Date: {lastUpdated}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <div className="prose prose-indigo max-w-none">
          <p className="lead">
            Friendsgift.co.ke values your privacy and is committed to ensuring that your personal information is 
            handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, store, 
            and protect the information you provide to us while using our website and services. By accessing 
            or using Friendsgift.co.ke, you agree to the terms described in this policy.
          </p>
          
          <p>
            Friendsgift.co.ke is an ecommerce business legally established in the Republic of Kenya, 
            with a registered postal address of P.O. Box 903, Postal Code 30100. Our physical offices are 
            located at Ngumo Phase 1, House No. 30A, Nairobi, Kenya.
          </p>

          <div className="mt-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4" id="information-collection">Information Collection</h2>
              <p>
                In the course of providing our services, we may collect personal information such as your name, 
                contact details, billing and delivery addresses, payment information, and order history. This 
                information is collected when you make a purchase, create an account, contact customer support, 
                or interact with our website in other ways.
              </p>
              <p className="mt-2">
                We collect information that you voluntarily provide to us when you register on the platform, 
                express interest in obtaining information about us or our products and services, participate 
                in activities on the platform, or otherwise contact us.
              </p>
              <p className="mt-2">
                The personal information that we collect depends on the context of your interactions with us 
                and the platform, the choices you make, and the products and features you use. The personal 
                information we collect may include the following:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>
                  <strong>Personal Identifiers.</strong> We collect names, phone numbers, email addresses, 
                  and other similar identifiers.
                </li>
                <li>
                  <strong>Payment Data.</strong> We collect data necessary to process your payment if you make
                  purchases, such as your payment instrument number (such as a credit card number), and the 
                  security code associated with your payment instrument.
                </li>
                <li>
                  <strong>Business Data.</strong> If you are a seller, we collect business name, business 
                  address, business type, and other details about your business.
                </li>
                <li>
                  <strong>Profile Data.</strong> We collect your preferences in receiving marketing communications 
                  from us, your event planning preferences, and other profile data.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4" id="information-usage">How We Use Your Information</h2>
              <p>
                The information we collect is used strictly for its intended purposes. These include processing 
                and fulfilling your orders, communicating with you regarding your purchases, improving our website 
                and service offerings, and—if you have opted in—sending you updates and promotional materials. We 
                are committed to using your personal data responsibly and transparently.
              </p>
              <p className="mt-2">We use the information we collect or receive:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>
                  <strong>To facilitate account creation and authentication.</strong> If you choose to link 
                  your account with us to a third-party account (such as your Google or Facebook account), 
                  we use the information you allowed us to collect from those third parties to facilitate 
                  account creation and the login process.
                </li>
                <li>
                  <strong>To deliver services to the user.</strong> We may use your information to provide you 
                  with the requested service.
                </li>
                <li>
                  <strong>To process your payments.</strong> We process payment transactions through third-party 
                  payment processors like M-PESA or other integrated payment systems.
                </li>
                <li>
                  <strong>To send administrative information to you.</strong> We may use your personal information 
                  to send you product, service, and new feature information and/or information about changes 
                  to our terms, conditions, and policies.
                </li>
                <li>
                  <strong>To protect our Services.</strong> We may use your information as part of our efforts 
                  to keep our platform safe and secure (for example, for fraud monitoring and prevention).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4" id="information-sharing">Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal data to third parties. However, we may share your 
                information with trusted third-party service providers who assist us in operating the website and 
                delivering our services (for example, payment gateways, courier services, and IT support providers). 
                These third parties are contractually obligated to handle your data confidentially and securely, 
                in accordance with applicable laws.
              </p>
              <p className="mt-2">We may process or share your data that we hold based on the following legal basis:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>
                  <strong>Consent:</strong> We may process your data if you have given us specific consent 
                  to use your personal information for a specific purpose.
                </li>
                <li>
                  <strong>Legitimate Interests:</strong> We may process your data when it is reasonably necessary 
                  to achieve our legitimate business interests.
                </li>
                <li>
                  <strong>Performance of a Contract:</strong> Where we have entered into a contract with you, 
                  we may process your personal information to fulfill the terms of our contract.
                </li>
                <li>
                  <strong>Legal Obligations:</strong> We may disclose your information where we are legally 
                  required to do so in order to comply with applicable law, governmental requests, a judicial 
                  proceeding, court order, or legal process, such as in response to a court order or a subpoena.
                </li>
                <li>
                  <strong>Vital Interests:</strong> We may disclose your information where we believe it is 
                  necessary to investigate, prevent, or take action regarding potential violations of our 
                  policies, suspected fraud, situations involving potential threats to the safety of any 
                  person and illegal activities, or as evidence in litigation in which we are involved.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4" id="data-security">Data Security</h2>
              <p>
                <strong>Friendsgift.co.ke shall protect all data collected from users and shall use it solely 
                for its intended purposes.</strong> We adhere to strict data protection practices and comply with 
                the relevant provisions of the Data Protection Act of Kenya. We implement appropriate technical 
                and organizational measures to ensure that your personal data is secure from unauthorized access, 
                alteration, disclosure, or destruction.
              </p>
              <p className="mt-2">
                We have implemented appropriate technical and organizational security measures designed 
                to protect the security of any personal information we process. However, despite our 
                safeguards and efforts to secure your information, no electronic transmission over 
                the Internet or information storage technology can be guaranteed to be 100% secure.
              </p>
              <p className="mt-2">
                We implement several security measures to protect your information:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>All transmitted data is encrypted using SSL technology</li>
                <li>Access to personal information is restricted to authorized personnel only</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Secure password policies and multi-factor authentication for our systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4" id="privacy-rights">Your Privacy Rights</h2>
              <p>
                You have the right to access the personal information we hold about you, request corrections to any 
                inaccuracies, or request deletion of your data, subject to any legal or contractual retention 
                obligations. If you wish to exercise these rights, please contact us at <strong>support@friendsgift.co.ke</strong>.
              </p>
              <p className="mt-2">
                In some regions (like the European Economic Area), you have certain rights under 
                applicable data protection laws. These may include the right to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Request access to and obtain a copy of your personal information</li>
                <li>Request rectification or erasure of your personal information</li>
                <li>Restrict the processing of your personal information</li>
                <li>Data portability (if applicable)</li>
                <li>
                  Withdraw your consent at any time where we relied on your consent to process 
                  your personal information
                </li>
              </ul>
              <p className="mt-2">
                If you are a resident of Kenya, you may also have rights under the Kenya Data Protection Act.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4" id="cookies">Cookies Policy</h2>
              <p>
                Our website may also use cookies and similar technologies to enhance your user experience and 
                collect information about how you interact with our site. You may control your cookie preferences 
                through your browser settings at any time.
              </p>
              <p className="mt-2">
                Cookies are files with a small amount of data which may include an anonymous unique identifier.
                Cookies are sent to your browser from a website and stored on your device. You can instruct 
                your browser to refuse all cookies or to indicate when a cookie is being sent. However, if 
                you do not accept cookies, you may not be able to use some portions of our Service.
              </p>
              <p className="mt-2">We use the following types of cookies:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>
                  <strong>Essential Cookies:</strong> These cookies are essential to provide you with 
                  services available through our website and to enable you to use its features.
                </li>
                <li>
                  <strong>Functionality Cookies:</strong> These cookies allow our website to remember 
                  choices you make when you use our website.
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> These cookies help us understand how visitors 
                  interact with our website.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4" id="changes">Changes to Privacy Policy</h2>
              <p>
                We may occasionally update this Privacy Policy to reflect changes in legal requirements, our 
                practices, or service offerings. When changes are made, we will post the updated policy on this 
                page and revise the effective date accordingly. We encourage you to review this policy periodically 
                to stay informed about how we are protecting your information.
              </p>
              <p className="mt-2">
                You are advised to review this Privacy Policy periodically for any changes. Changes to this 
                Privacy Policy are effective when they are posted on this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4" id="contact">Contact Us</h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                please feel free to contact us via email at <strong>support@friendsgift.co.ke</strong> by post at 
                P.O. Box 903, Postal Code 30100, Ngumo Phase 1, House No. 30A, Nairobi, Kenya.
              </p>
            </section>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-lg mb-2">Have more questions?</h3>
        <p className="mb-4">
          If you have any questions about our privacy practices or this policy, please contact our 
          data protection officer.
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

export default PrivacyPolicy;