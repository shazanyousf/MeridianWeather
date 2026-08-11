/**
 * SearchLog Model - Tracks all weather searches for analytics.
 */

const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    query: {
      type: String,
      required: true,
    },
    location: {
      city: String,
      country: String,
    },
    type: {
      type: String,
      enum: [
        'city',
        'state',
        'country',
        'zip',
        'coordinates',
        'voice',
        'gps',
        'search',
        'comparison',
        'favorite',
        'auto',
      ],
      default: 'city',
    },
    resultCount: {
      type: Number,
      default: 0,
    },
    ip: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

searchLogSchema.index({ query: 1 });
searchLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SearchLog', searchLogSchema);
