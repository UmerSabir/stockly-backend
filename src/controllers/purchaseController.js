import Purchase from "../models/Purchase.js";
import Item from "../models/Item.js";

export const addPurchase = async (req, res) => {
  try {
    const { itemId, supplierName, quantity, costPrice, batchNumber, purchaseDate } = req.body;

    if (!itemId || !supplierName || !quantity || !costPrice) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const item = await Item.findOne({
      _id: itemId,
      userId: req.userId
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const purchase = await Purchase.create({
      userId: req.userId,
      itemId,
      supplierName,
      quantity,
      costPrice,
      batchNumber,
      purchaseDate
    });

    // update stock
    item.quantity += quantity;
    await item.save();

    res.status(201).json({
      message: "Purchase added",
      purchase,
      updatedStock: item.quantity
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to add purchase", error: err.message });
  }
};

export const getPurchases = async (req, res) => {
  try {
    const { search, supplier, page = 1, limit = 10, startDate, endDate } = req.query;

    const query = { userId: req.userId };

    // search by item name or SKU (via populate)
    if (search) {
      const regex = new RegExp(search, "i");

      query.$or = [
        { supplierName: { $regex: regex } }
      ];
    }

    // filter by supplier name
    if (supplier) {
      query.supplierName = supplier;
    }

    // date range filter
    if (startDate && endDate) {
      query.purchaseDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const skip = (page - 1) * limit;

    const purchases = await Purchase.find(query)
      .populate("itemId", "name sku category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Purchase.countDocuments(query);

    res.json({
      purchases,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch purchases", error: err.message });
  }
};

export const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate("itemId", "name sku category");

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    res.json(purchase);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch purchase", error: err.message });
  }
};

export const updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    const oldQuantity = purchase.quantity;
    const newQuantity = req.body.quantity ?? oldQuantity;

    // Find the item to adjust stock
    const item = await Item.findOne({
      _id: purchase.itemId,
      userId: req.userId
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Stock adjustment logic
    const diff = newQuantity - oldQuantity;
    item.quantity += diff;

    if (item.quantity < 0) {
      return res.status(400).json({ message: "Stock cannot be negative" });
    }

    // Update purchase fields
    purchase.supplierName = req.body.supplierName ?? purchase.supplierName;
    purchase.quantity = newQuantity;
    purchase.costPrice = req.body.costPrice ?? purchase.costPrice;
    purchase.batchNumber = req.body.batchNumber ?? purchase.batchNumber;
    purchase.purchaseDate = req.body.purchaseDate ?? purchase.purchaseDate;

    await purchase.save();
    await item.save();

    res.json({
      message: "Purchase updated",
      updatedPurchase: purchase,
      updatedStock: item.quantity
    });

  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

export const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    const item = await Item.findOne({
      _id: purchase.itemId,
      userId: req.userId
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Rollback stock
    item.quantity -= purchase.quantity;

    if (item.quantity < 0) {
      item.quantity = 0;
    }

    await item.save();
    await Purchase.findByIdAndDelete(req.params.id);

    res.json({
      message: "Purchase deleted",
      updatedStock: item.quantity
    });

  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};