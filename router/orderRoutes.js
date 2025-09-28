const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrdersByCustomer,
  getAllOrders,
} = require("../controllers/orderController");

// POST: create order
router.post("/", createOrder);

//get all orders for admin lineup (with customer + product details)
router.get("/all", getAllOrders);

// GET: get all orders for a customer
router.get("/:customerId", getOrdersByCustomer);

module.exports = router;
