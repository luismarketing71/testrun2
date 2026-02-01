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

// --- Booking System API ---

// Get Services (for dropdown and admin)
app.get("/api/services", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, category, description, duration_minutes, price, is_active FROM services WHERE is_active = true",
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// ... (Staff endpoints remain unchanged) ...

// Add New Service
app.post("/api/services", async (req, res) => {
  const { name, category, description, duration_minutes, price } = req.body;

  // Basic validation
  if (!name || !price)
    return res.status(400).json({ error: "Name and Price are required" });

  try {
    const [result] = await db.query(
      "INSERT INTO services (name, category, description, duration_minutes, price) VALUES (?, ?, ?, ?, ?)",
      [name, category, description, duration_minutes, price],
    );
    res.json({ id: result.insertId, name, message: "Service added" });
  } catch (error) {
    console.error("Error adding service:", error);
    res.status(500).json({ error: "Failed to add service: " + error.message });
  }
});

// ... (Booking endpoints remain unchanged) ...

// --- Database Setup Route (Run once) ---
app.get("/api/setup-db", async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 0. Drop existing tables
    await connection.query("DROP TABLE IF EXISTS payments");
    await connection.query("DROP TABLE IF EXISTS appointments");
    await connection.query("DROP TABLE IF EXISTS services");
    await connection.query("DROP TABLE IF EXISTS staff");
    await connection.query("DROP TABLE IF EXISTS users");

    // 1. Create Tables
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE staff (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    await connection.query(`
      CREATE TABLE services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50),
        description TEXT,
        duration_minutes INT,
        price DECIMAL(10, 2) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    await connection.query(`
      CREATE TABLE appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        staff_id INT,
        service_id INT,
        appointment_date DATE NOT NULL,
        start_time VARCHAR(10) NOT NULL,
        status VARCHAR(50) DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (staff_id) REFERENCES staff(id),
        FOREIGN KEY (service_id) REFERENCES services(id)
      )
    `);

    // 2. Seed Data
    await connection.query(`
      INSERT INTO services (name, category, description, duration_minutes, price) VALUES
      ('Classic Cut', 'Hair', 'Standard haircut', 30, 25.00),
      ('Skin Fade', 'Hair', 'Fade with foil shaver', 45, 30.00),
      ('Beard Trim', 'Beard', 'Shape up and trim', 20, 15.00),
      ('Full Works', 'Package', 'Haircut + Beard + Hot Towel', 60, 55.00)
    `);

    await connection.query(`
      INSERT INTO staff (full_name) VALUES
      ('Luis (Master Barber)'),
      ('Marcus (Senior)'),
      ('Sarah (Stylist)')
    `);

    await connection.commit();
    res.json({
      message: "Database reset and seeded successfully (Full Schema)!",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Setup error:", error);
    res.status(500).json({ error: "Setup failed: " + error.message });
  } finally {
    connection.release();
  }
});

// SPA Fallback: Send index.html for any other requests (so React Router works)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
