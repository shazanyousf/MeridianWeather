/**
 * Auth Validation - Input validation for auth routes.
 */

const validate = require('./validate');

const registerValidator = validate({
  name: {
    required: true,
    string: true,
    min: 3,
    max: 50,
  },
  email: {
    required: true,
    string: true,
    email: true,
  },
  password: {
    required: true,
    string: true,
    min: 8,
    max: 30,
  },
});

const loginValidator = validate({
  email: {
    required: true,
    string: true,
    email: true,
  },
  password: {
    required: true,
    string: true,
    min: 8,
  },
  rememberMe: {
    boolean: true,
    optional: true,
  },
});

const otpValidator = validate({
  email: {
    required: true,
    string: true,
    email: true,
  },
  otp: {
    required: true,
    string: true,
    length: 6,
  },
});

const verifyEmailValidator = validate({
  email: {
    required: true,
    string: true,
    email: true,
  },
  token: {
    required: true,
    string: true,
  },
});

const forgotPasswordValidator = validate({
  email: {
    required: true,
    string: true,
    email: true,
  },
});

const resetPasswordValidator = validate({
  token: {
    required: true,
    string: true,
  },
  password: {
    required: true,
    string: true,
    min: 8,
    max: 30,
  },
});

const resetPasswordWithOTPValidator = validate({
  email: {
    required: true,
    string: true,
    email: true,
  },
  otp: {
    required: true,
    string: true,
    length: 6,
  },
  password: {
    required: true,
    string: true,
    min: 8,
    max: 30,
  },
});

const changePasswordValidator = validate({
  currentPassword: {
    required: true,
    string: true,
    min: 8,
  },
  newPassword: {
    required: true,
    string: true,
    min: 8,
    max: 30,
  },
});

const refreshTokenValidator = validate({
  refreshToken: {
    required: true,
    string: true,
  },
});

module.exports = {
  registerValidator,
  loginValidator,
  otpValidator,
  verifyEmailValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  resetPasswordWithOTPValidator,
  changePasswordValidator,
  refreshTokenValidator,
};
