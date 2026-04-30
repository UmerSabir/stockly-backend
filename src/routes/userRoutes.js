import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import { updateUserRole } from "../controllers/userController.js";

const router = express.Router();

// OWNER only — change user role
router.patch(
  "/:id/role",
  auth,
  allowRoles("OWNER"),
  updateUserRole
);

export default router;