import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema(
  {
    acceptingOrders: {
      type: Boolean,
      default: true,
    },

    // ✅ NEW
    peakMode: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SystemConfig", systemConfigSchema);