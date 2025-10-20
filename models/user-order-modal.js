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
    paymentMethod: { type: String, default: "online" },
    totalAmount: Number,
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending",
    },
    paymentDetails: {
      cashfree_order_id: { type: String },
      payment_link: { type: String },
      payment_status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
        default: "PENDING",
      },
      payment_reference_id: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
