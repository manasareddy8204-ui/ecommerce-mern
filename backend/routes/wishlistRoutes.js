const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

router.get("/", authMiddleware, getWishlist);
router.post("/add", authMiddleware, addToWishlist);
router.delete("/remove/:productId", authMiddleware, removeFromWishlist);

module.exports = router;