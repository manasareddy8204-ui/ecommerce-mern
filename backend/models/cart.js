const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },

    // ✅ add item total (for faster calculations)
    itemTotal: { type: Number, default: 0 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: { type: [cartItemSchema], default: [] },

    // ✅ totals (needed for order, checkout)
    subtotal: { type: Number, default: 0 },
    countItems: { type: Number, default: 0 },

    // ✅ coupon support
    coupon: {
      code: { type: String, default: "" },
      discount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);