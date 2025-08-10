import connection from "../config/db.js";

export async function findUserByEmail(email) {
  const [rows] = await connection.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
}

export async function createUser(user) {
  const { name, email, passwordHash, role, companyName, managerCode, phone } =
    user;
  await connection.execute(
    `INSERT INTO users (name, email, password_hash, role, company_name, manager_code, phone)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      email,
      passwordHash,
      role,
      companyName || null,
      managerCode || null,
      phone || null,
    ]
  );
}
