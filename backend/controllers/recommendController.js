const Product = require("../models/Product");

// GET /api/products/recommend  (simple: top rated products)
const recommendProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ ratingAvg: -1 }).limit(5);
    return res.json({ products });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/products/:id/recommend (simple: same category)
const getRecommendations = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });

    const products = await Product.find({
      category: p.category,
      _id: { $ne: p._id },
    }).limit(5);

    return res.json({ products });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { recommendProducts, getRecommendations };