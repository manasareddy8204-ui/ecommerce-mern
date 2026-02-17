// routes/orderRoutes.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  markOrderPaid,
  updateOrderStatus,
  cancelMyOrder,
  adminCancelOrder,
  payOrderFake, // ✅ IMPORTANT
} = require("../controllers/orderController");

// =====================
// USER routes
// =====================
router.post("/", authMiddleware, placeOrder);
router.get("/my", authMiddleware, getMyOrders);
router.put("/:id/cancel", authMiddleware, cancelMyOrder);

// ✅ Fake online payment
router.post("/:id/pay", authMiddleware, payOrderFake);

// =====================
// ADMIN routes
// =====================
router.get("/", authMiddleware, isAdmin, getAllOrders);
router.put("/:id/pay", authMiddleware, isAdmin, markOrderPaid);
router.put("/:id/status", authMiddleware, isAdmin, updateOrderStatus);
router.put("/:id/admin-cancel", authMiddleware, isAdmin, adminCancelOrder);

module.exports = router;