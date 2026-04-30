import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";
import { passwordResetTemplate } from "../utils/emailTemplates.js";


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    const emailSent = await sendEmail(
      email,
      "Password Reset Request",
      passwordResetTemplate({
        name: user.name,
        resetLink
      })
    );

    // Email failed → rollback changes
    if (!emailSent) {
      user.resetPasswordToken = null;
      user.resetPasswordExpiry = null;
      await user.save();

      return res.status(500).json({
        message: "Password reset email could not be sent",
      });
    }

    // Email actually sent
    return res.json({
      message: "Password reset link sent to email",
    });

  } catch (error) {
    console.error("Forgot password error:", error.message);
    return res.status(500).json({
      message: "Something went wrong while sending reset email",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      user.twoFactorEnabled = false;
      user.otpCode = null;
      user.otpExpiry = null;
      user.otpAttempts = 0;
      user.resetPasswordToken = null;
      user.resetPasswordExpiry = null;

    await user.save();

    res.json({
      message: "Password reset successful. You can now log in."
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to reset password",
      error: error.message
    });
  }
};

