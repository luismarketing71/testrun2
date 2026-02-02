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

// Update Service
app.put("/api/services/:id", async (req, res) => {
  const { id } = req.params;
  const { name, category, description, duration_minutes, price } = req.body;

  if (!name || !price)
    return res.status(400).json({ error: "Name and Price are required" });

  try {
    await db.query(
      "UPDATE services SET name = ?, category = ?, description = ?, duration_minutes = ?, price = ? WHERE id = ?",
      [name, category, description, duration_minutes, price, id],
    );
    res.json({ id, message: "Service updated" });
  } catch (error) {
    console.error("Error updating service:", error);
    res
      .status(500)
      .json({ error: "Failed to update service: " + error.message });
  }
});

// Delete Service
app.delete("/api/services/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM services WHERE id = ?", [id]);
    res.json({ message: "Service deleted" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res
      .status(500)
      .json({ error: "Failed to delete service: " + error.message });
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
    res.status(500).json({ error: "Failed to add staff: " + error.message });
  }
});

// Update Staff
app.put("/api/staff/:id", async (req, res) => {
  const { id } = req.params;
  const { full_name } = req.body;
  if (!full_name) return res.status(400).json({ error: "Name is required" });

  try {
    await db.query("UPDATE staff SET full_name = ? WHERE id = ?", [
      full_name,
      id,
    ]);
    res.json({ id, full_name, message: "Staff updated" });
  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(500).json({ error: "Failed to update staff: " + error.message });
  }
});

// Delete Staff
app.delete("/api/staff/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM staff WHERE id = ?", [id]);
    res.json({ message: "Staff deleted" });
  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(500).json({ error: "Failed to delete staff: " + error.message });
  }
});

// Helper: Convert "HH:MM" to minutes since midnight
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// Create Booking (With Availability Check)
app.post("/api/bookings", async (req, res) => {
  const { name, email, serviceId, staffId, date, time } = req.body;

  if (!name || !email || !serviceId || !date || !time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get Service Details
    const [serviceRows] = await connection.query(
      "SELECT duration_minutes FROM services WHERE id = ?",
      [serviceId],
    );

    if (serviceRows.length === 0) throw new Error("Service not found");
    const duration = serviceRows[0].duration_minutes || 30;

    // 2. Calculate New Booking Time Range
    const startMin = timeToMinutes(time);
    const endMin = startMin + duration;

    // Format end_time for DB
    const endHours = Math.floor(endMin / 60);
    const endMinutes = endMin % 60;
    const endTime = `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;

    // 3. Fetch Existing Bookings for Date
    const [existingBookings] = await connection.query(
      "SELECT start_time, end_time, staff_id FROM appointments WHERE appointment_date = ? AND status != 'cancelled'",
      [date],
    );

    // 4. Fetch All Active Staff (for "Any" assignment)
    const [allStaff] = await connection.query(
      "SELECT id FROM staff WHERE is_active = true",
    );

    // 5. Check Availability
    let assignedStaffId = staffId;

    const isOverlapping = (bStart, bEnd) => {
      const bStartMin = timeToMinutes(bStart);
      const bEndMin = timeToMinutes(bEnd);
      return Math.max(startMin, bStartMin) < Math.min(endMin, bEndMin);
    };

    if (assignedStaffId) {
      // Case A: Specific Staff Selected
      const conflict = existingBookings.find(
        (b) =>
          String(b.staff_id) === String(assignedStaffId) &&
          isOverlapping(b.start_time, b.end_time),
      );

      if (conflict) {
        throw new Error("Selected staff is not available at this time.");
      }
    } else {
      // Case B: "Any" Staff Selected -> Find first available
      const busyStaffIds = new Set();
      existingBookings.forEach((b) => {
        if (isOverlapping(b.start_time, b.end_time)) {
          busyStaffIds.add(b.staff_id);
        }
      });

      const availableStaff = allStaff.find((s) => !busyStaffIds.has(s.id));

      if (!availableStaff) {
        throw new Error("No staff members are available at this time.");
      }
      assignedStaffId = availableStaff.id;
    }

    // 6. Create User if needed
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

    // 7. Insert Appointment
    await connection.query(
      "INSERT INTO appointments (user_id, service_id, staff_id, appointment_date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [userId, serviceId, assignedStaffId, date, time, endTime, "confirmed"],
    );

    await connection.commit();
    res.json({ status: "success", message: "Booking confirmed!" });
  } catch (error) {
    await connection.rollback();
    console.error("Booking error:", error);
    res
      .status(409) // Conflict
      .json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Check Availability
app.get("/api/availability", async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "Date is required" });

  try {
    const [bookings] = await db.query(
      "SELECT start_time, end_time, staff_id FROM appointments WHERE appointment_date = ? AND status != 'cancelled'",
      [date],
    );
    const [staff] = await db.query(
      "SELECT id, full_name FROM staff WHERE is_active = true",
    );
    res.json({ bookings, staff });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// Get Dashboard Stats (Consolidated)
app.get("/api/dashboard/stats", async (req, res) => {
  const dateParam = req.query.date; // Expecting 'YYYY-MM-DD'

  res.set("Cache-Control", "no-store"); // Prevent caching

  try {
    const connection = await db.getConnection();
    try {
      // 1. Today's Revenue & Count (Using provided date or server's CURDATE)
      const dateClause = dateParam ? "?" : "CURDATE()";
      const dateValue = dateParam ? [dateParam] : [];

      const [todayStats] = await connection.query(
        `
        SELECT
          COALESCE(SUM(s.price), 0) as revenue,
          COUNT(*) as count
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        WHERE a.appointment_date = ${dateClause}
        AND a.status != 'cancelled'
      `,
        dateValue,
      );

      // 2. All-time Stats for Avg Ticket & No-Show Rate
      const [overallStats] = await connection.query(`
        SELECT
          COUNT(*) as total_count,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count
        FROM appointments
      `);

      const [avgPriceRow] = await connection.query(`
        SELECT AVG(s.price) as avg_ticket
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        WHERE a.status != 'cancelled'
      `);

      const totalApps = overallStats[0].total_count || 0;
      const cancelledApps = overallStats[0].cancelled_count || 0;
      const noShowRate =
        totalApps > 0 ? ((cancelledApps / totalApps) * 100).toFixed(1) : 0;
      const avgTicket = (avgPriceRow[0].avg_ticket || 0).toFixed(2);

      res.json({
        revenue: todayStats[0].revenue,
        appointments: todayStats[0].count,
        noShowRate: noShowRate,
        avgTicket: avgTicket,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});
// Get Monthly Revenue
app.get("/api/dashboard/revenue/monthly", async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    const connection = await db.getConnection();
    try {
      const [rows] = await connection.query(`
        SELECT COALESCE(SUM(s.price), 0) as revenue
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        WHERE YEAR(a.appointment_date) = YEAR(CURDATE())
        AND MONTH(a.appointment_date) = MONTH(CURDATE())
        AND a.status != 'cancelled'
      `);
      res.json({ revenue: rows[0].revenue });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    res.status(500).json({ error: "Failed to fetch monthly revenue" });
  }
});

// Get Today's Appointment Count
app.get("/api/dashboard/appointments/today", async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    const connection = await db.getConnection();
    try {
      const [rows] = await connection.query(`
        SELECT COUNT(*) as count
        FROM appointments
        WHERE appointment_date = CURDATE()
        AND status != 'cancelled'
      `);
      res.json({ count: rows[0].count });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching appointment count:", error);
    res.status(500).json({ error: "Failed to fetch appointment count" });
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
        a.end_time,
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

// Get Today's Revenue (Legacy/Simple check)
app.get("/api/revenue/today", async (req, res) => {
  try {
    const query = `
      SELECT SUM(s.price) as total_revenue
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.appointment_date = CURDATE()
      AND a.status != 'cancelled'
    `;
    const [rows] = await db.query(query);
    const total = rows[0].total_revenue || 0;
    res.json({ total });
  } catch (error) {
    console.error("Error fetching revenue:", error);
    res.status(500).json({ error: "Failed to fetch revenue" });
  }
});

// Debug Endpoint
app.get("/api/debug", async (req, res) => {
  try {
    const [timeResult] = await db.query(
      "SELECT NOW() as db_time, CURDATE() as db_date",
    );
    const [counts] = await db.query(
      "SELECT (SELECT COUNT(*) FROM appointments) as appt_count, (SELECT COUNT(*) FROM services) as service_count",
    );

    res.json({
      status: "online",
      server_time: new Date(),
      db_time: timeResult[0].db_time,
      db_date: timeResult[0].db_date,
      counts: counts[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Database Setup Route (Run once) ---
app.get("/api/setup-db", async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 0. Drop existing tables (Reverse order of dependencies)
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
        end_time VARCHAR(10),
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
