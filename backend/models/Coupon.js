const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },

    type: { type: String, enum: ["PERCENT", "FLAT"], required: true },

    value: { type: Number, required: true, min: 1 }, // 10% or 200₹

    minOrder: { type: Number, default: 0, min: 0 },

    maxDiscount: { type: Number, default: 0, min: 0 }, // for percent coupons (0 = no cap)

    expiry: { type: Date, required: true },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);