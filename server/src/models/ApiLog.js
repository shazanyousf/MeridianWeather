/**
 * ApiLog Model - Tracks external API usage (OpenWeatherMap, WeatherAPI, etc.).
 */

const mongoose = require('mongoose');

const apiLogSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ['openweathermap', 'weatherapi', 'openmeteo', 'openaq', 'mapbox', 'geolocation'],
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE'],
      default: 'GET',
    },
    statusCode: {
      type: Number,
      default: 200,
    },
    responseTime: {
      type: Number,
      default: 0,
    }, // in ms
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    ip: String,
    requestParams: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

apiLogSchema.index({ provider: 1, createdAt: -1 });
apiLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ApiLog', apiLogSchema);
