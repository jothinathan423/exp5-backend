const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files (e.g., images)
app.use("/img", express.static(path.join(__dirname, "img")));

// MongoDB connection
const uri = process.env.MONGO_URI; // Store your full MongoDB URI in .env
const clientOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true }
};

mongoose.connect(uri, clientOptions)
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ msg: "Server error" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));