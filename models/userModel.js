import connectDB from "../config/db.js";

export async function findUserByEmail(email) {
  const db = await connectDB(); // Initialize the database connection
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return rows[0];
}

export async function createUser(user) {
  const db = await connectDB(); // Initialize the database connection
  const {
    name,
    email,
    passwordHash,
    role,
    supplierID,
    managerID,
    staffID,
    phone,
  } = user;
  await db.execute(
    `INSERT INTO users (name, email, password_hash, role, supplierID, managerID, staffID, phone)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      email,
      passwordHash,
      role,
      supplierID || null,
      managerID || null,
      staffID || null,
      phone || null,
    ]
  );
}

export async function fetchUserRoles(userId) {
  const db = await connectDB(); // Initialize the database connection
  const [rows] = await db.execute(
    "SELECT supplier_id, manager_id, staff_id FROM user_roles WHERE user_id = ?",
    [userId]
  );
  return rows[0];
}
