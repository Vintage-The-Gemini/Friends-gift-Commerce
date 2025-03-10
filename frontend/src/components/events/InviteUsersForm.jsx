// src/components/events/InviteUsersForm.jsx
import React, { useState } from "react";
import {
  Plus,
  X,
  Mail,
  Phone,
  User,
  Copy,
  Check,
  Link as LinkIcon,
} from "lucide-react";
import { eventService } from "../../services/api/event";
import { toast } from "react-toastify";

const InviteUsersForm = ({ eventId, accessCode, onInvitationSent }) => {
  const [invites, setInvites] = useState([
    { email: "", phoneNumber: "", name: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState({
    link: false,
    code: false,
  });

  const handleInputChange = (index, field, value) => {
    const updatedInvites = [...invites];
    updatedInvites[index][field] = value;
    setInvites(updatedInvites);
  };

  const addInviteField = () => {
    setInvites([...invites, { email: "", phoneNumber: "", name: "" }]);
  };

  const removeInviteField = (index) => {
    if (invites.length === 1) {
      // Keep at least one invite form
      setInvites([{ email: "", phoneNumber: "", name: "" }]);
      return;
    }

    const updatedInvites = [...invites];
    updatedInvites.splice(index, 1);
    setInvites(updatedInvites);
  };

  const validateForm = () => {
    // Check if at least one invite has email or phone
    const validInvites = invites.filter(
      (invite) => invite.email.trim() || invite.phoneNumber.trim()
    );

    if (validInvites.length === 0) {
      setError("Please enter at least one email or phone number");
      return false;
    }

    // Clear any previous errors
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Filter out empty invites
      const validInvites = invites.filter(
        (invite) => invite.email.trim() || invite.phoneNumber.trim()
      );

      const response = await eventService.inviteUsers(eventId, validInvites);

      if (response.success) {
        toast.success(response.message || "Invitations sent successfully");

        // Reset form
        setInvites([{ email: "", phoneNumber: "", name: "" }]);

        // Callback
        if (onInvitationSent) {
          onInvitationSent(response.data);
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

  const copyToClipboard = (text, type) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied({ ...copied, [type]: true });

        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopied({ ...copied, [type]: false });
        }, 2000);

        toast.success(
          `${
            type === "link" ? "Event link" : "Access code"
          } copied to clipboard`
        );
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast.error("Failed to copy to clipboard");
      });
  };

  const eventLink = `${window.location.origin}/events/${eventId}`;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium mb-4">Invite People</h3>

      {/* Shareable Link and Access Code */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shareable Link
          </label>
          <div className="flex">
            <input
              type="text"
              value={eventLink}
              readOnly
              className="flex-1 bg-gray-50 border rounded-l-lg px-3 py-2"
            />
            <button
              onClick={() => copyToClipboard(eventLink, "link")}
              className="bg-gray-100 border-y border-r rounded-r-lg px-3 py-2 hover:bg-gray-200"
            >
              {copied.link ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {accessCode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Code
            </label>
            <div className="flex">
              <input
                type="text"
                value={accessCode}
                readOnly
                className="flex-1 bg-gray-50 border rounded-l-lg px-3 py-2"
              />
              <button
                onClick={() => copyToClipboard(accessCode, "code")}
                className="bg-gray-100 border-y border-r rounded-r-lg px-3 py-2 hover:bg-gray-200"
              >
                {copied.code ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Share this code with people you want to invite
            </p>
          </div>
        )}
      </div>

      {/* Invite Form */}
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {invites.map((invite, index) => (
            <div key={index} className="p-3 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-700">
                  Person {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeInviteField(index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center mb-1">
                    <User className="w-4 h-4 text-gray-400 mr-1" />
                    <label className="text-sm text-gray-700">
                      Name (Optional)
                    </label>
                  </div>
                  <input
                    type="text"
                    value={invite.name}
                    onChange={(e) =>
                      handleInputChange(index, "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <div className="flex items-center mb-1">
                    <Mail className="w-4 h-4 text-gray-400 mr-1" />
                    <label className="text-sm text-gray-700">Email</label>
                  </div>
                  <input
                    type="email"
                    value={invite.email}
                    onChange={(e) =>
                      handleInputChange(index, "email", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <div className="flex items-center mb-1">
                    <Phone className="w-4 h-4 text-gray-400 mr-1" />
                    <label className="text-sm text-gray-700">
                      Phone Number
                    </label>
                  </div>
                  <input
                    type="tel"
                    value={invite.phoneNumber}
                    onChange={(e) =>
                      handleInputChange(index, "phoneNumber", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="+254..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={addInviteField}
            className="flex items-center justify-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Person
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Sending Invitations..." : "Send Invitations"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InviteUsersForm;
