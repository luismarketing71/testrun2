const mysql = require("mysql2/promise");
require("dotenv").config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error(
    "❌ FATAL ERROR: DATABASE_URL environment variable is missing.",
  );
  process.exit(1);
}

console.log("✅ DATABASE_URL is defined. Attempting to connect...");

// Create the connection pool.
const pool = mysql.createPool(dbUrl);

module.exports = pool;
