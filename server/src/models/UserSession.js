/**
 * UserSession Model - Tracks user sessions & refresh tokens for security.
 */

const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    userAgent: String,
    ip: String,
    device: {
      type: String,
      default: 'unknown',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSessionSchema.index({ user: 1, isActive: 1 });
userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('UserSession', userSessionSchema);
