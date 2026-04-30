import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { addItem } from "../controllers/itemController.js";
import { getItems } from "../controllers/itemController.js";
import { getItemById } from "../controllers/itemController.js";
import { updateItem } from "../controllers/itemController.js";
import { deleteItem } from "../controllers/itemController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { addItemSchema, updateItemSchema } from "../validations/itemValidation.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/", auth, validate(addItemSchema), addItem);
router.get("/", auth, getItems);
router.get("/:id", auth, getItemById);
router.put("/:id", auth, validate(updateItemSchema), updateItem);

router.delete(
  "/:id",
  auth,
  allowRoles("OWNER"),
  deleteItem
);

export default router;