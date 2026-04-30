import Sale from "../models/Sale.js";
import Item from "../models/Item.js";

export const addSale = async (req, res) => {
  try {
    const { itemId, customerName, quantitySold, sellingPrice, saleDate } = req.body;

    if (!itemId || !quantitySold || !sellingPrice) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const item = await Item.findOne({
      _id: itemId,
      userId: req.userId
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.quantity < quantitySold) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // calculate profit
    const profit = (sellingPrice - item.purchasePrice) * quantitySold;

    const sale = await Sale.create({
      userId: req.userId,
      itemId,
      customerName: customerName || "Walk-in Customer",
      quantitySold,
      sellingPrice,
      saleDate,
      profit
    });

    // update stock
    item.quantity -= quantitySold;
    await item.save();

    res.status(201).json({
      message: "Sale added",
      sale,
      updatedStock: item.quantity
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to add sale", error: err.message });
  }
};

export const getSales = async (req, res) => {
  try {
    const { search, customer, page = 1, limit = 10, startDate, endDate } = req.query;

    const query = { userId: req.userId };

    // search by item name, sku, or customer name
    if (search) {
      const regex = new RegExp(search, "i");

      query.$or = [
        { customerName: { $regex: regex } }
      ];
    }

    // filter by customer name
    if (customer) {
      query.customerName = customer;
    }

    // date range filter (saleDate)
    if (startDate && endDate) {
      query.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const skip = (page - 1) * limit;

    const sales = await Sale.find(query)
      .populate("itemId", "name sku category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Sale.countDocuments(query);

    res.json({
      sales,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch sales",
      error: err.message
    });
  }
};

export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate("itemId", "name sku category");

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sale", error: err.message });
  }
};

export const updateSale = async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const item = await Item.findOne({
      _id: sale.itemId,
      userId: req.userId
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const oldQty = sale.quantitySold;
    const newQty = req.body.quantitySold ?? oldQty;

    // Stock adjustment: rollback old, apply new
    const diff = newQty - oldQty;

    if (diff > 0 && item.quantity < diff) {
      return res.status(400).json({ message: "Not enough stock to increase sale quantity" });
    }

    item.quantity -= diff;

    if (item.quantity < 0) {
      item.quantity = 0;
    }

    // Update sale fields
    sale.customerName = req.body.customerName ?? sale.customerName;
    sale.quantitySold = newQty;
    sale.sellingPrice = req.body.sellingPrice ?? sale.sellingPrice;
    sale.saleDate = req.body.saleDate ?? sale.saleDate;

    // recalc profit
    sale.profit = (sale.sellingPrice - item.purchasePrice) * sale.quantitySold;

    await sale.save();
    await item.save();

    res.json({
      message: "Sale updated",
      updatedSale: sale,
      updatedStock: item.quantity
    });

  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const item = await Item.findOne({
      _id: sale.itemId,
      userId: req.userId
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Rollback stock
    item.quantity += sale.quantitySold;
    await item.save();

    await Sale.findByIdAndDelete(req.params.id);

    res.json({
      message: "Sale deleted",
      updatedStock: item.quantity
    });

  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};