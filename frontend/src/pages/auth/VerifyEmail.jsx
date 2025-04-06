// frontend/src/pages/auth/VerifyEmail.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import Logo from "../../assets/images/Friends-gift-logo.svg";

const VerifyEmail = () => {
  const { token } = useParams();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        if (!token) {
          setStatus("error");
          setMessage("Verification token is missing");
          return;
        }

        const data = await verifyEmail(token);
        setStatus("success");
        setMessage(data.message || "Email verified successfully");
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "Email verification failed");
      }
    };

    verify();
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow text-center">
        <img src={Logo} alt="Friends Gift Logo" className="h-12 mx-auto" />

        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader className="h-16 w-16 text-[#5551FF] animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">
              Verifying your email...
            </h2>
            <p className="mt-2 text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">
              Email Verified!
            </h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <div className="mt-6">
              <Link
                to="/auth/signin"
                className="inline-block bg-[#5551FF] text-white py-2 px-6 rounded-md font-medium hover:bg-[#4440FF] transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-6">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">
              Verification Failed
            </h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <p className="mt-4 text-gray-600">
              The verification link may have expired or is invalid.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                to="/auth/resend-verification"
                className="block bg-[#5551FF] text-white py-2 px-6 rounded-md font-medium hover:bg-[#4440FF] transition-colors"
              >
                Resend Verification Email
              </Link>
              <Link
                to="/auth/signin"
                className="block bg-gray-200 text-gray-800 py-2 px-6 rounded-md font-medium hover:bg-gray-300 transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;