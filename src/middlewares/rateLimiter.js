const rateLimit = require('express-rate-limit');

const rateLimiterUsingThirdParty = rateLimit({
  windowMs: 0.5 * 60 * 60 * 1000, // 30min in milliseconds
  max: 100,
  message: 'You\'ve sent too many requests. Please try again later.',
  headers: true,
});

module.exports = rateLimiterUsingThirdParty;
