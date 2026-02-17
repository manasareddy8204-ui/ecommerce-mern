const User = require("../models/User");

const isAdmin = async (req, res, next) => {
  try {
    // req.user.id comes from authMiddleware
    const user = await User.findById(req.user.id).select("role");
    if (!user) return res.status(401).json({ message: "User not found" });

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = isAdmin;