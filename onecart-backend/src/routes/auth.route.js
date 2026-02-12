import express from "express";
import User from "../models/User.model.js";
import { sendOtpEmail } from "../utils/sendEmail.js";

const router = express.Router();

/**
 * STEP 1: Send OTP
 */
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Restrict to VIT emails
    if (!email || !email.endsWith("@vitstudent.ac.in")) {
      return res.status(400).json({ error: "Only VIT email allowed" });
    }

    // 2. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 🔑 Determine role at creation time
    const isDelivery = email.startsWith("delivery");

    // 3. Save OTP (create user if not exists)
    const user = await User.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        otpExpiry: Date.now() + 5 * 60 * 1000, // 5 minutes
        role: isDelivery ? "delivery" : "user",
      },
      {
        upsert: true,
        new: true,
        runValidators: false, // 👈 CRITICAL FOR OTP FLOW
      }
    );

    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

/**
 * STEP 2: Verify OTP
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, name, hostelBlock } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (
      user.otp !== otp ||
      !user.otpExpiry ||
      user.otpExpiry < Date.now()
    ) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Update profile details ONLY if needed (users only)
    if (user.role === "user") {
      if (!user.name && name) user.name = name;
      if (!user.hostelBlock && hostelBlock) user.hostelBlock = hostelBlock;
    }

    // Clear OTP
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

export default router;
