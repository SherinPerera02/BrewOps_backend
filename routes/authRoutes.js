import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "../config/db.js"; // your MySQL connection helper
import { registerUser } from "../controllers/authController.js";

const router = express.Router();

// LOGIN route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const connection = await connectDB();
    // Explicitly select required fields from the database
    const [rows] = await connection.execute(
      "SELECT id, email, password_hash AS password, role FROM users WHERE email = ?",
      [email]
    );

    console.log("User query result:", rows);

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = rows[0];
    console.log("Password from request:", password);
    console.log("Password hash from database:", user.password);

    if (!password || !user.password) {
      console.error("Password or password_hash is undefined", {
        password,
        password_hash: user.password,
      });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_KEY,
      { expiresIn: "1d" }
    );

    res.json({
      jwtToken,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Register route
router.post("/register", registerUser);

// Endpoint to get logged-in user details
router.get("/user", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const connection = await connectDB();
    const [rows] = await connection.execute(
      "SELECT id, name, email FROM users WHERE id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
