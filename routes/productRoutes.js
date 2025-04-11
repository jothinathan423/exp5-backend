// filepath: d:\MEC\MERN\buy_sell_app\routes\productRoutes.js
const express = require("express");
const multer = require("multer");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "img/"); // Save images to the "img" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});
const upload = multer({ storage });

// Add a new product
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { title, description, price } = req.body;
    const image = req.file?.path;

    if (!title || !description || !price || !image) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const newProduct = new Product({
      title,
      description,
      price,
      image,
      user: req.user.id, // Associate the product with the authenticated user
    });
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("user", "name email"); // Populate user details
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Delete a product (for "Buy" functionality)
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Product removed" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
