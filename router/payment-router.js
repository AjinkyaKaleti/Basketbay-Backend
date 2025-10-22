const express = require("express");
const {
  createPaymentLink,
  handleCashfreeWebhook,
  verifyPayment,
} = require("../controllers/payment-controller");
const router = express.Router();

router.post("/create-link", createPaymentLink);
router.post("/webhook", handleCashfreeWebhook);
router.post("/verify/:orderId", verifyPayment);

module.exports = router;
