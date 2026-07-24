const mysql = require('mysql2/promise');

// A connection pool, not a single connection: handles concurrent requests
// safely and reconnects automatically if a connection drops. A single
// mysql.createConnection() (the original approach) serializes every query
// through one socket and dies silently on disconnect - fine for a demo,
// not for anything that has to stay up.
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    // Cloud MySQL (Railway, Aiven, PlanetScale) often exposes a non-3306 port.
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'todolist',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

async function checkConnection() {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
}

module.exports = { pool, checkConnection };
