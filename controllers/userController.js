const UserModel = require("../models/userModel");
const catchAsync = require("../middlewares/catchAsync");
const dotenv=require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const ejs = require("ejs");
const path = require("path");
const sendMail = require("../utils/sendMail");
const ErrorHandler = require("../utils/ErrorHandler");

// Register user
const registrationUser = catchAsync(async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const isEmailExists = await UserModel.findOne({ email });
        if (isEmailExists) {
            return next(new ErrorHandler("email already exists", 400));
        }
        const user = { name, email, password };
        const activationToken = createActivationToken(user);
        const activationCode = activationToken.activationCode;
        const data = { user: { name: user.name }, activationCode };
        const html = await ejs.renderFile(path.join(__dirname, "../mails/activationMail.ejs"), data);
        
        try {
            await sendMail({
                email: user.email,
                subject: "Activate your account",
                template: "activationMail.ejs",
                data,
            });

            res.status(201).json({
                success: true,
                message: `Please check your email: ${user.email} to activate your account`,
                activationToken: activationToken.token,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

const createActivationToken = (user) => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jwt.sign({ user, activationCode }, process.env.ACTIVATION_SECRET, { expiresIn: "5m" });
    return { token, activationCode };
};

// Activate user
const activateUser = catchAsync(async (req, res, next) => {
    try {
        const { activation_token, activation_code } = req.body;

        const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
        if (newUser.activationCode !== activation_code) {
            return next(new ErrorHandler("Invalid activation code", 400));
        }
        const { name, email, password } = newUser.user;
        const existsUser = await UserModel.findOne({ email });
        if (existsUser) {
            return next(new ErrorHandler("Email already exists", 400));
        }
        const user = await UserModel.create({ name, email, password });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Get user info
const getUserInfo = catchAsync(async (req, res, next) => {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    res.status(200).json({ success: true, user });
});

// Login user
const loginUser = catchAsync(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler("Please enter email and password", 400));
        }
        const user = await UserModel.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler("User not found", 400));
        }
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return next(new ErrorHandler("Invalid email or password", 400));
        }
        
        // Generate JWT token
        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "iahdfoghoa", { expiresIn: process.env.JWT_EXPIRES_IN || "3d"});
        res.status(200).json({ success: true, accessToken });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Logout user
const logoutUser = catchAsync(async (req, res, next) => {
    try {
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
// Update user info
const updateUserInfo = catchAsync(async (req, res, next) => {
    try {
      const { name } = req.body;
      const userId = req.user._id;
      
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { name },
        { new: true, runValidators: true }
      );
  
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
  
      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  });
  
  // Update password
  const updatePassword = catchAsync(async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user._id;
  
      const user = await UserModel.findById(userId).select("+password");
  
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
  
      const isPasswordMatch = await user.comparePassword(currentPassword);
  
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Current password is incorrect", 400));
      }
  
      user.password = newPassword;
      await user.save();
  
      res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  });
  
  // Update profile picture
  const updateProfilePicture = catchAsync(async (req, res, next) => {
    try {
      const userId = req.user._id;
  
      // Assuming you handle file upload and save the file URL in req.body.profilePicture
  
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { avatar: req.body.profilePicture },
        { new: true, runValidators: true }
      );
  
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
  
      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  });
  
  module.exports = { 
    registrationUser, 
    activateUser, 
    loginUser, 
    getUserInfo, 
    updateUserInfo, 
    updatePassword, 
    updateProfilePicture, 
    logoutUser 
  };