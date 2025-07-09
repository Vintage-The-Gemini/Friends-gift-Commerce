// frontend/src/pages/auth/SignUp.jsx - COMPLETE FILE WITH PHONE FORMAT SUPPORT
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import GoogleAuth from "../../components/auth/GoogleAuth";
import Logo from "../../assets/images/Friends-gift-logo.svg";

const SignUp = () => {
  const { register } = useAuth();
  const [role, setRole] = useState("buyer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    agreeToTerms: false,
  });

  // Helper function to format phone number display
  const formatPhoneDisplay = (value) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // If starts with +254, format as +254 XXX XXX XXX
    if (cleaned.startsWith('+254') && cleaned.length <= 13) {
      const number = cleaned.slice(4);
      if (number.length <= 3) return `+254 ${number}`;
      if (number.length <= 6) return `+254 ${number.slice(0, 3)} ${number.slice(3)}`;
      return `+254 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
    }
    
    // If starts with 07, format as 07XX XXX XXX
    if (cleaned.startsWith('07') && cleaned.length <= 10) {
      if (cleaned.length <= 4) return cleaned;
      if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    
    return value;
  };

  // Helper function to validate phone number
  const validatePhoneNumber = (phone) => {
    if (!phone) return true; // Phone is optional if email is provided
    
    // Remove spaces for validation
    const cleaned = phone.replace(/\s/g, '');
    
    // Check if it's a valid phone number (+254XXXXXXXXX or 07XXXXXXXX)
    return /^(\+254[0-9]{9}|07[0-9]{8})$/.test(cleaned);
  };

  // Helper function to validate email
  const validateEmail = (email) => {
    if (!email) return true; // Email is optional if phone is provided
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const formatted = formatPhoneDisplay(value);
    setFormData({ ...formData, phoneNumber: formatted });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Please provide your full name");
      setLoading(false);
      return;
    }

    if (!formData.email && !formData.phoneNumber) {
      setError("Please provide either email or phone number");
      setLoading(false);
      return;
    }

    if (formData.email && !validateEmail(formData.email)) {
      setError("Please provide a valid email address");
      setLoading(false);
      return;
    }

    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      setError("Please provide a valid phone number (+254XXXXXXXXX or 07XXXXXXXX)");
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setError("Please provide a password");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (role === "seller" && !formData.businessName.trim()) {
      setError("Please provide your business name");
      setLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      setLoading(false);
      return;
    }

    try {
      // Clean phone number for submission (remove spaces)
      const cleanPhoneNumber = formData.phoneNumber 
        ? formData.phoneNumber.replace(/\s/g, '') 
        : null;

      const userData = {
        name: formData.name.trim(),
        password: formData.password,
        role,
      };

      // Add email if provided
      if (formData.email) {
        userData.email = formData.email.toLowerCase().trim();
      }

      // Add phone number if provided
      if (cleanPhoneNumber) {
        userData.phoneNumber = cleanPhoneNumber;
      }

      // Add business name for sellers
      if (role === "seller" && formData.businessName) {
        userData.businessName = formData.businessName.trim();
      }

      await register(userData);

      if (formData.email) {
        toast.info("Please check your email to verify your account");
      } else {
        toast.success("Registration successful");
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-lg shadow">
        <div className="text-center">
          <img
            src={Logo}
            alt="Friends Gift Logo"
            className="h-12 mx-auto mb-2"
          />
          <h2 className="text-2xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join us and start your gifting journey
          </p>
        </div>

        {/* Role Selection */}
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={() => setRole("buyer")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              role === "buyer"
                ? "bg-[#5551FF] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            As Buyer
          </button>
          <button
            type="button"
            onClick={() => setRole("seller")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              role === "seller"
                ? "bg-[#5551FF] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            As Merchant
          </button>
        </div>

        {/* Google Auth Component */}
        <div className="mt-4">
          <GoogleAuth
            buttonText={`Sign up with Google as ${role === "buyer" ? "Buyer" : "Seller"}`}
            role={role}
          />
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-[#5551FF] focus:border-[#5551FF]"
              placeholder="Enter your full name"
            />
          </div>

          {/* Business Name (for sellers) */}
          {role === "seller" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-[#5551FF] focus:border-[#5551FF]"
                placeholder="Enter your business name"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address {!formData.phoneNumber && "*"}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-[#5551FF] focus:border-[#5551FF]"
              placeholder="Enter your email address"
            />
            {!formData.phoneNumber && (
              <p className="mt-1 text-xs text-gray-500">
                Email is required if phone number is not provided
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number {!formData.email && "*"}
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-[#5551FF] focus:border-[#5551FF]"
              placeholder="+254... or 07..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Use format: +254XXXXXXXXX or 07XXXXXXXX
              {!formData.email && " (Required if email not provided)"}
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-[#5551FF] focus:border-[#5551FF]"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 8 characters long
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-[#5551FF] focus:border-[#5551FF]"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start">
            <input
              id="agree-terms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) =>
                setFormData({ ...formData, agreeToTerms: e.target.checked })
              }
              className="h-4 w-4 text-[#5551FF] focus:ring-[#5551FF] border-gray-300 rounded mt-1"
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700">
              I agree to the{" "}
              <Link
                to="/terms-of-service"
                className="text-[#5551FF] hover:text-[#4440DD] underline"
                target="_blank"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy-policy"
                className="text-[#5551FF] hover:text-[#4440DD] underline"
                target="_blank"
              >
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5551FF] hover:bg-[#4440DD] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5551FF] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating account...
              </div>
            ) : (
              `Create ${role === "buyer" ? "Buyer" : "Seller"} Account`
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/auth/signin"
              className="font-medium text-[#5551FF] hover:text-[#4440DD]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;