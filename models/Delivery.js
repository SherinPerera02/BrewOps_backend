import db from "../config/database.js";

class Delivery {
  static async findAll(filters = {}) {
    try {
      const { supplier_id, start_date, end_date } = filters;

      let query =
        "SELECT d.*, s.name as supplier_name, s.supplier_id as supplier_code FROM deliveries d JOIN suppliers s ON d.supplier_id = s.id WHERE 1=1";
      const params = [];

      if (supplier_id) {
        query += " AND d.supplier_id = ?";
        params.push(supplier_id);
      }

      if (start_date) {
        query += " AND d.delivery_date >= ?";
        params.push(start_date);
      }

      if (end_date) {
        query += " AND d.delivery_date <= ?";
        params.push(end_date);
      }

      query += " ORDER BY d.delivery_date DESC";

      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        "SELECT d.*, s.name as supplier_name, s.supplier_id as supplier_code FROM deliveries d JOIN suppliers s ON d.supplier_id = s.id WHERE d.id = ?",
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async findBySupplier(supplierId) {
    try {
      const [rows] = await db.execute(
        "SELECT d.*, s.name as supplier_name, s.supplier_id as supplier_code FROM deliveries d JOIN suppliers s ON d.supplier_id = s.id WHERE d.supplier_id = ? ORDER BY d.delivery_date DESC",
        [supplierId]
      );
      return rows;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async getMonthlySummary(month) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          s.id as supplier_id,
          s.name as supplier_name,
          s.contact_number,
          s.bank_account_number,
          s.bank_name,
          s.rate,
          COALESCE(SUM(d.quantity), 0) as monthly_quantity,
          COALESCE(SUM(d.total_amount), 0) as monthly_amount,
          COUNT(d.id) as delivery_count
        FROM suppliers s
        LEFT JOIN deliveries d ON s.id = d.supplier_id 
          AND DATE_FORMAT(d.delivery_date, "%Y-%m") = ?
        WHERE s.is_active = true
        GROUP BY s.id
        ORDER BY s.name`,
        [month]
      );
      return rows;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async create(deliveryData) {
    try {
      const {
        supplier_id,
        quantity,
        rate_per_kg,
        delivery_date,
        payment_method,
        notes,
        total_amount,
      } = deliveryData;

      // Calculate total_amount if not provided
      const calculatedTotal = total_amount || quantity * rate_per_kg;

      // Use provided delivery_date or current date
      const deliveryDateToUse =
        delivery_date || new Date().toISOString().split("T")[0];

      const [result] = await db.execute(
        "INSERT INTO deliveries (supplier_id, delivery_date, quantity, rate_per_kg, total_amount, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          supplier_id,
          deliveryDateToUse,
          quantity,
          rate_per_kg,
          calculatedTotal,
          payment_method || "monthly",
          notes || null,
        ]
      );

      return {
        id: result.insertId,
        supplier_id,
        quantity,
        rate_per_kg,
        delivery_date: deliveryDateToUse,
        total_amount: calculatedTotal,
        payment_method: payment_method || "monthly",
        notes: notes || null,
      };
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async update(id, deliveryData) {
    try {
      const { quantity, rate_per_kg, delivery_date, payment_method, notes } =
        deliveryData;

      const total_amount = quantity * rate_per_kg;

      const [result] = await db.execute(
        "UPDATE deliveries SET quantity = ?, rate_per_kg = ?, total_amount = ?, delivery_date = ?, payment_method = ?, notes = ? WHERE id = ?",
        [
          quantity,
          rate_per_kg,
          total_amount,
          delivery_date,
          payment_method,
          notes,
          id,
        ]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute("DELETE FROM deliveries WHERE id = ?", [
        id,
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }
}

export default Delivery;
