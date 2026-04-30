import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import {
  addSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale
} from "../controllers/saleController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  addSaleSchema,
  updateSaleSchema
} from "../validations/saleValidation.js";

const router = express.Router();

/**
 * Add sale
 * OWNER, MANAGER, STAFF
 */
router.post(
  "/",
  auth,
  allowRoles("OWNER", "MANAGER", "STAFF"),
  validate(addSaleSchema),
  addSale
);

/**
 * Get all sales
 * OWNER, MANAGER
 */
router.get(
  "/",
  auth,
  allowRoles("OWNER", "MANAGER"),
  getSales
);

/**
 * Get sale by ID
 * OWNER, MANAGER
 */
router.get(
  "/:id",
  auth,
  allowRoles("OWNER", "MANAGER"),
  getSaleById
);

/**
 * Update sale
 * OWNER, MANAGER
 */
router.put(
  "/:id",
  auth,
  allowRoles("OWNER", "MANAGER"),
  validate(updateSaleSchema),
  updateSale
);

/**
 * Delete sale
 * OWNER only
 */
router.delete(
  "/:id",
  auth,
  allowRoles("OWNER"),
  deleteSale
);

export default router;