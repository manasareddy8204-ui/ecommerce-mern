const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { addReview, getReviews } = require("../controllers/reviewController");

// ✅ Recommendation controller (import only once)
const { recommendProducts, getRecommendations } = require("../controllers/recommendController");
console.log("recommendController:", require("../controllers/recommendController"));

// ✅ Public routes
router.get("/", getProducts);

// ✅ Recommendation routes (MUST be before "/:id")
router.get("/recommend", authMiddleware, recommendProducts);
router.get("/:id/recommend", getRecommendations);

// ✅ Reviews (MUST be before "/:id")
router.post("/:id/reviews", authMiddleware, addReview);
router.get("/:id/reviews", getReviews);

// ✅ Single product
router.get("/:id", getProductById);

// ✅ Admin routes
router.post("/", authMiddleware, isAdmin, createProduct);
router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

module.exports = router;