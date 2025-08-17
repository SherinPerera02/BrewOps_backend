import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail } from "../models/userModel.js";
import dotenv from "dotenv";
import connectDB from "../config/db.js"; // Ensure the correct import for database connection
dotenv.config();

export async function registerUser(req, res) {
  const { name, email, password, role, phone, employeeId } = req.body;

  try {
    const db = await connectDB(); // Initialize the database connection

    console.log(
      "Validating employee ID with role:",
      role,
      "and employeeId:",
      employeeId
    );

    // Validate employee ID
    const [employee] = await db.execute(
      "SELECT * FROM employees WHERE role = ? AND employee_id = ?",
      [role, employeeId]
    );

    console.log("Employee validation result:", employee);

    if (employee.length === 0) {
      console.error("Invalid employee ID for role:", role);
      return res
        .status(400)
        .json({ message: "Invalid employee ID for the selected role" });
    }

    console.log("Checking if user already exists with email:", email);

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    console.log("User existence check result:", existingUser);

    if (existingUser) {
      console.error("Email already registered:", email);
      return res.status(400).json({ message: "Email already registered" });
    }

    console.log("Hashing password for user:", email);

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully for user:", email);

    // Ensure phone is null if undefined
    const sanitizedPhone = phone || null;

    console.log("Inserting user into database:", {
      name,
      email,
      role,
      phone: sanitizedPhone,
      employeeId,
    });

    // Save user to database
    const [result] = await db.execute(
      "INSERT INTO users (name, email, password_hash, role, phone, employee_id) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, passwordHash, role, sanitizedPhone, employeeId]
    );

    console.log("User insertion result:", result);

    console.log("User registered successfully with email:", email);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    console.log("Password from request:", password);
    console.log("Password hash from database:", user.password_hash);

    if (!password || !user.password_hash) {
      console.error("Password or password_hash is undefined", {
        password,
        password_hash: user.password_hash,
      });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_KEY,
      { expiresIn: "1d" }
    );

    // Return token and role
    res.json({ message: "Login successful", token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
