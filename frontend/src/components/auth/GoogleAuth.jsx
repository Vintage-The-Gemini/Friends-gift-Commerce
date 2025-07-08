// frontend/src/components/auth/GoogleAuth.jsx - COMPLETE DEBUG VERSION
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

const GoogleAuth = ({ buttonText = "Sign in with Google", role = "buyer" }) => {
  const { loginWithGoogle } = useAuth();
  const googleButtonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  // Get client ID
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // Comprehensive debugging
    const debug = {
      rawClientId: clientId,
      clientIdType: typeof clientId,
      clientIdLength: clientId?.length || 0,
      clientIdExists: !!clientId,
      clientIdFirst20: clientId?.substring(0, 20) || 'N/A',
      clientIdLast30: clientId?.substring(clientId?.length - 30) || 'N/A',
      endsWithCorrectFormat: clientId?.endsWith('.apps.googleusercontent.com') || false,
      currentOrigin: window.location.origin,
      allViteEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')),
      nodeEnv: import.meta.env.MODE,
    };

    setDebugInfo(debug);

    console.log("🔍 === COMPLETE GOOGLE AUTH DEBUG ===");
    console.log("1. Raw Client ID:", debug.rawClientId);
    console.log("2. Client ID Type:", debug.clientIdType);
    console.log("3. Client ID Length:", debug.clientIdLength);
    console.log("4. Client ID Exists:", debug.clientIdExists);
    console.log("5. First 20 chars:", debug.clientIdFirst20);
    console.log("6. Last 30 chars:", debug.clientIdLast30);
    console.log("7. Correct format:", debug.endsWithCorrectFormat);
    console.log("8. Current Origin:", debug.currentOrigin);
    console.log("9. All VITE vars:", debug.allViteEnvVars);
    console.log("10. Node ENV:", debug.nodeEnv);
    console.log("🔍 === DEBUG END ===");

    // Step 1: Check if client ID exists
    if (!clientId) {
      console.error("❌ STEP 1 FAILED: Client ID is missing");
      setError("Google Client ID not configured. Check your .env file.");
      setIsLoading(false);
      return;
    }

    // Step 2: Check if client ID is a string
    if (typeof clientId !== 'string') {
      console.error("❌ STEP 2 FAILED: Client ID is not a string:", typeof clientId);
      setError(`Google Client ID must be a string, got: ${typeof clientId}`);
      setIsLoading(false);
      return;
    }

    // Step 3: Check if client ID is not empty
    if (clientId.trim() === '') {
      console.error("❌ STEP 3 FAILED: Client ID is empty string");
      setError("Google Client ID is empty");
      setIsLoading(false);
      return;
    }

    // Step 4: Check length (should be around 70+ characters)
    if (clientId.length < 50) {
      console.error("❌ STEP 4 FAILED: Client ID too short:", clientId.length);
      setError(`Google Client ID too short (${clientId.length} chars). Expected 70+ chars.`);
      setIsLoading(false);
      return;
    }

    // Step 5: Check format
    if (!clientId.endsWith('.apps.googleusercontent.com')) {
      console.error("❌ STEP 5 FAILED: Invalid format. Client ID:", clientId);
      setError(`Invalid format. Must end with '.apps.googleusercontent.com'. Got: ${clientId}`);
      setIsLoading(false);
      return;
    }

    console.log("✅ ALL VALIDATION STEPS PASSED");

    // Define the callback function
    const handleGoogleSignIn = async (response) => {
      console.log("🔐 [GoogleAuth] Google response received:", response);
      
      try {
        if (!response?.credential) {
          throw new Error("No credential received from Google");
        }
        
        console.log("🔐 [GoogleAuth] Credential length:", response.credential.length);
        console.log("🔐 [GoogleAuth] Sending to backend with role:", role);
        
        const result = await loginWithGoogle(response.credential, role);
        console.log("🔐 [GoogleAuth] Backend response:", result);
        
        toast.success("Google sign-in successful");
      } catch (error) {
        console.error("🔐 [GoogleAuth] Login error:", error);
        toast.error(`Google sign-in failed: ${error.message}`);
      }
    };

    // Make callback globally available
    window.handleGoogleSignIn = handleGoogleSignIn;

    // Load Google Sign-In API
    console.log("📡 Loading Google API script...");
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("📡 Google API script loaded successfully");
      
      if (!window.google) {
        console.error("❌ window.google not available");
        setError("Google API object not available");
        setIsLoading(false);
        return;
      }

      if (!window.google.accounts) {
        console.error("❌ window.google.accounts not available");
        setError("Google accounts API not available");
        setIsLoading(false);
        return;
      }

      if (!window.google.accounts.id) {
        console.error("❌ window.google.accounts.id not available");
        setError("Google accounts ID API not available");
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("🔧 Initializing Google Sign-In...");
        console.log("🔧 Using Client ID:", clientId.substring(0, 20) + "..." + clientId.substring(clientId.length - 20));
        
        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        
        console.log("✅ Google Sign-In initialized successfully");
        
        // Check if button ref exists
        if (!googleButtonRef.current) {
          console.error("❌ Button ref is null");
          setError("Button container not found");
          setIsLoading(false);
          return;
        }

        console.log("🎨 Rendering Google button...");
        
        // Render the button
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          width: 250,
        });
        
        setIsLoading(false);
        console.log("✅ Google button rendered successfully");
        
      } catch (error) {
        console.error("❌ Google initialization error:", error);
        console.error("❌ Error stack:", error.stack);
        setError(`Google initialization failed: ${error.message}`);
        setIsLoading(false);
      }
    };
    
    script.onerror = (error) => {
      console.error("❌ Google API script loading failed:", error);
      setError("Failed to load Google Sign-In API script");
      setIsLoading(false);
    };
    
    document.head.appendChild(script);
    console.log("📡 Google API script added to document head");

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up Google Auth component");
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      delete window.handleGoogleSignIn;
    };
  }, [clientId, loginWithGoogle, role]);

  if (error) {
    return (
      <div className="flex justify-center my-4">
        <div className="max-w-md w-full">
          <div className="text-red-600 text-sm bg-red-50 p-4 rounded border border-red-200">
            <div className="font-semibold mb-2">🚨 Google Sign-In Error:</div>
            <div className="mb-3">{error}</div>
            
            <details className="text-xs">
              <summary className="cursor-pointer font-medium mb-2">🔍 Debug Information</summary>
              <div className="bg-gray-100 p-2 rounded mt-2 font-mono">
                <div>Client ID Exists: {debugInfo.clientIdExists ? '✅' : '❌'}</div>
                <div>Client ID Type: {debugInfo.clientIdType}</div>
                <div>Client ID Length: {debugInfo.clientIdLength}</div>
                <div>Correct Format: {debugInfo.endsWithCorrectFormat ? '✅' : '❌'}</div>
                <div>First 20 chars: {debugInfo.clientIdFirst20}</div>
                <div>Last 30 chars: {debugInfo.clientIdLast30}</div>
                <div>VITE vars: {debugInfo.allViteEnvVars?.join(', ')}</div>
              </div>
            </details>
            
            <div className="text-xs mt-3 text-gray-600">
              💡 <strong>Quick fixes:</strong>
              <ul className="list-disc list-inside mt-1">
                <li>Check your <code>.env</code> file in frontend root</li>
                <li>Restart your development server</li>
                <li>Verify Client ID ends with <code>.apps.googleusercontent.com</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center my-4">
        <div className="text-gray-600 text-sm bg-gray-50 p-3 rounded animate-pulse border">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            Loading Google Sign-In...
          </div>
          <div className="text-xs mt-1 text-gray-500">
            Initializing with Client ID: {debugInfo.clientIdFirst20}...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center my-4">
      <div ref={googleButtonRef} className="google-signin-button"></div>
    </div>
  );
};

export default GoogleAuth;