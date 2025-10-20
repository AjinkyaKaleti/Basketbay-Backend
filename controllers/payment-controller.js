const Cashfree = require("@cashfreepayments/cashfree-sdk");
const Order = require("../models/user-order-modal");
const User = require("../models/user-modal");
const { sendEmail } = require("../utils/mailer");
require("dotenv").config();

// Initialize Cashfree client (production)
const client = new Cashfree.Payments({
  environment: "PROD",
  appId: process.env.CASHFREE_APP_ID,
  secretKey: process.env.CASHFREE_SECRET_KEY,
});

// Payment link creation (same as before)
const paymentGateway = async (req, res) => {
  const { amount, customerEmail, customerName, customerPhone } = req.body;

  if (!amount || !customerEmail || !customerName) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const paymentData = {
      customer_details: {
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: customerPhone || "9999999999",
      },
      order_amount: parseFloat(amount),
      order_currency: "INR",
      order_note: "BasketBay Order Payment",
      notify_customer: true,
      return_url: `${process.env.CLIENT_URL}/payment-success`,
    };

    const response = await client.paymentLinks.create(paymentData);

    if (response && response.link) {
      // Optional: save this orderId to DB if you have already created the order
      if (user) {
        await Order.findOneAndUpdate(
          { customer: user._id, status: "pending" }, // last pending order
          {
            $set: {
              "paymentDetails.cashfree_order_id": response.order_id,
              "paymentDetails.cashfree_link": response.link,
              "paymentDetails.created_at": new Date(),
            },
          },
          { new: true }
        );
      }

      res.json({ paymentLink: response.link, orderId: response.order_id });
    } else {
      res
        .status(500)
        .json({ message: "Failed to create payment link", response });
    }
  } catch (err) {
    console.error("Cashfree payment link error:", err);
    res.status(500).json({ message: "Payment gateway error", error: err });
  }
};

// Webhook handler
const cashfreeWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET;
    const signature = req.headers["x-webhook-signature"];
    const payload = JSON.stringify(req.body);

    // Validate signature
    const crypto = require("crypto");
    const hash = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");

    if (hash !== signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const { order_id, order_amount, order_status } = req.body;

    // Only update for successful payment
    if (order_status === "PAID") {
      // Find the order in DB by matching email & amount (you can also save orderId while creating)
      const order = await Order.findOne({
        "paymentDetails.cashfree_order_id": order_id,
      });

      if (order) {
        order.status = "Paid";
        order.paymentDetails.cashfree_payment_status = order_status;
        order.paymentDetails.cashfree_payment_time = new Date();
        await order.save();

        // Send confirmation email
        const customer = await User.findById(order.customer);
        if (customer) {
          const html = `
            <p>Hi ${customer.firstname},</p>
            <p>Your payment of ₹${order_amount} for Order ID: ${order._id} is successful!</p>
            <p>Thank you for shopping with BasketBay.</p>
          `;
          await sendEmail(
            customer.email,
            `Payment Successful - Order ${order._id}`,
            html
          );
        }
      }
    }

    res.status(200).json({ message: "Webhook processed" });
  } catch (err) {
    console.error("Cashfree webhook error:", err);
    res.status(500).json({ message: "Webhook processing failed" });
  }
};

// Optional: verify payment manually
/*
const verifyPayment = async (req, res) => {
  const { orderId } = req.body;
  try {
    const paymentStatus = await client.paymentLinks.get(orderId);

    if (paymentStatus && paymentStatus.payment_status === "PAID") {
      return res.json({
        status: "success",
        message: "Payment verified successfully",
        paymentDetails: paymentStatus,
      });
    } else {
      return res.status(400).json({
        status: "failure",
        message: "Payment not completed yet",
        paymentDetails: paymentStatus,
      });
    }
  } catch (err) {
    console.error("Cashfree verify payment error:", err);
    res.status(500).json({ status: "error", message: "Verification failed" });
  }
};
*/

module.exports = {
  paymentGateway,
  cashfreeWebhook,
};
