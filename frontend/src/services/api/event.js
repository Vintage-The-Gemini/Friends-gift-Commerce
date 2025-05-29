// src/services/api/event.js - OPTIMIZED VERSION
import api from "./axios.config";

// Cache implementation for better performance
class EventCache {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  get(key) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.cacheTimeout) {
      return item.data;
    }
    this.cache.delete(key);
    return null;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  invalidate(pattern) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  clear() {
    this.cache.clear();
  }
}

const eventCache = new EventCache();

// API endpoints with proper structure to avoid route conflicts
const ENDPOINTS = {
  BASE: "/events",
  MY_EVENTS: "/events/my-events",
  DETAIL: (id) => `/events/${id}`,
  STATS: (id) => `/events/${id}/stats`,
  INVITE: (id) => `/events/${id}/invite`,
  RESPOND: (id) => `/events/${id}/respond`,
  CONTRIBUTIONS: (id) => `/events/${id}/contributions`,
  STATUS: (id) => `/events/${id}/status`,
  CHECKOUT_STATUS: (id) => `/events/${id}/checkout-status`,
  CHECKOUT: (id) => `/events/${id}/checkout`,
};

// Helper function to handle API errors consistently
const handleApiError = (error, defaultMessage) => {
  console.error("[Event Service] Error:", error);

  if (error.response) {
    const enhancedError = new Error(
      error.response.data?.message || defaultMessage
    );
    enhancedError.status = error.response.status;
    enhancedError.errorType = error.response.data?.errorType;
    enhancedError.response = error.response;
    throw enhancedError;
  }

  throw (
    error.response?.data || {
      success: false,
      message: defaultMessage,
      error: error.message,
    }
  );
};

// Request deduplication to prevent duplicate API calls
const pendingRequests = new Map();

const deduplicate = async (key, requestFn) => {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
};

// Event service methods
export const eventService = {
  // Create a new event
  createEvent: async (eventData) => {
    try {
      console.log("Creating event with data:", eventData);

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

      // Handle products
      if (eventData.selectedProducts && Array.isArray(eventData.selectedProducts)) {
        const productsArray = eventData.selectedProducts.map((item) => ({
          product: item.product._id,
          quantity: parseInt(item.quantity) || 1,
        }));
        formData.append("products", JSON.stringify(productsArray));
      }

      // Handle image if provided
      if (eventData.image instanceof File) {
        formData.append("image", eventData.image);
      } else if (typeof eventData.image === "string") {
        formData.append("image", eventData.image);
      }

      const response = await api.post(ENDPOINTS.BASE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Invalidate cache after creation
      eventCache.invalidate();

      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to create event");
    }
  },

  // Get all public events with caching and optimization
  getEvents: async (filters = {}) => {
    try {
      // Create cache key based on filters
      const cacheKey = `events_${JSON.stringify(filters)}`;
      
      // Check cache first
      const cached = eventCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Deduplicate requests
      const requestKey = `getEvents_${cacheKey}`;
      
      return await deduplicate(requestKey, async () => {
        // Build query params with optimization
        const params = new URLSearchParams();

        // Essential filters
        if (filters.status) params.append("status", filters.status);
        if (filters.eventType) params.append("eventType", filters.eventType);
        if (filters.search) params.append("search", filters.search);
        if (filters.visibility) params.append("visibility", filters.visibility);
        
        // Pagination
        params.append("page", filters.page || 1);
        params.append("limit", Math.min(filters.limit || 12, 50)); // Limit max items
        
        // Sorting
        if (filters.sortBy) params.append("sortBy", filters.sortBy);

        // Select only essential fields for list view
        params.append("select", "title,image,currentAmount,targetAmount,eventDate,endDate,status,creator,eventType,visibility,contributions");

        const url = `${ENDPOINTS.BASE}?${params.toString()}`;
        const response = await api.get(url);

        // Cache the response
        eventCache.set(cacheKey, response.data);

        return response.data;
      });
    } catch (error) {
      return handleApiError(error, "Failed to fetch events");
    }
  },

  // Get an event by ID with caching
  getEvent: async (eventId, params = {}) => {
    try {
      if (!eventId || !/^[0-9a-fA-F]{24}$/.test(eventId)) {
        throw new Error("Invalid event ID format");
      }

      const cacheKey = `event_${eventId}_${JSON.stringify(params)}`;
      const cached = eventCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const requestKey = `getEvent_${eventId}`;
      
      return await deduplicate(requestKey, async () => {
        const response = await api.get(ENDPOINTS.DETAIL(eventId), { params });
        
        // Cache individual event
        eventCache.set(cacheKey, response.data);
        
        return response.data;
      });
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

      const formData = new FormData();

      // Add basic event data
      if (eventData.title) formData.append("title", eventData.title);
      if (eventData.eventType) formData.append("eventType", eventData.eventType);
      if (eventData.description) formData.append("description", eventData.description);
      if (eventData.eventDate) formData.append("eventDate", eventData.eventDate);
      if (eventData.endDate) formData.append("endDate", eventData.endDate);
      if (eventData.visibility) formData.append("visibility", eventData.visibility);

      // Add customEventType if it exists
      if (eventData.customEventType) {
        formData.append("customEventType", eventData.customEventType);
      }

      // Handle image
      if (eventData.image instanceof File) {
        formData.append("image", eventData.image);
      } else if (typeof eventData.image === "string") {
        formData.append("image", eventData.image);
      }

      // Handle selected products
      if (eventData.selectedProducts && Array.isArray(eventData.selectedProducts)) {
        const productArray = eventData.selectedProducts.map((item) => ({
          product: item.product._id || item.product,
          quantity: parseInt(item.quantity) || 1,
        }));
        formData.append("products", JSON.stringify(productArray));
      } else if (eventData.products) {
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

      // Invalidate cache for this event and lists
      eventCache.invalidate(eventId);
      eventCache.invalidate("events_");

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

      // Invalidate cache
      eventCache.invalidate(eventId);
      eventCache.invalidate("events_");

      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to delete event");
    }
  },

  // Get current user's events with caching
  getUserEvents: async (filters = {}) => {
    try {
      const cacheKey = `userEvents_${JSON.stringify(filters)}`;
      const cached = eventCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const queryString = params.toString();
      const url = queryString ? `${ENDPOINTS.MY_EVENTS}?${queryString}` : ENDPOINTS.MY_EVENTS;

      const requestKey = `getUserEvents_${cacheKey}`;
      
      return await deduplicate(requestKey, async () => {
        const response = await api.get(url);
        
        // Cache with shorter timeout for user-specific data
        eventCache.set(cacheKey, response.data);
        
        return response.data;
      });
    } catch (error) {
      return handleApiError(error, "Failed to fetch your events");
    }
  },

  // Get events the user has been invited to
  getInvitedEvents: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const queryString = params.toString();
      const url = queryString ? `/events/user/invited?${queryString}` : "/events/user/invited";

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

      const cacheKey = `eventStats_${eventId}`;
      const cached = eventCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await api.get(ENDPOINTS.STATS(eventId));
      
      // Cache stats with shorter timeout
      eventCache.set(cacheKey, response.data);
      
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

      const inviteData = Array.isArray(invites) ? { invites: invites } : invites;
      const response = await api.post(ENDPOINTS.INVITE(eventId), inviteData);

      // Invalidate event cache
      eventCache.invalidate(eventId);

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

  // Get contributions for an event with caching
  getEventContributions: async (eventId, params = {}) => {
    try {
      if (!eventId) {
        throw new Error("Event ID is required");
      }

      const cacheKey = `contributions_${eventId}_${JSON.stringify(params)}`;
      const cached = eventCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await api.get(ENDPOINTS.CONTRIBUTIONS(eventId), { params });
      
      // Cache contributions with shorter timeout
      eventCache.set(cacheKey, response.data);
      
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
      if (error.response && error.response.status === 403) {
        const accessError = new Error("You don't have permission to view this event");
        accessError.status = 403;
        accessError.errorType = "accessDenied";
        throw accessError;
      }
      return handleApiError(error, "Failed to access private event");
    }
  },

  // Update event status
  updateEventStatus: async (eventId, status) => {
    try {
      if (!eventId || !status) {
        throw new Error("Event ID and status are required");
      }

      console.log(`Updating event status - ID: ${eventId}, Status: ${status}`);

      const response = await api.put(ENDPOINTS.STATUS(eventId), { status });

      // Invalidate cache for this event
      eventCache.invalidate(eventId);
      eventCache.invalidate("events_");

      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to update event status");
    }
  },

  // Complete event checkout
  completeEventCheckout: async (checkoutData) => {
    try {
      if (!checkoutData.eventId) {
        throw new Error("Event ID is required");
      }
      
      const url = ENDPOINTS.CHECKOUT(checkoutData.eventId);
      console.log("Checkout endpoint URL:", url);
      console.log("Sending checkout data:", JSON.stringify(checkoutData));
      
      const response = await api.post(url, checkoutData);

      // Invalidate cache after checkout
      eventCache.invalidate(checkoutData.eventId);
      eventCache.invalidate("events_");

      return response.data;
    } catch (error) {
      console.error("Checkout API error:", error);
      const errorMessage = error.response?.data?.message || 
                           error.message || 
                           "Failed to complete checkout";
      throw new Error(errorMessage);
    }
  },

  // Get event checkout eligibility
  getEventCheckoutEligibility: async (eventId) => {
    try {
      if (!eventId) {
        throw new Error("Event ID is required");
      }
  
      const cacheKey = `checkout_eligibility_${eventId}`;
      const cached = eventCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const url = ENDPOINTS.CHECKOUT_STATUS(eventId);
      const response = await api.get(url);

      // Cache eligibility with short timeout (1 minute)
      const shortCache = new Map();
      shortCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      setTimeout(() => shortCache.delete(cacheKey), 60000);

      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to check event eligibility");
    }
  },

  // Cache management methods
  cache: {
    clear: () => eventCache.clear(),
    invalidate: (pattern) => eventCache.invalidate(pattern),
    get: (key) => eventCache.get(key),
    set: (key, data) => eventCache.set(key, data)
  }
};

export default eventService;