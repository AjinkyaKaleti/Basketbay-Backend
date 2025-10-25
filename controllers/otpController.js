const User = require("../models/user-modal");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/mailer");

let otpStore = {}; // { email: { otp, expiresAt } }

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

//------------Send Otp-----------------
const sendOtp = async (req, res) => {
  try {
    const { email, mode } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    let user = await User.findOne({ email });

    // Only check user existence for login
    if (mode === "login" && !user) {
      return res.status(404).json({ message: "User not found" });
    }

    //Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    otpStore[email] = { otp, expiresAt: expiry.getTime() };
    setTimeout(() => delete otpStore[email], 5 * 60 * 1000);

    // Save OTP & expiry only if user exists (login case)
    if (user) {
      user.otp = otp;
      user.otpExpiry = expiry;
      await user.save();
    }

    // Send OTP email
    const html = `<p>Your OTP is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`;

    const emailSent = await sendEmail(email, "Your BasketBay OTP", html);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again.",
      });
    }

    console.log(`Generated OTP for ${email}: ${otp}`);
    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//------------Verify Otp-----------------

const verifyOtp = async (req, res) => {
  try {
    const { email, otp, mode } = req.body;

    if (!email || !otp || !mode) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP required" });
    }

    if (mode === "signup") {
      const record = otpStore[email];
      if (!record) {
        return res
          .status(400)
          .json({ success: false, message: "OTP not found" });
      }
      if (record.otp !== otp) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
      }
      if (record.expiresAt < Date.now()) {
        delete otpStore[email];
        return res.status(400).json({ success: false, message: "OTP expired" });
      }

      // OTP verified for signup — remove from store
      delete otpStore[email];

      return res.status(200).json({
        success: true,
        message: "OTP verified for signup",
      });
    }

    if (mode === "login") {
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      if (user.otp !== otp) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
      }
      if (user.otpExpiry < new Date()) {
        return res.status(400).json({ success: false, message: "OTP expired" });
      }

      // OTP is valid — mark as verified
      user.isOtpVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();

      // Create JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        success: true,
        message: "OTP verified & user logged in",
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstname,
          lastName: user.lastname,
          mobile: user.mobile,
        },
      });
    }

    return res.status(400).json({ success: false, message: "Invalid mode" });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "OTP verification failed" });
  }
};

module.exports = { sendOtp, verifyOtp };
