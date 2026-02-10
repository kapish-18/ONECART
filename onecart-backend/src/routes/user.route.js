import express from "express";
import User from "../models/User.model.js";

const router = express.Router();

/**
 * Create user (TEMP – for testing)
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, hostelBlock, role } = req.body;

    const user = await User.create({
      name,
      email,
      hostelBlock,
      role,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get all users (TEMP – for testing)
 */
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
