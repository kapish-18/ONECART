import express from "express";
import Order from "../models/Order.model.js";
import User from "../models/User.model.js";

const router = express.Router();

/* ================= GET DELIVERY USER ================= */
router.get("/me", async (req, res) => {
  try {
    const { email } = req.query;

    const user = await User.findOne({
      email,
      role: "delivery",
    });

    if (!user) {
      return res.status(404).json({ error: "Delivery user not found" });
    }

    if (!user.isApproved) {
      return res.status(403).json({ error: "Not approved" });
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: "Failed to fetch delivery user" });
  }
});

/* ================= SAVE PUSH TOKEN ================= */
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
    res.status(500).json({ error: "Failed to save push token" });
  }
});

/* ================= GET ASSIGNED ORDER ================= */
router.get("/my-order", async (req, res) => {
  try {
    const { email } = req.query;

    const user = await User.findOne({
      email,
      role: "delivery",
      isApproved: true,
    });

    if (!user) {
      return res.status(403).json({ error: "Not approved" });
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
      return res.status(403).json({ error: "Not approved" });
    }

    res.json({ isAvailable: user.isAvailable });
  } catch {
    res.status(500).json({ error: "Failed to update availability" });
  }
});

/* ================= AVAILABLE ORDERS ================= */
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find({
      status: "CREATED",
      deliveryPerson: null,
    })
      .populate("user", "email hostelBlock")
      .sort({ createdAt: 1 });

    res.json(orders);
  } catch {
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
      return res.status(403).json({
        error: "Not approved or not available",
      });
    }

    const activeOrder = await Order.findOne({
      deliveryPerson: user._id,
      status: "ASSIGNED",
    });

    if (activeOrder) {
      return res.status(400).json({
        error: "Already have active order",
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
  } catch {
    res.status(500).json({ error: "Failed to accept order" });
  }
});

/* ================= SET FOOD AMOUNT ================= */
router.post("/set-food-amount", async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "ASSIGNED") {
      return res.status(400).json({ error: "Order not assigned" });
    }

    order.foodAmount = amount;
    order.totalAmount = amount + order.deliveryFee;

    await order.save();

    res.json({ success: true, totalAmount: order.totalAmount });
  } catch {
    res.status(500).json({ error: "Failed to set food amount" });
  }
});

/* ================= DELIVERY CANCEL ================= */
router.post("/cancel-assigned", async (req, res) => {
  try {
    const { orderId, deliveryEmail } = req.body;

    const user = await User.findOne({
      email: deliveryEmail,
      role: "delivery",
    });

    if (!user) {
      return res.status(404).json({ error: "Delivery user not found" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (
      order.status !== "ASSIGNED" ||
      order.paymentStatus !== "PENDING" ||
      order.deliveryPerson?.toString() !== user._id.toString()
    ) {
      return res.status(400).json({ error: "Cannot cancel this order" });
    }

    order.status = "CREATED";
    order.deliveryPerson = null;
    order.foodAmount = 0;
    order.totalAmount = 0;
    order.paymentStatus = "PENDING";

    await order.save();

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to cancel order" });
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

    if (order.paymentStatus !== "PAID") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    order.status = "DELIVERED";
    order.deliveredAt = new Date();
    await order.save();

    res.json({ message: "Order delivered" });
  } catch {
    res.status(500).json({ error: "Failed to mark delivered" });
  }
});

/* ================= DELIVERY EARNINGS + HISTORY ================= */
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

    res.json({ todayEarnings, orders });
  } catch {
    res.status(500).json({ error: "Failed to fetch earnings" });
  }
});

export default router;