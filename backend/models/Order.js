const mongoose = require("mongoose");

// ============================
// Order Item Schema
// ============================
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    itemTotal: { type: Number, required: true },
    image: { type: String },
  },
  { _id: false }
);

// ============================
// Shipping Address Schema
// ============================
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
  },
  { _id: false }
);

// ============================
// Main Order Schema
// ============================
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    // ============================
    // Payment Fields
    // ============================
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
     default: "COD",
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    paymentRef: { type: String, default: "" }, // fake payment id

    // ============================
    // Order Status
    // ============================
    status: {
      type: String,
      enum: ["pending", "placed", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
