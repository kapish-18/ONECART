import mongoose from "mongoose";

const outletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    menuImages: {
      type: [String], // array of image URLs
      default: [],
    },

    instructions: {
      type: String,
      default: "Type item name and quantity",
    },
  },
  { timestamps: true }
);

const Outlet = mongoose.model("Outlet", outletSchema);

export default Outlet;
