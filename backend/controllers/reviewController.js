const Product = require("../models/Product");
const Order = require("../models/Order");

// ⭐ Add review (only if user bought product)
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { id } = req.params;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // ✅ Check user purchased this product
    const hasBought = await Order.findOne({
      user: req.user.id,
      "items.product": id,
      status: "delivered",
    });

    if (!hasBought) {
      return res.status(403).json({
        message: "You can review only after product delivery",
      });
    }

    // ✅ Prevent multiple reviews
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "You already reviewed this product" });
    }

    const review = {
      user: req.user.id,
      name: req.user.name || "User",
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);

    // ⭐ Update rating
    product.ratingCount = product.reviews.length;
    product.ratingAvg =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) /
      product.ratingCount;

    await product.save();

    return res.status(201).json({
      message: "Review added successfully",
      product,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ⭐ Get product reviews
const getReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select("reviews ratingAvg ratingCount");

    if (!product) return res.status(404).json({ message: "Product not found" });

    return res.status(200).json({
      ratingAvg: product.ratingAvg,
      ratingCount: product.ratingCount,
      reviews: product.reviews,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { addReview, getReviews };