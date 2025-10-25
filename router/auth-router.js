const express = require("express");
const router = express.Router();

const { sendOtp, verifyOtp } = require("../controllers/otpController.js");
const {
  home,
  signup,
  otpLogin,
  findEmailByMobile,
  handleAdminAccess,
  updateProfile,
} = require("../controllers/auth-controller");

// Home route
router.get("/", home);

//Login using otp
router.post("/otp-login", otpLogin);

// Signup route
router.post("/signup", signup);

// OTP routes
router.post("/send-otp", sendOtp);

//otp verify
router.post("/verify-otp", verifyOtp);

// Find email by mobile
router.post("/find-email-by-mobile", findEmailByMobile);

// POST /api/auth/admin
router.post("/admin", handleAdminAccess);

// POST /api/auth/update-profile
router.patch("/update-profile", updateProfile);

module.exports = router;
