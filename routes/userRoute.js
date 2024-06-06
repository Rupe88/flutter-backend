const express = require("express");
const {
  registrationUser,
  loginUser,
  activateUser,
  getUserInfo,
  logoutUser,
  updateUserInfo,
  updatePassword,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

//router
router.post("/register-user", registrationUser);
router.post("/login-user", loginUser);
router.post("/activate-user", activateUser);
router.post("/logout-user", authMiddleware, logoutUser); //protected route
router.get("/me", authMiddleware, getUserInfo); // Protected route
router.put("/update-user-info", authMiddleware, updateUserInfo); // Protected route
router.put("/update-password", authMiddleware, updatePassword); // Protected route

module.exports = router;
