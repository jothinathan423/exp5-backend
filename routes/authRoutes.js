const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

const DEFAULT_JWT_SECRET = "default_secret_key"; // Define a default secret key

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    console.error("Validation error: Missing fields in request body.");
    return res.status(400).json({ msg: "Please enter all fields." });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const secretKey = process.env.JWT_SECRET || DEFAULT_JWT_SECRET; // Use default if not defined
    const token = jwt.sign({ id: newUser._id }, secretKey, { expiresIn: "1h" });

    res.json({ token });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password" });
    }

    const secretKey = process.env.JWT_SECRET || DEFAULT_JWT_SECRET; // Use default if not defined
    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: "1h" });

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
module.exports = router;
