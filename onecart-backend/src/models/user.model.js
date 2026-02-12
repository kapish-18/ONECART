import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    name: {
      type: String,
      trim: true,
      required: function () {
        return this?.role === "user";
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
        return this?.role === "user";
      },
    },

    role: {
      type: String,
      enum: ["user", "delivery", "admin"],
      default: "user",
    },

    /* ================= AUTH (OTP) ================= */
    otp: {
      type: String,
    },

    otpExpiry: {
      type: Date,
    },

    /* ================= DELIVERY USER ================= */
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

    // 🔐 NEW FIELD (for delivery approval later)
    isApproved: {
      type: Boolean,
      default: function () {
        return this?.role === "delivery" ? false : true;
      },
    },
  },
  {
    timestamps: true,
  }
);

/* ================= INDEXES ================= */
userSchema.index({ role: 1, isAvailable: 1 });

const User = mongoose.model("User", userSchema);
export default User;