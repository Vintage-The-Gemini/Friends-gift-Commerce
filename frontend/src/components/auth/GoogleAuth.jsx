// frontend/src/components/auth/GoogleAuth.jsx
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

const GoogleAuth = ({ buttonText = "Sign in with Google", role = "buyer" }) => {
  const { loginWithGoogle } = useAuth();
  const googleButtonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // Validate client ID
    if (!clientId) {
      setError("Google Client ID not configured");
      setIsLoading(false);
      return;
    }

    if (!clientId.endsWith('.apps.googleusercontent.com')) {
      setError("Invalid Google Client ID format");
      setIsLoading(false);
      return;
    }

    console.log("[GoogleAuth] Initializing with Client ID:", clientId?.substring(0, 20) + "...");

    // Define the callback function
    const handleGoogleSignIn = async (response) => {
      console.log("[GoogleAuth] Google response received");
      
      try {
        if (!response?.credential) {
          throw new Error("No credential received from Google");
        }
        
        console.log("[GoogleAuth] Sending credential to backend");
        const result = await loginWithGoogle(response.credential, role);
        console.log("[GoogleAuth] Login successful");
        
        toast.success("Google sign-in successful");
      } catch (error) {
        console.error("[GoogleAuth] Login error:", error);
        toast.error(`Google sign-in failed: ${error.message}`);
      }
    };

    // Make callback globally available
    window.handleGoogleSignIn = handleGoogleSignIn;

    const initializeGoogle = () => {
      if (window.google?.accounts?.id) {
        try {
          // Initialize Google Sign-In
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Use requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            if (googleButtonRef.current) {
              // Clear any existing content
              googleButtonRef.current.innerHTML = '';
              
              // Render the button
              window.google.accounts.id.renderButton(googleButtonRef.current, {
                type: "standard",
                theme: "outline", 
                size: "large",
                text: "signin_with",
                width: 250,
              });
              
              setIsLoading(false);
              console.log("[GoogleAuth] Button rendered successfully");
            } else {
              console.error("[GoogleAuth] Button ref still null after requestAnimationFrame");
              setError("Button container not available");
              setIsLoading(false);
            }
          });
        } catch (error) {
          console.error("[GoogleAuth] Google initialization error:", error);
          setError("Failed to initialize Google Sign-In");
          setIsLoading(false);
        }
      } else {
        console.log("[GoogleAuth] Google API not ready, loading script...");
        loadGoogleScript();
      }
    };

    const loadGoogleScript = () => {
      // Check if script already exists
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        console.log("[GoogleAuth] Script already exists, waiting for load...");
        setTimeout(initializeGoogle, 100);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log("[GoogleAuth] Google API script loaded");
        setTimeout(initializeGoogle, 100); // Small delay to ensure API is ready
      };
      
      script.onerror = () => {
        console.error("[GoogleAuth] Failed to load Google API script");
        setError("Failed to load Google Sign-In API");
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
    };

    // Start initialization
    initializeGoogle();

    // Cleanup
    return () => {
      delete window.handleGoogleSignIn;
    };
  }, [clientId, loginWithGoogle, role]);

  if (error) {
    return (
      <div className="flex justify-center my-4">
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
          Google Sign-In Error: {error}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center my-4">
        <div className="text-gray-600 text-sm bg-gray-50 p-3 rounded border">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            Loading Google Sign-In...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center my-4">
      <div 
        ref={googleButtonRef}
        id="google-signin-button"
        className="google-signin-button"
        style={{ 
          minHeight: '44px', 
          minWidth: '250px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      />
    </div>
  );
};

export default GoogleAuth;