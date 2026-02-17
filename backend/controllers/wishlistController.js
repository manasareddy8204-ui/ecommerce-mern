const User = require("../models/User");

// ✅ Get Wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    return res.status(200).json({
      count: user.wishlist.length,
      wishlist: user.wishlist,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Add to Wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) return res.status(400).json({ message: "productId is required" });

    const user = await User.findById(req.user.id);

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({ message: "Added to wishlist ✅", wishlist: user.wishlist });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Remove from Wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);

    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    return res.status(200).json({ message: "Removed from wishlist ✅", wishlist: user.wishlist });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };