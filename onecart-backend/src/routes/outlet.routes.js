import express from "express";
import Outlet from "../models/Outlet.js";

const router = express.Router();

/**
 * GET /outlets
 * Returns all available outlets
 */
router.get("/", async (req, res) => {
  try {
    const outlets = await Outlet.find().sort({ name: 1 });
    res.json(outlets);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch outlets" });
  }
});

export default router;
