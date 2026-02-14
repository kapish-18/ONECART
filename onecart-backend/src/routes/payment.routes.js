import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import Order from "../models/Order.model.js";

dotenv.config();

const router = express.Router();

/* ================= SAFE INITIALIZATION ================= */
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Razorpay keys missing in .env file");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ================= CREATE RAZORPAY ORDER ================= */
router.post("/create-order", async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 🔒 Must have amount set by delivery
    if (!order.totalAmount || order.totalAmount <= 0) {
      return res.status(400).json({
        error: "Amount not set yet by delivery partner",
      });
    }

    const amountInPaise = order.totalAmount * 100;

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order._id.toString(),
    });

    console.log("✅ Razorpay order created:", razorpayOrder.id);

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("❌ Create payment error:", err);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

/* ================= VERIFY PAYMENT ================= */
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.paymentStatus = "PAID";
    await order.save();

    console.log("💰 Payment verified for order:", orderId);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Verify payment error:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

export default router;