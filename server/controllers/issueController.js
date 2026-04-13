const Issue = require('../models/Issue');

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private (citizen)
const createIssue = async (req, res) => {
  try {
    const { title, description, category, location, lat, lng } = req.body;

    // Validation
    if (!title || !description || !location || !lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, location and map coordinates',
      });
    }

    // AI-based Classification (Keyword matching)
    let finalCategory = category && category !== 'Other' && category !== '' ? category : 'Other';
    
    if (finalCategory === 'Other') {
      const textToAnalyze = `${title} ${description}`.toLowerCase();
      
      const keywords = {
        'Garbage': ['garbage', 'trash', 'dump', 'waste', 'litter', 'smell', 'bin'],
        'Road': ['road', 'pothole', 'street', 'pavement', 'crack', 'asphalt', 'sidewalk'],
        'Water': ['water', 'pipe', 'leak', 'drain', 'sewer', 'flood', 'plumbing'],
        'Electricity': ['electric', 'light', 'wire', 'pole', 'power', 'dark', 'shock']
      };

      for (const [cat, words] of Object.entries(keywords)) {
        if (words.some(word => textToAnalyze.includes(word))) {
          finalCategory = cat;
          break; // Use the first match found
        }
      }
    }

    const issueData = {
      title,
      description,
      category: finalCategory,
      location,
      coordinates: {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      },
      createdBy: req.user._id,
    };

    // Handle image upload
    if (req.file) {
      issueData.image = `/uploads/${req.file.filename}`;
    }

    const issue = await Issue.create(issueData);

    // Populate createdBy for the response
    await issue.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. '),
      });
    }
    console.error('Create issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating issue',
    });
  }
};

// @desc    Get all issues (admin) or user's issues (citizen)
// @route   GET /api/issues
// @access  Private
const getIssues = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10, search, sort = 'newest' } = req.query;

    // Build filter
    const filter = {};

    // Citizens only see their own issues
    if (req.user.role === 'citizen') {
      filter.createdBy = req.user._id;
    }

    // Optional filters
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = sort === 'oldest' ? 1 : -1;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum),
      Issue.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: issues,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching issues',
    });
  }
};

// @desc    Get single issue by ID
// @route   GET /api/issues/:id
// @access  Private
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Citizens can only view their own issues
    if (
      req.user.role === 'citizen' &&
      issue.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this issue',
      });
    }

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }
    console.error('Get issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching issue',
    });
  }
};

// @desc    Update issue status
// @route   PUT /api/issues/:id/status
// @access  Private (admin only)
const updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    issue.status = status;

    // If admin is updating, assign to themselves
    if (req.user.role === 'admin' && !issue.assignedTo) {
      issue.assignedTo = req.user._id;
    }

    await issue.save();

    await issue.populate('createdBy', 'name email');
    await issue.populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating issue status',
    });
  }
};

// @desc    Delete an issue
// @route   DELETE /api/issues/:id
// @access  Private (admin or issue owner)
const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Only admin or the creator can delete
    if (
      req.user.role !== 'admin' &&
      issue.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this issue',
      });
    }

    await Issue.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully',
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }
    console.error('Delete issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting issue',
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/issues/stats
// @access  Private
const getIssueStats = async (req, res) => {
  try {
    // Determine context based on user role
    const matchStage = req.user.role === 'citizen' ? { createdBy: req.user._id } : {};

    const [totalIssues, statusBreakdown, categoryBreakdown] = await Promise.all([
      Issue.countDocuments(matchStage),
      Issue.aggregate([
        { $match: matchStage },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Issue.aggregate([
        { $match: matchStage },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    // Format Data
    const formattedStats = {
      total: totalIssues,
      status: {
        Open: 0,
        'In Progress': 0,
        Resolved: 0,
        Closed: 0
      },
      categories: {
        Garbage: 0,
        Road: 0,
        Water: 0,
        Electricity: 0,
        Other: 0
      }
    };

    statusBreakdown.forEach(item => {
      if (formattedStats.status[item._id] !== undefined) {
        formattedStats.status[item._id] = item.count;
      }
    });

    categoryBreakdown.forEach(item => {
      if (formattedStats.categories[item._id] !== undefined) {
        formattedStats.categories[item._id] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stats',
    });
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  updateIssueStatus,
  deleteIssue,
  getIssueStats
};
