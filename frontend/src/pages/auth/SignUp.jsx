// frontend/src/pages/auth/SignUp.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import GoogleAuth from "../../components/auth/GoogleAuth";
import Logo from "../../assets/images/Friends-gift-logo.svg";

const SignUp = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("buyer");
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Please enter your full name");
      return false;
    }

    if (role === "seller" && !formData.businessName.trim()) {
      setError("Business name is required for sellers");
      return false;
    }

    // Validate that either phone or email is provided
    if (!formData.phoneNumber && !formData.email) {
      setError("Please provide either phone number or email");
      return false;
    }

    // Validate phone number format if provided
    if (
      formData.phoneNumber &&
      !formData.phoneNumber.match(/^\+254[0-9]{9}$/)
    ) {
      setError("Please enter a valid Kenyan phone number (+254...)");
      return false;
    }

    // Validate email format if provided
    if (
      formData.email &&
      !formData.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
    ) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const userData = {
        name: formData.name.trim(),
        password: formData.password,
        role,
      };

      // Add phone if provided
      if (formData.phoneNumber) {
        userData.phoneNumber = formData.phoneNumber;
      }

      // Add email if provided
      if (formData.email) {
        userData.email = formData.email;
      }

      // Add business name for sellers
      if (role === "seller") {
        userData.businessName = formData.businessName.trim();
      }

      await register(userData);

      // If using email, notify about verification
      if (formData.email) {
        toast.info("Please check your email to verify your account");
      } else {
        toast.success("Registration successful");
      }

      // Navigate to sign in (or keep on the page that auth context navigates to)
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
        </div>

        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={() => setRole("buyer")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              role === "buyer"
                ? "bg-[#5551FF] text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            As Buyer
          </button>
          <button
            type="button"
            onClick={() => setRole("seller")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              role === "seller"
                ? "bg-[#5551FF] text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            As Merchant
          </button>
        </div>

        <div className="mt-4">
          <GoogleAuth
            buttonText={`Sign up with Google as ${
              role === "buyer" ? "Buyer" : "Seller"
            }`}
            role={role}
          />
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name*
            </label>
            <input
              type="text"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#5551FF] focus:border-[#5551FF]"
              required
            />
          </div>

          {role === "seller" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Name*
              </label>
              <input
                type="text"
                name="businessName"
                autoComplete="organization"
                value={formData.businessName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#5551FF] focus:border-[#5551FF]"
                required={role === "seller"}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              autoComplete="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+254"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#5551FF] focus:border-[#5551FF]"
            />
            <p className="mt-1 text-xs text-gray-500">
              {!formData.email
                ? "Phone number is required if email is not provided"
                : ""}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#5551FF] focus:border-[#5551FF]"
            />
            <p className="mt-1 text-xs text-gray-500">
              {!formData.phoneNumber
                ? "Email is required if phone number is not provided"
                : ""}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password*
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#5551FF] focus:border-[#5551FF]"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 8 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password*
            </label>
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#5551FF] focus:border-[#5551FF]"
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5551FF] hover:bg-[#4440FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5551FF] disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="text-sm text-center">
            Already have an account?{" "}
            <Link
              to="/auth/signin"
              className="text-[#5551FF] hover:text-[#4440FF] font-medium"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
