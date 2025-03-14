import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Kiểm tra kết nối
db.getConnection()
  .then((connection) => {
    console.log('✅ Connected to MySQL successfully!');
    connection.release();
  })
  .catch((err) => {
    console.error('❌ MySQL connection failed:', err.message);
  });

export default db;
