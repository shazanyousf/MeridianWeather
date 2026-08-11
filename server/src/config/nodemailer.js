/**
 * NodeMailer Configuration - for sending emails (verification, OTP, password reset).
 */

const nodemailer = require('nodemailer');

const getEmailPassword = () => {
  const raw = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || '';
  // App passwords are often copied with spaces for readability.
  return raw.replace(/\s+/g, '');
};

/**
 * Create a reusable transporter.
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: getEmailPassword(),
  },
});

/**
 * Send an email.
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !getEmailPassword()) {
    throw new Error('SMTP is not configured. Set EMAIL_USER and EMAIL_PASSWORD in server/.env');
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
};

module.exports = { transporter, sendEmail };
