// /app/controllers/payment-controller.js
const Order = require("../models/user-order-modal");
const User = require("../models/user-modal");
const CASHFREE_BASE_URL = "https://api.cashfree.com/pg"; // For PROD

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

    const orderId = `ORDER_${Date.now()}`;

    //Create Cashfree order via REST API
    const response = await axios.post(
      `${CASHFREE_BASE_URL}/orders`,
      {
        order_id: orderId,
        order_amount: totalAmount,
        order_currency: "INR",
        customer_details: {
          customer_id: customer._id.toString(),
          customer_name: `${customer.firstname} ${customer.lastname}`,
          customer_email: customer.email,
          customer_phone: customer.mobileno,
        },
        order_meta: {
          return_url: "https://basketbay.in/payment-status",
        },
      },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json",
        },
      }
    );

    //Extract payment link from response
    const paymentLink = response.data?.payment_link || null;
    if (!paymentLink) {
      throw new Error("Failed to get payment link from Cashfree");
    }

    //Save order in DB with pending status
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
      message: "Payment link created successfully.",
      paymentLink,
      orderId: savedOrder._id,
    });
  } catch (err) {
    console.error("Payment link creation error:", err.response?.data || err);
    res.status(500).json({
      success: false,
      message: "Error creating payment link",
      error: err.response?.data || err.message,
    });
  }
};

//Webhook handler to update order
const handleCashfreeWebhook = async (req, res) => {
  try {
    const { orderId, orderStatus, referenceId } = req.body;

    const order = await Order.findOne({
      "paymentDetails.cashfree_order_id": orderId,
    });
    if (!order) {
      return res.status(404).send("Order not found");
    }

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
