import User from "../models/User.js";

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["OWNER", "MANAGER", "STAFF", "VIEWER"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({
      message: "User role updated successfully",
      userId: user._id,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user role",
      error: error.message
    });
  }
};