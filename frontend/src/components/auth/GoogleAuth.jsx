// src/components/auth/GoogleAuth.jsx
import React, { useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

const GoogleAuth = ({ buttonText = "Sign in with Google", role = "buyer" }) => {
  const { loginWithGoogle } = useAuth();
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Define the callback function for Google Sign In
    window.handleGoogleSignIn = async (response) => {
      try {
        await loginWithGoogle(response.credential, role);
        toast.success("Google sign-in successful");
      } catch (error) {
        console.error("Google sign-in error:", error);
        toast.error(error.message || "Google sign-in failed");
      }
    };

    // Load the Google Sign-In API script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Initialize Google Sign-In when script loads
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: window.handleGoogleSignIn,
        });

        // Render the button
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          width: "100%",
        });
      }
    };

    // Cleanup
    return () => {
      // Remove the script tag if it exists
      const scriptTag = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (scriptTag) {
        document.body.removeChild(scriptTag);
      }
      delete window.handleGoogleSignIn;
    };
  }, [loginWithGoogle, role]);

  return (
    <div className="w-full flex justify-center">
      <div
        id="google-signin-button"
        ref={googleButtonRef}
        className="w-full"
      ></div>
    </div>
  );
};

export default GoogleAuth;
