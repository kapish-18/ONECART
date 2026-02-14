import express from "express";
import SystemConfig from "../models/SystemConfig.model.js";
import User from "../models/User.model.js";

const router = express.Router();

/* ================= GET STATUS ================= */
router.get("/status", async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({
        acceptingOrders: true,
        peakMode: false,
      });
    }

    const availableDeliveryCount = await User.countDocuments({
      role: "delivery",
      isAvailable: true,
    });

    const acceptingOrders =
      config.acceptingOrders && availableDeliveryCount > 0;

    res.json({
      acceptingOrders,
      adminEnabled: config.acceptingOrders,
      availableDeliveryCount,
      peakMode: config.peakMode, // ✅ return peak mode
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch system status" });
  }
});

/* ================= PATCH SYSTEM ================= */
router.patch("/", async (req, res) => {
  try {
    const { acceptingOrders, peakMode } = req.body;

    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({
        acceptingOrders: acceptingOrders ?? true,
        peakMode: peakMode ?? false,
      });
    } else {
      if (acceptingOrders !== undefined)
        config.acceptingOrders = acceptingOrders;

      if (peakMode !== undefined)
        config.peakMode = peakMode;

      await config.save();
    }

    res.json(config);
  } catch {
    res.status(500).json({ error: "Failed to update system config" });
  }
});

export default router;