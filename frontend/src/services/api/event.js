// src/services/api/event.js - Fixed version

import api from "./axios.config";

// API endpoints
const ENDPOINTS = {
  BASE: "/events",
  MY_EVENTS: "/events/user",
  DETAIL: (id) => `/events/${id}`,
  STATS: (id) => `/events/${id}/stats`,
};

// Event service methods
export const eventService = {
  createEvent: async (eventData) => {
    try {
      // Fix - Convert 'products' property if it's a JSON string to an actual array
      const formattedData = { ...eventData };

      // If products is a string that's actually a JSON array, parse it
      if (typeof formattedData.products === "string") {
        try {
          // Check if the string is already a valid JSON array
          const parsed = JSON.parse(formattedData.products);

          // If it's an array, use it directly, otherwise keep as string
          // (server may expect string format)
          if (!Array.isArray(parsed)) {
            console.log("Warning: Parsed products is not an array", parsed);
          }
        } catch (err) {
          console.error("Error parsing products JSON:", err);
          // If parsing fails, create a new array with the products
          formattedData.products = JSON.stringify(eventData.products);
        }
      } else if (Array.isArray(eventData.products)) {
        // If it's already an array, stringify it
        formattedData.products = JSON.stringify(eventData.products);
      }

      console.log("Sending formatted data to API:", formattedData);
      const response = await api.post(ENDPOINTS.BASE, formattedData);
      return response.data;
    } catch (error) {
      console.error("[Event Service] Create Error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to create event",
          error: error.message,
        }
      );
    }
  },

  getEvents: async (filters = {}) => {
    try {
      // Build query params
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.eventType) params.append("eventType", filters.eventType);
      if (filters.search) params.append("search", filters.search);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const queryString = params.toString();
      const url = queryString
        ? `${ENDPOINTS.BASE}?${queryString}`
        : ENDPOINTS.BASE;

      console.log("Fetching events from:", url);
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("[Event Service] Get Events Error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to fetch events",
          error: error.message,
        }
      );
    }
  },

  getEvent: async (eventId, accessCode = null) => {
    try {
      let url = ENDPOINTS.DETAIL(eventId);
      // Add access code as query param if provided (for private/unlisted events)
      if (accessCode) {
        url += `?accessCode=${accessCode}`;
      }

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("[Event Service] Get Event Error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to fetch event details",
          error: error.message,
        }
      );
    }
  },

  updateEvent: async (eventId, eventData) => {
    try {
      // Apply the same fix for updating events
      const formattedData = { ...eventData };

      if (typeof formattedData.products === "string") {
        try {
          JSON.parse(formattedData.products);
          // Keep it as is if already properly formatted JSON string
        } catch (err) {
          // If parsing fails, create a new array with the products
          formattedData.products = JSON.stringify(eventData.products);
        }
      } else if (Array.isArray(eventData.products)) {
        // If it's already an array, stringify it
        formattedData.products = JSON.stringify(eventData.products);
      }

      const response = await api.put(ENDPOINTS.DETAIL(eventId), formattedData);
      return response.data;
    } catch (error) {
      console.error("[Event Service] Update Error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to update event",
          error: error.message,
        }
      );
    }
  },

  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(ENDPOINTS.DETAIL(eventId));
      return response.data;
    } catch (error) {
      console.error("[Event Service] Delete Error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to delete event",
          error: error.message,
        }
      );
    }
  },

  getUserEvents: async (filters = {}) => {
    try {
      console.log("Fetching user events with filters:", filters);

      // Build query params
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const queryString = params.toString();
      const url = queryString
        ? `${ENDPOINTS.MY_EVENTS}?${queryString}`
        : ENDPOINTS.MY_EVENTS;

      console.log("Fetching user events from:", url);
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("[Event Service] Get User Events Error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to fetch your events",
          error: error.message,
        }
      );
    }
  },

  getInvitedEvents: async (filters = {}) => {
    try {
      // Build query params
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const queryString = params.toString();
      const url = queryString
        ? `/events/user/invited?${queryString}`
        : "/events/user/invited";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("[Event Service] Get Invited Events Error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to fetch invited events",
          error: error.message,
        }
      );
    }
  },

  getEventStats: async (eventId) => {
    try {
      const response = await api.get(ENDPOINTS.STATS(eventId));
      return response.data;
    } catch (error) {
      console.error("[Event Service] Get Event Stats Error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to fetch event statistics",
          error: error.message,
        }
      );
    }
  },

  inviteUsers: async (eventId, emails) => {
    try {
      const response = await api.post(`${ENDPOINTS.DETAIL(eventId)}/invite`, {
        invites: emails,
      });
      return response.data;
    } catch (error) {
      console.error("[Event Service] Invite Users Error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to send invitations",
          error: error.message,
        }
      );
    }
  },
};

export default eventService;
