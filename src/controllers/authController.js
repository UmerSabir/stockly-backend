import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateOtp } from "../utils/generateOtp.js";
import { otpTemplate } from "../utils/emailTemplates.js";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * LOGIN CONTROLLER
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ If 2FA is enabled → send OTP
    if (user.twoFactorEnabled) {
      const otp = generateOtp();

      user.otpCode = otp;
      user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
      user.otpAttempts = 0; // ✅ reset attempts on new OTP

      await user.save();

      await sendEmail(
        user.email,
        "Your Login OTP",
        otpTemplate({ name: user.name, otp })
      );

      return res.json({
        message: "OTP sent to your email",
        twoFactorRequired: true,
      });
    }

    // ✅ Normal login (RBAC-ready token)
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

/**
 * SIGNUP CONTROLLER
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already used" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      // role defaults to "OWNER" via schema
    });

    return res.status(201).json({
      message: "User created",
      userId: user._id,
    });
  } catch (err) {
    return res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

/**
 * VERIFY OTP CONTROLLER
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.otpCode || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (user.otpAttempts >= 5) {
      return res.status(429).json({
        message: "Too many OTP attempts. Please login again.",
      });
    }

    if (user.otpCode !== otp) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ✅ Successful OTP verification
    user.otpCode = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    // ✅ RBAC-ready token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "OTP verified successfully",
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/**
 * TOGGLE TWO-FACTOR AUTHENTICATION
 */
export const toggleTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.twoFactorEnabled = !user.twoFactorEnabled;
    await user.save();

    res.json({
      message: `Two‑factor authentication ${
        user.twoFactorEnabled ? "enabled" : "disabled"
      }`,
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to toggle 2FA",
      error: error.message,
    });
  }
};