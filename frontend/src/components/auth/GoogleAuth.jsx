import React, { useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

const GoogleAuth = ({ buttonText = "Sign in with Google", role = "buyer" }) => {
  const { loginWithGoogle } = useAuth();
  const googleButtonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // Debug client ID
    console.log("[GoogleAuth] Client ID:", clientId);
    console.log("[GoogleAuth] Current origin:", window.location.origin);

    // Define callback with enhanced debugging
    window.handleGoogleSignIn = async (response) => {
      console.log("[GoogleAuth] Raw Google response:", response);
      
      try {
        if (!response) {
          console.error("[GoogleAuth] No response from Google");
          toast.error("Google sign-in failed: No response received");
          return;
        }
        
        if (!response.credential) {
          console.error("[GoogleAuth] No credential in response:", response);
          toast.error("Google sign-in failed: No credential received");
          return;
        }
        
        console.log("[GoogleAuth] Credential received, sending to backend");
        
        // Calling loginWithGoogle with debug info
        const result = await loginWithGoogle(response.credential, role);
        console.log("[GoogleAuth] Login result:", result);
        
        toast.success("Google sign-in successful");
      } catch (error) {
        console.error("[GoogleAuth] Error during login:", error);
        console.error("[GoogleAuth] Error stack:", error.stack);
        toast.error(`Google sign-in failed: ${error.message || "Unknown error"}`);
      }
    };

    // Load the Google Sign-In API script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("[GoogleAuth] Google API script loaded");
      
      if (!window.google) {
        console.error("[GoogleAuth] window.google not available after script load");
        return;
      }
      
      try {
        console.log("[GoogleAuth] Initializing Google Sign-In");
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: window.handleGoogleSignIn,
          cancel_on_tap_outside: true,
        });
        
        console.log("[GoogleAuth] Rendering Google button");
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          width: 250,
        });
        
        console.log("[GoogleAuth] Google button rendered");
      } catch (error) {
        console.error("[GoogleAuth] Error initializing Google Sign-In:", error);
      }
    };
    
    script.onerror = (error) => {
      console.error("[GoogleAuth] Failed to load Google API script:", error);
    };
    
    document.body.appendChild(script);
    console.log("[GoogleAuth] Google API script added to DOM");

    // Cleanup
    return () => {
      console.log("[GoogleAuth] Cleaning up Google Auth component");
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      delete window.handleGoogleSignIn;
    };
  }, [clientId, loginWithGoogle, role]);

  return (
    <div className="flex justify-center my-4">
      <div ref={googleButtonRef}></div>
    </div>
  );
};

export default GoogleAuth;