// controllers/contribution.controller.js
const Contribution = require("../models/Contribution");
const Event = require("../models/Event");

// @desc    Create contribution
// @route   POST /api/contributions
// @access  Private
exports.createContribution = async (req, res) => {
  try {
    const { eventId, amount, paymentMethod, message, anonymous } = req.body;

    // Validate event exists and is active
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Event is not active",
      });
    }

    // Create contribution
    const contribution = await Contribution.create({
      event: eventId,
      contributor: req.user._id,
      amount,
      paymentMethod,
      message,
      anonymous: anonymous || false,
    });

    // Add contribution to event
    event.contributions.push(contribution._id);
    event.currentAmount += amount;

    // Check if target amount is reached
    if (event.currentAmount >= event.targetAmount) {
      event.status = "completed";
    }

    await event.save();

    await contribution.populate([
      { path: "event", select: "title eventType currentAmount targetAmount" },
      { path: "contributor", select: "name" },
    ]);

    res.status(201).json({
      success: true,
      data: contribution,
    });
  } catch (error) {
    console.error("Contribution creation error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all contributions for an event
// @route   GET /api/contributions/event/:eventId
// @access  Private
exports.getEventContributions = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check authorization
    if (
      event.visibility === "private" &&
      event.creator.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view contributions",
      });
    }

    const contributions = await Contribution.find({ event: req.params.eventId })
      .populate("contributor", "name")
      .sort("-createdAt");

    res.json({
      success: true,
      count: contributions.length,
      data: contributions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's contributions
// @route   GET /api/contributions/user
// @access  Private
exports.getUserContributions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const contributions = await Contribution.find({ contributor: req.user._id })
      .populate("event", "title eventType")
      .sort("-createdAt")
      .skip(startIndex)
      .limit(limit);

    const total = await Contribution.countDocuments({
      contributor: req.user._id,
    });

    res.json({
      success: true,
      count: contributions.length,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
      },
      data: contributions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update contribution payment status
// @route   PUT /api/contributions/:id
// @access  Private/Admin
exports.updateContributionStatus = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: "Contribution not found",
      });
    }

    const { paymentStatus, transactionId, paymentDetails } = req.body;

    contribution.paymentStatus = paymentStatus;
    if (transactionId) contribution.transactionId = transactionId;

    // Update payment specific details
    if (paymentDetails) {
      switch (contribution.paymentMethod) {
        case "mpesa":
          contribution.mpesaDetails = paymentDetails;
          break;
        case "card":
          contribution.cardDetails = paymentDetails;
          break;
        case "paypal":
          contribution.paypalDetails = paymentDetails;
          break;
      }
    }

    await contribution.save();

    // If payment completed, update event amount
    if (paymentStatus === "completed") {
      const event = await Event.findById(contribution.event);
      if (event) {
        event.currentAmount = await Contribution.aggregate([
          { $match: { event: event._id, paymentStatus: "completed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]).then((result) => result[0]?.total || 0);

        if (event.currentAmount >= event.targetAmount) {
          event.status = "completed";
        }
        await event.save();
      }
    }

    res.json({
      success: true,
      data: contribution,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get contribution by ID
// @route   GET /api/contributions/:id
// @access  Private
exports.getContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id)
      .populate("event", "title eventType")
      .populate("contributor", "name");

    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: "Contribution not found",
      });
    }

    // Check authorization
    if (
      contribution.contributor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this contribution",
      });
    }

    res.json({
      success: true,
      data: contribution,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
