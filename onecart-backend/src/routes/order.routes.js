import express from "express";
import Order from "../models/Order.model.js";
import User from "../models/User.model.js";
import SystemConfig from "../models/SystemConfig.model.js";
import { sendPushNotification } from "../utils/sendPush.js";

const router = express.Router();

/* ======================================================
   GET ALL ORDERS (ADMIN PANEL)
====================================================== */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "email hostelBlock")
      .populate("deliveryPerson", "email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/* ======================================================
   GET USER ORDERS
====================================================== */
router.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const orders = await Order.find({ user: user._id })
      .populate("deliveryPerson", "email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Fetch user orders error:", err);
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
});

/* ======================================================
   CREATE ORDER
====================================================== */
router.post("/", async (req, res) => {
  try {
    const { userEmail, outlets } = req.body;

    if (!userEmail || !outlets || outlets.length === 0) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    const config = await SystemConfig.findOne();
    if (!config || !config.acceptingOrders) {
      return res.status(403).json({
        error: "Ordering is currently disabled",
      });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    /* ================= DELIVERY FEE LOGIC ================= */

    const outletCount = outlets.length;
    let totalItems = 0;

    for (const o of outlets) {
      if (!o.items) continue;

      const lines = o.items.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const match = trimmed.match(/x(\d+)/i);
        if (match) {
          totalItems += parseInt(match[1], 10);
        } else {
          totalItems += 1;
        }
      }
    }

    // 🔒 SAFETY DEFAULT
    let deliveryFee = 29;

    if (totalItems > 5) {
      deliveryFee = 59;
    } else if (
      (outletCount === 1 && totalItems <= 2) ||
      (outletCount === 2 && totalItems === 2)
    ) {
      deliveryFee = 29;
    } else if (
      (outletCount === 1 && totalItems <= 3) ||
      (outletCount === 2 && totalItems <= 3)
    ) {
      deliveryFee = 39;
    } else {
      deliveryFee = 49;
    }

    if (config?.peakMode) {
      deliveryFee += 10;
    }

    /* ================= CREATE ORDER ================= */

    const order = await Order.create({
      user: user._id,
      outlets,
      hostelBlock: user.hostelBlock,
      status: "CREATED",
      deliveryPerson: null,
      deliveryFee: deliveryFee, // explicit safe assignment
      foodAmount: 0,
      totalAmount: 0,
      paymentStatus: "PENDING",
    });

    console.log("🟢 ORDER CREATED:", order._id);
    console.log("💰 DELIVERY FEE SAVED:", deliveryFee);

    /* ================= PUSH NOTIFICATION ================= */

    const deliveryUsers = await User.find({
      role: "delivery",
      isAvailable: true,
      pushToken: { $ne: null },
    });

    for (const deliveryUser of deliveryUsers) {
      await sendPushNotification(
        deliveryUser.pushToken,
        "🚨 New Order Available",
        `Pickup from hostel ${user.hostelBlock}`
      );
    }

    res.status(201).json({
      message: "Order placed successfully",
      orderId: order._id,
      deliveryFee,
    });

  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
});

export default router;