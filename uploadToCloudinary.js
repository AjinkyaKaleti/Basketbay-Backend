require("dotenv").config();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

// Mongoose Product model
const Product = require("./models/admin-product-modal");

// MongoDB connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/BasketBayDataBase",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Folder where your local images are stored
const IMAGES_FOLDER = "C:/Users/Admin/Downloads/BasketBay/products";

async function uploadImages() {
  try {
    const files = fs.readdirSync(IMAGES_FOLDER);

    for (const file of files) {
      const localPath = path.join(IMAGES_FOLDER, file);

      console.log(`⏳ Uploading ${file}...`);

      // 4. Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(localPath, {
        folder: "basketbay/products", // Cloudinary folder
      });

      console.log(`Uploaded: ${result.secure_url}`);

      // 5. Update product in DB if it matches this filename
      const updated = await Product.findOneAndUpdate(
        { imageUrl: `/uploads/${file}` }, // old stored local path
        { imageUrl: result.secure_url }, // new cloudinary URL
        { new: true }
      );

      if (updated) {
        console.log(`Updated product ${updated.name} with new image URL`);
      } else {
        console.log(`No product found for ${file}`);
      }
    }

    console.log("Migration finished");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

uploadImages();
