const express = require("express");
const {
  createPaymentLink,
  cashfreeWebhook,
} = require("../controllers/payment-controller");
const router = express.Router();

router.post("/create-link", createPaymentLink);
router.post("/webhook", cashfreeWebhook);

module.exports = router;
