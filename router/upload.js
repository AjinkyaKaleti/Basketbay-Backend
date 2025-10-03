const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinaryConfig");

// Use memory storage to avoid disk writes
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    //console.log("Uploading image to Cloudinary:", req.file.originalname);

    cloudinary.uploader
      .upload_stream({ folder: "basketbay/products" }, (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ error: error.message });
        }

        //console.log("Uploaded successfully:", result.secure_url);
        res.json({
          url: result.secure_url,
          message: "Image uploaded successfully",
        });
      })
      .end(req.file.buffer);
  } catch (err) {
    console.error("Upload route error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
