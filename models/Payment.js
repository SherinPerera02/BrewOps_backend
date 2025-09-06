import db from "../config/database.js";

class Payment {
  static async findAll(filters = {}) {
    try {
      const { month, supplier_id, payment_type } = filters;

      let query =
        "SELECT p.*, s.name as supplier_name FROM payments p JOIN suppliers s ON p.supplier_id = s.id WHERE 1=1";
      const params = [];

      if (month) {
        query += " AND p.payment_month = ?";
        params.push(month);
      }

      if (supplier_id) {
        query += " AND p.supplier_id = ?";
        params.push(supplier_id);
      }

      if (payment_type) {
        query += " AND p.payment_type = ?";
        params.push(payment_type);
      }

      query += " ORDER BY p.payment_date DESC";

      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        "SELECT p.*, s.name as supplier_name FROM payments p JOIN suppliers s ON p.supplier_id = s.id WHERE p.id = ?",
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async getStatistics() {
    try {
      const [stats] = await db.execute("SELECT * FROM payment_statistics");

      // Get monthly totals for current month
      const currentMonth = new Date().toISOString().slice(0, 7);
      const [monthlyDeliveries] = await db.execute(
        'SELECT SUM(quantity) as total_quantity FROM deliveries WHERE DATE_FORMAT(delivery_date, "%Y-%m") = ?',
        [currentMonth]
      );

      return {
        ...stats[0],
        monthly_quantity: monthlyDeliveries[0]?.total_quantity || 0,
      };
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async createMonthlyPayment(paymentData) {
    try {
      const {
        supplier_id,
        month,
        amount,
        payment_method = "Bank Transfer",
      } = paymentData;

      // Check if payment already exists
      const [existing] = await db.execute(
        'SELECT * FROM payments WHERE supplier_id = ? AND payment_month = ? AND payment_type = "monthly"',
        [supplier_id, month]
      );

      if (existing.length > 0) {
        throw new Error("Payment already exists for this supplier and month");
      }

      const [result] = await db.execute(
        "INSERT INTO payments (supplier_id, payment_type, payment_month, amount, payment_date, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          supplier_id,
          "monthly",
          month,
          amount,
          new Date(),
          payment_method,
          "paid",
        ]
      );

      return {
        id: result.insertId,
        supplier_id,
        month,
        amount,
        payment_method,
      };
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }

  static async createSpotCashPayment(paymentData) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const {
        supplier_id,
        quantity,
        rate_per_kg,
        payment_method = "Cash",
      } = paymentData;
      const amount = quantity * rate_per_kg;

      // Insert payment record
      const [paymentResult] = await connection.execute(
        "INSERT INTO payments (supplier_id, payment_type, amount, payment_date, payment_method, status) VALUES (?, ?, ?, ?, ?, ?)",
        [supplier_id, "spot-cash", amount, new Date(), payment_method, "paid"]
      );

      // Also record the delivery
      const [deliveryResult] = await connection.execute(
        "INSERT INTO deliveries (supplier_id, delivery_date, quantity, rate_per_kg, total_amount) VALUES (?, ?, ?, ?, ?)",
        [supplier_id, new Date(), quantity, rate_per_kg, amount]
      );

      await connection.commit();

      return {
        payment_id: paymentResult.insertId,
        delivery_id: deliveryResult.insertId,
        supplier_id,
        quantity,
        rate_per_kg,
        amount,
        payment_method,
      };
    } catch (error) {
      await connection.rollback();
      throw new Error("Database error: " + error.message);
    } finally {
      connection.release();
    }
  }

  static async updateStatus(id, status) {
    try {
      const [result] = await db.execute(
        "UPDATE payments SET status = ? WHERE id = ?",
        [status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Database error: " + error.message);
    }
  }
}

export default Payment;
