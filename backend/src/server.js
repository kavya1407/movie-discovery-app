require("dotenv").config();

const express = require("express");
const cors = require("cors");

const movieRoutes = require("./routes/movieRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

const app = express();

// =========================================
// MIDDLEWARE
// =========================================

app.use(cors());
app.use(express.json());

// =========================================
// ROOT ROUTE
// =========================================

app.get("/", (req, res) => {
  res.json({
    message: "Movie Discovery API is running",
  });
});

// =========================================
// HEALTH CHECK
// =========================================

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
  });
});

// =========================================
// API ROUTES
// =========================================

app.use("/api/movies", movieRoutes);
app.use("/api/wishlist", wishlistRoutes);

// =========================================
// SERVER
// =========================================

const PORT = process.env.PORT || 5000;

console.log(
  "OMDb key loaded:",
  process.env.OMDB_API_KEY ? "YES" : "NO"
);

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});