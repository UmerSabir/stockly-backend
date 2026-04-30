import Item from "../models/Item.js";
import Sale from "../models/Sale.js";

export const getInventoryOverview = async (req, res) => {
  try {
    const items = await Item.find({ userId: req.userId });

    const totalItems = items.length;

    const totalStockQuantity = items.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);

    const totalStockValue = items.reduce((sum, item) => {
      return sum + item.quantity * item.purchasePrice;
    }, 0);

    res.json({
      totalItems,
      totalStockQuantity,
      totalStockValue
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch overview",
      error: err.message
    });
  }
};


export const getDailySales = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      userId: req.userId,
      saleDate: { $gte: start, $lte: end }
    });

    const totalSalesToday = sales.reduce((sum, sale) => {
      return sum + sale.quantitySold * sale.sellingPrice;
    }, 0);

    const totalProfitToday = sales.reduce((sum, sale) => {
      return sum + sale.profit;
    }, 0);

    res.json({
      totalSalesToday,
      totalProfitToday,
      totalTransactions: sales.length
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch daily sales",
      error: err.message
    });
  }
};

export const getMonthlySales = async (req, res) => {
  try {
    const now = new Date();

    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const sales = await Sale.find({
      userId: req.userId,
      saleDate: { $gte: start, $lte: end }
    });

    const totalSalesThisMonth = sales.reduce((sum, sale) => {
      return sum + sale.quantitySold * sale.sellingPrice;
    }, 0);

    const totalProfitThisMonth = sales.reduce((sum, sale) => {
      return sum + sale.profit;
    }, 0);

    res.json({
      totalSalesThisMonth,
      totalProfitThisMonth,
      totalTransactions: sales.length
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch monthly sales",
      error: err.message
    });
  }
};

export const getTopSellingItems = async (req, res) => {
  try {
    const sales = await Sale.find({ userId: req.userId }).populate(
      "itemId",
      "name sku category purchasePrice"
    );

    // Grouping logic
    const itemStats = {};

    sales.forEach((sale) => {
      const id = sale.itemId._id.toString();

      if (!itemStats[id]) {
        itemStats[id] = {
          itemId: id,
          name: sale.itemId.name,
          sku: sale.itemId.sku,
          category: sale.itemId.category,
          totalQuantitySold: 0,
          totalRevenue: 0,
          totalProfit: 0,
        };
      }

      itemStats[id].totalQuantitySold += sale.quantitySold;
      itemStats[id].totalRevenue += sale.quantitySold * sale.sellingPrice;
      itemStats[id].totalProfit += sale.profit;
    });

    // Convert object to array and sort by quantity sold
    const topSelling = Object.values(itemStats).sort(
      (a, b) => b.totalQuantitySold - a.totalQuantitySold
    );

    res.json(topSelling);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch top selling items",
      error: err.message,
    });
  }
};

export const getLowStockItems = async (req, res) => {
  try {
    const threshold = 10; // You can later make this configurable

    const items = await Item.find({
      userId: req.userId,
      quantity: { $lte: threshold }
    }).sort({ quantity: 1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch low stock items",
      error: err.message
    });
  }
};

export const getExpiryAlerts = async (req, res) => {
  try {
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    const expiringItems = await Item.find({
      userId: req.userId,
      expiryDate: { $ne: null, $lte: next30Days }
    }).sort({ expiryDate: 1 });

    res.json(expiringItems);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch expiry alerts",
      error: err.message
    });
  }
};