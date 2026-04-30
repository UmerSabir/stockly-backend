import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    sku: {
      type: String,
      required: true,
      unique: true
    },

    category: {
      type: String,
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      default: 0
    },

    purchasePrice: {
      type: Number,
      required: true
    },

    sellingPrice: {
      type: Number,
      required: true
    },

    expiryDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);