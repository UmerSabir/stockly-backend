import express from "express";
import { signup, login } from "../controllers/authController.js";
import { signupSchema, loginSchema } from "../validations/authValidation.js";
import { auth } from "../middlewares/authMiddleware.js";
import { forgotPassword } from "../controllers/passwordController.js";
import { resetPassword } from "../controllers/passwordController.js";
import { resetPasswordSchema } from "../validations/passwordValidation.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { verifyOtp } from "../controllers/authController.js";
import { toggleTwoFactor } from "../controllers/authController.js";


const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.post("/verify-otp", verifyOtp);
router.put("/toggle-2fa", auth, toggleTwoFactor);

router.get("/me", auth, (req, res) => {
  res.json({ userId: req.userId });
});

export default router;