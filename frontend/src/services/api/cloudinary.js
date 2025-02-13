// src/services/api/cloudinary.js
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Debug logging
console.log("Cloudinary Config:", {
  cloudName: CLOUD_NAME || "not set",
  uploadPreset: UPLOAD_PRESET || "not set",
  envVars: import.meta.env,
});

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  console.error(
    "Missing Cloudinary configuration. Please check your .env file"
  );
}

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export const uploadToCloudinary = async (file) => {
  try {
    // Validate configuration before upload
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error(
        "Cloudinary configuration missing. Please check your environment variables."
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    console.log("Starting upload to:", CLOUDINARY_URL);

    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Failed to parse error response" }));
      console.error("Upload failed:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Upload successful:", {
      publicId: data.public_id,
      url: data.secure_url,
    });

    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
