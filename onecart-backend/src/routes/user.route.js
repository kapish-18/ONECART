import express from "express";
import User from "../models/User.model.js";

const router = express.Router();

/* ================= CREATE USER (TEMP – for testing) ================= */
router.post("/", async (req, res) => {
  try {
    const { name, email, hostelBlock, role } = req.body;
    const user = await User.create({ name, email, hostelBlock, role });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ================= GET ALL USERS (TEMP – for testing) ================= */
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/* ================= SAVE USER PUSH TOKEN ================= */
router.post("/push-token", async (req, res) => {
  try {
    const { email, pushToken } = req.body;
    if (!pushToken) {
      return res.status(400).json({ error: "Push token required" });
    }
    const user = await User.findOneAndUpdate(
      { email, role: "user" },
      { pushToken },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save push token" });
  }
});

export default router;