import express from "express";
import SystemConfig from "../models/SystemConfig.model.js";
import User from "../models/User.model.js";

const router = express.Router();

/**
 * GET /system/status
 * Returns whether orders can be accepted
 */
router.get("/status", async (req, res) => {
  try {
    // Admin-level config
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({ acceptingOrders: true });
    }

    // Check delivery availability
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
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch system status" });
  }
});

/**
 * PATCH /system
 * Admin toggles acceptingOrders
 */
router.patch("/", async (req, res) => {
  try {
    const { acceptingOrders } = req.body;

    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({ acceptingOrders });
    } else {
      config.acceptingOrders = acceptingOrders;
      await config.save();
    }

    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Failed to update system config" });
  }
});

export default router;
