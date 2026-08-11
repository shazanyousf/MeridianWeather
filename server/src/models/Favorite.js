/**
 * Favorite Model - Stores users' favorite/saved cities.
 */

const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
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
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// A user can favorite a location only once
favoriteSchema.index({ user: 1, 'location.city': 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
