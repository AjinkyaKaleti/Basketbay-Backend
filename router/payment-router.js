const express = require("express");
const {
  paymentGateway,
  cashfreeWebhook,
} = require("../controllers/payment-controller");
const router = express.Router();

router.post("/payment-gateway", paymentGateway);
router.post("/webhook", cashfreeWebhook); // webhook endpoint

module.exports = router;
