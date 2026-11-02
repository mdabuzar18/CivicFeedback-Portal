const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Feedback must belong to a user'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Infrastructure', 'Sanitation', 'Public Safety', 'Utilities', 'Other'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
    },
    ward: {
      type: String,
      required: [true, 'Please select an administrative ward'],
    },
    location: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
      },
    },
    photoUrl: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
  },
  {
    timestamps: true, // This automatically manages createdAt and updatedAt
  }
);

module.exports = mongoose.model('Feedback', FeedbackSchema);
