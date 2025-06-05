// backend/src/controllers/event/eventContributions.js
const Event = require('../../models/Event');
const Contribution = require('../../models/Contribution');
const mongoose = require('mongoose');

/**
 * Get contributions for a specific event
 * @route GET /api/events/:id/contributions
 * @access Public (for public events) / Private (for private events)
 */
const getEventContributions = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const event = await Event.findById(id).lean();
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check access permissions for private events
    if (event.visibility === 'private') {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required for private events'
        });
      }

      const isOwner = event.creator.toString() === req.user.userId;
      const isAdmin = req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view contributions for your own events.'
        });
      }
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Get contributions with pagination
    const [contributions, totalCount] = await Promise.all([
      Contribution.find({ event: id })
        .populate('contributor', 'name email')
        .populate('product', 'name price')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Contribution.countDocuments({ event: id })
    ]);

    // Filter out sensitive information for non-owners
    const isOwner = req.user && event.creator.toString() === req.user.userId;
    const isAdmin = req.user?.role === 'admin';

    const sanitizedContributions = contributions.map(contribution => {
      // Always hide contributor details if marked anonymous
      if (contribution.anonymous) {
        const sanitized = { ...contribution };
        delete sanitized.contributor;
        sanitized.contributorName = 'Anonymous';
        return sanitized;
      }

      // For non-owners/non-admins, limit information
      if (!isOwner && !isAdmin) {
        return {
          _id: contribution._id,
          amount: contribution.amount,
          message: contribution.message,
          createdAt: contribution.createdAt,
          contributorName: contribution.contributor?.name || 'Unknown',
          product: contribution.product
        };
      }

      return contribution;
    });

    res.json({
      success: true,
      data: sanitizedContributions,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        limit: limitNum
      },
      summary: {
        totalContributions: totalCount,
        totalAmount: event.currentAmount || 0,
        averageContribution: totalCount > 0 ? (event.currentAmount || 0) / totalCount : 0
      }
    });

  } catch (error) {
    console.error('Get event contributions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event contributions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get contribution statistics for an event
 * @route GET /api/events/:id/contributions/stats
 * @access Private (Owner only)
 */
const getEventContributionStats = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const event = await Event.findById(id).lean();
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
        message: 'Access denied. You can only view statistics for your own events.'
      });
    }

    // Get contribution statistics
    const stats = await Contribution.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          totalContributions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageContribution: { $avg: '$amount' },
          maxContribution: { $max: '$amount' },
          minContribution: { $min: '$amount' },
          uniqueContributors: { $addToSet: '$contributor' }
        }
      },
      {
        $addFields: {
          uniqueContributorCount: { $size: '$uniqueContributors' }
        }
      },
      {
        $project: {
          uniqueContributors: 0 // Remove the array, keep only the count
        }
      }
    ]);

    // Get daily contribution trends (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyTrends = await Contribution.aggregate([
      { 
        $match: { 
          event: new mongoose.Types.ObjectId(id),
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          dailyAmount: { $sum: '$amount' },
          dailyCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const result = {
      success: true,
      data: {
        overview: stats[0] || {
          totalContributions: 0,
          totalAmount: 0,
          averageContribution: 0,
          maxContribution: 0,
          minContribution: 0,
          uniqueContributorCount: 0
        },
        progress: {
          currentAmount: event.currentAmount || 0,
          targetAmount: event.targetAmount,
          progressPercentage: event.targetAmount > 0 ? 
            ((event.currentAmount || 0) / event.targetAmount * 100) : 0,
          remainingAmount: Math.max(0, event.targetAmount - (event.currentAmount || 0))
        },
        trends: dailyTrends.map(trend => ({
          date: `${trend._id.year}-${trend._id.month.toString().padStart(2, '0')}-${trend._id.day.toString().padStart(2, '0')}`,
          amount: trend.dailyAmount,
          count: trend.dailyCount
        }))
      }
    };

    res.json(result);

  } catch (error) {
    console.error('Get contribution stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contribution statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getEventContributions,
  getEventContributionStats
};