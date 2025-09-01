import connectDB from "../config/db.js";

// Get supplier by ID
export async function findSupplierById(supplierId) {
  const db = await connectDB();
  const [rows] = await db.execute(
    "SELECT * FROM suppliers WHERE supplier_id = ?",
    [supplierId]
  );
  return rows[0];
}

// Get supplier by user ID (from users table)
export async function findSupplierByUserId(userId) {
  const db = await connectDB();
  const [rows] = await db.execute(
    `SELECT s.*, u.email, u.name as user_name 
     FROM suppliers s 
     JOIN users u ON s.user_id = u.id 
     WHERE u.id = ?`,
    [userId]
  );
  return rows[0];
}

// Get supplier by email
export async function findSupplierByEmail(email) {
  const db = await connectDB();
  const [rows] = await db.execute(
    `SELECT s.*, u.email, u.name as user_name 
     FROM suppliers s 
     JOIN users u ON s.user_id = u.id 
     WHERE u.email = ?`,
    [email]
  );
  return rows[0];
}

// Create new supplier
export async function createSupplier(supplierData) {
  const db = await connectDB();
  const {
    supplier_id,
    user_id,
    name,
    contact_number,
    address,
    city,
    postal_code,
    country,
    bank_account_number,
    bank_name,
    branch_code,
  } = supplierData;

  const [result] = await db.execute(
    `INSERT INTO suppliers 
     (supplier_id, user_id, name, contact_number, address, city, postal_code, country, 
      bank_account_number, bank_name, branch_code, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      supplier_id,
      user_id,
      name,
      contact_number,
      address,
      city,
      postal_code,
      country,
      bank_account_number,
      bank_name,
      branch_code,
    ]
  );
  return result;
}

// Update supplier profile
export async function updateSupplierProfile(supplierId, supplierData) {
  const db = await connectDB();
  const {
    name,
    contact_number,
    address,
    city,
    postal_code,
    country,
    bank_account_number,
    bank_name,
    branch_code,
  } = supplierData;

  const [result] = await db.execute(
    `UPDATE suppliers 
     SET name = ?, contact_number = ?, address = ?, city = ?, postal_code = ?, 
         country = ?, bank_account_number = ?, bank_name = ?, branch_code = ?, 
         updated_at = NOW()
     WHERE supplier_id = ?`,
    [
      name,
      contact_number,
      address,
      city,
      postal_code,
      country,
      bank_account_number,
      bank_name,
      branch_code,
      supplierId,
    ]
  );
  return result;
}

// Update user email and password
export async function updateUserProfile(userId, userData) {
  const db = await connectDB();
  const { name, email, password_hash } = userData;

  let query =
    "UPDATE users SET name = ?, email = ?, updated_at = NOW() WHERE id = ?";
  let params = [name, email, userId];

  if (password_hash) {
    query =
      "UPDATE users SET name = ?, email = ?, password_hash = ?, updated_at = NOW() WHERE id = ?";
    params = [name, email, password_hash, userId];
  }

  const [result] = await db.execute(query, params);
  return result;
}

// Get supplier statistics
export async function getSupplierStats(supplierId) {
  const db = await connectDB();

  // This is a placeholder - you can modify based on your actual supply records table
  const [monthlyDelivery] = await db.execute(
    `SELECT COALESCE(SUM(quantity), 0) as total_quantity 
     FROM supply_records 
     WHERE supplier_id = ? AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`,
    [supplierId]
  );

  const [totalRevenue] = await db.execute(
    `SELECT COALESCE(SUM(total_amount), 0) as total_revenue 
     FROM supply_records 
     WHERE supplier_id = ? AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`,
    [supplierId]
  );

  const [qualityScore] = await db.execute(
    `SELECT COALESCE(AVG(quality_score), 0) as avg_quality 
     FROM supply_records 
     WHERE supplier_id = ? AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`,
    [supplierId]
  );

  const [deliveryRate] = await db.execute(
    `SELECT 
       COUNT(*) as total_deliveries,
       SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed_deliveries
     FROM supply_records 
     WHERE supplier_id = ? AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`,
    [supplierId]
  );

  const deliveryPercentage =
    deliveryRate[0].total_deliveries > 0
      ? (deliveryRate[0].completed_deliveries /
          deliveryRate[0].total_deliveries) *
        100
      : 0;

  return {
    monthlyDelivery: monthlyDelivery[0].total_quantity || 0,
    monthlyRevenue: totalRevenue[0].total_revenue || 0,
    qualityScore: qualityScore[0].avg_quality || 0,
    deliveryRate: deliveryPercentage,
  };
}

// Delete supplier (soft delete)
export async function deleteSupplier(supplierId) {
  const db = await connectDB();
  const [result] = await db.execute(
    "UPDATE suppliers SET deleted_at = NOW() WHERE supplier_id = ?",
    [supplierId]
  );
  return result;
}
