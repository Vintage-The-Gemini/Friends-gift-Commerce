// src/components/auth/SignUpForm.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import RoleToggle from "./RoleToggle";
import { authStyles } from "./AuthStyles";

const SignUpForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("buyer");
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    businessName: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
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

    if (!formData.phoneNumber.match(/^\+254[0-9]{9}$/)) {
      setError("Please enter a valid Kenyan phone number (+254...)");
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
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role,
      };

      if (role === "seller") {
        userData.businessName = formData.businessName.trim();
      }

      await register(userData);
      navigate("/auth/signin");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <RoleToggle selectedRole={role} onRoleChange={handleRoleChange} />

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <div>
          <label className={authStyles.label}>Full Name</label>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            className={authStyles.input}
            required
          />
        </div>

        {role === "seller" && (
          <div>
            <label className={authStyles.label}>Business Name</label>
            <input
              type="text"
              name="businessName"
              autoComplete="organization"
              value={formData.businessName}
              onChange={handleChange}
              className={authStyles.input}
              required
            />
          </div>
        )}

        <div>
          <label className={authStyles.label}>Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            autoComplete="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+254"
            className={authStyles.input}
            required
          />
        </div>

        <div>
          <label className={authStyles.label}>Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              className={authStyles.input}
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
        </div>

        <div>
          <label className={authStyles.label}>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={authStyles.input}
            required
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <button type="submit" disabled={loading} className={authStyles.button}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/auth/signin" className={authStyles.link}>
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUpForm;
