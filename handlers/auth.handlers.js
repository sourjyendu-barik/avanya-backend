const UserModel = require("../models/model.user");
const axios = require("axios");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { setSecureCookie } = require("../services/setSecureCookies");
const { oauth2client } = require("../utils/googleConfigs");

const signIn = async (req, res) => {
  try {
    const { code } = req.body;

    // Exchange authorization code for Google tokens
    const googleResponse = await oauth2client.getToken(code);
    oauth2client.setCredentials(googleResponse.tokens);

    // Get Google user info
    const userInfo = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${googleResponse.tokens.access_token}`,
        },
      },
    );

    const { id: googleId, name, email, picture } = userInfo.data;
    const normalizedEmail = email ? email.toLowerCase() : null;

    // Find user by Google ID first
    let user = await UserModel.findOne({ googleId });

    // If a user exists with the same email, reuse that account instead of creating a duplicate
    if (!user && normalizedEmail) {
      user = await UserModel.findOne({ email: normalizedEmail });
    }

    // Create user if it doesn't exist
    if (!user) {
      try {
        user = await UserModel.create({
          googleId,
          name,
          email: normalizedEmail,
          profilePhoto: picture,
        });
      } catch (createError) {
        console.error("Create user failed:", createError);
        return res.status(500).json({
          success: false,
          message: "Unable to create user",
        });
      }
    } else {
      const updates = {};

      if (!user.googleId && googleId) updates.googleId = googleId;
      if (!user.name && name) updates.name = name;
      if (!user.email && normalizedEmail) updates.email = normalizedEmail;
      if (!user.profilePhoto && picture) updates.profilePhoto = picture;

      if (Object.keys(updates).length > 0) {
        user = await UserModel.findByIdAndUpdate(user._id, updates, {
          new: true,
          runValidators: true,
        });
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Unable to resolve user",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_TIMEOUT || "1d",
      },
    );

    // Set secure cookie
    setSecureCookie(res, token);

    // Send response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        joined: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Google Sign-In Error:", error);

    res.status(500).json({
      success: false,
      message: "Google Sign-In failed",
    });
  }
};

const getMe = async (req, res) => {
  try {
    // console.log(req.user);
    const user = await UserModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        joined: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get Me Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const logout = (req, res) => {
  // for localhost
  // res.clearCookie("access_token_avanya", {
  //   httpOnly: true,
  // });

  // for deployment
  res.clearCookie("access_token_avanya", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = {
  getMe,
  logout,
  signIn,
};
