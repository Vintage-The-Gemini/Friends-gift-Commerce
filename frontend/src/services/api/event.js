// src/services/api/event.js
import api from "./axios.config";

// API endpoints
const ENDPOINTS = {
  BASE: "/events",
  MY_EVENTS: "/events/my-events",
  DETAIL: (id) => `/events/${id}`,
  STATS: (id) => `/events/${id}/stats`,
  INVITE: (id) => `/events/${id}/invite`,
  RESPOND: (id) => `/events/${id}/respond`,
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

        console.log("Processed products array:", productsArray);
        const productsJson = JSON.stringify(productsArray);
        console.log("Stringified products:", productsJson);

        // Stringify the products array and append it
        formData.append("products", productsJson);
      } else if (eventData.products && typeof eventData.products === "string") {
        // If products is already a JSON string, use it directly
        console.log("Using pre-formatted products JSON:", eventData.products);
        formData.append("products", eventData.products);
      } else {
        console.warn(
          "No products or invalid products format:",
          eventData.selectedProducts || eventData.products
        );
      }

      // Handle image if provided
      if (eventData.image) {
        // If image is a file, append directly
        if (eventData.image instanceof File) {
          console.log("Appending image file:", eventData.image.name);
          formData.append("image", eventData.image);
        }
        // If image is a URL/string, append as is
        else if (typeof eventData.image === "string") {
          console.log("Appending image URL");
          formData.append("image", eventData.image);
        }
      }

      // Debug what's in formData
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        // Don't log the full image data
        if (pair[0] === "image" && !(typeof pair[1] === "string")) {
          console.log("image: [File object]");
        } else {
          console.log(pair[0] + ": " + pair[1]);
        }
      }

      // Send the request with proper headers for FormData
      console.log("Sending request to:", ENDPOINTS.BASE);
      const response = await api.post(ENDPOINTS.BASE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Event creation response:", response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to create event");
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

  getEvent: async (eventId, params = {}) => {
    try {
      // Support passing either accessCode as a string or as part of params object
      let queryParams = { ...params };

      // Build URL with params
      let url = ENDPOINTS.DETAIL(eventId);

      // Make the request with query params
      const response = await api.get(url, { params: queryParams });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch event details");
    }
  },

  updateEvent: async (eventId, eventData) => {
    try {
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

      console.log("Updating event with data:", Object.fromEntries(formData));
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

  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(ENDPOINTS.DETAIL(eventId));
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to delete event");
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

      console.log("Fetching user events from:", url);
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch your events");
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
      return handleApiError(error, "Failed to fetch invited events");
    }
  },

  getEventStats: async (eventId) => {
    try {
      const response = await api.get(ENDPOINTS.STATS(eventId));
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch event statistics");
    }
  },

  // Enhanced method for inviting users with better error handling
  inviteUsers: async (eventId, invites) => {
    try {
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

  // Add method for responding to invitations
  respondToInvitation: async (eventId, response) => {
    try {
      const result = await api.post(ENDPOINTS.RESPOND(eventId), { response });
      return result.data;
    } catch (error) {
      return handleApiError(error, "Failed to respond to invitation");
    }
  },

  // Get access-controlled event with proper error handling
  getPrivateEvent: async (eventId, accessCode) => {
    try {
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
};

export default eventService;
