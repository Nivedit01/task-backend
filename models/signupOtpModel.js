const mongoose = require("mongoose");

const signupOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  mobileNumber: {
    type: String
  },
  otp: {
    type: Number,
    required: true
  },
  otpExpire: {
    type: Date,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600  // auto-delete after 10 minutes
  }
});

module.exports = mongoose.model("SignupOtp", signupOtpSchema);
