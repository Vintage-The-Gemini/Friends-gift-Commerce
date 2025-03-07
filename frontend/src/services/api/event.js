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
      // Create a FormData object to properly handle file uploads
      const formData = new FormData();

      // Add basic event data
      formData.append("title", eventData.title);
      formData.append("eventType", eventData.eventType);
      formData.append("description", eventData.description);
      formData.append("eventDate", eventData.eventDate);
      formData.append("endDate", eventData.endDate);
      formData.append("visibility", eventData.visibility);
      formData.append("targetAmount", eventData.targetAmount);

      // For custom event types
      if (eventData.eventType === "other" && eventData.customEventType) {
        formData.append("customEventType", eventData.customEventType);
      }

      // Handle products - THIS IS THE KEY PART
      if (
        eventData.selectedProducts &&
        Array.isArray(eventData.selectedProducts)
      ) {
        // Convert selected products to the format expected by backend
        const productsArray = eventData.selectedProducts.map((item) => ({
          product: item.product._id,
          quantity: parseInt(item.quantity) || 1,
        }));

        // Stringify the products array and append it
        formData.append("products", JSON.stringify(productsArray));
      }

      // Handle image if provided
      if (eventData.image) {
        // If image is a file, append directly
        if (eventData.image instanceof File) {
          formData.append("image", eventData.image);
        }
        // If image is a URL/string, append as is
        else if (typeof eventData.image === "string") {
          formData.append("image", eventData.image);
        }
      }

      // Send the request with proper headers for FormData
      const response = await api.post(ENDPOINTS.BASE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

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
      const requestData = {
        title: eventData.title,
        eventType: eventData.eventType,
        description: eventData.description,
        eventDate: eventData.eventDate,
        endDate: eventData.endDate,
        visibility: eventData.visibility,
      };

      // Add customEventType if it exists (for "other" event type)
      if (eventData.customEventType) {
        requestData.customEventType = eventData.customEventType;
      }

      // Add image if it exists
      if (eventData.image) {
        requestData.image = eventData.image;
      }

      // Handle selected products consistent with createEvent
      if (
        eventData.selectedProducts &&
        Array.isArray(eventData.selectedProducts)
      ) {
        const productArray = eventData.selectedProducts.map((item) => ({
          product: item.product._id,
          quantity: parseInt(item.quantity) || 1,
        }));

        // IMPORTANT: Backend expects a stringified JSON array
        requestData.products = JSON.stringify(productArray);
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
