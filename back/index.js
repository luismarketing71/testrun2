const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running correctly" });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS solution");
    res.json({
      status: "ok",
      message: "Database connected!",
      solution: rows[0].solution,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res
      .status(500)
      .json({ status: "error", message: "Database connection failed" });
  }
});

// Serve Static Frontend Files (from the sibling 'front/dist' directory)
// Nixpacks will build the frontend into front/dist before this runs.
const frontendDistPath = path.join(__dirname, "../front/dist");

app.use(express.static(frontendDistPath));

// SPA Fallback: Send index.html for any other requests (so React Router works)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
