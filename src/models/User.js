import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, 
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["OWNER", "MANAGER", "STAFF", "VIEWER"],
      default: "OWNER"
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    // 🔐 Two-Factor Authentication
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    otpCode: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },

    otpAttempts: {
      type: Number,
      default: 0,
    },

    // 🔁 Password reset
    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;