import express from "express";
import Order from "../models/Order.model.js";
import User from "../models/User.model.js";

const router = express.Router();

/*
  GET /stats
  Public endpoint — no auth required.
  Returns live platform stats for the GitHub README badge.
*/
router.get("/", async (req, res) => {
  try {
    const [deliveries, users, revenueAgg] = await Promise.all([
      Order.countDocuments({ status: "DELIVERED" }),
      User.countDocuments({ role: "user" }),
      Order.aggregate([
        { $match: { status: "DELIVERED" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$deliveryFee" },
          },
        },
      ]),
    ]);

    res.json({
      deliveries,
      users,
      revenue: revenueAgg[0]?.total || 0,
    });
  } catch (err) {
    console.error("Stats endpoint error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;