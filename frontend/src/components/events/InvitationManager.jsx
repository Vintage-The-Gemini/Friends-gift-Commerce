// src/components/events/InvitationManager.jsx
import React, { useState } from "react";
import { Users, Mail, Phone, Plus, Trash, Copy } from "lucide-react";
import { eventService } from "../../services/api/event";
import { toast } from "react-toastify";

const InvitationManager = ({ event, onInvitationsSent, accessCode }) => {
  const [invites, setInvites] = useState([
    { name: "", email: "", phoneNumber: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleInputChange = (index, field, value) => {
    const updatedInvites = [...invites];
    updatedInvites[index][field] = value;
    setInvites(updatedInvites);
  };

  const addInviteRow = () => {
    setInvites([...invites, { name: "", email: "", phoneNumber: "" }]);
  };

  const removeInviteRow = (index) => {
    if (invites.length === 1) {
      // Keep at least one row, just clear it
      setInvites([{ name: "", email: "", phoneNumber: "" }]);
      return;
    }

    const updatedInvites = [...invites];
    updatedInvites.splice(index, 1);
    setInvites(updatedInvites);
  };

  const validateInvites = () => {
    // Filter out empty rows
    const validInvites = invites.filter(
      (invite) => invite.email.trim() || invite.phoneNumber.trim()
    );

    if (validInvites.length === 0) {
      setError("Please provide at least one email or phone number");
      return false;
    }

    // Validate email format if provided
    for (const invite of validInvites) {
      if (invite.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite.email)) {
        setError(`Invalid email format: ${invite.email}`);
        return false;
      }

      // Validate phone format if provided
      if (invite.phoneNumber && !/^\+254[0-9]{9}$/.test(invite.phoneNumber)) {
        setError(
          `Invalid phone number format: ${invite.phoneNumber}. Use format: +254XXXXXXXXX`
        );
        return false;
      }
    }

    setError("");
    return validInvites;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validInvites = validateInvites();
    if (!validInvites) return;

    setLoading(true);
    try {
      const response = await eventService.inviteUsers(event._id, validInvites);

      if (response.success) {
        toast.success("Invitations sent successfully");
        setInvites([{ name: "", email: "", phoneNumber: "" }]);

        if (onInvitationsSent) {
          onInvitationsSent(response.data);
        }
      } else {
        throw new Error(response.message || "Failed to send invitations");
      }
    } catch (error) {
      console.error("Error sending invitations:", error);
      setError(error.message || "Failed to send invitations");
      toast.error(error.message || "Failed to send invitations");
    } finally {
      setLoading(false);
    }
  };

  const copyShareableLink = () => {
    const link = `${window.location.origin}/events/${event._id}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setCopied(true);
        toast.success("Link copied to clipboard");

        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        toast.error("Failed to copy link");
      });
  };

  const copyAccessCode = () => {
    if (!accessCode) return;

    navigator.clipboard
      .writeText(accessCode)
      .then(() => {
        toast.success("Access code copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy access code:", err);
        toast.error("Failed to copy access code");
      });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-medium mb-6 flex items-center">
        <Users className="w-6 h-6 mr-2 text-[#5551FF]" />
        Invite People to Your Event
      </h2>

      {/* Sharing Options */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Sharing Options</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Shareable Link */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-gray-700">Share Link</h4>
              <button
                onClick={copyShareableLink}
                className="text-[#5551FF] hover:text-[#4440FF] p-1 rounded-md hover:bg-[#5551FF]/10 transition-colors"
                title="Copy link to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Share this link with others to let them view your event.
            </p>
          </div>

          {/* Access Code */}
          {accessCode && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-700">Access Code</h4>
                <button
                  onClick={copyAccessCode}
                  className="text-[#5551FF] hover:text-[#4440FF] p-1 rounded-md hover:bg-[#5551FF]/10 transition-colors"
                  title="Copy access code to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Share this code for private event access:
                </p>
                <span className="font-mono text-sm bg-[#5551FF]/10 px-2 py-1 rounded text-[#5551FF]">
                  {accessCode}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Form */}
      <form onSubmit={handleSubmit}>
        <h3 className="font-medium text-gray-700 mb-3">Send Invites</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-4">
          {invites.map((invite, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg"
            >
              {/* Name Field */}
              <div className="md:col-span-4">
                <label className="flex items-center text-xs font-medium text-gray-700 mb-1">
                  <Users className="w-3 h-3 mr-1" />
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={invite.name}
                  onChange={(e) =>
                    handleInputChange(index, "name", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#5551FF]"
                  placeholder="Enter name"
                />
              </div>

              {/* Email Field */}
              <div className="md:col-span-3">
                <label className="flex items-center text-xs font-medium text-gray-700 mb-1">
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={invite.email}
                  onChange={(e) =>
                    handleInputChange(index, "email", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#5551FF]"
                  placeholder="Enter email"
                />
              </div>

              {/* Phone Field */}
              <div className="md:col-span-4">
                <label className="flex items-center text-xs font-medium text-gray-700 mb-1">
                  <Phone className="w-3 h-3 mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={invite.phoneNumber}
                  onChange={(e) =>
                    handleInputChange(index, "phoneNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#5551FF]"
                  placeholder="+254..."
                />
              </div>

              {/* Remove Button */}
              <div className="md:col-span-1 flex items-end justify-center">
                <button
                  type="button"
                  onClick={() => removeInviteRow(index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  title="Remove"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <button
            type="button"
            onClick={addInviteRow}
            className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Person
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center py-2 px-6 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF] disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Invitations"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvitationManager;
