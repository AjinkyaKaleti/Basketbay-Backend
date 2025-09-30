const Order = require("../models/user-order-modal");
const User = require("../models/user-modal"); // to get customer's email
const Product = require("../models/admin-product-modal");
const { sendEmail } = require("../utils/mailer");

// POST: create a new order
const createOrder = async (req, res) => {
  try {
    const { customerId, products, totalAmount, paymentMethod, paymentDetails } =
      req.body;

    if (!customerId || !products || products.length === 0) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    // Determine order status
    let status = "pending";
    if (paymentMethod === "Razorpay" && paymentDetails?.razorpay_payment_id) {
      status = "Paid"; // mark paid only if Razorpay payment exists
    }

    const newOrder = new Order({
      customer: customerId,
      products,
      paymentMethod,
      paymentDetails: paymentDetails || {},
      totalAmount,
      status,
    });

    const savedOrder = await newOrder.save();

    // Update product stock
    for (let item of products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { count: -item.quantity }, // reduce stock
      });
    }

    // Get customer's email from user collection
    const customer = await User.findById(customerId);
    if (!customer) {
      return res
        .status(404)
        .json({ message: "Customer not found to send email" });
    }

    const productList = products
      .map(
        (p) =>
          `${p.name} - Qty: ${p.quantity}, Price: ₹${p.price}, Discount: ${
            p.discount || 0
          }%`
      )
      .join("<br/>");

    // Send email to customer
    const emailSent = await sendEmail(
      customer.email,
      `Order Confirmation - ${savedOrder._id}`,
      `
    <p>Greetings ${customer.firstname},</p>
    <p>Thank you for your order!</p>
    <p><strong>Order ID:</strong> ${savedOrder._id}</p>
    <p><strong>Products:</strong><br/>${productList}</p>
    <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
    <p><strong>Payment Method:</strong> ${paymentMethod}</p>
    <p>Your order will be processed shortly.</p>
  `
    );

    if (!emailSent) console.warn("Order confirmation email failed to send");

    res
      .status(201)
      .json({ message: "Order placed! Check your email.", order: savedOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET: fetch orders by customer for recent tab
const getOrdersByCustomer = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.params.customerId }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// get all orders (for LineupOrders admin panel)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "firstname lastname email address mobile")
      .populate("products.productId", "name price description")
      .sort({ createdAt: -1 });

    // format response so frontend gets `customerName` and `address`
    const formatted = orders.map((order) => ({
      _id: order._id,
      customerName: `${order.customer?.firstname || ""} ${
        order.customer?.lastname || ""
      }`,
      address: order.customer?.address || "N/A",
      mobile: order.customer?.mobile,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      products: order.products.map((p) => ({
        name: p.name || p.productId?.name,
        price: p.price || p.productId?.price,
        quantity: p.quantity,
      })),
    }));

    res.json({ orders: formatted });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all orders" });
  }
};

module.exports = {
  createOrder,
  getOrdersByCustomer,
  getAllOrders,
};
