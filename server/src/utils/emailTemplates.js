/**
 * Email Templates - HTML templates for various emails.
 */

const emailStyles = `
  <style>
    body { font-family: Arial, Helvetica, sans-serif; background: #f4f7fb; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #2563eb, #06b6d4); padding: 24px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 24px; }
    .body { padding: 30px; color: #333; }
    .otp { font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; color: #2563eb; margin: 20px 0; }
    .btn { display: inline-block; background: #2563eb; color: white !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; }
    .footer { background: #f8fafc; padding: 16px; text-align: center; color: #64748b; font-size: 12px; }
    .center { text-align: center; }
  </style>
`;

const baseTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${emailStyles}
</head>
<body>
  <div class="container">
    <div class="header"><h1>🌦️ Meridian Weather</h1></div>
    <div class="body">
      <h2 style="color:#1e293b;">${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Meridian Weather. All rights reserved.</p>
      <p>Smart Weather Forecasting & Climate Analytics</p>
    </div>
  </div>
</body>
</html>
`;

const emailVerificationTemplate = (name, token) =>
  baseTemplate(
    'Verify Your Email',
    `
    <p>Hello ${name},</p>
    <p>Thank you for registering with Meridian Weather. Please verify your email address to activate your account.</p>
    <div class="center"><a class="btn" href="${process.env.CLIENT_URL}/verify-email?token=${token}">Verify Email</a></div>
    <p style="color:#64748b;font-size:13px;">Or copy this link:<br>${process.env.CLIENT_URL}/verify-email?token=${token}</p>
    <p style="color:#ef4444;font-size:13px;">This link expires in 24 hours. If you didn't register, please ignore this email.</p>
    `
  );

const otpTemplate = (name, otp) =>
  baseTemplate(
    'Your OTP Code',
    `
    <p>Hello ${name},</p>
    <p>Use the following One-Time Password (OTP) to complete your verification:</p>
    <div class="otp">${otp}</div>
    <p style="color:#64748b;font-size:13px;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
    `
  );

const passwordResetTemplate = (name, token) =>
  baseTemplate(
    'Reset Your Password',
    `
    <p>Hello ${name},</p>
    <p>We received a request to reset your password. Click the button below to proceed:</p>
    <div class="center"><a class="btn" href="${process.env.CLIENT_URL}/reset-password?token=${token}">Reset Password</a></div>
    <p style="color:#64748b;font-size:13px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
    `
  );

const weatherAlertTemplate = (name, alert) =>
  baseTemplate(
    `⚠️ ${alert.title}`,
    `
    <p>Hello ${name},</p>
    <p><strong>${alert.description}</strong></p>
    <p><strong>Severity:</strong> ${alert.severity}</p>
    <p><strong>Location:</strong> ${alert.location?.city || 'Your area'}</p>
    <p style="color:#64748b;font-size:13px;">Please take necessary precautions. Stay safe!</p>
    `
  );

const welcomeTemplate = (name) =>
  baseTemplate(
    'Welcome to Meridian Weather!',
    `
    <p>Hello ${name},</p>
    <p>Your email has been verified successfully. Welcome to the Meridian Weather community! 🎉</p>
    <p>Now you can:</p>
    <ul>
      <li>Search real-time weather for any location</li>
      <li>Save your favorite cities</li>
      <li>Get personalized weather alerts</li>
      <li>View historical climate analytics</li>
    </ul>
    <div class="center"><a class="btn" href="${process.env.CLIENT_URL}">Get Started</a></div>
    `
  );

module.exports = {
  emailVerificationTemplate,
  otpTemplate,
  passwordResetTemplate,
  weatherAlertTemplate,
  welcomeTemplate,
};
