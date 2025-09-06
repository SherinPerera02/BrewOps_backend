import db from "../config/database.js";

class Supplier {
  static async findAll() {
    try {
      const [rows] = await db.execute("SELECT * FROM suppliers ORDER BY name");
      return rows;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async findActive() {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM suppliers WHERE is_active = true ORDER BY name"
      );
      return rows;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute("SELECT * FROM suppliers WHERE id = ?", [
        id,
      ]);
      return rows[0];
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async create(supplierData) {
    try {
      const {
        name,
        contact_number,
        bank_account_number,
        bank_name,
        rate = 150,
      } = supplierData;

      // Generate supplier ID
      const supplier_id = "SUP" + Date.now();

      const [result] = await db.execute(
        "INSERT INTO suppliers (supplier_id, name, contact_number, bank_account_number, bank_name, rate) VALUES (?, ?, ?, ?, ?, ?)",
        [
          supplier_id,
          name,
          contact_number,
          bank_account_number,
          bank_name,
          rate,
        ]
      );

      return {
        id: result.insertId,
        supplier_id,
        name,
        contact_number,
        bank_account_number,
        bank_name,
        rate,
      };
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("Supplier ID already exists");
      }
      throw new Error("Database error: " + error.message);
    }
  }

  static async update(id, supplierData) {
    try {
      const {
        name,
        contact_number,
        bank_account_number,
        bank_name,
        rate,
        is_active,
      } = supplierData;

      const [result] = await db.execute(
        "UPDATE suppliers SET name = ?, contact_number = ?, bank_account_number = ?, bank_name = ?, rate = ?, is_active = ? WHERE id = ?",
        [
          name,
          contact_number,
          bank_account_number,
          bank_name,
          rate,
          is_active,
          id,
        ]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async softDelete(id) {
    try {
      const [result] = await db.execute(
        "UPDATE suppliers SET is_active = false WHERE id = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }
}

export default Supplier;
