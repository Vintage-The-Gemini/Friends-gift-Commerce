// backend/src/controllers/event/eventInvitations.js
const Event = require('../../models/Event');
const User = require('../../models/User');
const mongoose = require('mongoose');

/**
 * Invite users to an event
 * @route POST /api/events/:id/invite
 * @access Private (Owner only)
 */
const inviteUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { invites } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    if (!invites || !Array.isArray(invites) || invites.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one invite is required'
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.creator.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only invite users to your own events.'
      });
    }

    // Validate and process invites
    const validInvites = [];
    const errors = [];

    for (let i = 0; i < invites.length; i++) {
      const invite = invites[i];
      
      // Validate email format if provided
      if (invite.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(invite.email)) {
          errors.push(`Invalid email format at position ${i + 1}: ${invite.email}`);
          continue;
        }
      }

      // Validate phone format if provided (Kenyan format)
      if (invite.phoneNumber) {
        const phoneRegex = /^\+254[0-9]{9}$/;
        if (!phoneRegex.test(invite.phoneNumber)) {
          errors.push(`Invalid phone format at position ${i + 1}: ${invite.phoneNumber}. Use format +254XXXXXXXXX`);
          continue;
        }
      }

      // Must have either email or phone
      if (!invite.email && !invite.phoneNumber) {
        errors.push(`Either email or phone number required at position ${i + 1}`);
        continue;
      }

      // Check if already invited
      const alreadyInvited = event.invitedUsers.some(existing => 
        (invite.email && existing.email === invite.email) ||
        (invite.phoneNumber && existing.phoneNumber === invite.phoneNumber)
      );

      if (alreadyInvited) {
        errors.push(`User at position ${i + 1} is already invited`);
        continue;
      }

      validInvites.push({
        name: invite.name?.trim() || '',
        email: invite.email?.toLowerCase().trim() || '',
        phoneNumber: invite.phoneNumber?.trim() || '',
        status: 'pending',
        invitedAt: new Date()
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors occurred',
        errors
      });
    }

    if (validInvites.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid invites to process'
      });
    }

    // Add invites to event
    event.invitedUsers.push(...validInvites);
    await event.save();

    // Here you would typically send emails/SMS notifications
    // For now, we'll just log the intention
    console.log(`Sending invitations for event ${event.title} to:`, validInvites);

    res.json({
      success: true,
      message: `Successfully invited ${validInvites.length} user(s)`,
      data: {
        eventId: event._id,
        totalInvited: validInvites.length,
        totalInvitedUsers: event.invitedUsers.length,
        newInvites: validInvites
      }
    });

  } catch (error) {
    console.error('Invite users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invitations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Respond to event invitation
 * @route PUT /api/events/:id/invitation/respond
 * @access Private
 */
const respondToInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body; // 'accepted' or 'declined'

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    if (!['accepted', 'declined'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'Response must be "accepted" or "declined"'
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Find the user's invitation
    const user = await User.findById(req.user.userId);
    const invitation = event.invitedUsers.find(invite => 
      (invite.email && invite.email === user.email) ||
      (invite.phoneNumber && invite.phoneNumber === user.phoneNumber)
    );

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'No invitation found for this user'
      });
    }

    // Update invitation status
    invitation.status = response;
    invitation.respondedAt = new Date();

    await event.save();

    res.json({
      success: true,
      message: `Invitation ${response} successfully`,
      data: {
        eventId: event._id,
        eventTitle: event.title,
        response: response,
        respondedAt: invitation.respondedAt
      }
    });

  } catch (error) {
    console.error('Respond to invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to invitation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get event invitations (for event owner)
 * @route GET /api/events/:id/invitations
 * @access Private (Owner only)
 */
const getEventInvitations = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query; // 'pending', 'accepted', 'declined'

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const event = await Event.findById(id).lean();
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.creator.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view invitations for your own events.'
      });
    }

    let invitations = event.invitedUsers || [];

    // Filter by status if provided
    if (status && ['pending', 'accepted', 'declined'].includes(status)) {
      invitations = invitations.filter(invite => invite.status === status);
    }

    // Calculate summary
    const summary = {
      total: event.invitedUsers?.length || 0,
      pending: event.invitedUsers?.filter(i => i.status === 'pending').length || 0,
      accepted: event.invitedUsers?.filter(i => i.status === 'accepted').length || 0,
      declined: event.invitedUsers?.filter(i => i.status === 'declined').length || 0
    };

    res.json({
      success: true,
      data: invitations,
      summary
    });

  } catch (error) {
    console.error('Get event invitations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event invitations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  inviteUsers,
  respondToInvitation,
  getEventInvitations
};