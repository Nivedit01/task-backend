const express = require("express");

const {
    userSignup,
    login,
    sendOtp,
    verifyOtp,
    resetPassword
} = require("../controllers/authController");
const { verifyToken } = require("../middleware/verifyToken");

const router = express.Router();

router.post('/signup', userSignup);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;