import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema(
  {
    acceptingOrders: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SystemConfig", systemConfigSchema);
