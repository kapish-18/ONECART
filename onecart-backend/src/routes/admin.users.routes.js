import express from "express";
import User from "../models/User.model.js";

const router = express.Router();

/* ===== GET UNAPPROVED DELIVERY USERS ===== */
router.get("/pending-delivery", async (req, res) => {
  const users = await User.find({
    role: "delivery",
    isApproved: false,
  });

  res.json(users);
});

/* ===== APPROVE DELIVERY USER ===== */
router.patch("/approve-delivery", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOneAndUpdate(
    { email, role: "delivery" },
    { isApproved: true },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

export default router;
