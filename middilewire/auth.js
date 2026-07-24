const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = async (req, res, next) => {
  try {
    const token = req.cookies?.access_token_avanya;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = auth;
