const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

// =====================
// HELPER FUNCTIONS
// =====================

// Reduce stock when order placed
const reduceStock = async (items) => {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }
};

// Restore stock when cancelled
const restoreStock = async (orderItems) => {
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }
};

// =====================
// USER CONTROLLERS
// =====================

// ✅ PLACE ORDER (COD + ONLINE)
const placeOrder = async (req, res) => {
  try {
    const { paymentMethod = "COD", shippingAddress } = req.body;

    // Shipping validation
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const items = cart.items.map((i) => ({
      product: i.product._id,
      title: i.product.title,
      price: i.product.price,
      quantity: i.quantity,
      itemTotal: i.product.price * i.quantity,
      image: i.product.images?.[0] || "",
    }));

    const subtotal = items.reduce((sum, i) => sum + i.itemTotal, 0);
    const tax = Math.round(subtotal * 0.05);
    const shipping = subtotal > 5000 ? 0 : 100;
    const total = subtotal + tax + shipping;

    // ONLINE = pending, COD = placed
    const status = paymentMethod === "ONLINE" ? "pending" : "placed";

    const order = await Order.create({
      user: req.user.id,
      items,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      paymentMethod,
      isPaid: false,
      status,
    });

    // Reduce stock
    await reduceStock(cart.items);

    // Clear cart
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ GET MY ORDERS
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ FAKE ONLINE PAYMENT
const payOrderFake = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentRef } = req.body;

    const order = await Order.findOne({ _id: id, user: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.paymentMethod !== "ONLINE") {
      return res.status(400).json({ message: "This is not an ONLINE order" });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: "Already paid" });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentRef = paymentRef || `FAKEPAY_${Date.now()}`;
    order.status = "placed";

    await order.save();

    return res.status(200).json({
      message: "Payment successful ✅ (FAKE)",
      order,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// =====================
// ADMIN CONTROLLERS
// =====================

// ✅ GET ALL ORDERS
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ MARK ORDER PAID (COD collected)
const markOrderPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.isPaid) {
      return res.status(400).json({ message: "Already marked paid" });
    }

    order.isPaid = true;
    order.paidAt = new Date();

    await order.save();

    return res.status(200).json({
      message: "Order marked as paid ✅",
      order,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE STATUS
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["pending", "placed", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    return res.status(200).json({
      message: "Order updated ✅",
      order,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ USER CANCEL
const cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!["pending", "placed"].includes(order.status)) {
      return res.status(400).json({ message: "Cannot cancel now" });
    }

    order.status = "cancelled";
    await order.save();

    await restoreStock(order.items);

    return res.status(200).json({
      message: "Cancelled successfully",
      order,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ ADMIN CANCEL
const adminCancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "cancelled";
    await order.save();

    await restoreStock(order.items);

    return res.status(200).json({
      message: "Admin cancelled order",
      order,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getAllOrders,
  markOrderPaid,
  updateOrderStatus,
  cancelMyOrder,
  adminCancelOrder,
  payOrderFake,
};