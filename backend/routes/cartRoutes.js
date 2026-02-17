const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getMyCart,
  addToCart,
  updateCartItemQty,
  removeCartItem,
  clearCart,
  applyCoupon,     // ✅ ADD
  removeCoupon,    // ✅ ADD
} = require("../controllers/cartController");

// Cart
router.get("/", authMiddleware, getMyCart);
router.post("/add", authMiddleware, addToCart);
router.put("/update/:productId", authMiddleware, updateCartItemQty);
router.delete("/remove/:productId", authMiddleware, removeCartItem);
router.delete("/clear", authMiddleware, clearCart);

// ✅ Coupons
router.post("/apply-coupon", authMiddleware, applyCoupon);
router.post("/remove-coupon", authMiddleware, removeCoupon);

module.exports = router;