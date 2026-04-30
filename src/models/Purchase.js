import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
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

    supplierName: {
      type: String,
      required: true
    },

    quantity: {
      type: Number,
      required: true
    },

    costPrice: {
      type: Number,
      required: true
    },

    batchNumber: {
      type: String,
      default: null
    },

    purchaseDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("Purchase", purchaseSchema);
``