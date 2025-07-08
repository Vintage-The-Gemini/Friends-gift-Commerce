// frontend/src/components/auth/GoogleAuth.jsx
import React, { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

const GoogleAuth = ({ role = "buyer" }) => {
  const { loginWithGoogle } = useAuth();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      console.error("No Google Client ID found");
      return;
    }

    // Load Google script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      // Initialize when script loads
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              await loginWithGoogle(response.credential, role);
              toast.success("Google sign-in successful");
            } catch (error) {
              toast.error("Google sign-in failed");
            }
          }
        });

        // Render the button
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-div"),
          {
            type: "standard",
            theme: "outline", 
            size: "large",
            text: "signin_with",
            width: 250
          }
        );
      }
    };
    document.head.appendChild(script);
  }, [clientId, loginWithGoogle, role]);

  return (
    <div className="flex justify-center my-4">
      <div id="google-signin-div"></div>
    </div>
  );
};

export default GoogleAuth;