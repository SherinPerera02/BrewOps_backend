import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";

async function createAdmin() {
  const connection = await connectDB();

  const email = "smperera574@gmail.com";
  const password = "Admin123";
  const role = "admin";

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await connection.execute(
      "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
      [email, hashedPassword, role]
    );
    console.log("Admin user created successfully!");
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await connection.end();
  }
}

createAdmin();
