const db = require('./back/db');

async function debug() {
  try {
    const [dateRes] = await db.query("SELECT CURDATE() as server_date, NOW() as server_time");
    console.log("Server Date/Time:", dateRes[0]);

    const [appointments] = await db.query("SELECT * FROM appointments ORDER BY id DESC LIMIT 5");
    console.log("\nRecent Appointments:");
    console.table(appointments);

    const [stats] = await db.query(`
        SELECT
          COALESCE(SUM(s.price), 0) as revenue,
          COUNT(*) as count
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        WHERE a.appointment_date = CURDATE()
        AND a.status != 'cancelled'
    `);
    console.log("\nStats Query Result:", stats[0]);

  } catch (err) {
    console.error(err);
  }
  process.exit();
}

debug();
