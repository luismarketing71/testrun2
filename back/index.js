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

// Get Services (for dropdown)
app.get("/api/services", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, price FROM services WHERE is_active = true",
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// Get Staff (for dropdown)
app.get("/api/staff", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, full_name FROM staff WHERE is_active = true",
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

// Add New Staff
app.post("/api/staff", async (req, res) => {
  const { full_name } = req.body;
  if (!full_name) return res.status(400).json({ error: "Name is required" });

  try {
    const [result] = await db.query(
      "INSERT INTO staff (full_name) VALUES (?)",
      [full_name],
    );
    res.json({ id: result.insertId, full_name, message: "Staff added" });
  } catch (error) {
    console.error("Error adding staff:", error);
    res.status(500).json({ error: "Failed to add staff" });
  }
});

// Add New Service
app.post("/api/services", async (req, res) => {
  const { name, price, duration_minutes } = req.body;
  if (!name || !price)
    return res.status(400).json({ error: "Name and Price are required" });

  try {
    const [result] = await db.query(
      "INSERT INTO services (name, price) VALUES (?, ?)",
      [name, price],
    );
    res.json({ id: result.insertId, name, price, message: "Service added" });
  } catch (error) {
    console.error("Error adding service:", error);
    res.status(500).json({ error: "Failed to add service" });
  }
});

// Create Booking
app.post("/api/bookings", async (req, res) => {
  const { name, email, serviceId, staffId, date, time } = req.body;

  if (!name || !email || !serviceId || !date || !time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Find or Create User
    let [users] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    let userId;

    if (users.length > 0) {
      userId = users[0].id;
    } else {
      const [result] = await connection.query(
        "INSERT INTO users (full_name, email) VALUES (?, ?)",
        [name, email],
      );
      userId = result.insertId;
    }

    // 2. Create Appointment
    // Note: Assuming 'start_time' is the column for time.
    // If you have 'end_time', we might need to calculate it based on service duration,
    // but for now we'll just insert the start time.
    await connection.query(
      "INSERT INTO appointments (user_id, service_id, staff_id, appointment_date, start_time, status) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, serviceId, staffId || null, date, time, "confirmed"],
    );

    await connection.commit();
    res.json({ status: "success", message: "Booking confirmed!" });
  } catch (error) {
    await connection.rollback();
    console.error("Booking error:", error);
    res.status(500).json({ error: "Failed to create booking" });
  } finally {
    connection.release();
  }
});

// Get All Bookings (for Admin)
app.get("/api/bookings", async (req, res) => {
  try {
    const query = `
      SELECT
        a.id,
        a.appointment_date,
        a.start_time,
        u.full_name as customer_name,
        s.name as service_name,
        st.full_name as staff_name
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN services s ON a.service_id = s.id
      LEFT JOIN staff st ON a.staff_id = st.id
      ORDER BY a.appointment_date DESC, a.start_time DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Serve Static Frontend Files (from the sibling 'front/dist' directory)
// Nixpacks will build the frontend into front/dist before this runs.
const frontendDistPath = path.join(__dirname, "../front/dist");

app.use(express.static(frontendDistPath));

// --- Database Setup Route (Run once) ---
app.get("/api/setup-db", async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Create Tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
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

    // 2. Seed Data (only if empty)
    const [services] = await connection.query("SELECT * FROM services");
    if (services.length === 0) {
      await connection.query(`
        INSERT INTO services (name, price) VALUES
        ('Classic Cut', 25.00),
        ('Skin Fade', 30.00),
        ('Beard Trim', 15.00),
        ('Full Works', 55.00)
      `);
    }

    const [staff] = await connection.query("SELECT * FROM staff");
    if (staff.length === 0) {
      await connection.query(`
        INSERT INTO staff (full_name) VALUES
        ('Luis (Master Barber)'),
        ('Marcus (Senior)'),
        ('Sarah (Stylist)')
      `);
    }

    await connection.commit();
    res.json({ message: "Database setup and seeded successfully!" });
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
