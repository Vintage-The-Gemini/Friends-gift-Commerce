// src/components/events/EventInvitations.jsx
import React, { useState } from "react";
import { Check, X, Users, Mail, Phone, Plus } from "lucide-react";
import InviteUsersForm from "./InviteUsersForm";
import { eventService } from "../../services/api/event";
import { toast } from "react-toastify";

const EventInvitations = ({ event, isOwner, onInviteSent }) => {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [loading, setLoading] = useState({});

  const handleRespondToInvitation = async (eventId, response) => {
    setLoading({ [response]: true });

    try {
      const result = await eventService.respondToInvitation(eventId, response);

      if (result.success) {
        toast.success(result.message || `Invitation ${response}`);

        // Trigger re-fetch of event details
        if (onInviteSent) {
          onInviteSent();
        }
      } else {
        throw new Error(result.message || "Failed to respond to invitation");
      }
    } catch (error) {
      console.error("Error responding to invitation:", error);
      toast.error(error.message || "Failed to respond to invitation");
    } finally {
      setLoading({ [response]: false });
    }
  };

  // Check if current user is invited
  const isUserInvited = (event) => {
    if (!event?.invitedUsers || !event.invitedUsers.length) {
      return false;
    }

    // This assumes the user's email or phone is available in the component scope
    // If not, you'll need to pass these as props or use a context
    return event.invitedUsers.some(
      (user) =>
        (user.email && user.email === currentUserEmail) ||
        (user.phoneNumber && user.phoneNumber === currentUserPhone)
    );
  };

  // Get current user's invitation status
  const getUserInvitationStatus = (event) => {
    if (!event?.invitedUsers || !event.invitedUsers.length) {
      return null;
    }

    const userInvite = event.invitedUsers.find(
      (user) =>
        (user.email && user.email === currentUserEmail) ||
        (user.phoneNumber && user.phoneNumber === currentUserPhone)
    );

    return userInvite ? userInvite.status : null;
  };

  // If user data isn't available directly, this is how you'd get it
  const currentUserEmail = "current-user@example.com"; // Replace with actual user email
  const currentUserPhone = "+254XXXXXXXXX"; // Replace with actual user phone

  const invitationStatus = getUserInvitationStatus(event);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium flex items-center">
          <Users className="w-5 h-5 mr-2 text-indigo-500" />
          Event Participants
        </h3>

        {isOwner && (
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            {showInviteForm ? "Cancel" : "Invite People"}
          </button>
        )}
      </div>

      {/* Invitation Form for Event Owner */}
      {isOwner && showInviteForm && (
        <div className="mb-6">
          <InviteUsersForm
            eventId={event._id}
            accessCode={event.accessCode}
            onInvitationSent={() => {
              setShowInviteForm(false);
              if (onInviteSent) onInviteSent();
            }}
          />
        </div>
      )}

      {/* Current User's Invitation Status (if they're invited) */}
      {!isOwner && invitationStatus && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium mb-2">Your Invitation</h4>

          {invitationStatus === "pending" ? (
            <div>
              <p className="text-gray-600 mb-4">
                You've been invited to this event. Would you like to attend?
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() =>
                    handleRespondToInvitation(event._id, "accepted")
                  }
                  disabled={loading.accepted}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading.accepted ? (
                    "Processing..."
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    handleRespondToInvitation(event._id, "declined")
                  }
                  disabled={loading.declined}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading.declined ? (
                    "Processing..."
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Decline
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  invitationStatus === "accepted"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {invitationStatus === "accepted" ? "Accepted" : "Declined"}
              </span>
              {invitationStatus === "declined" && (
                <button
                  onClick={() =>
                    handleRespondToInvitation(event._id, "accepted")
                  }
                  className="ml-4 text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Change to Accepted
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Guest List */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Guest List</h4>

        {!event?.invitedUsers || event.invitedUsers.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No guests have been invited yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {event.invitedUsers.map((user, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || "Guest"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col text-sm text-gray-500">
                        {user.email && (
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email}
                          </div>
                        )}
                        {user.phoneNumber && (
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {user.phoneNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                          user.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : user.status === "declined"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.status.charAt(0).toUpperCase() +
                          user.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventInvitations;
