// frontend/src/pages/auth/SignIn.jsx - COMPLETE FILE WITH PHONE FORMAT SUPPORT
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import GoogleAuth from "../../components/auth/GoogleAuth";
import Logo from "../../assets/images/Friends-gift-logo.svg";

const SignIn = () => {
  const { login } = useAuth();
  const [role, setRole] = useState("buyer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  // Helper function to normalize phone number display
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
    
    return value; // Return as-is for email or other formats
  };

  // Helper function to validate identifier
  const validateIdentifier = (identifier) => {
    // Check if it's an email
    if (identifier.includes('@')) {
      return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(identifier);
    }
    
    // Remove spaces for phone validation
    const cleaned = identifier.replace(/\s/g, '');
    
    // Check if it's a valid phone number (+254XXXXXXXXX or 07XXXXXXXX)
    return /^(\+254[0-9]{9}|07[0-9]{8})$/.test(cleaned);
  };

  const handleIdentifierChange = (e) => {
    const value = e.target.value;
    
    // If it looks like a phone number, format it
    if (!value.includes('@')) {
      const formatted = formatPhoneDisplay(value);
      setFormData({ ...formData, identifier: formatted });
    } else {
      setFormData({ ...formData, identifier: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.identifier) {
      setError("Please provide your email or phone number");
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setError("Please provide your password");
      setLoading(false);
      return;
    }

    // Validate identifier format
    if (!validateIdentifier(formData.identifier)) {
      setError("Please enter a valid email or phone number (+254XXXXXXXXX or 07XXXXXXXX)");
      setLoading(false);
      return;
    }

    try {
      const isEmail = formData.identifier.includes("@");
      
      // Clean phone number for submission (remove spaces)
      const cleanIdentifier = isEmail 
        ? formData.identifier 
        : formData.identifier.replace(/\s/g, '');

      const credentials = {
        identifier: cleanIdentifier,
        password: formData.password,
        role,
      };

      await login(credentials);
    } catch (err) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
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
          <h2 className="text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Please sign in to continue
          </p>
        </div>

        {/* Role Selection */}
        <div className="flex justify-center space-x-4 mb-4">
          <button
            type="button"
            onClick={() => setRole("buyer")}
            className={`px-4 py-2 rounded-full transition-colors ${
              role === "buyer"
                ? "bg-[#5551FF] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            As Buyer
          </button>
          <button
            type="button"
            onClick={() => setRole("seller")}
            className={`px-4 py-2 rounded-full transition-colors ${
              role === "seller"
                ? "bg-[#5551FF] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            As Merchant
          </button>
        </div>

        {/* Google Auth Component */}
        <div className="mt-6 mb-4">
          <GoogleAuth 
            buttonText={`Continue with Google as ${role === "buyer" ? "Buyer" : "Seller"}`}
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

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email or Phone Number
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="email tel"
                required
                value={formData.identifier}
                onChange={handleIdentifierChange}
                className="appearance-none rounded block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#5551FF] focus:border-[#5551FF]"
                placeholder="Email or Phone (+254... or 07...)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use your email or phone number (+254XXXXXXXXX or 07XXXXXXXX)
              </p>
            </div>
            
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="appearance-none rounded block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#5551FF] focus:border-[#5551FF]"
                  placeholder="Password"
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
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#5551FF] focus:ring-[#5551FF] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/auth/forgot-password"
                className="font-medium text-[#5551FF] hover:text-[#4440DD]"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#5551FF] hover:bg-[#4440DD] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5551FF] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/auth/signup"
              className="font-medium text-[#5551FF] hover:text-[#4440DD]"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;