import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { getInventoryOverview } from "../controllers/dashboardController.js";
import { getDailySales } from "../controllers/dashboardController.js";
import { getMonthlySales } from "../controllers/dashboardController.js";
import { getTopSellingItems } from "../controllers/dashboardController.js";
import { getLowStockItems } from "../controllers/dashboardController.js";
import { getExpiryAlerts } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/inventory-overview", auth, getInventoryOverview);
router.get("/daily-sales", auth, getDailySales);
router.get("/monthly-sales", auth, getMonthlySales);
router.get("/top-selling-items", auth, getTopSellingItems);
router.get("/low-stock", auth, getLowStockItems);
router.get("/expiry-alerts", auth, getExpiryAlerts);

export default router;