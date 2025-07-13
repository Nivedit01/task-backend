const express = require("express");

const {
    userSignup,
    login,
    sendOtp,
    verifyOtp,
    resetPassword,
    requestSignupOtp,
    verifySignupOtp
} = require("../controllers/authController");
const { verifyToken } = require("../middleware/verifyToken");
const { otpRequestLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post('/signup', userSignup);
router.post('/login', login);
router.post("/request-signup-otp", otpRequestLimiter, requestSignupOtp);
router.post("/verify-signup-otp", verifySignupOtp);
router.post('/send-otp', otpRequestLimiter, sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;