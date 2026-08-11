/**
 * WeatherHistory Model - Stores weather search history per user.
 */

const mongoose = require('mongoose');

const weatherHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      city: { type: String, required: true },
      state: String,
      country: String,
      zipCode: String,
      lat: Number,
      lon: Number,
    },
    weather: {
      temperature: Number,
      feelsLike: Number,
      condition: String,
      humidity: Number,
      windSpeed: Number,
      pressure: Number,
      icon: String,
    },
    source: {
      type: String,
      enum: ['search', 'favorite', 'gps', 'comparison', 'auto'],
      default: 'search',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast querying by user & time
weatherHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('WeatherHistory', weatherHistorySchema);
