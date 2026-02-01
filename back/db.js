const mysql = require('mysql2/promise');
require('dotenv').config();

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool(process.env.DATABASE_URL);

module.exports = pool;
