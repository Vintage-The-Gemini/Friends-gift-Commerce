// frontend/src/pages/auth/SignUp.jsx
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
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (!formData.email && !formData.phoneNumber) {
      setError("Please provide either email or phone number");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (role === "seller" && !formData.businessName.trim()) {
      setError("Business name is required for sellers");
      setLoading(false);
      return;
    }

    try {
      const userData = {
        name: formData.name.trim(),
        password: formData.password,
        role,
      };

      // Add email or phone
      if (formData.email) {
        userData.email = formData.email.trim();
      }
      if (formData.phoneNumber) {
        userData.phoneNumber = formData.phoneNumber.trim();
      }

      // Add business name for sellers
      if (role === "seller") {
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
        </div>

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
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
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
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-[#5551FF] focus:border-[#5551FF]"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-[#5551FF] focus:border-[#5551FF]"
              placeholder="+254712345678"
            />
            <p className="text-xs text-gray-500 mt-1">
              Note: Either email or phone number is required
            </p>
          </div>

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
                placeholder="Your business name"
              />
            </div>
          )}

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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-[#5551FF] focus:border-[#5551FF] pr-10"
                placeholder="Password (min 6 characters)"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="mt-1">
              <div className={`text-xs ${formData.password.length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
                • At least 6 characters
              </div>
            </div>
          </div>

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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-[#5551FF] focus:border-[#5551FF] pr-10"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.confirmPassword && (
              <div className={`text-xs mt-1 ${
                formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
              }`}>
                {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}
          </div>

          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
            <p className="mb-2">By creating an account, you agree to our:</p>
            <div className="space-y-1">
              <p>• <Link to="/terms" className="text-[#5551FF] hover:underline">Terms of Service</Link></p>
              <p>• <Link to="/privacy" className="text-[#5551FF] hover:underline">Privacy Policy</Link></p>
              <p>• <Link to="/cookies" className="text-[#5551FF] hover:underline">Cookie Policy</Link></p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.name || (!formData.email && !formData.phoneNumber) || formData.password.length < 6 || formData.password !== formData.confirmPassword}
            className="w-full py-3 px-4 bg-[#5551FF] hover:bg-[#4441DD] text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5551FF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating account...
              </div>
            ) : (
              `Create ${role === "buyer" ? "Buyer" : "Seller"} Account`
            )}
          </button>

          <div className="text-sm text-center space-y-2">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/auth/signin"
                className="text-[#5551FF] hover:text-[#4441DD] font-medium"
              >
                Sign in
              </Link>
            </p>
            
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <Link to="/help" className="hover:text-[#5551FF]">Help</Link>
              <span>•</span>
              <Link to="/support" className="hover:text-[#5551FF]">Support</Link>
              <span>•</span>
              <Link to="/contact" className="hover:text-[#5551FF]">Contact</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;