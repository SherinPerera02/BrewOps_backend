import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../models/userModel.js";

export async function registerUser(req, res) {
  const { name, email, password, role, companyName, managerCode, phone } =
    req.body;

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    await createUser({
      name,
      email,
      passwordHash,
      role,
      companyName,
      managerCode,
      phone,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid)
      return res.status(400).json({ message: "Invalid credentials" });

    // Normally generate JWT token here
    res.json({ message: "Login successful", role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
