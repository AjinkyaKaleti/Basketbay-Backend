const Product = require("../models/admin-product-modal");

// Add product
exports.addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: "Product added", product });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add product", error: err.message });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: err.message });
  }
};

// Update stock after order
exports.updateStock = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    //subtract the ordered count from current stock
    if (product.count < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    product.count -= quantity; // decrement stock
    await product.save();

    res.json({ message: "Stock updated successfully", product });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update stock", error: err.message });
  }
};
