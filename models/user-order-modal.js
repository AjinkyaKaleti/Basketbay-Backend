const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        quantity: Number,
        discount: { type: Number, default: 0 },
        imageUrl: { type: String },
      },
    ],
    paymentMethod: String,
    totalAmount: Number,
    status: { type: String, default: "Completed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
