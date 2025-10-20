const { payments } = require("@cashfreepayments/cashfree-sdk");
const crypto = require("crypto");
const Order = require("../models/user-order-modal");
const Product = require("../models/admin-product-modal");
require("dotenv").config();

// Initialize Cashfree client
const cashfree = payments({
  clientId: process.env.CASHFREE_APP_ID,
  clientSecret: process.env.CASHFREE_SECRET_KEY,
  environment: "PROD", // or "TEST" for sandbox
});

// POST: create payment link and pending order
const createPaymentLink = async (req, res) => {
  try {
    const {
      customerId,
      products,
      totalAmount,
      customerName,
      customerEmail,
      customerPhone,
    } = req.body;

    if (!customerId || !products || products.length === 0 || !totalAmount) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Generate unique order ID for Cashfree
    const orderId = `ORDER_${Date.now()}`;

    // Step 1: Save pending order in DB
    const pendingOrder = new Order({
      customer: customerId,
      products,
      totalAmount,
      paymentMethod: "online",
      status: "PENDING",
      paymentDetails: {
        cashfree_order_id: orderId,
        payment_status: "PENDING",
      },
    });

    const savedOrder = await pendingOrder.save();

    // Step 2: Create Cashfree payment link
    const paymentResponse = await cashfree.payments.createLink({
      orderId,
      orderAmount: totalAmount,
      orderCurrency: "INR",
      customerDetails: {
        customerName,
        customerEmail,
        customerPhone,
      },
      orderNote: "BasketBay Order Payment",
    });

    // Step 3: Save payment link in DB
    savedOrder.paymentDetails.payment_link = paymentResponse.paymentLink;
    await savedOrder.save();

    res.status(200).json({
      paymentLink: paymentResponse.paymentLink,
      cashfree_order_id: orderId,
      orderId: savedOrder._id,
    });
  } catch (err) {
    console.error("Cashfree create link error:", err);
    res.status(500).json({ message: "Failed to create payment link" });
  }
};

// POST: Cashfree webhook
const cashfreeWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-webhook-signature"];
    const secret = process.env.CASHFREE_WEBHOOK_SECRET;
    const payload = JSON.stringify(req.body);

    const hash = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    if (hash !== signature)
      return res.status(400).json({ message: "Invalid signature" });

    const { order_id, order_status, reference_id, order_amount } = req.body;

    // Find the pending order
    const order = await Order.findOne({
      "paymentDetails.cashfree_order_id": order_id,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order_status === "PAID") {
      order.status = "Paid";
      order.paymentDetails.payment_status = "SUCCESS";
      order.paymentDetails.cashfree_payment_time = new Date();
      order.paymentDetails.cashfree_reference_id = reference_id;

      // Reduce product stock
      for (let item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { count: -item.quantity },
        });
      }

      await order.save();
    }

    res.status(200).json({ message: "Webhook processed" });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ message: "Webhook failed" });
  }
};

module.exports = { createPaymentLink, cashfreeWebhook };
