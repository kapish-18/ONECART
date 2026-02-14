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

    deliveryFee: {
      type: Number,
      default: 30,
    },

    /* ================= PAYMENT FIELDS ================= */

    foodAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },

    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);