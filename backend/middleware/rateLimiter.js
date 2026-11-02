const rateLimit = require('express-rate-limit');

// General rate limiter for all API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Brute-force protection for Auth (login/signup)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login/signup attempts per 15 minutes
  message: {
    message: 'Too many login attempts. Please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Spam protection for submitting feedback
const feedbackSubmissionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 feedback submissions per 10 minutes
  message: {
    message: 'Too many feedback submissions. Please wait 10 minutes before submitting more.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  feedbackSubmissionLimiter,
};
