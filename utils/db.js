const mongoose = require("mongoose");
//const URI = "mongodb://localhost:27017/userdata";
const URI = process.env.MONGODB_URI;

const connectDb = async () => {
  try {
    await mongoose.connect(
      // "mongodb+srv://ajinkyajc1994:ac6H5JXGbe90OQNh@basketbaydb.2ulvev0.mongodb.net/crud"
      URI
    );
    console.log("Successful Connection");
  } catch (error) {
    console.log("Database connect fail " + error);
    process.exit(1);
  }
};

module.exports = connectDb;
