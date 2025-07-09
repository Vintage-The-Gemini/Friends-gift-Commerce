// frontend/src/components/auth/GoogleAuth.jsx - SIMPLE WORKING VERSION
import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

const GoogleAuth = ({ role = "buyer" }) => {
  const { loginWithGoogle } = useAuth();
  const [buttonRendered, setButtonRendered] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      console.error("No Google Client ID found");
      return;
    }

    // Simple script loading without complex logic
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    
    script.onload = () => {
      // Wait a bit for Google to be ready, then initialize
      setTimeout(() => {
        if (window.google?.accounts?.id) {
          try {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: async (response) => {
                try {
                  await loginWithGoogle(response.credential, role);
                  toast.success("Google sign-in successful");
                } catch (error) {
                  console.error("Login failed:", error);
                  toast.error("Google sign-in failed");
                }
              }
            });

            // Render button directly
            const container = document.getElementById("google-signin-div");
            if (container) {
              window.google.accounts.id.renderButton(container, {
                type: "standard",
                theme: "outline",
                size: "large",
                text: "signin_with",
                width: 250
              });
              setButtonRendered(true);
            }
          } catch (error) {
            console.error("Google initialization failed:", error);
          }
        }
      }, 500); // Give Google time to load
    };

    script.onerror = () => {
      console.error("Failed to load Google script");
    };

    document.head.appendChild(script);

    // Cleanup
    return () => {
      script.remove();
    };
  }, [clientId, loginWithGoogle, role]);

  // Show nothing while loading, show button when ready
  return (
    <div className="flex justify-center my-4">
      {!buttonRendered && (
        <div className="w-64 h-11 bg-gray-100 rounded flex items-center justify-center">
          <span className="text-sm text-gray-600">Loading Google Sign-In...</span>
        </div>
      )}
      <div 
        id="google-signin-div" 
        style={{ display: buttonRendered ? 'block' : 'none' }}
      />
    </div>
  );
};

export default GoogleAuth;