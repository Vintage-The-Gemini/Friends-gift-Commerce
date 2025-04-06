// frontend/src/pages/auth/ResendVerification.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import Logo from "../../assets/images/Friends-gift-logo.svg";

const ResendVerification = () => {
  const { resendVerificationEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setStatus("error");
      setMessage("Please enter your email address");
      return;
    }

    try {
      setStatus("loading");
      const data = await resendVerificationEmail(email);
      setStatus("success");
      setMessage(data.message || "Verification email sent successfully");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Failed to send verification email");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div className="text-center">
          <img
            src={Logo}
            alt="Friends Gift Logo"
            className="h-12 mx-auto mb-2"
          />
          <h2 className="text-2xl font-bold text-gray-900">
            Resend Verification Email
          </h2>
          <p className="mt-2 text-gray-600">
            Enter your email address and we'll send you a new verification link.
          </p>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">Email Sent!</h3>
            <p className="mt-2 text-center text-gray-600">{message}</p>
            <p className="mt-2 text-center text-gray-600">
              Please check your email inbox and follow the verification link.
            </p>
            <div className="mt-6 w-full">
              <Link
                to="/auth/signin"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5551FF] hover:bg-[#4440FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5551FF]"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#5551FF] focus:border-[#5551FF]"
                placeholder="your-email@example.com"
              />
            </div>

            {status === "error" && (
              <div className="text-red-500 text-sm text-center">{message}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5551FF] hover:bg-[#4440FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5551FF]"
              >
                {status === "loading" ? (
                  <span className="flex items-center">
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
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Send className="h-4 w-4 mr-2" />
                    Send Verification Email
                  </span>
                )}
              </button>
            </div>

            <div className="text-sm text-center">
              <Link
                to="/auth/signin"
                className="flex items-center justify-center text-[#5551FF] hover:text-[#4440FF]"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResendVerification;