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
      console.log("Original event data:", eventData);

      // Create a new object for the request
      const requestData = { ...eventData };

      // Check if products is an array (not already stringified)
      if (requestData.products && typeof requestData.products === "string") {
        // Already a string, no need to change it
        console.log("Products already stringified:", requestData.products);
      } else if (Array.isArray(requestData.products)) {
        // Convert array to string
        console.log("Converting products array to string");
        requestData.products = JSON.stringify(requestData.products);
      } else if (
        requestData.selectedProducts &&
        Array.isArray(requestData.selectedProducts)
      ) {
        // Handle case where products data is in selectedProducts
        console.log("Using selectedProducts array");
        const formattedProducts = requestData.selectedProducts.map((item) => ({
          product: item.product._id,
          quantity: parseInt(item.quantity) || 1,
        }));
        requestData.products = JSON.stringify(formattedProducts);
        // Remove the selectedProducts property as it's not needed on the server
        delete requestData.selectedProducts;
      }

      console.log("Sending request data:", requestData);

      const response = await api.post(ENDPOINTS.BASE, requestData);
      return response.data;
    } catch (error) {
      console.error("[Event Service] Create Error:", error);
      if (error.response?.data) {
        console.error("Server error response:", error.response.data);
      }
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
      // Copy eventData to avoid modifying the original object
      const requestData = { ...eventData };

      // Format products data if needed
      if (requestData.products && typeof requestData.products !== "string") {
        requestData.products = JSON.stringify(requestData.products);
      } else if (
        requestData.selectedProducts &&
        Array.isArray(requestData.selectedProducts)
      ) {
        const formattedProducts = requestData.selectedProducts.map((item) => ({
          product: item.product._id,
          quantity: parseInt(item.quantity) || 1,
        }));
        requestData.products = JSON.stringify(formattedProducts);
        delete requestData.selectedProducts;
      }

      const response = await api.put(ENDPOINTS.DETAIL(eventId), requestData);
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
