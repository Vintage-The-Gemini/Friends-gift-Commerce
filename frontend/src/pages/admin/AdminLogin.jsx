// frontend/src/pages/admin/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });

  // In frontend/src/pages/admin/AdminLogin.jsx - update the handleSubmit function

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    // Use the auth hook's adminLogin function instead of direct axios
    const response = await adminLogin({
      phoneNumber: formData.phoneNumber,
      password: formData.password,
      role: "admin", // Explicitly set role as admin
    });

    console.log("Admin login response:", response);

    if (response.success) {
      // Double-check that we have the user in localStorage before navigating
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      
      console.log("Stored user after login:", storedUser);
      console.log("Token exists:", !!storedToken);
      
      if (storedUser && storedToken) {
        // Log stored user info to verify role
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("Stored user role:", parsedUser.role);
          
          if (parsedUser.role !== "admin") {
            console.warn("User does not have admin role!");
          }
        } catch (e) {
          console.error("Error parsing stored user:", e);
        }
      }
      
      // Navigate to admin dashboard
      navigate("/admin/dashboard");
    } else {
      throw new Error(response.message || "Login failed");
    }
  } catch (err) {
    console.error("Admin login error:", err);
    setError(
      err.response?.data?.message ||
        err.message ||
        "Invalid admin credentials"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access administrative dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md -space-y-px">
            <div className="mb-4">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#5551FF] focus:border-[#5551FF]"
                placeholder="+254xxxxxxxxx"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#5551FF] focus:border-[#5551FF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5551FF] hover:bg-[#4440FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5551FF]"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
