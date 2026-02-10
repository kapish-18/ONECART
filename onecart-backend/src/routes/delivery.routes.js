import express from "express";
import Order from "../models/Order.model.js";
import User from "../models/User.model.js";

const router = express.Router();

/* ======================================================
   GET DELIVERY USER
====================================================== */
router.get("/me", async (req, res) => {
  try {
    const { email } = req.query;

    const user = await User.findOne({ email, role: "delivery" });
    if (!user) {
      return res.status(404).json({ error: "Delivery user not found" });
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: "Failed to fetch delivery user" });
  }
});

/* ======================================================
   GET CURRENT ASSIGNED ORDER
====================================================== */
router.get("/my-order", async (req, res) => {
  try {
    const { email } = req.query;

    const user = await User.findOne({ email, role: "delivery" });
    if (!user) {
      return res.status(404).json({ error: "Delivery user not found" });
    }

    const order = await Order.findOne({
      deliveryPerson: user._id,
      status: "ASSIGNED",
    })
      .populate("user", "email hostelBlock")
      .populate("deliveryPerson", "email");

    res.json(order || null);
  } catch {
    res.status(500).json({ error: "Failed to fetch assigned order" });
  }
});

/* ======================================================
   UPDATE AVAILABILITY
====================================================== */
router.patch("/availability", async (req, res) => {
  try {
    const { email, isAvailable } = req.body;

    const user = await User.findOneAndUpdate(
      { email, role: "delivery" },
      { isAvailable },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "Delivery user not found" });
    }

    res.json({ isAvailable: user.isAvailable });
  } catch {
    res.status(500).json({ error: "Failed to update availability" });
  }
});

/* ======================================================
   GET AVAILABLE ORDERS
====================================================== */
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find({
      status: "CREATED",
      $or: [
        { deliveryPerson: { $exists: false } },
        { deliveryPerson: null },
      ],
    })
      .populate("user", "email hostelBlock")
      .sort({ createdAt: 1 });

    res.json(orders);
  } catch (err) {
    console.error("Delivery orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/* ======================================================
   ACCEPT ORDER (ATOMIC)
====================================================== */
router.post("/accept", async (req, res) => {
  try {
    const { orderId, deliveryEmail } = req.body;

    const user = await User.findOne({
      email: deliveryEmail,
      role: "delivery",
      isAvailable: true,
    });

    if (!user) {
      return res.status(400).json({ error: "Delivery person not available" });
    }

    // prevent multiple active orders
    const activeOrder = await Order.findOne({
      deliveryPerson: user._id,
      status: "ASSIGNED",
    });

    if (activeOrder) {
      return res.status(400).json({
        error: "You already have an active order",
      });
    }

    // atomic assignment
    const order = await Order.findOneAndUpdate(
      { _id: orderId, status: "CREATED" },
      {
        $set: {
          deliveryPerson: user._id,
          status: "ASSIGNED",
        },
      },
      { new: true }
    ).populate("user", "email hostelBlock");

    if (!order) {
      return res.status(400).json({ error: "Order not available" });
    }

    res.json({
      message: "Order accepted",
      order,
    });
  } catch (err) {
    console.error("Accept order error:", err);
    res.status(500).json({ error: "Failed to accept order" });
  }
});

/* ======================================================
   MARK DELIVERED
====================================================== */
router.post("/deliver", async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = "DELIVERED";
    order.deliveredAt = new Date();
    order.deliveryFee = order.deliveryFee ?? 30;

    await order.save();

    res.json({
      message: "Order delivered",
      orderId: order._id,
    });
  } catch {
    res.status(500).json({ error: "Failed to mark delivered" });
  }
});

/* ======================================================
   DELIVERY EARNINGS
====================================================== */
router.get("/earnings", async (req, res) => {
  try {
    const { email } = req.query;

    const user = await User.findOne({ email, role: "delivery" });
    if (!user) {
      return res.status(404).json({ error: "Delivery user not found" });
    }

    const orders = await Order.find({
      deliveryPerson: user._id,
      status: "DELIVERED",
    }).sort({ deliveredAt: -1 });

    const today = new Date().toDateString();

    const todayEarnings = orders
      .filter(
        (o) =>
          o.deliveredAt &&
          new Date(o.deliveredAt).toDateString() === today
      )
      .reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

    const totalEarnings = orders.reduce(
      (sum, o) => sum + (o.deliveryFee || 0),
      0
    );

    res.json({
      todayEarnings,
      totalEarnings,
      totalOrders: orders.length,
      orders,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch earnings" });
  }
});

/* ======================================================
   🔔 SAVE PUSH TOKEN (THIS WAS MISSING ❗)
====================================================== */
router.post("/push-token", async (req, res) => {
  try {
    const { email, pushToken } = req.body;

    if (!pushToken) {
      return res.status(400).json({ error: "Push token required" });
    }

    const user = await User.findOneAndUpdate(
      { email, role: "delivery" },
      { pushToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "Delivery user not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Push token save error:", err);
    res.status(500).json({ error: "Failed to save push token" });
  }
});

export default router;
