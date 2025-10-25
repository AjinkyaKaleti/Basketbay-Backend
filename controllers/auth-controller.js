// responsible to handle the application logic
//process the incoming request using routers

//get my data using get fetch

const User = require("../models/user-modal");

console.log("UserDB--->", User);

//-----------------Home--------------
const home = async (req, res) => {
  try {
    const data = req.body;
    console.log(`home data ${data}`);

    res.status(200).send({ message: req.body });
  } catch (error) {
    console.error("Home error:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

//-----------------Login--------------
const otpLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, msg: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Check if OTP was verified before allowing login
    if (!user.isOtpVerified) {
      return res.status(403).json({ success: false, msg: "OTP not verified" });
    }

    // Generate JWT
    const token = await user.generateToken();

    res.status(200).json({
      success: true,
      msg: "Login successful",
      token,
      firstname: user.firstname,
      user,
    });
  } catch (error) {
    console.error("OTP Login error:", error);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};

//-----------------Signup--------------
const signup = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      age,
      email,
      mobileno,
      address,
      pincode,
      gender,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile: mobileno }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const newUser = new User({
      firstname,
      lastname,
      age: Number(age),
      email,
      mobile: mobileno, // map to schema
      address,
      pincode,
      gender,
      isOtpVerified: true,
    });

    await newUser.save();

    // Generate JWT token
    const token = await newUser.generateToken();

    res.status(200).json({
      message: `Welcome ${firstname}`,
      user: newUser,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};

//-----------------Signup--------------

const findEmailByMobile = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile)
      return res.status(400).json({ message: "Mobile number is required" });

    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ email: user.email });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

//-----------------Admin Login--------------
const handleAdminAccess = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ success: false, msg: "Password is required" });
    }

    if (password === process.env.ADMIN_PASS) {
      return res.status(200).json({ success: true, msg: "Access granted" });
    } else {
      return res.status(401).json({ success: false, msg: "Invalid password" });
    }
  } catch (error) {
    console.error("Admin access error:", error);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};

//-----------------Profile Edit--------------
const updateProfile = async (req, res) => {
  try {
    const { email, ...updates } = req.body;
    const user = await User.findOneAndUpdate({ email }, updates, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

module.exports = {
  home,
  signup,
  otpLogin,
  findEmailByMobile,
  handleAdminAccess,
  updateProfile,
};
