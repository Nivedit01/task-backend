const jwt = require("jsonwebtoken");

// to verify user token
const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1]

    if (!token) {
        return res.status(401).json({
            success: false,
            status: 401,
            message: "You are not authenticated!"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                status: 403,
                message: "Token is not valid. Permission denied!"
            });
        }

        req.user = decoded;
        next();
    })
};

module.exports = {
    verifyToken
}