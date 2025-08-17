import connectDB from "../config/db.js";

export default class InventoryModel {
  static async create({ batchid, inventorynumber, quantity }) {
    const connection = await connectDB();
    const [result] = await connection.execute(
      "INSERT INTO inventory (batchid, inventorynumber, quantity) VALUES (?, ?, ?)",
      [batchid, inventorynumber, quantity]
    );
    return { id: result.insertId, batchid, inventorynumber, quantity };
  }

  static async findAll() {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      "SELECT * FROM inventory ORDER BY createdAt DESC"
    );
    return rows;
  }

  static async findById(id) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      "SELECT * FROM inventory WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  }

  static async updateById(id, { batchid, inventorynumber, quantity }) {
    const connection = await connectDB();
    const [result] = await connection.execute(
      "UPDATE inventory SET batchid = ?, inventorynumber = ?, quantity = ? WHERE id = ?",
      [batchid, inventorynumber, quantity, id]
    );
    return result.affectedRows > 0;
  }

  static async deleteById(id) {
    const connection = await connectDB();
    const [result] = await connection.execute(
      "DELETE FROM inventory WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}
