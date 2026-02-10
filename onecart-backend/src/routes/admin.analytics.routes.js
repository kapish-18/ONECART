import express from "express";
import Order from "../models/Order.model.js";
import User from "../models/User.model.js";

const router = express.Router();

/* ======================================================
   📊 ADMIN ANALYTICS SUMMARY
   GET /admin/analytics/summary
====================================================== */
router.get("/summary", async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const deliveredOrders = await Order.countDocuments({
      status: "DELIVERED",
    });

    const cancelledOrders = await Order.countDocuments({
      status: "CANCELLED",
    });

    const activeDeliveryPartners = await User.countDocuments({
      role: "delivery",
      isAvailable: true,
    });

    const earningsAgg = await Order.aggregate([
      { $match: { status: "DELIVERED" } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$deliveryFee" },
          avgDeliveryTime: {
            $avg: {
              $subtract: ["$deliveredAt", "$createdAt"],
            },
          },
        },
      },
    ]);

    res.json({
      totalOrders,
      deliveredOrders,
      cancelledOrders,
      activeDeliveryPartners,
      totalEarnings: earningsAgg[0]?.totalEarnings || 0,
      avgDeliveryTimeMinutes: earningsAgg[0]
        ? Math.round(earningsAgg[0].avgDeliveryTime / 60000)
        : 0,
    });
  } catch (err) {
    console.error("Admin analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

/* ======================================================
   📈 ORDERS PER DAY (LAST 7 DAYS)
   GET /admin/analytics/orders-per-day
====================================================== */
router.get("/orders-per-day", async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders-per-day" });
  }
});

/* ======================================================
   🚴 DELIVERY PARTNER PERFORMANCE
   GET /admin/analytics/delivery-performance
====================================================== */
router.get("/delivery-performance", async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $match: { status: "DELIVERED" } },
      {
        $group: {
          _id: "$deliveryPerson",
          totalOrders: { $sum: 1 },
          earnings: { $sum: "$deliveryFee" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "deliveryUser",
        },
      },
      { $unwind: "$deliveryUser" },
      {
        $project: {
          email: "$deliveryUser.email",
          totalOrders: 1,
          earnings: 1,
        },
      },
      { $sort: { totalOrders: -1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch delivery performance" });
  }
});

export default router;
