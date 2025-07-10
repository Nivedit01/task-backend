const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// signup user
const userSignup = async (req, res) => {
    try{
        const { name, email, age, mobileNumber, password } = req.body;


        const existingUser = await User.findOne({email: email});
        if(existingUser){
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Email already exists!"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashPassword,
            age,
            mobileNumber
        });

        res.status(200).json({
            success: true,
            status: 200,
            message: "User created successfully!"
        });

    }
    catch(error) {
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

        const user = await User.findOne({ email });
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
            token });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            status: 500,
            message: err.message
        });
    }
};

// forgot password send email


// forgot password verify otp


// forgot password reset password


// logout 


module.exports = {
    userSignup,
    login
}