import express from "express";
import Order from "../models/Order.model.js";
import User from "../models/User.model.js";

const router = express.Router();

/* ======================================================
   💸 PAYOUT SUMMARY
   GET /admin/payouts?period=today|week|month|all

   For each delivery partner, returns:
   - name, email, qrCode
   - ordersDelivered: number of DELIVERED orders in period
   - foodAmountFronted: sum of foodAmount (money they paid at outlet)
   - deliveryFeesEarned: sum of deliveryFee
   - youOwe: foodAmountFronted + deliveryFeesEarned - (9 * ordersDelivered)

   Formula explanation:
     - You receive totalAmount (foodAmount + deliveryFee) from user via Razorpay
     - Delivery partner fronts foodAmount at the outlet
     - You owe them back: foodAmount (reimburse) + deliveryFee (their cut)
     - You keep: ₹9 per order as your revenue
====================================================== */
router.get("/", async (req, res) => {
  try {
    const { period = "week" } = req.query;

    // Build date filter
    let dateFilter = {};
    const now = new Date();
    if (period === "today") {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      dateFilter = { deliveredAt: { $gte: startOfDay } };
    } else if (period === "week") {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { deliveredAt: { $gte: weekAgo } };
    } else if (period === "month") {
      const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { deliveredAt: { $gte: monthAgo } };
    }
    // period === "all" => no date filter

    const payoutData = await Order.aggregate([
      {
        $match: {
          status: "DELIVERED",
          deliveryPerson: { $ne: null },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$deliveryPerson",
          ordersDelivered: { $sum: 1 },
          foodAmountFronted: { $sum: "$foodAmount" },
          deliveryFeesEarned: { $sum: "$deliveryFee" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "partner",
        },
      },
      { $unwind: "$partner" },
      {
        $project: {
          _id: 0,
          partnerId: "$_id",
          name: "$partner.name",
          email: "$partner.email",
          qrCode: "$partner.qrCode",
          ordersDelivered: 1,
          foodAmountFronted: 1,
          deliveryFeesEarned: 1,
          youOwe: {
            $subtract: [
              { $add: ["$foodAmountFronted", "$deliveryFeesEarned"] },
              { $multiply: ["$ordersDelivered", 9] },
            ],
          },
        },
      },
      { $sort: { youOwe: -1 } },
    ]);

    // Also return total you owe across all partners
    const totalOwed = payoutData.reduce((sum, p) => sum + p.youOwe, 0);
    const totalOrders = payoutData.reduce((sum, p) => sum + p.ordersDelivered, 0);
    const yourRevenue = totalOrders * 9;

    res.json({
      period,
      partners: payoutData,
      summary: {
        totalOwed,
        totalOrders,
        yourRevenue,
      },
    });
  } catch (err) {
    console.error("Payouts error:", err);
    res.status(500).json({ error: "Failed to fetch payouts" });
  }
});

/* ======================================================
   📷 SET QR CODE FOR DELIVERY PARTNER
   PATCH /admin/payouts/qr
   Body: { email, qrCode }  (qrCode is an image URL)
====================================================== */
router.patch("/qr", async (req, res) => {
  try {
    const { email, qrCode } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });

    const user = await User.findOneAndUpdate(
      { email, role: "delivery" },
      { qrCode },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "Delivery partner not found" });

    res.json({ success: true, qrCode: user.qrCode });
  } catch (err) {
    console.error("QR update error:", err);
    res.status(500).json({ error: "Failed to update QR code" });
  }
});

export default router;