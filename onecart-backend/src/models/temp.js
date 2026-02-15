import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */

    name: {
      type: String,
      trim: true,
      required: function () {
        return this.role === "user";
      },
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    hostelBlock: {
      type: String,
      required: function () {
        return this.role === "user";
      },
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "delivery", "admin"],
      default: "user",
    },

    /* ================= OTP ================= */

    otp: String,
    otpExpiry: Date,

    /* ================= DELIVERY FIELDS ================= */

    isApproved: {
      type: Boolean,
      default: false,
    },

    isAvailable: {
      type: Boolean,
      default: false,
    },

    pushToken: {
      type: String,
      default: null,
    },

    totalEarnings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, isAvailable: 1 });

const User = mongoose.model("User", userSchema);
export default User;