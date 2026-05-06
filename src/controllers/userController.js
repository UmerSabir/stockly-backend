import User from "../models/User.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// ✅ GET ALL USERS (OWNER only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json({
      message: "Users fetched successfully",
      data: users
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message
    });
  }
};

// ✅ CREATE USER (OWNER only)
export const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Validation
    if (!name || !email || !role) {
      return res.status(400).json({ 
        message: "Name, email, and role are required" 
      });
    }

    const allowedRoles = ["OWNER", "MANAGER", "STAFF", "VIEWER"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ 
        message: "Invalid role" 
      });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ 
        message: "Email already exists" 
      });
    }

    // Generate temporary password (8 characters with mix)
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      twoFactorEnabled: false
    });

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User created successfully",
      user: userResponse,
      tempPassword: tempPassword // Send to frontend to display once
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create user",
      error: error.message
    });
  }
};

// ✅ UPDATE PROFILE (logged-in user)
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId;

    if (!name || !name.trim()) {
      return res.status(400).json({ 
        message: "Name is required" 
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    res.json({
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message
    });
  }
};

// ✅ CHANGE PASSWORD (logged-in user)
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId;

    // Validation
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Old password and new password are required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "New password must be at least 6 characters" 
      });
    }

    // Get user with password field
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: "Current password is incorrect" 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({
      message: "Password changed successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to change password",
      error: error.message
    });
  }
};

// ✅ UPDATE USER ROLE (OWNER only)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentUserId = req.userId;

    // Get requesting user to check if OWNER
    const requestingUser = await User.findById(currentUserId);
    if (requestingUser.role !== "OWNER") {
      return res.status(403).json({ 
        message: "Only OWNER can change roles" 
      });
    }

    const allowedRoles = ["OWNER", "MANAGER", "STAFF", "VIEWER"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ 
        message: "Invalid role" 
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Prevent removing OWNER's own OWNER role
    if (id === currentUserId && user.role === "OWNER" && role !== "OWNER") {
      return res.status(400).json({ 
        message: "You cannot remove your own OWNER role" 
      });
    }

    user.role = role;
    await user.save();

    res.json({
      message: "User role updated successfully",
      user: user.toObject()
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user role",
      error: error.message
    });
  }
};

// ✅ SAVE BUSINESS SETTINGS (OWNER only)
export const saveBusinessSettings = async (req, res) => {
  try {
    const { storeName, currency, lowStockThreshold } = req.body;
    const userId = req.userId;

    // Validation
    if (!storeName || !currency || lowStockThreshold === undefined) {
      return res.status(400).json({ 
        message: "All fields are required" 
      });
    }

    if (lowStockThreshold < 1) {
      return res.status(400).json({ 
        message: "Low stock threshold must be at least 1" 
      });
    }

    // Save settings to user document
    // (For now, we'll add fields to User model dynamically)
    const user = await User.findByIdAndUpdate(
      userId,
      {
        storeName,
        currency,
        lowStockThreshold
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    res.json({
      message: "Business settings saved successfully",
      settings: {
        storeName: user.storeName,
        currency: user.currency,
        lowStockThreshold: user.lowStockThreshold
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save business settings",
      error: error.message
    });
  }
};