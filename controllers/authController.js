const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email-send");


// signup user
const userSignup = async (req, res) => {
    try {
        const { name, email, age, mobileNumber, password } = req.body;


        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Email already exists!"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const verificationOtp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

        await User.create({
            name,
            email : email.toLowerCase(),
            password: hashPassword,
            age,
            mobileNumber,
            emailVerificationOtp: verificationOtp,
            emailOtpExpiry: otpExpiry,
            emailVerified: false
        });

        // send email
        await sendEmail(
            email,
            "Verify your account",
            `Your verification OTP is: ${verificationOtp}`
        );

        res.status(200).json({
            success: true,
            status: 200,
            message: "User created. Verification OTP sent to email."
        });

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: error.message
        });
    }
}

// user login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({
            success: false,
            status: 400,
            message: "User not found"
        });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({
            success: false,
            status: 401,
            message: "Invalid credentials"
        });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "10m" || process.env.JWT_EXPIRES_IN
        });

        res.status(200).json({
            suucess: true,
            status: 200,
            message: "Login successful!",
            token
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            status: 500,
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
    resetPassword
}