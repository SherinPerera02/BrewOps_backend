import db from "../config/database.js";
import bcrypt from "bcryptjs";

class User {
  static async findByEmail(email) {
    try {
      const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      return rows[0];
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
      return rows[0];
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async create(userData) {
    try {
      const {
        name,
        email,
        password,
        role = "staff",
        phone,
        employee_id,
      } = userData;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      const [result] = await db.execute(
        "INSERT INTO users (name, email, password_hash, role, phone, employee_id) VALUES (?, ?, ?, ?, ?, ?)",
        [name, email, hashedPassword, role, phone, employee_id]
      );

      return {
        id: result.insertId,
        name,
        email,
        role,
        phone,
        employee_id,
      };
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("Email or employee ID already exists");
      }
      throw new Error("Database error: " + error.message);
    }
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async findAll() {
    try {
      const [rows] = await db.execute(
        "SELECT id, name, email, role, phone, employee_id, created_at FROM users ORDER BY created_at DESC"
      );
      return rows;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }
}

export default User;
