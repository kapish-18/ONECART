import express from "express";
import Order from "../models/Order.model.js";
import User from "../models/User.model.js";
import SystemConfig from "../models/SystemConfig.model.js";
import { sendPushNotification } from "../utils/sendPush.js";

const router = express.Router();

/**
 * CREATE ORDER (USER)
 * POST /orders
 */
router.post("/", async (req, res) => {
  try {
    const { userEmail, outlets } = req.body;

    if (!userEmail || !outlets || outlets.length === 0) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    /* ================= SYSTEM CHECKS ================= */
    const config = await SystemConfig.findOne();
    if (!config || !config.acceptingOrders) {
      return res.status(403).json({
        error: "Ordering is currently disabled",
      });
    }

    /* ================= USER ================= */
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    /* ================= CREATE ORDER ================= */
    const order = await Order.create({
      user: user._id,
      outlets,
      hostelBlock: user.hostelBlock,
      status: "CREATED",
      deliveryPerson: null,
      deliveryFee: 30,
    });

    console.log("🟢 ORDER CREATED:", order._id);

    /* ================= 🔔 PUSH NOTIFICATION ================= */
    const deliveryUsers = await User.find({
      role: "delivery",
      isAvailable: true,
      pushToken: { $exists: true, $ne: null },
    });

    console.log("📦 Notifying delivery users:", deliveryUsers.length);

    for (const deliveryUser of deliveryUsers) {
      await sendPushNotification(
        deliveryUser.pushToken,
        "🚨 New Order Available",
        `Pickup from hostel ${user.hostelBlock}`
      );
    }

    /* ================= RESPONSE ================= */
    res.status(201).json({
      message: "Order placed successfully",
      order: {
        id: order._id,
        status: order.status,
        createdAt: order.createdAt,
      },
    });

  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
});

export default router;
