const rateLimit = require("express-rate-limit");

// Limit OTP requests to 3 per 15 minutes per IP
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    success: false,
    status: 429,
    message: "Too many OTP requests. Please try again after 15 minutes."
  }
});

module.exports = { otpRequestLimiter };
