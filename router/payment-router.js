const express = require("express");
const {
  createPaymentLink,
  handleCashfreeWebhook,
} = require("../controllers/payment-controller");
const router = express.Router();

router.post("/create-link", createPaymentLink);
router.post("/webhook", handleCashfreeWebhook);
router.post("/verify", verifyPayment);

module.exports = router;
