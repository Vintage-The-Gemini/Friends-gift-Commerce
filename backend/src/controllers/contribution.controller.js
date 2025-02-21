// controllers/contribution.controller.js
const Contribution = require("../models/Contribution");
const Event = require("../models/Event");

exports.createContribution = async (req, res) => {
  try {
    const { eventId, amount, paymentMethod, message, anonymous } = req.body;

    // Input validation
    if (!eventId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Please provide eventId, amount and paymentMethod",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

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

    // Create initial contribution record with pending status
    const contribution = await Contribution.create({
      event: eventId,
      contributor: req.user._id,
      amount,
      paymentMethod,
      message,
      anonymous: anonymous || false,
      paymentStatus: "pending",
    });

    // Handle different payment methods
    let paymentResponse;
    try {
      switch (paymentMethod) {
        case "mpesa":
          // Initialize M-PESA payment
          paymentResponse = {
            phoneNumber: req.body.phoneNumber,
            amount: amount,
            reference: contribution._id,
            status: "pending",
          };
          contribution.mpesaDetails = {
            phoneNumber: req.body.phoneNumber,
            transactionCode: null, // Will be updated after payment
            responseCode: "0",
            responseDescription: "Payment initiated",
          };
          break;

        case "card":
          // Initialize card payment
          paymentResponse = {
            status: "pending",
            reference: contribution._id,
          };
          contribution.cardDetails = {
            last4: null, // Will be updated after payment
            brand: null,
            chargeId: null,
          };
          break;

        default:
          throw new Error("Invalid payment method");
      }

      await contribution.save();

      // For demo purposes, auto-complete the payment
      // In production, this would be handled by payment webhook
      setTimeout(async () => {
        contribution.paymentStatus = "completed";
        if (paymentMethod === "mpesa") {
          contribution.mpesaDetails.transactionCode = "DEMO" + Date.now();
        }
        await contribution.save();

        // Update event amount
        event.currentAmount += amount;
        event.contributions.push(contribution._id);

        if (event.currentAmount >= event.targetAmount) {
          event.status = "completed";
        }
        await event.save();
      }, 5000);

      await contribution.populate([
        { path: "event", select: "title eventType currentAmount targetAmount" },
        { path: "contributor", select: "name" },
      ]);

      res.status(201).json({
        success: true,
        data: {
          contribution,
          payment: paymentResponse,
        },
      });
    } catch (paymentError) {
      // If payment initialization fails, update contribution status
      contribution.paymentStatus = "failed";
      await contribution.save();
      throw paymentError;
    }
  } catch (error) {
    console.error("Contribution creation error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getEventContributions = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Enhanced authorization check
    const isCreator = event.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isPublic = event.visibility === "public";

    if (!isPublic && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view contributions",
      });
    }

    const contributions = await Contribution.find({
      event: req.params.eventId,
      paymentStatus: "completed", // Only show completed contributions
    })
      .populate("contributor", "name")
      .sort("-createdAt")
      .select("-mpesaDetails -cardDetails"); // Exclude sensitive payment details

    // Calculate statistics
    const stats = {
      totalAmount: contributions.reduce((sum, c) => sum + c.amount, 0),
      totalContributors: new Set(
        contributions.map((c) => c.contributor._id.toString())
      ).size,
      averageAmount: contributions.length
        ? contributions.reduce((sum, c) => sum + c.amount, 0) /
          contributions.length
        : 0,
    };

    res.json({
      success: true,
      count: contributions.length,
      stats,
      data: contributions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Keep the rest of the controller methods as they are
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
