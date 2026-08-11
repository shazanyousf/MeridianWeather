/**
 * Validation utility - body validation middleware factory.
 * Uses express-validator style but lightweight custom implementation.
 */

const validator = require('validator');

/**
 * Build a validation middleware from a rules object.
 * @param {Object} rules - { field: { required, string, email, min, max, length, boolean, optional } }
 */
const validate = (rules) => {
  return (req, res, next) => {
    const errors = {};

    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body[field];

      // Required check
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        continue;
      }

      // Optional & empty -> skip
      if (rule.optional && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type checks
      if (rule.string && typeof value !== 'string') {
        errors[field] = `${field} must be a string`;
        continue;
      }
      if (rule.boolean && typeof value !== 'boolean' && value !== true && value !== false) {
        errors[field] = `${field} must be a boolean`;
        continue;
      }

      // String validations
      if (typeof value === 'string') {
        if (rule.email && !validator.isEmail(value)) {
          errors[field] = 'Please provide a valid email';
          continue;
        }
        if (rule.min && value.length < rule.min) {
          errors[field] = `${field} must be at least ${rule.min} characters`;
          continue;
        }
        if (rule.max && value.length > rule.max) {
          errors[field] = `${field} must be at most ${rule.max} characters`;
          continue;
        }
        if (rule.length && value.length !== rule.length) {
          errors[field] = `${field} must be exactly ${rule.length} characters`;
          continue;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    next();
  };
};

module.exports = validate;
