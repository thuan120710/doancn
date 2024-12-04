const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/AdminUser");
const bcrypt = require("bcrypt");
const multer = require("multer");
const verify = require("../Middleware/verifyToken");
const upload = multer();
const song = require("../models/Song");

const generateToken = (user) => {
  const payload = {
    userId: user._id,
    username: user.username,
    role: user.role, // Thêm vai trò vào payload
  };
  console.log(payload);
  console.log("JWT_SECRET when generating token:", process.env.JWT_SECRET);

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
};

module.exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Tìm user trong cơ sở dữ liệu
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Tạo token
    const token = generateToken(user);
    console.log("Generated Token:", token); // Log để kiểm tra token

    // Gửi phản hồi bao gồm token
    res.json({
      status: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token, // Đảm bảo token được gửi về client
    });
  } catch (error) {
    console.error("Error in login:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({
          status: false,
          message: "Username, Email and Password are required",
        });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, message: "Username or email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    res
      .status(201)
      .json({ status: true, message: "User registered successfully", user });
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    res.clearCookie("token").json("Logged out");
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAdminProfile = async (req, res, next) => {
  try {
    const adminProfile = await User.findOne(); // You need to implement this function

    // Check if admin profile data is retrieved successfully
    if (adminProfile) {
      // Send the admin profile data as JSON response
      res.json({
        AdminProfile: adminProfile,
        successMsg: "Admin profile retrieved successfully",
      });
    } else {
      // If admin profile data retrieval fails, send an error response
      res.status(500).json({ errorMsg: "Failed to retrieve admin profile" });
    }
  } catch (error) {
    console.error("Error retrieving admin profile:", error);
    res.status(500).json({ errorMsg: "Error retrieving admin profile" }); // Return an error response
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};
module.exports.dashboard = (req, res) => {
  res.json({ message: "Welcome to Admin Dashboard!" });
};
