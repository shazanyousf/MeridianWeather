/**
 * WeatherAlert Model - Stores weather alerts (storm, flood, cyclone, etc.).
 */

const mongoose = require('mongoose');

const weatherAlertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['storm', 'flood', 'cyclone', 'earthquake', 'heatwave', 'coldwave', 'rain', 'thunderstorm', 'fog', 'wind'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'severe', 'extreme'],
      default: 'moderate',
    },
    location: {
      city: String,
      state: String,
      country: String,
      lat: Number,
      lon: Number,
    },
    affectedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: Date,
    source: {
      type: String,
      default: 'system',
    },
    geoArea: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

weatherAlertSchema.index({ geoArea: '2dsphere' });
weatherAlertSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model('WeatherAlert', weatherAlertSchema);
