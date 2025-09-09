import mysql from "mysql2/promise";

let pool;

// Create connection pool for better performance
const createPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "Kodithuwakku#22",
      database: process.env.DB_NAME || "brewops_db",
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: "utf8mb4",
      timezone: "+00:00",
    });
  }
  return pool;
};

// Legacy function for backward compatibility
export default async function connectDB() {
  const pool = createPool();
  // Return a connection from the pool
  return await pool.getConnection();
}

// Export the database object with execute and query methods
export const db = {
  execute: async (query, params = []) => {
    const pool = createPool();
    return await pool.execute(query, params);
  },

  query: async (query, params = []) => {
    const pool = createPool();
    return await pool.query(query, params);
  },

  getConnection: async () => {
    const pool = createPool();
    return await pool.getConnection();
  },

  end: async () => {
    if (pool) {
      await pool.end();
      pool = null;
    }
  },
};
