const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const otpRoutes = require("./router/otpRoutes");
const router = require("./router/auth-router");
const connectDb = require("./utils/db");
const orderRoutes = require("./router/orderRoutes");
const productRoutes = require("./router/productRoutes");
const paymentRoutes = require("./router/payment-router");
const cors = require("cors");

// dotenv.config();
const app = express();

// Allow frontend (Netlify) to call your backend
app.use(
  cors({
    origin: ["https://basketbay.netlify.app"],
    credentials: true,
  })
);

//the line of code adds express middleware that parses incomming request bodywiith JSON payload
//this middleware is responsible for parsing JSON  data from requests
app.use(express.json());

app.use("/api/auth", router);

app.use("/api/auth", otpRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/payment", paymentRoutes);

app.use("/api/products", productRoutes);

app.use("/uploads", express.static("uploads"));

// PORT for Railway (Railway sets process.env.PORT automatically)

const PORT = process.env.PORT || 5000;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`server is running at ${PORT}`);
  });
});
