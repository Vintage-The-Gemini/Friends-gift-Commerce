// src/services/api/event.js
import api from "./axios.config";

// API endpoints
const ENDPOINTS = {
  BASE: "/events",
  MY_EVENTS: "/events/my-events",
  DETAIL: (id) => `/events/${id}`,
};

// Handle API responses
const handleResponse = async (apiCall, errorMessage) => {
  try {
    const response = await apiCall();

    if (!response.data.success) {
      throw new Error(response.data.message || errorMessage);
    }

    return response.data;
  } catch (error) {
    console.error(`API Error: ${errorMessage}`, error);
    throw error.response?.data || { message: errorMessage };
  }
};

// Event service methods
export const eventService = {
  createEvent: (eventData) =>
    handleResponse(
      () => api.post(ENDPOINTS.BASE, eventData),
      "Failed to create event"
    ),

  getEvents: (params = {}) =>
    handleResponse(
      () => api.get(ENDPOINTS.BASE, { params }),
      "Failed to fetch events"
    ),

  getEvent: (eventId) =>
    handleResponse(
      () => api.get(ENDPOINTS.DETAIL(eventId)),
      "Failed to fetch event"
    ),

  updateEvent: (eventId, eventData) =>
    handleResponse(
      () => api.put(ENDPOINTS.DETAIL(eventId), eventData),
      "Failed to update event"
    ),

  deleteEvent: (eventId) =>
    handleResponse(
      () => api.delete(ENDPOINTS.DETAIL(eventId)),
      "Failed to delete event"
    ),

  getUserEvents: () =>
    handleResponse(
      () => api.get(ENDPOINTS.MY_EVENTS),
      "Failed to fetch user events"
    ),

  // Additional helper methods
  validateEventData: (eventData) => {
    const requiredFields = [
      "title",
      "eventType",
      "description",
      "eventDate",
      "endDate",
    ];
    const missingFields = requiredFields.filter((field) => !eventData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    if (!eventData.products || eventData.products.length === 0) {
      throw new Error("At least one product is required");
    }

    return true;
  },

  formatEventData: (rawData) => {
    return {
      ...rawData,
      products:
        typeof rawData.products === "string"
          ? rawData.products
          : JSON.stringify(rawData.products),
      title: rawData.title?.trim(),
      description: rawData.description?.trim(),
      targetAmount: parseFloat(rawData.targetAmount) || 0,
    };
  },
};

export default eventService;
