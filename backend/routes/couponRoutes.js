const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

const { createCoupon, getCoupons } = require("../controllers/couponController");

// Public
router.get("/", getCoupons);

// Admin
router.post("/", authMiddleware, isAdmin, createCoupon);

module.exports = router;