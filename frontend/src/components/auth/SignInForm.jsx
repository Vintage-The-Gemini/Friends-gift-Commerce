// src/components/auth/SignInForm.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { authStyles } from "./AuthStyles";

const SignInForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData);
      // Navigate based on user role will be handled in the useAuth hook
    } catch (err) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md -space-y-px">
        <div className="mb-4">
          <label htmlFor="phoneNumber" className={authStyles.label}>
            Phone Number
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            required
            value={formData.phoneNumber}
            onChange={handleChange}
            className={authStyles.input}
            placeholder="+254xxxxxxxxx"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className={authStyles.label}>
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              className={authStyles.input}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
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

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div>
        <button type="submit" disabled={loading} className={authStyles.button}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>

      <div className="text-sm text-center">
        <Link to="/auth/signup" className={authStyles.link}>
          Don't have an account? Sign up
        </Link>
      </div>
    </form>
  );
};

export default SignInForm;
