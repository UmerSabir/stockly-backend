import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true
    },

    customerName: {
      type: String,
      default: "Walk-in Customer"
    },

    quantitySold: {
      type: Number,
      required: true
    },

    sellingPrice: {
      type: Number,
      required: true
    },

    saleDate: {
      type: Date,
      default: Date.now
    },

    profit: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Sale", saleSchema);