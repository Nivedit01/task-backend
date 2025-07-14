const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// get user by id
const getUserById = async (req, res) => {
    try {
        const userId = req.user.userId;

        const userData = await User.findById(userId).select("name email age mobileNumber createdAt");
        if (!userData) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "User not found!"
            });
        }

        res.status(200).json({
            success: true,
            status: 200,
            message: "User fetched successfully!",
            data: userData
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: error.message
        })
    }
};

// update user profile
const updateUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { userData } = req.body;

        const allowedFields = ["name", "age", "mobileNumber"];

        // Filter the fields user is allowed to update
        const filteredData = {};
        for (const key of allowedFields) {
            if (userData[key] !== undefined) {
                filteredData[key] = userData[key];
            }
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: filteredData },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "User not found!"
            });
        }

        res.status(200).json({
            success: true,
            status: 200,
            message: "User updated successfully!",
            data: {
                name: user.name,
                age: user.age,
                mobileNumber: user.mobileNumber
            }
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: error.message
        })
    }
};

// delete user
const deleteUser = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "User not found!"
            });
        }

        const isMatch = await bcrypt.compare(req.params.password, user.password);
        if (!isMatch) return res.status(401).json({
            success: false,
            status: 401,
            message: "Invalid credentials"
        });

        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            status: 200,
            message: "User deleted successfully!"
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

module.exports = {
    getUserById,
    updateUser,
    deleteUser
}