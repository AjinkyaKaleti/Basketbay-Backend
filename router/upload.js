const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinaryConfig");

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "basketbay/products", // folder in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const parser = multer({ storage });

// Upload endpoint
router.post("/image", parser.single("image"), (req, res) => {
  try {
    if (!req.file) {
      console.error("Multer did not receive a file!");
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({
      message: "Image uploaded successfully",
      url: req.file.path, // Cloudinary URL
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = router;
