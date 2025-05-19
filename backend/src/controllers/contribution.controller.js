// controllers/contribution.controller.js
const Contribution = require("../models/Contribution");
const Event = require("../models/Event");

// Import the M-PESA service if real payments are enabled
let mpesaService = null;
if (process.env.ENABLE_REAL_MPESA === 'true') {
  try {
    mpesaService = require("../utils/mpesaService");
  } catch (error) {
    console.warn("M-PESA service not available:", error.message);
  }
}

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
          if (!req.body.phoneNumber) {
            throw new Error("Phone number is required for M-PESA payments");
          }
          
          // Phone number validation
          const phoneNumber = req.body.phoneNumber;
          if (!phoneNumber.match(/^\+254[0-9]{9}$/)) {
            throw new Error("Please enter a valid Kenyan phone number (+254...)");
          }
          
          // Create basic M-PESA details structure
          contribution.mpesaDetails = {
            phoneNumber: phoneNumber,
            transactionCode: null, // Will be updated after payment
            responseCode: "0", // Default for simulation
            responseDescription: "Payment initiated",
          };
          
          // Try real Daraja API integration if available
          let darajaResult = null;
          const useRealMpesa = process.env.ENABLE_REAL_MPESA === 'true' && mpesaService;
          
          if (useRealMpesa) {
            try {
              console.log("Initiating real M-PESA payment via Daraja API");
              
              // Format phone number for Daraja (remove +)
              const formattedPhone = phoneNumber.replace('+', '');
              
              // Initiate STK Push
              darajaResult = await mpesaService.initiateSTKPush(
                formattedPhone,
                amount,
                contribution._id.toString(),
                `Contrib ${event.title.substring(0, 8)}`
              );
              
              console.log("Daraja STK push result:", darajaResult);
              
              // Update contribution with Daraja response details
              if (darajaResult && darajaResult.CheckoutRequestID) {
                contribution.mpesaDetails.checkoutRequestID = darajaResult.CheckoutRequestID;
                contribution.mpesaDetails.merchantRequestID = darajaResult.MerchantRequestID;
                contribution.mpesaDetails.responseCode = darajaResult.ResponseCode;
                contribution.mpesaDetails.responseDescription = darajaResult.ResponseDescription;
              }
            } catch (darajaError) {
              console.error("Daraja API error:", darajaError);
              // Fall back to simulation on error
              darajaResult = null;
            }
          } else {
            console.log("Using M-PESA payment simulation");
          }
          
          // Set up response for the client
          paymentResponse = {
            phoneNumber: phoneNumber,
            amount: amount,
            reference: contribution._id,
            status: "pending",
          };
          
          // Add Daraja-specific fields if available
          if (darajaResult) {
            paymentResponse.checkoutRequestID = darajaResult.CheckoutRequestID;
            paymentResponse.merchantRequestID = darajaResult.MerchantRequestID;
            paymentResponse.usingRealMpesa = true;
          } else {
            paymentResponse.usingRealMpesa = false;
            paymentResponse.simulationEnabled = true;
          }
          
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

      // For demo purposes, auto-complete the payment after delay
      // In production with real Daraja, this would be handled by payment webhook
      const useSimulation = process.env.ENABLE_PAYMENT_SIMULATION !== 'false' && !paymentResponse.usingRealMpesa;
      
      if (useSimulation) {
        console.log(`Simulating payment completion in 5 seconds for contribution ${contribution._id}`);
        
        setTimeout(async () => {
          try {
            // Fetch the contribution again to make sure it's current
            const updatedContribution = await Contribution.findById(contribution._id);
            
            // Only auto-complete if still pending (may have been updated by webhook)
            if (updatedContribution && updatedContribution.paymentStatus === "pending") {
              updatedContribution.paymentStatus = "completed";
              if (paymentMethod === "mpesa") {
                updatedContribution.mpesaDetails.transactionCode = "SIM" + Date.now();
                updatedContribution.transactionId = "SIM" + Date.now();
              }
              await updatedContribution.save();

              // Update event amount
              const eventToUpdate = await Event.findById(eventId);
              if (eventToUpdate) {
                eventToUpdate.currentAmount += amount;
                eventToUpdate.contributions.push(contribution._id);

                if (eventToUpdate.currentAmount >= eventToUpdate.targetAmount) {
                  eventToUpdate.status = "completed";
                }
                await eventToUpdate.save();
                console.log(`Simulation: Updated event ${eventId} with new contribution`);
              }
            }
          } catch (simError) {
            console.error("Error in payment simulation:", simError);
          }
        }, 5000);
      }

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
          contribution.mpesaDetails = {...contribution.mpesaDetails, ...paymentDetails};
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

// M-PESA callback handler
exports.handleMpesaCallback = async (req, res) => {
  try {
    // Log the callback for debugging
    console.log("M-PESA Callback received:", JSON.stringify(req.body, null, 2));
    
    // Extract callback data
    const { Body } = req.body;
    
    if (!Body || !Body.stkCallback) {
      console.error("Invalid M-PESA callback format");
      return res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
    }
    
    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = Body.stkCallback;
    
    // Find the contribution using the CheckoutRequestID
    const contribution = await Contribution.findOne({
      "mpesaDetails.checkoutRequestID": CheckoutRequestID
    });
    
    if (!contribution) {
      console.error(`Contribution not found for CheckoutRequestID: ${CheckoutRequestID}`);
      return res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
    }
    
    // Update contribution based on the result
    if (ResultCode === 0) {
      // Payment successful
      contribution.paymentStatus = "completed";
      
      // Extract transaction details from metadata
      if (CallbackMetadata && CallbackMetadata.Item) {
        const mpesaCode = CallbackMetadata.Item.find(item => item.Name === "MpesaReceiptNumber");
        const phoneNumber = CallbackMetadata.Item.find(item => item.Name === "PhoneNumber");
        
        if (mpesaCode) {
          contribution.mpesaDetails.transactionCode = mpesaCode.Value;
          contribution.transactionId = mpesaCode.Value;
        }
      }
      
      // Update event amount
      const event = await Event.findById(contribution.event);
      if (event) {
        event.currentAmount += contribution.amount;
        event.contributions.push(contribution._id);

        if (event.currentAmount >= event.targetAmount) {
          event.status = "completed";
        }
        await event.save();
      }
    } else {
      // Payment failed
      contribution.paymentStatus = "failed";
      contribution.mpesaDetails.responseDescription = ResultDesc || "Payment failed";
    }
    
    await contribution.save();
    
    // Always respond with success to M-PESA (to acknowledge receipt)
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (error) {
    console.error("M-PESA callback error:", error);
    // Always respond with success to M-PESA
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
  }
};