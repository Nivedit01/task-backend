const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email-send");
const SignupOtp = require("../models/signupOtpModel");


// signup user
const userSignup = async (req, res) => {
    try {
        const { name, email, age, mobileNumber, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Check if OTP was verified for this email
        const otpEntry = await SignupOtp.findOne({ email: email.toLowerCase() });
        if (!otpEntry || !otpEntry.verified) {
            return res.status(403).json({
                success: false,
                message: "Email not verified via OTP"
            });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            age,
            mobileNumber
        });

        // Delete used OTP entry
        await SignupOtp.deleteOne({ email: email.toLowerCase() });

        res.status(201).json({
            success: true,
            status: 201,
            message: "User registered successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            status: 500,
            message: err.message
        });
    }
};

// user login
const login = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({
            success: false,
            status: 400,
            message: "User not found"
        });

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) return res.status(401).json({
            success: false,
            status: 401,
            message: "Invalid credentials"
        });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "10m" || process.env.JWT_EXPIRES_IN
        });

        const {
            password,
            emailVerified,
            resetOtp,
            resetOtpExpire,
            __v,
            emailVerificationOtp,
            emailOtpExpiry,
            resetOtpVerified,
            createdAt,
            updatedAt,
            ...userData
        } = user.toObject();

        res.status(200).json({
            suucess: true,
            status: 200,
            message: "Login successful!",
            token,
            data: userData
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            status: 500,
            message: err.message
        });
    }
};

// signup otp request 
const requestSignupOtp = async (req, res) => {
    try {
        const { email, mobileNumber } = req.body;

        // Check if email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit
        const otpExpire = Date.now() + 1 * 60 * 1000; // 10 mins from now

        // Upsert: insert or update if already requested earlier
        await SignupOtp.findOneAndUpdate(
            { email },
            {
                email,
                mobileNumber,
                otp,
                otpExpire,
                verified: false
            },
            { upsert: true, new: true }
        );

        // Send OTP via email
        await sendEmail(email, "Signup OTP", `Your OTP is: ${otp}`);

        res.status(200).json({
            success: true,
            message: "OTP sent to your email"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// verify signup otp
const verifySignupOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otpEntry = await SignupOtp.findOne({ email });

        if (!otpEntry) {
            return res.status(400).json({
                success: false,
                message: "No OTP request found for this email"
            });
        }

        if (otpEntry.otp !== Number(otp)) {
            return res.status(401).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        if (otpEntry.otpExpire < Date.now()) {
            return res.status(403).json({
                success: false,
                message: "OTP has expired"
            });
        }

        otpEntry.verified = true;
        await otpEntry.save();

        res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// forgot password send email
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({
                success: false,
                status: 404,
                message: "User not found with this email"
            });

        const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
        const expiry = Date.now() + 5 * 60 * 1000; // valid for 5 min

        // Store OTP and expiry in user doc
        user.resetOtp = otp;
        user.resetOtpExpire = expiry;
        await user.save();

        await sendEmail(email, "Reset Password OTP", `Your OTP is: ${otp}`);

        res.status(200).json({
            success: true,
            status: 200,
            message: "OTP sent to email successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            status: 500,
            message: err.message
        });
    }
};

// forgot password verify otp
const verifyOtp = async (req, res) => {
    try {
        const { email, otp, purpose } = req.body;

        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({
                success: false,
                status: 400,
                message: "User not found"
            });

        // 🟠 Email Verification
        if (purpose === "email") {
            if (!user.emailVerificationOtp)
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: "No OTP found for email verification"
                });

            if (user.emailVerificationOtp !== Number(otp))
                return res.status(401).json({
                    success: false,
                    status: 401,
                    message: "Invalid OTP"
                });

            if (user.emailOtpExpiry < Date.now())
                return res.status(403).json({
                    success: false,
                    status: 403,
                    message: "OTP expired"
                });

            user.emailVerified = true;
            user.emailVerificationOtp = undefined;
            user.emailOtpExpiry = undefined;
        }

        // 🔵 Password Reset
        else if (purpose === "reset") {
            if (!user.resetOtp)
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: "No OTP found for password reset"
                });

            if (user.resetOtp !== Number(otp))
                return res.status(401).json({
                    success: false,
                    status: 401,
                    message: "Invalid OTP"
                });

            if (user.resetOtpExpire < Date.now())
                return res.status(403).json({
                    success: false,
                    status: 403,
                    message: "OTP expired"
                });

            user.resetOtpVerified = true;
        }

        // 🚫 Unknown purpose
        else {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Invalid purpose"
            });
        }

        await user.save();

        res.status(200).json({
            success: true,
            status: 200,
            message: "OTP verified successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            status: 500,
            message: err.message
        });
    }
};

// forgot password reset password
const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const user = await User.findOne({ email });
        if (!user || !user.resetOtpVerified)
            return res.status(401).json({
                success: false,
                status: 401,
                message: "OTP verification required!"
            });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Clear OTP info
        user.resetOtp = undefined;
        user.resetOtpExpire = undefined;
        user.resetOtpVerified = false;

        await user.save();

        res.status(200).json({
            success: true,
            status: 200,
            message: "Password reset successful"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            status: 500,
            message: err.message
        });
    }
};

// logout 
// const logout = async(req, res) => {
//     try{
//         const 
//     }
// }

module.exports = {
    userSignup,
    login,
    sendOtp,
    verifyOtp,
    resetPassword,
    verifySignupOtp,
    requestSignupOtp
}