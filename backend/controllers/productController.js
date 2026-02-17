const Product = require("../models/Product");

// ✅ Create product
const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock, images } = req.body;

    if (!title || price === undefined || !category) {
      return res.status(400).json({ message: "title, price, category are required" });
    }

    const product = await Product.create({
      title,
      description: description || "",
      price,
      category,
      stock: stock ?? 0,
      images: Array.isArray(images) ? images : [],
    });

    return res.status(201).json({ message: "Product created", product });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Get all products (search/filter/sort/pagination)
const getProducts = async (req, res) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { ratingAvg: -1 },
    };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sortMap[sort] || sortMap.newest).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      count: items.length,
      products: items,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ product });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Update product
const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ message: "Product updated", product: updated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Delete product
const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};