const nodemailer = require("nodemailer");
const User = require("../models/user-modal");
const jwt = require("jsonwebtoken");

let otpStore = {}; // { email: { otp, expiresAt } }

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

//------------Send Otp-----------------
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    otpStore[email] = { otp, expiresAt: expiry.getTime() };
    setTimeout(() => delete otpStore[email], 5 * 60 * 1000);

    // Save OTP & expiry in database
    user.otp = otp;
    user.otpExpiry = expiry; // Now using the defined variable
    await user.save();

    console.log(`Generated OTP for ${email}: ${otp}`);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your BasketBay OTP",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: `OTP sent to ${email}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

//------------Verify Otp-----------------

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check OTP match
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Check expiry
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // OTP is valid — mark as verified
    user.isOtpVerified = true;
    user.otp = undefined; // clear OTP
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
      },
    });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "OTP verification failed" });
  }
};

module.exports = { sendOtp, verifyOtp };
