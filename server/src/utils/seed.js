/**
 * Seed utility - Creates default admin & sample data.
 */

const Admin = require('../models/Admin');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const connectDB = require('../config/db');

/**
 * Seed default admin if none exists.
 */
const seedAdmins = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        name: 'Super Admin',
        email: 'admin@meridianweather.com',
        password: 'Admin@12345',
        role: 'superadmin',
        isSuperAdmin: true,
      });
      console.log('✅ Default admin created: admin@meridianweather.com / Admin@12345');
    }
  } catch (error) {
    console.error('Admin seeding failed:', error.message);
  }
};

/**
 * Seed sample data (admin, users, announcements).
 */
const seedAll = async () => {
  await connectDB();

  // Seed admin
  await seedAdmins();

  // Seed sample users
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'John@12345',
        isVerified: true,
        preferences: { theme: 'dark', units: 'metric', language: 'en' },
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'Jane@12345',
        isVerified: true,
        preferences: { theme: 'light', units: 'imperial', language: 'en' },
      },
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'Alice@12345',
        isVerified: false,
        preferences: { theme: 'light', units: 'metric', language: 'en' },
      },
    ]);
    console.log('✅ Sample users created');
  }

  // Seed default announcements
  const annCount = await Announcement.countDocuments();
  if (annCount === 0) {
    await Announcement.create([
      {
        title: 'Welcome to Meridian Weather!',
        message: 'Explore real-time weather, forecasts, and climate analytics for any location.',
        type: 'info',
        priority: 'high',
      },
      {
        title: 'New Feature: AI Recommendations',
        message: 'Get personalized travel, clothing, and health recommendations based on weather.',
        type: 'feature',
        priority: 'medium',
      },
    ]);
    console.log('✅ Default announcements created');
  }

  console.log('✅ Seeding complete!');
  process.exit(0);
};

// Run directly when executed
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
  seedAll().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { seedAdmins, seedAll };
