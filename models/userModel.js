const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    age: {
        type: Number
    },
    mobileNumber: {
        type: String
    },
    profilePicture: {
        type: String
    },
    isAccountVerified: Boolean,
    emailVerified: Boolean,
    emailVerificationOtp: Date,
    emailOtpExpiry: Date,
    resetOtp: Number,
    resetOtpExpire: Date,
    resetOtpVerified: Boolean
},
    {
        timestamps: true
    });

module.exports = mongoose.model('User', UserSchema);