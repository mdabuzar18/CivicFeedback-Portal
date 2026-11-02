const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const { protect, admin } = require('../middleware/auth');
const { feedbackSubmissionLimiter } = require('../middleware/rateLimiter');
const { sendStatusEmail } = require('../config/mailer');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, webp, etc.) are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @route   POST /api/feedback
// @desc    Submit new feedback (Only for logged-in users)
// @access  Private
router.post(
  '/feedback',
  protect,
  feedbackSubmissionLimiter,
  upload.single('photo'),
  async (req, res) => {
    try {
      // Role Enforcement: check that only citizens can submit feedback
      if (req.user.role !== 'citizen') {
        return res.status(403).json({ message: 'Forbidden: Only citizens can submit feedback.' });
      }
      const { category, description, ward, latitude, longitude } = req.body;

      // Validate required inputs
      if (!category || !description || !ward || !latitude || !longitude) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Create Feedback referencing current logged-in user
      const feedback = await Feedback.create({
        user: req.user._id,
        category,
        description,
        ward,
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
        photoUrl: req.file ? `/uploads/${req.file.filename}` : null,
        status: 'Pending',
      });

      // Populate user info for response
      const populatedFeedback = await Feedback.findById(feedback._id).populate('user', 'name email role');

      res.status(201).json(populatedFeedback);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ message: 'Server error during submission', error: error.message });
    }
  }
);

// @route   GET /api/feedback
// @desc    Get feedbacks (Admins get all, Citizens get only their own)
// @access  Private
router.get('/feedback', protect, async (req, res) => {
  try {
    let query = {};
    
    // If not Admin, filter feedbacks to show only user's own submissions
    if (req.user.role !== 'admin') {
      query = { user: req.user._id };
    }

    const feedbackList = await Feedback.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json(feedbackList);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Server error fetching feedback', error: error.message });
  }
});

// @route   PATCH /api/admin/status/:id
// @desc    Update feedback status (Admin only)
// @access  Private (Admin only)
router.patch('/admin/status/:id', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback item not found' });
    }

    feedback.status = status;
    await feedback.save();

    const populatedFeedback = await Feedback.findById(id).populate('user', 'name email role');

    // Send automated status update email notification to the citizen
    let emailPreviewUrl = null;
    if (populatedFeedback.user && populatedFeedback.user.email) {
      emailPreviewUrl = await sendStatusEmail(
        populatedFeedback.user.email,
        populatedFeedback.user.name,
        populatedFeedback._id,
        status
      );
    }

    res.status(200).json({
      ...populatedFeedback.toObject(),
      emailPreviewUrl,
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error updating status', error: error.message });
  }
});

// Seed helper route updated for authentication and new fields
// @route   POST /api/feedback/seed
// @desc    Seed initial mock users & feedbacks (Admin/Citizen accounts)
// @access  Public
router.post('/feedback/seed', async (req, res) => {
  try {
    // Clear existing feedback and mock users if requested to have a fresh demo
    await Feedback.deleteMany({});
    // We keep custom/other users, but let's delete the specific test users to prevent unique constraint errors
    await User.deleteMany({ email: { $in: ['admin@example.com', 'citizen@example.com', 'citizen2@example.com'] } });

    // Create default Admin and Citizen accounts
    // (Pre-save hooks in User.js automatically hash the passwords 'password123')
    const adminUser = await User.create({
      name: 'Admin Supervisor',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    const citizen1 = await User.create({
      name: 'John Citizen',
      email: 'citizen@example.com',
      password: 'password123',
      role: 'citizen'
    });

    const citizen2 = await User.create({
      name: 'Sarah Miller',
      email: 'citizen2@example.com',
      password: 'password123',
      role: 'citizen'
    });

    // Mock Feedbacks with Wards, Geolocation coordinates and placeholder photos
    const mockFeedbacks = [
      {
        user: citizen1._id,
        category: 'Infrastructure',
        description: 'Large sinkhole forming in the middle of Main St right outside the public library. Dangerous for motor vehicles.',
        ward: 'Ward 10',
        location: { latitude: 40.7128, longitude: -74.0060 },
        status: 'Pending',
        photoUrl: null // Placeholder (code supports local images)
      },
      {
        user: citizen2._id,
        category: 'Sanitation',
        description: 'Illegal dumping of construction materials observed on Oak Ave. Blocking pedestrian walkway.',
        ward: 'Ward 11',
        location: { latitude: 40.7306, longitude: -73.9352 },
        status: 'In Progress',
        photoUrl: null
      },
      {
        user: citizen1._id,
        category: 'Public Safety',
        description: 'Streetlights out for the past 4 blocks along Elm St. Promotes security concerns during late hours.',
        ward: 'Ward 10',
        location: { latitude: 40.7589, longitude: -73.9851 },
        status: 'Resolved',
        photoUrl: null
      },
      {
        user: citizen2._id,
        category: 'Utilities',
        description: 'Water main burst detected at the corner of 5th Ave and 23rd St, flooding the street level.',
        ward: 'Ward 12',
        location: { latitude: 40.7418, longitude: -73.9893 },
        status: 'Pending',
        photoUrl: null
      }
    ];

    const seeded = await Feedback.insertMany(mockFeedbacks);
    res.status(201).json({
      message: 'Database seeded successfully with test accounts and feedbacks',
      accounts: {
        admin: { email: 'admin@example.com', password: 'password123' },
        citizen: { email: 'citizen@example.com', password: 'password123' }
      },
      feedbackCount: seeded.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Seeding error', error: error.message });
  }
});

module.exports = router;
