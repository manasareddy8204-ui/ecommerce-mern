const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");

// helper: calculate totals
const buildCartResponse = async (cart) => {
  await cart.populate("items.product");

  const items = cart.items
    .filter((i) => i.product)
    .map((i) => ({
      product: {
        _id: i.product._id,
        title: i.product.title,
        price: i.product.price,
        category: i.product.category,
        images: i.product.images,
        stock: i.product.stock,
      },
      quantity: i.quantity,
      itemTotal: i.product.price * i.quantity,
    }));

  const subtotal = items.reduce((sum, i) => sum + i.itemTotal, 0);
  const countItems = items.reduce((sum, i) => sum + i.quantity, 0);

  // ✅ coupon + discount
  const coupon = cart.coupon || { code: "", discount: 0 };
  const discount = coupon.discount || 0;
  const finalTotal = Math.max(0, subtotal - discount);

  return {
    _id: cart._id,
    user: cart.user,
    items,
    subtotal,
    countItems,
    coupon,
    discount,
    finalTotal,
    updatedAt: cart.updatedAt,
    createdAt: cart.createdAt,
  };
};

// ✅ Get my cart
const getMyCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [], coupon: { code: "", discount: 0 } });
    }

    const data = await buildCartResponse(cart);
    return res.status(200).json({ cart: data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Add item to cart (or increase qty)
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) return res.status(400).json({ message: "productId is required" });
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ message: "quantity must be an integer >= 1" });
    }

    const product = await Product.findById(productId).select("stock");
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [], coupon: { code: "", discount: 0 } });

    const existing = cart.items.find((i) => i.product.toString() === productId);

    if (existing) {
      const newQty = existing.quantity + qty;
      if (product.stock < newQty) {
        return res.status(400).json({ message: `Only ${product.stock} items in stock` });
      }
      existing.quantity = newQty;
    } else {
      if (product.stock < qty) {
        return res.status(400).json({ message: `Only ${product.stock} items in stock` });
      }
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();
    const data = await buildCartResponse(cart);
    return res.status(200).json({ message: "Added to cart", cart: data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Update quantity (set exact qty)
const updateCartItemQty = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ message: "quantity must be an integer >= 1" });
    }

    const product = await Product.findById(productId).select("stock");
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < qty) return res.status(400).json({ message: `Only ${product.stock} items in stock` });

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [], coupon: { code: "", discount: 0 } });

    const existing = cart.items.find((i) => i.product.toString() === productId);
    if (!existing) return res.status(404).json({ message: "Item not in cart" });

    existing.quantity = qty;

    await cart.save();
    const data = await buildCartResponse(cart);
    return res.status(200).json({ message: "Cart updated", cart: data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Remove item from cart
const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [], coupon: { code: "", discount: 0 } });

    const before = cart.items.length;
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);

    if (cart.items.length === before) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    // ✅ if cart becomes empty, remove coupon
    if (cart.items.length === 0) {
      cart.coupon = { code: "", discount: 0 };
    }

    await cart.save();
    const data = await buildCartResponse(cart);
    return res.status(200).json({ message: "Item removed", cart: data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Clear cart
const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [], coupon: { code: "", discount: 0 } });

    cart.items = [];
    cart.coupon = { code: "", discount: 0 }; // ✅ clear coupon too
    await cart.save();

    const data = await buildCartResponse(cart);
    return res.status(200).json({ message: "Cart cleared", cart: data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Apply coupon
const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "Coupon code is required" });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ message: "Invalid coupon" });

    if (coupon.expiry < new Date()) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [], coupon: { code: "", discount: 0 } });

    const data = await buildCartResponse(cart);

    if (data.subtotal < coupon.minOrder) {
      return res.status(400).json({
        message: `Minimum order must be ₹${coupon.minOrder} to use this coupon`,
      });
    }

    let discount = 0;

    if (coupon.type === "PERCENT") {
      discount = Math.round((data.subtotal * coupon.value) / 100);
      if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = Math.min(coupon.value, data.subtotal);
    }

    cart.coupon = { code: coupon.code, discount };
    await cart.save();

    const updated = await buildCartResponse(cart);

    return res.status(200).json({
      message: "Coupon applied ✅",
      cart: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Remove coupon
const removeCoupon = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.coupon = { code: "", discount: 0 };
    await cart.save();

    const updated = await buildCartResponse(cart);

    return res.status(200).json({
      message: "Coupon removed ✅",
      cart: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMyCart,
  addToCart,
  updateCartItemQty,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
};