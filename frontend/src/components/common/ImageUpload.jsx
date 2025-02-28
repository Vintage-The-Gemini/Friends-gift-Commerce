import React, { useState, useRef } from "react";
import { Upload, X, Image, Camera, Loader } from "lucide-react";
import { toast } from "react-toastify";

/**
 * Image upload component that handles file selection, preview, and upload to server
 *
 * @param {Function} onUpload - Callback function that receives the uploaded image URL
 * @param {string} label - Label for the upload field
 * @param {string} currentImage - Current image URL (if already uploaded)
 * @param {string} className - Additional CSS classes to apply
 * @param {number} maxSizeMB - Maximum file size in MB (default: 5MB)
 */
const ImageUpload = ({
  onUpload,
  label = "Upload Image",
  currentImage,
  className = "",
  maxSizeMB = 5,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset states
    setError("");

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
      setError("Only image files (JPEG, PNG, GIF) are allowed");
      return;
    }

    // Validate file size
    if (file.size > maxSizeBytes) {
      setError(`Image size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Show preview immediately for better UX
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload image to server
    setUploading(true);

    try {
      // Create form data for the file upload
      const formData = new FormData();
      formData.append("image", file);

      // Upload to server
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload image");
      }

      // Call the callback with the image URL
      onUpload(data.imageUrl);
      setError("");
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload image. Please try again.");
      // Keep the preview but notify about upload failure
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUpload(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {previewUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity">
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center h-48 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
            disabled={uploading}
          />

          {uploading ? (
            <div className="text-center">
              <Loader className="w-10 h-10 text-[#5551FF] animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Uploading image...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-[#5551FF]/10 flex items-center justify-center mb-3">
                <Camera className="w-6 h-6 text-[#5551FF]" />
              </div>
              <p className="text-sm font-medium text-[#5551FF] mb-1">
                Click to upload an image
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG or GIF (max. {maxSizeMB}MB)
              </p>
            </>
          )}
        </div>
      )}

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
};

export default ImageUpload;
