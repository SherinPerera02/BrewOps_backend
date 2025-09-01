import connectDB from "../config/db.js";

export default class InventoryModel {
  static async create({ inventoryid, quantity }) {
    const connection = await connectDB();
    const [result] = await connection.execute(
      "INSERT INTO inventory (inventoryid, quantity) VALUES (?, ?)",
      [inventoryid, quantity]
    );
    return { id: result.insertId, inventoryid, quantity };
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

  static async updateById(id, { inventoryid, quantity }) {
    const connection = await connectDB();
    const [result] = await connection.execute(
      "UPDATE inventory SET inventoryid = ?, quantity = ? WHERE id = ?",
      [inventoryid, quantity, id]
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
