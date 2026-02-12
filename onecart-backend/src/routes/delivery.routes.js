import express from "express";
import Order from "../models/Order.model.js";
import User from "../models/User.model.js";

const router = express.Router();

/* ================= GET DELIVERY USER ================= */
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

/* ================= GET CURRENT ASSIGNED ORDER ================= */
router.get("/my-order", async (req, res) => {
  try {
    const { email } = req.query;

    const user = await User.findOne({
      email,
      role: "delivery",
      isApproved: true,
    });

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

/* ================= UPDATE AVAILABILITY ================= */
router.patch("/availability", async (req, res) => {
  try {
    const { email, isAvailable } = req.body;

    const user = await User.findOneAndUpdate(
      { email, role: "delivery", isApproved: true },
      { isAvailable },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "Delivery user not approved" });
    }

    res.json({ isAvailable: user.isAvailable });
  } catch {
    res.status(500).json({ error: "Failed to update availability" });
  }
});

/* ================= GET AVAILABLE ORDERS ================= */
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find({
      status: "CREATED",
      deliveryPerson: null,
    })
      .populate("user", "email hostelBlock")
      .sort({ createdAt: 1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/* ================= ACCEPT ORDER ================= */
router.post("/accept", async (req, res) => {
  try {
    const { orderId, deliveryEmail } = req.body;

    const user = await User.findOne({
      email: deliveryEmail,
      role: "delivery",
      isAvailable: true,
      isApproved: true,
    });

    if (!user) {
      return res.status(400).json({
        error: "Delivery person not approved or not available",
      });
    }

    const activeOrder = await Order.findOne({
      deliveryPerson: user._id,
      status: "ASSIGNED",
    });

    if (activeOrder) {
      return res.status(400).json({
        error: "You already have an active order",
      });
    }

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

    res.json({ message: "Order accepted", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to accept order" });
  }
});

/* ================= MARK DELIVERED ================= */
router.post("/deliver", async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = "DELIVERED";
    order.deliveredAt = new Date();
    await order.save();

    res.json({ message: "Order delivered" });
  } catch {
    res.status(500).json({ error: "Failed to mark delivered" });
  }
});

export default router;
