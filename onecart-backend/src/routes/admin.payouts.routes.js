import express from "express";
import Order from "../models/Order.model.js";
import User from "../models/User.model.js";

const router = express.Router();

/* ======================================================
   💸 PAYOUT SUMMARY
   GET /admin/payouts?period=today|week|month|all

   Only counts DELIVERED orders AFTER each partner's lastPaidAt.
   This way "Mark Paid" effectively resets their outstanding balance
   without deleting any data.

   youOwe = foodAmountFronted + deliveryFeesEarned - (9 × ordersDelivered)
====================================================== */
router.get("/", async (req, res) => {
  try {
    const { period = "week" } = req.query;

    // Build period date filter (secondary filter, on top of lastPaidAt)
    let periodDate = null;
    const now = new Date();
    if (period === "today") {
      periodDate = new Date(now);
      periodDate.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      periodDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "month") {
      periodDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
    }
    // period === "all" => periodDate stays null

    // Fetch all approved delivery partners so we show everyone,
    // even those with 0 outstanding orders
    const allPartners = await User.find(
      { role: "delivery", isApproved: true },
      { name: 1, email: 1, qrCode: 1, lastPaidAt: 1 }
    );

    // For each partner, query their outstanding orders individually
    // so we can apply their personal lastPaidAt cutoff
    const results = await Promise.all(
      allPartners.map(async (partner) => {
        const dateConditions = [];
        if (partner.lastPaidAt) {
          dateConditions.push({ deliveredAt: { $gt: partner.lastPaidAt } });
        }
        if (periodDate) {
          dateConditions.push({ deliveredAt: { $gte: periodDate } });
        }

        const matchStage = {
          status: "DELIVERED",
          deliveryPerson: partner._id,
          ...(dateConditions.length > 0 ? { $and: dateConditions } : {}),
        };

        const agg = await Order.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: null,
              ordersDelivered: { $sum: 1 },
              foodAmountFronted: { $sum: "$foodAmount" },
              deliveryFeesEarned: { $sum: "$deliveryFee" },
            },
          },
        ]);

        const stats = agg[0] || {
          ordersDelivered: 0,
          foodAmountFronted: 0,
          deliveryFeesEarned: 0,
        };

        return {
          partnerId: partner._id,
          name: partner.name,
          email: partner.email,
          qrCode: partner.qrCode || null,
          lastPaidAt: partner.lastPaidAt || null,
          ordersDelivered: stats.ordersDelivered,
          foodAmountFronted: stats.foodAmountFronted,
          deliveryFeesEarned: stats.deliveryFeesEarned,
          youOwe:
            stats.foodAmountFronted +
            stats.deliveryFeesEarned -
            stats.ordersDelivered * 9,
        };
      })
    );

    results.sort((a, b) => b.youOwe - a.youOwe);

    const totalOwed = results.reduce((s, p) => s + p.youOwe, 0);
    const totalOrders = results.reduce((s, p) => s + p.ordersDelivered, 0);
    const yourRevenue = totalOrders * 9;

    res.json({
      period,
      partners: results,
      summary: { totalOwed, totalOrders, yourRevenue },
    });
  } catch (err) {
    console.error("Payouts error:", err);
    res.status(500).json({ error: "Failed to fetch payouts" });
  }
});

/* ======================================================
   ✅ MARK PAID
   PATCH /admin/payouts/mark-paid
   Body: { email }

   Sets lastPaidAt = now. Next payout query only counts
   orders delivered after this moment.
====================================================== */
router.patch("/mark-paid", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });

    const user = await User.findOneAndUpdate(
      { email, role: "delivery" },
      { lastPaidAt: new Date() },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "Delivery partner not found" });

    res.json({ success: true, lastPaidAt: user.lastPaidAt });
  } catch (err) {
    console.error("Mark paid error:", err);
    res.status(500).json({ error: "Failed to mark as paid" });
  }
});

/* ======================================================
   📷 SET QR CODE
   PATCH /admin/payouts/qr
   Body: { email, qrCode }
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