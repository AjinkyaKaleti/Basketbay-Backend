const crypto = require("crypto");
const Razorpay = require("razorpay");

// console.log("Razorpay Key ID:", process.env.REACT_APP_RAZORPAY_KEY_ID);
// console.log("Razorpay Key Secret:", process.env.REACT_APP_RAZORPAY_KEY_SECRET);

// Initialize Razorpay instance here so the controller can use it
const razorpay = new Razorpay({
  key_id: process.env.REACT_APP_RAZORPAY_KEY_ID,
  key_secret: process.env.REACT_APP_RAZORPAY_KEY_SECRET,
});

const paymentGateway = async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // amount in paise
    currency: "INR",
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Verify payment
const verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.REACT_APP_RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    res.json({ status: "success", message: "Payment verified successfully" });
  } else {
    res
      .status(400)
      .json({ status: "failure", message: "Payment verification failed" });
  }
};

module.exports = {
  paymentGateway,
  verifyPayment,
};
