const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// ✅ quick test route
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server is working ✅" });
});

// ✅ auth routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// ✅ products routes
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

// ✅ 👉 ADD CART ROUTES HERE (THIS IS THE CORRECT PLACE)
const cartRoutes = require("./routes/cartRoutes");
app.use("/api/cart", cartRoutes);

const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);

const wishlistRoutes = require("./routes/wishlistRoutes");
app.use("/api/wishlist", wishlistRoutes);

const couponRoutes = require("./routes/couponRoutes");
app.use("/api/coupons", couponRoutes);

// ❌ DO NOT PUT ROUTES BELOW THIS — 404 must be LAST

// ✅ 404 handler (must stay at bottom)
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

// DB + start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("MongoDB connection error ❌", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));