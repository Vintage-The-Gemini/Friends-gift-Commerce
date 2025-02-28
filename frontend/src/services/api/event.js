// src/services/api/event.js
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
      const response = await api.post(ENDPOINTS.BASE, eventData);
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

  getEvent: async (eventId) => {
    try {
      const response = await api.get(ENDPOINTS.DETAIL(eventId));
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
      const response = await api.put(ENDPOINTS.DETAIL(eventId), eventData);
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
      // Build query params
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const queryString = params.toString();
      const url = queryString
        ? `${ENDPOINTS.MY_EVENTS}?${queryString}`
        : ENDPOINTS.MY_EVENTS;

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
        emails,
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

  getInvitations: async (eventId) => {
    try {
      const response = await api.get(
        `${ENDPOINTS.DETAIL(eventId)}/invitations`
      );
      return response.data;
    } catch (error) {
      console.error("[Event Service] Get Invitations Error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to fetch invitations",
          error: error.message,
        }
      );
    }
  },
};
