import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "../config/db.js"; // your MySQL connection helper

const router = express.Router();

// LOGIN route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
