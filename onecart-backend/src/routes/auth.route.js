import express from "express";
import User from "../models/User.model.js";
import { sendOtpEmail } from "../utils/sendEmail.js";

const router = express.Router();

/* ======================================================
   SEND OTP
   POST /auth/send-otp
====================================================== */
router.post("/send-otp", async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    if (!role || !["user", "delivery"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.findOneAndUpdate(
      { email },
      {
        email,
        role,
        otp,
        otpExpiry: Date.now() + 5 * 60 * 1000,
      },
      {
        upsert: true,
        new: true,
        runValidators: false, // VERY IMPORTANT
      }
    );

    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

/* ======================================================
   VERIFY OTP
   POST /auth/verify-otp
====================================================== */
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

    // Only users need name + hostel
    if (user.role === "user") {
      if (!user.name && name) user.name = name;
      if (!user.hostelBlock && hostelBlock) user.hostelBlock = hostelBlock;
    }

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