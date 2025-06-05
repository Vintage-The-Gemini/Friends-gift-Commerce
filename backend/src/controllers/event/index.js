// backend/src/controllers/event/index.js
const eventCRUD = require('./eventCRUD');
const eventValidation = require('./eventValidation');
const eventCheckout = require('./eventCheckout');
const eventContributions = require('./eventContributions');
const eventInvitations = require('./eventInvitations');

// Re-export all controller functions to maintain existing API structure
module.exports = {
  // CRUD Operations
  createEvent: eventCRUD.createEvent,
  getEvents: eventCRUD.getEvents,
  getEventById: eventCRUD.getEventById,
  updateEvent: eventCRUD.updateEvent,
  deleteEvent: eventCRUD.deleteEvent,
  getUserEvents: eventCRUD.getUserEvents,
  
  // Status Management
  updateEventStatus: eventValidation.updateEventStatus,
  
  // Checkout & Orders
  getEventCheckoutEligibility: eventCheckout.getEventCheckoutEligibility,
  completeEventCheckout: eventCheckout.completeEventCheckout,
  
  // Contributions
  getEventContributions: eventContributions.getEventContributions,
  
  // Invitations & Access
  inviteUsers: eventInvitations.inviteUsers,
  respondToInvitation: eventInvitations.respondToInvitation,
};