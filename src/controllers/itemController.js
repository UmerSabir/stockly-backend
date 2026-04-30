import Item from "../models/Item.js";

export const addItem = async (req, res) => {
  try {
    const { name, sku, category, quantity, purchasePrice, sellingPrice, expiryDate } = req.body;

    if (!name || !sku || !category || !quantity || !purchasePrice || !sellingPrice) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const exists = await Item.findOne({ sku });
    if (exists) {
      return res.status(400).json({ message: "SKU already exists" });
    }

    const item = await Item.create({
      userId: req.userId,
      name,
      sku,
      category,
      quantity,
      purchasePrice,
      sellingPrice,
      expiryDate
    });

    res.status(201).json({ message: "Item added", item });
  } catch (err) {
    res.status(500).json({ message: "Failed to add item", error: err.message });
  }
};

export const getItems = async (req, res) => {
  try {
    const { search, category, stock, page, limit } = req.query;

    const query = { userId: req.userId };

    // search by name or sku
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } }
      ];
    }

    // filter by category
    if (category) {
      query.category = category;
    }

    // stock filters
    if (stock === "low") {
      query.quantity = { $lte: 10, $gt: 0 };
    }

    if (stock === "out") {
      query.quantity = 0;
    }

    // If NO pagination params → return ALL items
    if (!page && !limit) {
      const items = await Item.find(query).sort({ createdAt: -1 });
      return res.json({
        items,
        total: items.length,
        totalPages: 1,
        currentPage: 1
      });
    }

    // IF pagination provided → apply pagination
    const p = Number(page) || 1;
    const l = Number(limit) || 10;

    const skip = (p - 1) * l;

    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l);

    const total = await Item.countDocuments(query);

    res.json({
      items,
      total,
      totalPages: Math.ceil(total / l),
      currentPage: p
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch items",
      error: err.message
    });
  }
};

export const getItemById = async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch item", error: err.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const updates = req.body;

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json({ message: "Item updated", updatedItem });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};