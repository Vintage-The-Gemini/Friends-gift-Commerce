// backend/src/controllers/event/eventCRUD.js
const Event = require('../../models/Event');
const Product = require('../../models/Product');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Create a new event with expanded event types and custom events
 * @route POST /api/events
 * @access Private
 */
const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      eventType,
      customEventType, // New field for custom events
      description,
      eventDate,
      endDate,
      visibility,
      targetAmount,
      products,
      image
    } = req.body;

    // Expanded list of event types
    const allowedEventTypes = [
      'birthday', 'wedding', 'graduation', 'babyShower', 
      'houseWarming', 'anniversary', 'retirement', 'engagement',
      'christening', 'baptism', 'communion', 'confirmation',
      'funeral', 'memorial', 'celebration', 'farewell',
      'thanksgiving', 'holiday', 'christmas', 'newyear',
      'valentines', 'mothers-day', 'fathers-day', 'easter',
      'charity', 'fundraiser', 'teambuilding', 'reunion',
      'promotion', 'achievement', 'milestone', 'recovery',
      'houseblessing', 'business-launch', 'opening', 'other'
    ];

    if (!allowedEventTypes.includes(eventType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event type. Please choose from available options or select "other" for custom events.'
      });
    }

    // If eventType is 'other', customEventType is required
    if (eventType === 'other' && !customEventType?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Custom event type is required when event type is "other"'
      });
    }

    // Validate custom event type length
    if (eventType === 'other' && customEventType.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Custom event type must be 50 characters or less'
      });
    }

    // Parse and validate products
    let productList = [];
    if (products) {
      try {
        productList = typeof products === 'string' ? JSON.parse(products) : products;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid products format'
        });
      }
    }

    if (!productList || productList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product must be selected for the event'
      });
    }

    // Validate product IDs and calculate target amount
    let calculatedTargetAmount = 0;
    for (const item of productList) {
      if (!mongoose.isValidObjectId(item.product)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID: ${item.product}`
        });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is not available`
        });
      }

      calculatedTargetAmount += product.price * (item.quantity || 1);
    }

    // Use calculated target amount if not provided
    const finalTargetAmount = targetAmount || calculatedTargetAmount;

    // Generate access code for private/unlisted events
    const accessCode = visibility !== 'public' ? 
      Math.random().toString(36).substring(2, 8).toUpperCase() : null;

    // Create event
    const event = new Event({
      title: title.trim(),
      eventType,
      customEventType: eventType === 'other' ? customEventType.trim() : undefined,
      description: description.trim(),
      eventDate: new Date(eventDate),
      endDate: new Date(endDate),
      visibility,
      targetAmount: finalTargetAmount,
      currentAmount: 0,
      products: productList.map(item => ({
        product: item.product,
        quantity: item.quantity || 1,
        status: 'pending'
      })),
      creator: req.user.userId,
      status: 'pending', // Will be activated after initial contribution
      accessCode,
      image: image || null,
      invitedUsers: [],
      contributions: []
    });

    await event.save();

    // Populate creator and products for response
    await event.populate([
      { path: 'creator', select: 'name email' },
      { path: 'products.product', select: 'name price images description' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all events (with filters)
 * @route GET /api/events
 * @access Public/Private
 */
const getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      eventType,
      status = 'active',
      visibility = 'public',
      sortBy = '-createdAt',
      creator
    } = req.query;

    // Build filter object
    const filter = {};

    // Add status filter
    if (status !== 'all') {
      filter.status = status;
    }

    // Add visibility filter (only admins can see all)
    if (req.user?.role !== 'admin') {
      if (visibility === 'public') {
        filter.visibility = 'public';
      } else {
        // For non-public events, only show user's own events
        filter.creator = req.user?.userId;
      }
    } else if (visibility !== 'all') {
      filter.visibility = visibility;
    }

    // Add creator filter
    if (creator) {
      filter.creator = creator;
    }

    // Add event type filter
    if (eventType && eventType !== 'all') {
      filter.eventType = eventType;
    }

    // Add search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { customEventType: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query with population
    const [events, totalCount] = await Promise.all([
      Event.find(filter)
        .populate('creator', 'name email')
        .populate('products.product', 'name price images stock')
        .sort(sortBy)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Event.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: events,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get single event by ID
 * @route GET /api/events/:id
 * @access Public/Private (depends on visibility)
 */
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const { accessCode } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const event = await Event.findById(id)
      .populate('creator', 'name email phoneNumber')
      .populate('products.product', 'name price description images stock seller')
      .populate('contributions', 'amount contributor createdAt anonymous message')
      .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check access permissions
    const isOwner = req.user && event.creator._id.toString() === req.user.userId;
    const isAdmin = req.user?.role === 'admin';

    if (event.visibility === 'private') {
      if (!isOwner && !isAdmin) {
        // Check if user provided correct access code
        if (!accessCode || accessCode !== event.accessCode) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. This event is private.',
            requiresAccessCode: true
          });
        }
      }
    }

    // Remove sensitive data if not owner/admin
    if (!isOwner && !isAdmin) {
      delete event.accessCode;
    }

    res.json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update event
 * @route PUT /api/events/:id
 * @access Private (Owner only)
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      eventType,
      customEventType,
      description,
      eventDate,
      endDate,
      visibility,
      products,
      image
    } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
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
        message: 'Access denied. You can only update your own events.'
      });
    }

    // Validate event type if provided
    if (eventType) {
      const allowedEventTypes = [
        'birthday', 'wedding', 'graduation', 'babyShower', 
        'houseWarming', 'anniversary', 'retirement', 'engagement',
        'christening', 'baptism', 'communion', 'confirmation',
        'funeral', 'memorial', 'celebration', 'farewell',
        'thanksgiving', 'holiday', 'christmas', 'newyear',
        'valentines', 'mothers-day', 'fathers-day', 'easter',
        'charity', 'fundraiser', 'teambuilding', 'reunion',
        'promotion', 'achievement', 'milestone', 'recovery',
        'houseblessing', 'business-launch', 'opening', 'other'
      ];

      if (!allowedEventTypes.includes(eventType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event type'
        });
      }

      // If eventType is 'other', customEventType is required
      if (eventType === 'other' && !customEventType?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Custom event type is required when event type is "other"'
        });
      }
    }

    // Parse and validate products if provided
    let productList;
    if (products) {
      try {
        productList = typeof products === 'string' ? JSON.parse(products) : products;
        
        // Validate product IDs
        for (const item of productList) {
          if (!mongoose.isValidObjectId(item.product)) {
            return res.status(400).json({
              success: false,
              message: `Invalid product ID: ${item.product}`
            });
          }

          const product = await Product.findById(item.product);
          if (!product) {
            return res.status(400).json({
              success: false,
              message: `Product not found: ${item.product}`
            });
          }
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid products format'
        });
      }
    }

    // Calculate new target amount if products changed
    let newTargetAmount = event.targetAmount;
    if (productList) {
      newTargetAmount = 0;
      for (const item of productList) {
        const product = await Product.findById(item.product);
        newTargetAmount += product.price * (item.quantity || 1);
      }
    }

    // Update event fields
    const updateData = {
      ...(title && { title: title.trim() }),
      ...(eventType && { 
        eventType,
        customEventType: eventType === 'other' ? customEventType?.trim() : undefined
      }),
      ...(description && { description: description.trim() }),
      ...(eventDate && { eventDate: new Date(eventDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...(visibility && { visibility }),
      ...(productList && { 
        products: productList.map(item => ({
          product: item.product,
          quantity: item.quantity || 1,
          status: 'pending'
        })),
        targetAmount: newTargetAmount
      }),
      ...(image !== undefined && { image }),
      updatedAt: new Date()
    };

    // Remove customEventType if eventType is not 'other'
    if (eventType && eventType !== 'other') {
      updateData.customEventType = undefined;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate([
      { path: 'creator', select: 'name email' },
      { path: 'products.product', select: 'name price images description' }
    ]);

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete event
 * @route DELETE /api/events/:id
 * @access Private (Owner only)
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
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
        message: 'Access denied. You can only delete your own events.'
      });
    }

    // Check if event has contributions
    if (event.currentAmount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an event that has received contributions. Please contact support.'
      });
    }

    await Event.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user's events
 * @route GET /api/events/user/my-events
 * @access Private
 */
const getUserEvents = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = { creator: req.user.userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [events, totalCount] = await Promise.all([
      Event.find(filter)
        .populate('creator', 'name email')
        .populate('products.product', 'name price images')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum),
      Event.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: events,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        limit: limitNum
      }
    });

  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user events',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getUserEvents
};