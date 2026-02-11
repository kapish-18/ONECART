import express from "express";
import Order from "../models/Order.model.js";
import User from "../models/User.model.js";
import SystemConfig from "../models/SystemConfig.model.js";
import { sendPushNotification } from "../utils/sendPush.js";

const router = express.Router();

/* ======================================================
   CREATE ORDER (USER)
   POST /orders
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

    const order = await Order.create({
      user: user._id,
      outlets,
      hostelBlock: user.hostelBlock,
      status: "CREATED",
      deliveryPerson: null,
      deliveryFee: 30,
    });

    console.log("🟢 ORDER CREATED:", order._id);

    /* 🔔 PUSH NOTIFICATION */
    const deliveryUsers = await User.find({
      role: "delivery",
      isAvailable: true,
      pushToken: { $ne: null },
    });

    console.log("📦 Notifying delivery users:", deliveryUsers.length);

    for (const d of deliveryUsers) {
      await sendPushNotification(
        d.pushToken,
        "🚨 New Order Available",
        `Pickup from hostel ${user.hostelBlock}`
      );
    }

    res.status(201).json({
      message: "Order placed successfully",
      orderId: order._id,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
});

/* ======================================================
   ADMIN: GET ALL ORDERS (CRITICAL)
   GET /orders
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
   ADMIN: UPDATE ORDER STATUS
   PATCH /orders/:orderId/status
====================================================== */
router.patch("/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "CREATED",
      "ASSIGNED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;

    if (status === "DELIVERED") {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

export default router;
