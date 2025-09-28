const express = require("express");
const router = express.Router();
const productController = require("../controllers/product-controller");
const Product = require("../models/admin-product-modal");
const multer = require("multer");
const path = require("path");

// Ensure uploads directory exists (create manually or via startup script)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// GET /api/products?page=1&limit=10
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // default page 1
    const limit = parseInt(req.query.limit) || 6; // default 6 per page
    const skip = (page - 1) * limit;

    // total number of documents
    const total = await Product.countDocuments();

    // fetch with pagination, sorted by newest
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // make sure we return `image` field for compatibility with existing frontend
    const mapped = products.map((p) => {
      const o = p.toObject();
      if (!o.image && o.imageUrl) {
        o.image = o.imageUrl;
      }
      return o;
    });

    // Handle case when no products found
    if (mapped.length === 0) {
      return res.status(200).json({
        products: [],
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        message: "No products available",
      });
    }

    // Send paginated data
    res.json({
      products: mapped,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// POST /api/products  -> multipart/form-data with fields (name, description, price, discount, count) and file field `image`
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      description = "",
      price = 0,
      discount = 0,
      count = 0,
    } = req.body;

    // Compose full image URL if file provided
    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl; // fallback
    }

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      discount: parseFloat(discount),
      count: parseInt(count, 10),
      imageUrl,
    });

    const saved = await product.save();
    const out = saved.toObject();
    out.image = out.imageUrl; // maintain legacy `image` key

    res.status(201).json({ product: out, message: "Product created" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to create product", error: err.message });
  }
});

router.put("/stock", productController.updateStock);

// Increase stock
router.put("/increase/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { count: 1 } },
      { new: true }
    );
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Decrease stock
router.put("/decrease/:id", async (req, res) => {
  // try {
  //   const product = await Product.findById(req.params.id);
  //   if (!product)
  //     return res.status(404).json({ success: false, message: "Not found" });

  //   if (product.count > 0) {
  //     product.count -= 1;
  //     await product.save();
  //     res.json({ success: true, product });
  //   } else {
  //     res
  //       .status(400)
  //       .json({ success: false, message: "Stock cannot go below 0" });
  //   }
  // } catch (err) {
  //   res.status(500).json({ success: false, error: err.message });
  // }

  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { count: -1 } },
      { new: true } // return updated doc
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product count decreased", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to decrease product" });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, deletedId: req.params.id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
