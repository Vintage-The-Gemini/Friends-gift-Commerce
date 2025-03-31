// src/services/api/event.js
import api from "./axios.config";

// API endpoints with proper structure to avoid route conflicts
const ENDPOINTS = {
  BASE: "/events",
  MY_EVENTS: "/events/my-events", // Specific endpoint for user events
  DETAIL: (id) => `/events/${id}`,
  STATS: (id) => `/events/${id}/stats`,
  INVITE: (id) => `/events/${id}/invite`,
  RESPOND: (id) => `/events/${id}/respond`,
  CONTRIBUTIONS: (id) => `/events/${id}/contributions`,

  // Make absolutely sure this endpoint is formatted correctly
  STATUS: (id) => `/events/${id}/status`,
};
// Helper function to handle API errors consistently
const handleApiError = (error, defaultMessage) => {
  console.error("[Event Service] Error:", error);

  if (error.response) {
    // Create enhanced error with additional properties
    const enhancedError = new Error(
      error.response.data?.message || defaultMessage
    );

    // Add useful properties to the error
    enhancedError.status = error.response.status;
    enhancedError.errorType = error.response.data?.errorType;
    enhancedError.response = error.response;

    throw enhancedError;
  }

  // If no response, throw generic error
  throw (
    error.response?.data || {
      success: false,
      message: defaultMessage,
      error: error.message,
    }
  );
};

// Event service methods
export const eventService = {
  // Create a new event
  createEvent: async (eventData) => {
    try {
      console.log("Creating event with data:", eventData);

      // Create a FormData object to properly handle file uploads
      const formData = new FormData();

      // Add basic event data
      formData.append("title", eventData.title);
      formData.append("eventType", eventData.eventType);
      formData.append("description", eventData.description);
      formData.append("eventDate", eventData.eventDate);
      formData.append("endDate", eventData.endDate);
      formData.append("visibility", eventData.visibility || "public");
      formData.append("targetAmount", eventData.targetAmount);

      // For custom event types
      if (eventData.eventType === "other" && eventData.customEventType) {
        formData.append("customEventType", eventData.customEventType);
      }

      // Debug logging for products
      console.log(
        "Selected products before processing:",
        eventData.selectedProducts
          ? JSON.stringify(
              eventData.selectedProducts.map((p) => ({
                id: p.product._id,
                name: p.product.name,
              }))
            )
          : "none"
      );

      // Handle products
      if (
        eventData.selectedProducts &&
        Array.isArray(eventData.selectedProducts)
      ) {
        // Convert selected products to the format expected by backend
        const productsArray = eventData.selectedProducts.map((item) => ({
          product: item.product._id,
          quantity: parseInt(item.quantity) || 1,
        }));

        const productsJson = JSON.stringify(productsArray);
        formData.append("products", productsJson);
      } else if (eventData.products && typeof eventData.products === "string") {
        // If products is already a JSON string, use it directly
        formData.append("products", eventData.products);
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
      return handleApiError(error, "Failed to create event");
    }
  },

  // Get all public events
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
      if (filters.visibility) params.append("visibility", filters.visibility);

      const queryString = params.toString();
      const url = queryString
        ? `${ENDPOINTS.BASE}?${queryString}`
        : ENDPOINTS.BASE;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch events");
    }
  },

  // Get an event by ID
  getEvent: async (eventId, params = {}) => {
    try {
      if (!eventId) {
        throw new Error("Event ID is required");
      }

      // Make sure we're using a valid MongoDB ID format
      // A simple check for a valid-looking ObjectId (24 char hex string)
      if (!/^[0-9a-fA-F]{24}$/.test(eventId)) {
        throw new Error("Invalid event ID format");
      }

      // Build URL with params
      let url = ENDPOINTS.DETAIL(eventId);

      // Make the request with query params
      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch event details");
    }
  },

  // Update an existing event
  updateEvent: async (eventId, eventData) => {
    try {
      if (!eventId) {
        throw new Error("Event ID is required");
      }

      // Use FormData for multipart uploads
      const formData = new FormData();

      // Add basic event data
      if (eventData.title) formData.append("title", eventData.title);
      if (eventData.eventType)
        formData.append("eventType", eventData.eventType);
      if (eventData.description)
        formData.append("description", eventData.description);
      if (eventData.eventDate)
        formData.append("eventDate", eventData.eventDate);
      if (eventData.endDate) formData.append("endDate", eventData.endDate);
      if (eventData.visibility)
        formData.append("visibility", eventData.visibility);

      // Add customEventType if it exists (for "other" event type)
      if (eventData.customEventType) {
        formData.append("customEventType", eventData.customEventType);
      }

      // Handle image
      if (eventData.image) {
        if (eventData.image instanceof File) {
          formData.append("image", eventData.image);
        } else if (typeof eventData.image === "string") {
          formData.append("image", eventData.image);
        }
      }

      // Handle selected products
      if (
        eventData.selectedProducts &&
        Array.isArray(eventData.selectedProducts)
      ) {
        const productArray = eventData.selectedProducts.map((item) => ({
          product: item.product._id || item.product,
          quantity: parseInt(item.quantity) || 1,
        }));

        // IMPORTANT: Backend expects a stringified JSON array
        formData.append("products", JSON.stringify(productArray));
      } else if (eventData.products) {
        // Handle direct products property if provided
        if (typeof eventData.products === "string") {
          formData.append("products", eventData.products);
        } else if (Array.isArray(eventData.products)) {
          formData.append("products", JSON.stringify(eventData.products));
        }
      }

      const response = await api.put(ENDPOINTS.DETAIL(eventId), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to update event");
    }
  },

  // Delete an event
  deleteEvent: async (eventId) => {
    try {
      if (!eventId) {
        throw new Error("Event ID is required");
      }

      const response = await api.delete(ENDPOINTS.DETAIL(eventId));
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to delete event");
    }
  },

  // Get current user's events - using the dedicated endpoint
  getUserEvents: async (filters = {}) => {
    try {
      // Build query params for filtering
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
      return handleApiError(error, "Failed to fetch your events");
    }
  },

  // Get events the user has been invited to
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
      return handleApiError(error, "Failed to fetch invited events");
    }
  },

  // Get stats for an event
  getEventStats: async (eventId) => {
    try {
      if (!eventId) {
        throw new Error("Event ID is required");
      }

      const response = await api.get(ENDPOINTS.STATS(eventId));
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch event statistics");
    }
  },

  // Invite users to an event
  inviteUsers: async (eventId, invites) => {
    try {
      if (!eventId) {
        throw new Error("Event ID is required");
      }

      // Support both array of emails and array of objects with email/phone
      const inviteData = Array.isArray(invites)
        ? { invites: invites }
        : invites;

      const response = await api.post(ENDPOINTS.INVITE(eventId), inviteData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to send invitations");
    }
  },

  // Respond to an event invitation
  respondToInvitation: async (eventId, response) => {
    try {
      if (!eventId) {
        throw new Error("Event ID is required");
      }

      const result = await api.post(ENDPOINTS.RESPOND(eventId), { response });
      return result.data;
    } catch (error) {
      return handleApiError(error, "Failed to respond to invitation");
    }
  },

  // Get contributions for an event
  getEventContributions: async (eventId, params = {}) => {
    try {
      if (!eventId) {
        throw new Error("Event ID is required");
      }

      const response = await api.get(ENDPOINTS.CONTRIBUTIONS(eventId), {
        params,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch event contributions");
    }
  },

  // Get access-controlled event with proper error handling
  getPrivateEvent: async (eventId, accessCode) => {
    try {
      if (!eventId) {
        throw new Error("Event ID is required");
      }

      if (!accessCode) {
        throw new Error("Access code is required for private events");
      }

      const response = await api.get(ENDPOINTS.DETAIL(eventId), {
        params: { accessCode },
      });
      return response.data;
    } catch (error) {
      // Handle specific error types
      if (error.response && error.response.status === 403) {
        // Create enhanced error for better UI handling
        const accessError = new Error(
          "You don't have permission to view this event"
        );
        accessError.status = 403;
        accessError.errorType = "accessDenied";
        throw accessError;
      }

      return handleApiError(error, "Failed to access private event");
    }
  },

  // Update event status - using PUT instead of PATCH for better compatibility
  updateEventStatus: async (eventId, status) => {
    try {
      if (!eventId) {
        throw new Error("Event ID is required");
      }

      if (!status) {
        throw new Error("Status is required");
      }

      console.log(`Updating event status - ID: ${eventId}, Status: ${status}`);
      console.log(`API call to: ${ENDPOINTS.STATUS(eventId)}`);

      // Try PUT instead of PATCH for better compatibility with some servers
      const response = await api.put(ENDPOINTS.STATUS(eventId), { status });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to update event status");
    }
  },
};

export default eventService;
