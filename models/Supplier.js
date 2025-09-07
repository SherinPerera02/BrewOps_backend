import db from "../config/database.js";

class Supplier {
  static async findAll() {
    try {
      // Only return active suppliers by default
      const [rows] = await db.execute(
        "SELECT * FROM suppliers WHERE is_active = true ORDER BY name"
      );
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
        nic_number,
        address,
        bank_account_number,
        bank_name,
        rate = 150,
      } = supplierData;

      // Generate sequential supplier ID in format SUP00001, SUP00002, etc.
      const [lastSupplier] = await db.execute(
        "SELECT supplier_id FROM suppliers ORDER BY id DESC LIMIT 1"
      );

      let nextNumber = 1;
      if (lastSupplier.length > 0 && lastSupplier[0].supplier_id) {
        // Extract number from last supplier_id (e.g., "SUP00005" -> 5)
        const lastId = lastSupplier[0].supplier_id;
        const match = lastId.match(/SUP(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      const supplier_id = `SUP${nextNumber.toString().padStart(5, "0")}`;

      const [result] = await db.execute(
        "INSERT INTO suppliers (supplier_id, name, contact_number, nic_number, address, bank_account_number, bank_name, rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          supplier_id,
          name,
          contact_number,
          nic_number,
          address,
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
        nic_number,
        address,
        bank_account_number,
        bank_name,
        rate,
      };
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        if (error.message.includes("unique_supplier_id")) {
          throw new Error("Supplier ID already exists");
        }
        if (error.message.includes("unique_nic_number")) {
          throw new Error("NIC number already exists");
        }
        throw new Error("Duplicate entry found");
      }
      throw new Error("Database error: " + error.message);
    }
  }

  static async update(id, supplierData) {
    try {
      const {
        name,
        contact_number,
        nic_number,
        address,
        bank_account_number,
        bank_name,
        rate,
        is_active = true, // Default to true if not provided
      } = supplierData;

      const [result] = await db.execute(
        "UPDATE suppliers SET name = ?, contact_number = ?, nic_number = ?, address = ?, bank_account_number = ?, bank_name = ?, rate = ?, is_active = ? WHERE id = ?",
        [
          name,
          contact_number,
          nic_number,
          address,
          bank_account_number,
          bank_name,
          rate,
          is_active,
          id,
        ]
      );

      return result.affectedRows > 0;
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        if (error.message.includes("unique_nic_number")) {
          throw new Error("NIC number already exists");
        }
        throw new Error("Duplicate entry found");
      }
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

  static async findByNIC(nic_number) {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM suppliers WHERE nic_number = ?",
        [nic_number]
      );
      return rows[0];
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async findBySupplierID(supplier_id) {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM suppliers WHERE supplier_id = ?",
        [supplier_id]
      );
      return rows[0];
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }
}

export default Supplier;
