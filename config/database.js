import mysql from "mysql2/promise";

let pool;

const createPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "Sherin2001@",
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

const db = {
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

export default db;
