// frontend/src/pages/auth/SignIn.jsx
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

    try {
      const isEmail = formData.identifier.includes("@");

      const credentials = {
        password: formData.password,
        role,
      };

      if (isEmail) {
        credentials.email = formData.identifier;
      } else {
        credentials.phoneNumber = formData.identifier;
      }

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
        </div>

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

        <div className="mt-6 mb-4">
          <GoogleAuth
            buttonText={`Continue with Google as ${
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
                onChange={(e) =>
                  setFormData({ ...formData, identifier: e.target.value })
                }
                className="appearance-none rounded block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#5551FF] focus:border-[#5551FF]"
                placeholder="Email or Phone (+254...)"
              />
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
                  className="appearance-none rounded block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#5551FF] focus:border-[#5551FF] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-[#5551FF] hover:text-[#4441DD]"
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#5551FF] hover:bg-[#4441DD] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5551FF] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="text-sm text-center">
            <Link
              to="/auth/signup"
              className="text-[#5551FF] hover:text-[#4441DD]"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;