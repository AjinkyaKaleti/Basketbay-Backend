// /app/controllers/payment-controller.js
const Order = require("../models/user-order-modal");
const User = require("../models/user-modal");
const cashfree = require("@cashfreepayments/cashfree-sdk");

// Create Payment Link & Pending Order
const createPaymentLink = async (req, res) => {
  try {
    const { customerId, products, totalAmount } = req.body;

    if (!customerId || !products || products.length === 0) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Generate unique order ID (you can also use MongoDB _id)
    const orderId = `ORDER_${Date.now()}`;

    // Use cashfree.orders.create() directly
    const paymentResponse = await cashfree.orders.create({
      clientId: process.env.CASHFREE_CLIENT_ID,
      clientSecret: process.env.CASHFREE_CLIENT_SECRET,
      environment: "PROD",
      orderId: orderId,
      orderAmount: totalAmount.toString(),
      orderCurrency: "INR",
      customerDetails: {
        customerId: customer._id.toString(),
        customerName: `${customer.firstname} ${customer.lastname}`,
        customerEmail: customer.email,
        customerPhone: customer.mobileno,
      },
      orderMeta: {
        returnUrl: "https://basketbay.in/payment-status",
      },
    });

    const paymentLink = paymentResponse.paymentLink;

    // Save pending order in your DB
    const pendingOrder = new Order({
      customer: customerId,
      products: products.map((p) => ({
        productId: p.productId,
        name: p.name,
        price: p.price,
        quantity: p.quantity,
        discount: p.discount || 0,
      })),
      totalAmount,
      paymentMethod: "online",
      paymentDetails: {
        cashfree_order_id: orderId,
        payment_link: paymentLink,
        payment_status: "PENDING",
      },
      status: "PENDING",
    });

    const savedOrder = await pendingOrder.save();

    res.status(201).json({
      success: true,
      message: "Payment link created, order is pending.",
      paymentLink,
      orderId: savedOrder._id,
    });
  } catch (err) {
    console.error("Payment link creation error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Optional: Webhook endpoint to update order status
const handleCashfreeWebhook = async (req, res) => {
  try {
    const { orderId, orderAmount, orderStatus, referenceId } = req.body;

    // Find order by cashfree_order_id
    const order = await Order.findOne({
      "paymentDetails.cashfree_order_id": orderId,
    });
    if (!order) {
      return res.status(404).send("Order not found");
    }

    // Update order status
    order.status = orderStatus === "PAID" ? "Paid" : orderStatus;
    order.paymentDetails.payment_status =
      orderStatus === "PAID" ? "SUCCESS" : orderStatus;
    order.paymentDetails.payment_reference_id = referenceId;

    await order.save();

    res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Server error");
  }
};

module.exports = {
  createPaymentLink,
  handleCashfreeWebhook,
};
