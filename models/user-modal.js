const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  gender: { type: String, required: true },
  isOtpVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  otp: { type: String, required: false },
  otpExpiry: { type: Date, required: false },
});

// Add JWT method
userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      mobile: this.mobile,
      isAdmin: this.isAdmin,
      isVerified: this.isOtpVerified,
    },
    process.env.JWT_SECRET_KEY || "your_jwt_secret",
    { expiresIn: "7d" }
  );
};

const User = mongoose.model("User", userSchema);
module.exports = User;

/*const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  middlename: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  gender: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v); // 10-digit number
      },
      message: (props) => `${props.value} is not a valid mobile number!`,
    },
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isMobileVerified: {
    type: Boolean,
    default: false,
  },
});

//secure the password
//save my data before saving into the database
//this is middleware

userSchema.pre("save", async function (next) {
  const user = this; //get the current entry before storing into the DB
  //console.log("user data: ", user);

  if (!user.isModified("password")) {
    return next(); //go to save data i.e user.create
  }

  try {
    const saltRound = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(user.password, saltRound);
    user.password = hash_password;
    next();
  } catch (error) {
    next(error);
  }
});

//JSON Web Token which is mixture of header,payload and signature
userSchema.methods.generateToken = async function () {
  try {
    return jwt.sign(
      {
        userId: this._id.toString(),
        mobile: this.mobile,
        isAdmin: this.isAdmin,
        isVerified: this.isMobileVerified,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "30d" }
    );
  } catch (error) {}
};

const User = new mongoose.model("User", userSchema);

module.exports = User;
*/
