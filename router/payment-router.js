const express = require("express");
const {
  paymentGateway,
  verifyPayment,
} = require("../controllers/payment-controller");
const router = express.Router();

router.post("/payment-gateway", paymentGateway);
router.post("/verify-payment", verifyPayment);

module.exports = router;
