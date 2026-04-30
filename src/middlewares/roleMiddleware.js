export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({ message: "Role not found" });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        message: "Access denied: insufficient permissions"
      });
    }

    next();
  };
};