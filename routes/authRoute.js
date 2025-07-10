const express = require("express");

const {
    userSignup,
    login
} = require("../controllers/authController");
const { verifyToken } = require("../middleware/verifyToken");

const router = express.Router();

router.post('/signup', verifyToken , userSignup);

module.exports = router;