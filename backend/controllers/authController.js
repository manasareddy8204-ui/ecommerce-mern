const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const safeUser = await User.findById(createdUser._id).select("-password");

    return res.status(201).json({
      message: "User registered successfully",
      user: safeUser,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });


    const safeUser = await User.findById(user._id).select("-password");

    return res.status(200).json({
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Protected: Get Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getProfile };
