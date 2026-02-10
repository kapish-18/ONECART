import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    outlets: [
      {
        outletId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Outlet",
          required: true,
        },
        outletName: String,
        items: String,
      },
    ],

    hostelBlock: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["CREATED", "ASSIGNED", "DELIVERED", "CANCELLED"],
      default: "CREATED",
    },

    deliveryPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ✅ NEW
    deliveryFee: {
      type: Number,
      default: 30,
    },

    // ✅ NEW
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
