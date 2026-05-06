import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import {
  getAllUsers,
  createUser,
  updateProfile,
  changePassword,
  updateUserRole,
  saveBusinessSettings
} from "../controllers/userController.js";

const router = express.Router();

// ✅ GET ALL USERS (OWNER only)
router.get("/", auth, allowRoles("OWNER"), getAllUsers);

// ✅ CREATE USER (OWNER only)
router.post("/", auth, allowRoles("OWNER"), createUser);

// ✅ UPDATE PROFILE (logged-in user)
router.put("/update-profile", auth, updateProfile);

// ✅ CHANGE PASSWORD (logged-in user)
router.put("/change-password", auth, changePassword);

// ✅ SAVE BUSINESS SETTINGS (OWNER only)
router.put("/business-info", auth, allowRoles("OWNER"), saveBusinessSettings);

// ✅ UPDATE USER ROLE (OWNER only) - PUT version
router.put("/:id/role", auth, allowRoles("OWNER"), updateUserRole);

// ✅ PATCH version (legacy compatibility)
router.patch(
  "/:id/role",
  auth,
  allowRoles("OWNER"),
  updateUserRole
);

export default router;