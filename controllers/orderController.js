const Order = require("../models/user-order-modal");
const User = require("../models/user-modal"); // to get customer's email
const Product = require("../models/admin-product-modal");
const { sendEmail } = require("../utils/mailer");

// POST: create a new order
const createOrder = async (req, res) => {
  console.log("Body:", JSON.stringify(req.body, null, 2));
  try {
    const { customerId, products, totalAmount, paymentMethod, paymentDetails } =
      req.body;

    if (!customerId || !products || products.length === 0) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    // Check if user has pending order for the same products
    const productIds = products.map((p) => p.productId).filter((id) => id); // remove undefined/null

    const existingPending = await Order.findOne({
      customer: customerId,
      "products.productId": { $in: productIds },
      status: "PENDING",
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message:
          "You already have a pending order for one or more of these products.",
      });
    }

    // Determine order status and payment status
    let status = paymentMethod === "COD" ? "PENDING" : "PENDING";
    let paymentStatus = paymentMethod === "COD" ? "PENDING" : "PENDING";

    if (
      paymentMethod === "online" &&
      paymentDetails?.cashfree_order_id &&
      paymentDetails?.payment_status === "SUCCESS"
    ) {
      status = "Paid";
      paymentStatus = "SUCCESS";
    }

    const newOrder = new Order({
      customer: customerId,
      products,
      paymentMethod: paymentMethod,
      paymentDetails: {
        cashfree_order_id: paymentDetails?.cashfree_order_id || "",
        payment_link: paymentDetails?.payment_link || "",
        payment_status: paymentStatus,
        payment_reference_id: paymentDetails?.payment_reference_id || "",
      },
      totalAmount,
      status,
    });

    const savedOrder = await newOrder.save();

    // Update product stock
    for (let item of products) {
      if (item.productId && item.quantity > 0) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { count: -item.quantity },
        });
      }
    }

    // Get customer's email from user collection
    const customer = await User.findById(customerId);
    console.log("customer email test data : ", customer);
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
    const html = `
      <p>Greetings ${customer.firstname},</p>
      <p>Thank you for your order!</p>
      <p><strong>Order ID:</strong> ${savedOrder._id}</p>
      <p><strong>Products:</strong><br/>${productList}</p>
      <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
       <p><strong>Payment Status:</strong> ${
         paymentStatus === "PENDING" ? "Pending" : "Paid"
       }</p>
      <p>We’ll notify you once your payment is confirmed.</p>
    `;

    const emailSent = await sendEmail(
      customer.email,
      `Order Confirmation - ${savedOrder._id}`,
      html
    );
    if (!emailSent) {
      console.warn("Warning: Order confirmation email failed to send");

      // still return success for order creation, but let frontend know email failed
      return res.status(201).json({
        message: "Order placed, but failed to send email.",
        order: savedOrder,
      });
    }

    res.status(201).json({
      success: true,
      message: "Order placed! Check your email.",
      order: savedOrder,
    });
  } catch (err) {
    console.error(err); // full stack trace
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// GET: fetch orders by customer for recent tab
const getOrdersByCustomer = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.params.customerId,
    }).sort({
      createdAt: -1,
    });
    if (!orders) {
      return res.status(404).json({ message: "No orders found" });
    }
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
      status: order.status,
      paymentStatus: order.paymentDetails?.payment_status || "PENDING",
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

// PATCH: update order status (for admin panel)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status,
        "paymentDetails.payment_status":
          status === "PAID" ? "SUCCESS" : "PENDING",
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("Error updating order status:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update status" });
  }
};

module.exports = {
  createOrder,
  getOrdersByCustomer,
  getAllOrders,
  updateOrderStatus,
};
