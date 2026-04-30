import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { addPurchase } from "../controllers/purchaseController.js";
import { getPurchases } from "../controllers/purchaseController.js";
import { getPurchaseById } from "../controllers/purchaseController.js";
import { updatePurchase } from "../controllers/purchaseController.js";
import { deletePurchase } from "../controllers/purchaseController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { addPurchaseSchema, updatePurchaseSchema } from "../validations/purchaseValidation.js";

const router = express.Router();

router.post("/", auth, validate(addPurchaseSchema), addPurchase);
router.get("/", auth, getPurchases);
router.get("/:id", auth, getPurchaseById);
router.put("/:id", auth, validate(updatePurchaseSchema), updatePurchase);
router.delete("/:id", auth, deletePurchase);


export default router;