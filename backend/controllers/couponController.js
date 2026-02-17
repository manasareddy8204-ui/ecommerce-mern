const Coupon = require("../models/Coupon");

// ✅ Admin: Create coupon
const createCoupon = async (req, res) => {
  try {
    let { code, type, value, minOrder, maxDiscount, expiry } = req.body;

    if (!code || !type || !value || !expiry) {
      return res.status(400).json({ message: "code, type, value, expiry are required" });
    }

    code = code.toUpperCase();

    const exists = await Coupon.findOne({ code });
    if (exists) return res.status(400).json({ message: "Coupon already exists" });

    const coupon = await Coupon.create({
      code,
      type,
      value,
      minOrder: minOrder ?? 0,
      maxDiscount: maxDiscount ?? 0,
      expiry,
    });

    return res.status(201).json({ message: "Coupon created ✅", coupon });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Public: Get all active coupons (optional)
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({ count: coupons.length, coupons });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { createCoupon, getCoupons };